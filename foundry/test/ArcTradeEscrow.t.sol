// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/ArcTradeEscrow.sol";
import "../src/MockUSDC.sol";

/**
 * @title ArcTradeEscrowTest
 * @notice Foundry test suite covering unit tests, access controls, escrow deposits, releases, refunds, disputes, and pause guards.
 */
interface VmCheat {
    function startPrank(address sender) external;
    function stopPrank() external;
    function expectRevert(bytes calldata revertData) external;
    function expectEmit(bool checkTopic1, bool checkTopic2, bool checkTopic3, bool checkData) external;
}

contract ArcTradeEscrowTest {
    VmCheat internal constant vm = VmCheat(address(uint160(uint256(keccak256("hevm cheat code")))));

    ArcTradeEscrow internal escrow;
    MockUSDC internal usdc;

    address internal admin = address(0xA11CE);
    address internal arbiter = address(0xB0B);
    address internal buyer = address(0x1111);
    address internal supplier = address(0x2222);
    address internal attacker = address(0xDEAD);

    string internal constant TRADE_ID = "TRD-ARC-2026-99";
    uint256 internal constant TRADE_AMOUNT = 50_000 * 10**6; // $50,000 USDC

    event TradeCreated(string tradeId, address indexed buyer, address indexed supplier, uint256 amount);
    event FundsLocked(string tradeId, uint256 amount);
    event FundsReleased(string tradeId, uint256 amount);
    event FundsRefunded(string tradeId, uint256 amount);
    event DisputeRaised(string tradeId, address indexed raisedBy);
    event DisputeResolved(string tradeId, uint256 buyerRefundAmount, uint256 supplierPayoutAmount);

    function setUp() public {
        // Deploy Mock USDC
        vm.startPrank(admin);
        usdc = new MockUSDC();

        // Deploy Escrow Contract
        escrow = new ArcTradeEscrow(address(usdc), admin, arbiter);

        // Mint USDC to buyer
        usdc.mint(buyer, 500_000 * 10**6);
        vm.stopPrank();

        // Buyer approves Escrow contract
        vm.startPrank(buyer);
        usdc.approve(address(escrow), type(uint256).max);
        vm.stopPrank();
    }

    // --- Test 1: Initialization & Role Assignment ---
    function test_Initialization() public view {
        require(address(escrow.usdcToken()) == address(usdc), "Token mismatch");
        require(escrow.hasRole(escrow.DEFAULT_ADMIN_ROLE(), admin), "Admin role missing");
        require(escrow.hasRole(escrow.MANAGER_ROLE(), admin), "Manager role missing");
        require(escrow.hasRole(escrow.ARBITER_ROLE(), arbiter), "Arbiter role missing");
        require(!escrow.hasRole(escrow.MANAGER_ROLE(), attacker), "Attacker should not have manager role");
    }

    // --- Test 2: Trade Creation ---
    function test_CreateTrade_Success() public {
        vm.startPrank(admin);
        
        vm.expectEmit(true, true, true, true);
        emit TradeCreated(TRADE_ID, buyer, supplier, TRADE_AMOUNT);

        escrow.createTrade(TRADE_ID, buyer, supplier, TRADE_AMOUNT);
        vm.stopPrank();

        (
            string memory id,
            address b,
            address s,
            uint256 amount,
            uint256 deposited,
            ArcTradeEscrow.EscrowStatus status,
            ,,
        ) = escrow.getTrade(TRADE_ID);

        require(keccak256(bytes(id)) == keccak256(bytes(TRADE_ID)), "Trade ID mismatch");
        require(b == buyer, "Buyer mismatch");
        require(s == supplier, "Supplier mismatch");
        require(amount == TRADE_AMOUNT, "Amount mismatch");
        require(deposited == 0, "Deposited should be zero");
        require(status == ArcTradeEscrow.EscrowStatus.Pending, "Status should be Pending");
    }

    function test_CreateTrade_RevertUnauthorized() public {
        vm.startPrank(attacker);
        vm.expectRevert("AccessControl: account is missing role");
        escrow.createTrade(TRADE_ID, buyer, supplier, TRADE_AMOUNT);
        vm.stopPrank();
    }

    // --- Test 3: Deposit & Automatic Escrow Locking ---
    function test_DepositAndLock_Success() public {
        vm.startPrank(admin);
        escrow.createTrade(TRADE_ID, buyer, supplier, TRADE_AMOUNT);
        vm.stopPrank();

        vm.startPrank(buyer);
        vm.expectEmit(true, true, true, true);
        emit FundsLocked(TRADE_ID, TRADE_AMOUNT);

        escrow.deposit(TRADE_ID);
        vm.stopPrank();

        (,,,, uint256 deposited, ArcTradeEscrow.EscrowStatus status,,,) = escrow.getTrade(TRADE_ID);
        require(deposited == TRADE_AMOUNT, "Deposited amount wrong");
        require(status == ArcTradeEscrow.EscrowStatus.Locked, "Status should be Locked");
        require(usdc.balanceOf(address(escrow)) == TRADE_AMOUNT, "Contract USDC balance wrong");
    }

    // --- Test 4: Escrow Release to Supplier ---
    function test_ReleaseFunds_BuyerTrigger() public {
        // Setup trade & deposit
        vm.startPrank(admin);
        escrow.createTrade(TRADE_ID, buyer, supplier, TRADE_AMOUNT);
        vm.stopPrank();

        vm.startPrank(buyer);
        escrow.deposit(TRADE_ID);

        uint256 initSupplierBal = usdc.balanceOf(supplier);

        vm.expectEmit(true, true, true, true);
        emit FundsReleased(TRADE_ID, TRADE_AMOUNT);

        escrow.releaseFunds(TRADE_ID);
        vm.stopPrank();

        require(usdc.balanceOf(supplier) == initSupplierBal + TRADE_AMOUNT, "Supplier payout failed");
        (,,,,, ArcTradeEscrow.EscrowStatus status,,,) = escrow.getTrade(TRADE_ID);
        require(status == ArcTradeEscrow.EscrowStatus.Released, "Status should be Released");
    }

    // --- Test 5: Refund to Buyer ---
    function test_RefundBuyer_SupplierConsent() public {
        vm.startPrank(admin);
        escrow.createTrade(TRADE_ID, buyer, supplier, TRADE_AMOUNT);
        vm.stopPrank();

        vm.startPrank(buyer);
        escrow.deposit(TRADE_ID);
        vm.stopPrank();

        uint256 initBuyerBal = usdc.balanceOf(buyer);

        vm.startPrank(supplier);
        vm.expectEmit(true, true, true, true);
        emit FundsRefunded(TRADE_ID, TRADE_AMOUNT);

        escrow.refundBuyer(TRADE_ID);
        vm.stopPrank();

        require(usdc.balanceOf(buyer) == initBuyerBal + TRADE_AMOUNT, "Buyer refund failed");
    }

    // --- Test 6: Dispute Raising & Arbiter Resolution ---
    function test_DisputeAndArbiterResolution() public {
        vm.startPrank(admin);
        escrow.createTrade(TRADE_ID, buyer, supplier, TRADE_AMOUNT);
        vm.stopPrank();

        vm.startPrank(buyer);
        escrow.deposit(TRADE_ID);

        // Raise Dispute
        vm.expectEmit(true, true, true, true);
        emit DisputeRaised(TRADE_ID, buyer);
        escrow.raiseDispute(TRADE_ID);
        vm.stopPrank();

        (,,,,, ArcTradeEscrow.EscrowStatus disputedStatus,,,) = escrow.getTrade(TRADE_ID);
        require(disputedStatus == ArcTradeEscrow.EscrowStatus.Disputed, "Status should be Disputed");

        // Split 60% buyer refund ($30,000) & 40% supplier payout ($20,000)
        uint256 buyerRefund = 30_000 * 10**6;
        uint256 supplierPayout = 20_000 * 10**6;

        uint256 initBuyerBal = usdc.balanceOf(buyer);
        uint256 initSupplierBal = usdc.balanceOf(supplier);

        vm.startPrank(arbiter);
        vm.expectEmit(true, true, true, true);
        emit DisputeResolved(TRADE_ID, buyerRefund, supplierPayout);

        escrow.resolveDispute(TRADE_ID, buyerRefund, supplierPayout);
        vm.stopPrank();

        require(usdc.balanceOf(buyer) == initBuyerBal + buyerRefund, "Buyer dispute split failed");
        require(usdc.balanceOf(supplier) == initSupplierBal + supplierPayout, "Supplier dispute split failed");
    }

    // --- Test 7: Pausable Guards ---
    function test_PauseEmergency() public {
        vm.startPrank(admin);
        escrow.pause();

        vm.expectRevert("Pausable: paused");
        escrow.createTrade(TRADE_ID, buyer, supplier, TRADE_AMOUNT);

        escrow.unpause();
        escrow.createTrade(TRADE_ID, buyer, supplier, TRADE_AMOUNT);
        vm.stopPrank();
    }
}
