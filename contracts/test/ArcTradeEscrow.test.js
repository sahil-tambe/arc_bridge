// Hardhat/Chai unit tests for ArcTradeEscrow
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArcTradeEscrow Smart Contract Suite", function () {
  let usdcToken;
  let escrow;
  let owner;
  let admin;
  let arbiter;
  let buyer;
  let supplier;
  let unauthorizedUser;

  const DECIMALS = 6;
  const INITIAL_BALANCE = ethers.parseUnits("1000000", DECIMALS);
  const TRADE_AMOUNT = ethers.parseUnits("10000", DECIMALS);
  const TRADE_ID = "TRD-TEST-8829-QX";

  beforeEach(async function () {
    // Get accounts
    [owner, admin, arbiter, buyer, supplier, unauthorizedUser] = await ethers.getSigners();

    // Deploy Mock USDC Token
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    usdcToken = await MockUSDC.deploy("Mock USDC", "USDC", DECIMALS);
    await usdcToken.waitForDeployment();
    const usdcAddress = await usdcToken.getAddress();

    // Deploy Escrow Contract
    const ArcTradeEscrow = await ethers.getContractFactory("ArcTradeEscrow");
    escrow = await ArcTradeEscrow.deploy(usdcAddress, admin.address, arbiter.address);
    await escrow.waitForDeployment();

    // Distribute USDC
    await usdcToken.transfer(buyer.address, INITIAL_BALANCE);
    await usdcToken.transfer(supplier.address, INITIAL_BALANCE);
  });

  describe("Deployment & Access Controls", function () {
    it("Should set correct roles and token addresses", async function () {
      expect(await escrow.usdcToken()).to.equal(await usdcToken.getAddress());
      
      const adminRole = await escrow.DEFAULT_ADMIN_ROLE();
      const managerRole = await escrow.MANAGER_ROLE();
      const arbiterRole = await escrow.ARBITER_ROLE();

      expect(await escrow.hasRole(adminRole, admin.address)).to.be.true;
      expect(await escrow.hasRole(managerRole, admin.address)).to.be.true;
      expect(await escrow.hasRole(arbiterRole, arbiter.address)).to.be.true;
      expect(await escrow.hasRole(managerRole, unauthorizedUser.address)).to.be.false;
    });

    it("Should prevent non-admins from pausing the contract", async function () {
      await expect(escrow.connect(unauthorizedUser).pause()).to.be.revertedWith(
        "AccessControl: account is missing role"
      );
    });
  });

  describe("Trade Creation Workflow", function () {
    it("Should allow MANAGER_ROLE to create a trade", async function () {
      await expect(escrow.connect(admin).createTrade(TRADE_ID, buyer.address, supplier.address, TRADE_AMOUNT))
        .to.emit(escrow, "TradeCreated")
        .withArgs(TRADE_ID, buyer.address, supplier.address, TRADE_AMOUNT);

      const trade = await escrow.getTrade(TRADE_ID);
      expect(trade.id).to.equal(TRADE_ID);
      expect(trade.buyer).to.equal(buyer.address);
      expect(trade.supplier).to.equal(supplier.address);
      expect(trade.amount).to.equal(TRADE_AMOUNT);
      expect(trade.status).to.equal(0); // EscrowStatus.Pending
    });

    it("Should prevent non-managers from creating a trade", async function () {
      await expect(
        escrow.connect(unauthorizedUser).createTrade(TRADE_ID, buyer.address, supplier.address, TRADE_AMOUNT)
      ).to.be.revertedWith("AccessControl: account is missing role");
    });

    it("Should prevent duplicate trade creation", async function () {
      await escrow.connect(admin).createTrade(TRADE_ID, buyer.address, supplier.address, TRADE_AMOUNT);
      await expect(
        escrow.connect(admin).createTrade(TRADE_ID, buyer.address, supplier.address, TRADE_AMOUNT)
      ).to.be.revertedWith("ArcTradeEscrow: trade already exists");
    });
  });

  describe("Deposit & Escrow Locking", function () {
    beforeEach(async function () {
      await escrow.connect(admin).createTrade(TRADE_ID, buyer.address, supplier.address, TRADE_AMOUNT);
    });

    it("Should lock trade automatically when full amount is deposited", async function () {
      const escrowAddress = await escrow.getAddress();
      await usdcToken.connect(buyer).approve(escrowAddress, TRADE_AMOUNT);

      await expect(escrow.connect(buyer).deposit(TRADE_ID))
        .to.emit(escrow, "FundsLocked")
        .withArgs(TRADE_ID, TRADE_AMOUNT);

      const trade = await escrow.getTrade(TRADE_ID);
      expect(trade.depositedAmount).to.equal(TRADE_AMOUNT);
      expect(trade.status).to.equal(1); // EscrowStatus.Locked
    });

    it("Should reject deposits from unauthorized buyers", async function () {
      const escrowAddress = await escrow.getAddress();
      await usdcToken.connect(unauthorizedUser).approve(escrowAddress, TRADE_AMOUNT);
      
      await expect(
        escrow.connect(unauthorizedUser).deposit(TRADE_ID)
      ).to.be.revertedWith("ArcTradeEscrow: only authorized buyer can deposit");
    });
  });

  describe("Escrow Settlement & Payout Release", function () {
    beforeEach(async function () {
      await escrow.connect(admin).createTrade(TRADE_ID, buyer.address, supplier.address, TRADE_AMOUNT);
      const escrowAddress = await escrow.getAddress();
      await usdcToken.connect(buyer).approve(escrowAddress, TRADE_AMOUNT);
      await escrow.connect(buyer).deposit(TRADE_ID);
    });

    it("Should allow buyer to release escrowed funds to supplier", async function () {
      const initialSupplierBalance = await usdcToken.balanceOf(supplier.address);

      await expect(escrow.connect(buyer).releaseFunds(TRADE_ID))
        .to.emit(escrow, "FundsReleased")
        .withArgs(TRADE_ID, TRADE_AMOUNT);

      const finalSupplierBalance = await usdcToken.balanceOf(supplier.address);
      expect(finalSupplierBalance - initialSupplierBalance).to.equal(TRADE_AMOUNT);

      const trade = await escrow.getTrade(TRADE_ID);
      expect(trade.status).to.equal(2); // EscrowStatus.Released
    });

    it("Should allow manager to force-release escrowed funds", async function () {
      await expect(escrow.connect(admin).releaseFunds(TRADE_ID))
        .to.emit(escrow, "FundsReleased");
    });

    it("Should block unauthorized users from releasing funds", async function () {
      await expect(
        escrow.connect(unauthorizedUser).releaseFunds(TRADE_ID)
      ).to.be.revertedWith("ArcTradeEscrow: unauthorized release trigger");
    });
  });

  describe("Dispute Raising & Resolution", function () {
    beforeEach(async function () {
      await escrow.connect(admin).createTrade(TRADE_ID, buyer.address, supplier.address, TRADE_AMOUNT);
      const escrowAddress = await escrow.getAddress();
      await usdcToken.connect(buyer).approve(escrowAddress, TRADE_AMOUNT);
      await escrow.connect(buyer).deposit(TRADE_ID);
    });

    it("Should allow buyer or supplier to raise a dispute", async function () {
      await expect(escrow.connect(buyer).raiseDispute(TRADE_ID))
        .to.emit(escrow, "DisputeRaised")
        .withArgs(TRADE_ID, buyer.address);

      const trade = await escrow.getTrade(TRADE_ID);
      expect(trade.status).to.equal(4); // EscrowStatus.Disputed
    });

    it("Should allow arbiter to resolve dispute with partial payouts", async function () {
      await escrow.connect(buyer).raiseDispute(TRADE_ID);

      const initialBuyerBalance = await usdcToken.balanceOf(buyer.address);
      const initialSupplierBalance = await usdcToken.balanceOf(supplier.address);

      const buyerRefund = ethers.parseUnits("4000", DECIMALS);
      const supplierPayout = ethers.parseUnits("6000", DECIMALS);

      await expect(escrow.connect(arbiter).resolveDispute(TRADE_ID, buyerRefund, supplierPayout))
        .to.emit(escrow, "DisputeResolved")
        .withArgs(TRADE_ID, buyerRefund, supplierPayout);

      expect(await usdcToken.balanceOf(buyer.address)).to.equal(initialBuyerBalance + buyerRefund);
      expect(await usdcToken.balanceOf(supplier.address)).to.equal(initialSupplierBalance + supplierPayout);

      const trade = await escrow.getTrade(TRADE_ID);
      expect(trade.status).to.equal(2); // EscrowStatus.Released
      expect(trade.depositedAmount).to.equal(0);
    });

    it("Should reject resolving a dispute with incorrect total amounts", async function () {
      await escrow.connect(buyer).raiseDispute(TRADE_ID);

      const wrongBuyerRefund = ethers.parseUnits("3000", DECIMALS);
      const wrongSupplierPayout = ethers.parseUnits("6000", DECIMALS);

      await expect(
        escrow.connect(arbiter).resolveDispute(TRADE_ID, wrongBuyerRefund, wrongSupplierPayout)
      ).to.be.revertedWith("ArcTradeEscrow: dispute split sum must equal total deposited escrow");
    });

    it("Should reject non-arbiters from resolving disputes", async function () {
      await escrow.connect(buyer).raiseDispute(TRADE_ID);
      await expect(
        escrow.connect(admin).resolveDispute(TRADE_ID, 0, TRADE_AMOUNT)
      ).to.be.revertedWith("AccessControl: account is missing role");
    });
  });

  describe("Refund Triggers", function () {
    it("Should allow supplier to trigger a full refund back to the buyer", async function () {
      await escrow.connect(admin).createTrade(TRADE_ID, buyer.address, supplier.address, TRADE_AMOUNT);
      const escrowAddress = await escrow.getAddress();
      await usdcToken.connect(buyer).approve(escrowAddress, TRADE_AMOUNT);
      await escrow.connect(buyer).deposit(TRADE_ID);

      const initialBuyerBalance = await usdcToken.balanceOf(buyer.address);

      await expect(escrow.connect(supplier).refundBuyer(TRADE_ID))
        .to.emit(escrow, "FundsRefunded")
        .withArgs(TRADE_ID, TRADE_AMOUNT);

      expect(await usdcToken.balanceOf(buyer.address)).to.equal(initialBuyerBalance + TRADE_AMOUNT);
      
      const trade = await escrow.getTrade(TRADE_ID);
      expect(trade.status).to.equal(3); // EscrowStatus.Refunded
    });
  });
});
