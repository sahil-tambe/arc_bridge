// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Standard interface of the ERC20 standard.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @dev SafeERC20 wrapper that throws on failures.
 */
library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        require(token.transfer(to, value), "SafeERC20: ERC20 transfer failed");
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        require(token.transferFrom(from, to, value), "SafeERC20: ERC20 transferFrom failed");
    }
}

/**
 * @dev Simple AccessControl contract implementation.
 */
abstract contract AccessControl {
    struct RoleData {
        mapping(address => bool) members;
        bytes32 adminRole;
    }

    mapping(bytes32 => RoleData) private _roles;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    function hasRole(bytes32 role, address account) public view virtual returns (bool) {
        return _roles[role].members[account];
    }

    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, msg.sender);
    }

    function _checkRole(bytes32 role, address account) internal view virtual {
        if (!hasRole(role, account)) {
            revert("AccessControl: account is missing role");
        }
    }

    function _grantRole(bytes32 role, address account) internal virtual {
        if (!hasRole(role, account)) {
            _roles[role].members[account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    function _revokeRole(bytes32 role, address account) internal virtual {
        if (hasRole(role, account)) {
            _roles[role].members[account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }
}

/**
 * @dev ReentrancyGuard implementation to prevent reentrant calls.
 */
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

/**
 * @dev Pausable implementation allowing emergency stops.
 */
abstract contract Pausable {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    constructor() {
        _paused = false;
    }

    modifier whenNotPaused() {
        require(!paused(), "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(paused(), "Pausable: not paused");
        _;
    }

    function paused() public view virtual returns (bool) {
        return _paused;
    }

    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}

/**
 * @title ArcTradeEscrow
 * @author Senior Blockchain Engineer
 * @notice Enterprise-grade Delivery-versus-Payment (DvP) escrow smart contract
 * for cross-border international trade built for the Arc ecosystem using stablecoins (USDC).
 */
contract ArcTradeEscrow is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // --- Role Constants ---
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    // --- State Variables ---
    IERC20 public immutable usdcToken; // Stablecoin utilized for trade values

    enum EscrowStatus {
        Pending,
        Locked,
        Released,
        Refunded,
        Disputed
    }

    struct Trade {
        string tradeId;
        address buyer;
        address supplier;
        uint256 amount;
        uint256 depositedAmount;
        EscrowStatus status;
        bool exists;
        uint256 createdAt;
        uint256 lockedAt;
        uint256 completedAt;
    }

    // Mapping from unique String tradeId to Trade struct
    mapping(string => Trade) private _trades;

    // --- Events ---
    event TradeCreated(string tradeId, address indexed buyer, address indexed supplier, uint256 amount);
    event FundsLocked(string tradeId, uint256 amount);
    event FundsReleased(string tradeId, uint256 amount);
    event FundsRefunded(string tradeId, uint256 amount);
    event DisputeRaised(string tradeId, address indexed raisedBy);
    event DisputeResolved(string tradeId, uint256 buyerRefundAmount, uint256 supplierPayoutAmount);

    /**
     * @notice Constructor initializes the token contract, setup platform admin and arbiter roles.
     * @param _usdcToken Address of the stablecoin (USDC) to be utilized for escrow agreements.
     * @param _admin Address of the primary deployer and platform administrator.
     * @param _arbiter Address of the compliance arbitration authority.
     */
    constructor(address _usdcToken, address _admin, address _arbiter) {
        require(_usdcToken != address(0), "ArcTradeEscrow: Invalid token address");
        require(_admin != address(0), "ArcTradeEscrow: Invalid admin address");
        require(_arbiter != address(0), "ArcTradeEscrow: Invalid arbiter address");

        usdcToken = IERC20(_usdcToken);

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MANAGER_ROLE, _admin);
        _grantRole(ARBITER_ROLE, _arbiter);
    }

    /**
     * @notice Creates a new commercial trade parameter sheet on-chain.
     * @param tradeId Unique string ID mapping back to PostgreSQL.
     * @param buyer Address of the purchasing entity authorized to deposit.
     * @param supplier Address of the vendor authorized to receive the final settlement.
     * @param amount Stablecoin value (in 6-decimal format for USDC) of the purchase agreement.
     */
    function createTrade(
        string calldata tradeId,
        address buyer,
        address supplier,
        uint256 amount
    ) external onlyRole(MANAGER_ROLE) whenNotPaused {
        require(bytes(tradeId).length > 0, "ArcTradeEscrow: tradeId cannot be empty");
        require(!_trades[tradeId].exists, "ArcTradeEscrow: trade already exists");
        require(buyer != address(0) && supplier != address(0), "ArcTradeEscrow: zero address invalid");
        require(buyer != supplier, "ArcTradeEscrow: buyer and supplier cannot be identical");
        require(amount > 0, "ArcTradeEscrow: amount must exceed zero");

        _trades[tradeId] = Trade({
            tradeId: tradeId,
            buyer: buyer,
            supplier: supplier,
            amount: amount,
            depositedAmount: 0,
            status: EscrowStatus.Pending,
            exists: true,
            createdAt: block.timestamp,
            lockedAt: 0,
            completedAt: 0
        });

        emit TradeCreated(tradeId, buyer, supplier, amount);
    }

    /**
     * @notice Buyer deposits the required USDC parameters into the escrow contract.
     * @param tradeId The unique commercial agreement identifier.
     */
    function deposit(string calldata tradeId) external nonReentrant whenNotPaused {
        Trade storage trade = _trades[tradeId];
        require(trade.exists, "ArcTradeEscrow: trade does not exist");
        require(trade.status == EscrowStatus.Pending, "ArcTradeEscrow: incorrect status for deposit");
        require(msg.sender == trade.buyer, "ArcTradeEscrow: only authorized buyer can deposit");

        uint256 requiredAmount = trade.amount - trade.depositedAmount;
        require(requiredAmount > 0, "ArcTradeEscrow: trade already fully funded");

        // Transfer funds from Buyer to Escrow
        usdcToken.safeTransferFrom(msg.sender, address(this), requiredAmount);
        trade.depositedAmount += requiredAmount;

        // Auto transition state to Locked once 100% funded
        trade.status = EscrowStatus.Locked;
        trade.lockedAt = block.timestamp;

        emit FundsLocked(tradeId, trade.depositedAmount);
    }

    /**
     * @notice Alternative explicit administrative or buyer-driven manual locking trigger.
     * @param tradeId The unique commercial agreement identifier.
     */
    function lockFunds(string calldata tradeId) external onlyRole(MANAGER_ROLE) whenNotPaused {
        Trade storage trade = _trades[tradeId];
        require(trade.exists, "ArcTradeEscrow: trade does not exist");
        require(trade.status == EscrowStatus.Pending, "ArcTradeEscrow: incorrect status for locking");
        require(trade.depositedAmount == trade.amount, "ArcTradeEscrow: trade is not fully deposited");

        trade.status = EscrowStatus.Locked;
        trade.lockedAt = block.timestamp;

        emit FundsLocked(tradeId, trade.depositedAmount);
    }

    /**
     * @notice Releases the escrowed USDC directly to the supplier upon successful verification.
     * @param tradeId The unique commercial agreement identifier.
     */
    function releaseFunds(string calldata tradeId) external nonReentrant whenNotPaused {
        Trade storage trade = _trades[tradeId];
        require(trade.exists, "ArcTradeEscrow: trade does not exist");
        require(
            trade.status == EscrowStatus.Locked,
            "ArcTradeEscrow: funds are not locked"
        );
        require(
            msg.sender == trade.buyer || hasRole(MANAGER_ROLE, msg.sender),
            "ArcTradeEscrow: unauthorized release trigger"
        );

        uint256 payout = trade.depositedAmount;
        require(payout > 0, "ArcTradeEscrow: zero balance in escrow");

        trade.depositedAmount = 0;
        trade.status = EscrowStatus.Released;
        trade.completedAt = block.timestamp;

        // Transfer funds to the Supplier
        usdcToken.safeTransfer(trade.supplier, payout);

        emit FundsReleased(tradeId, payout);
    }

    /**
     * @notice Refunds locked collateral back to the buyer prior to transit, or upon supplier consent.
     * @param tradeId The unique commercial agreement identifier.
     */
    function refundBuyer(string calldata tradeId) external nonReentrant whenNotPaused {
        Trade storage trade = _trades[tradeId];
        require(trade.exists, "ArcTradeEscrow: trade does not exist");
        require(
            trade.status == EscrowStatus.Pending || trade.status == EscrowStatus.Locked,
            "ArcTradeEscrow: cannot refund in current state"
        );
        require(
            msg.sender == trade.supplier || hasRole(MANAGER_ROLE, msg.sender),
            "ArcTradeEscrow: unauthorized refund trigger"
        );

        uint256 refundAmount = trade.depositedAmount;
        require(refundAmount > 0, "ArcTradeEscrow: zero deposit to refund");

        trade.depositedAmount = 0;
        trade.status = EscrowStatus.Refunded;
        trade.completedAt = block.timestamp;

        // Return funds to the Buyer
        usdcToken.safeTransfer(trade.buyer, refundAmount);

        emit FundsRefunded(tradeId, refundAmount);
    }

    /**
     * @notice Raises a dispute, locking the escrow status to freeze any release or refund operations.
     * @param tradeId The unique commercial agreement identifier.
     */
    function raiseDispute(string calldata tradeId) external whenNotPaused {
        Trade storage trade = _trades[tradeId];
        require(trade.exists, "ArcTradeEscrow: trade does not exist");
        require(
            trade.status == EscrowStatus.Locked,
            "ArcTradeEscrow: trade must be locked to raise dispute"
        );
        require(
            msg.sender == trade.buyer || msg.sender == trade.supplier || hasRole(MANAGER_ROLE, msg.sender),
            "ArcTradeEscrow: unauthorized dispute trigger"
        );

        trade.status = EscrowStatus.Disputed;

        emit DisputeRaised(tradeId, msg.sender);
    }

    /**
     * @notice Resolves an active dispute, dividing the frozen funds between buyer and supplier.
     * @param tradeId The unique commercial agreement identifier.
     * @param buyerRefundAmount Amount to return to the buyer (in decimals matching token).
     * @param supplierPayoutAmount Amount to payout to the supplier (in decimals matching token).
     */
    function resolveDispute(
        string calldata tradeId,
        uint256 buyerRefundAmount,
        uint256 supplierPayoutAmount
    ) external onlyRole(ARBITER_ROLE) nonReentrant whenNotPaused {
        Trade storage trade = _trades[tradeId];
        require(trade.exists, "ArcTradeEscrow: trade does not exist");
        require(trade.status == EscrowStatus.Disputed, "ArcTradeEscrow: trade is not disputed");

        uint256 totalSplit = buyerRefundAmount + supplierPayoutAmount;
        require(
            totalSplit == trade.depositedAmount,
            "ArcTradeEscrow: dispute split sum must equal total deposited escrow"
        );

        trade.depositedAmount = 0;
        trade.status = EscrowStatus.Released; // Transformed to released consensus block
        trade.completedAt = block.timestamp;

        // Perform safe transfers
        if (buyerRefundAmount > 0) {
            usdcToken.safeTransfer(trade.buyer, buyerRefundAmount);
        }
        if (supplierPayoutAmount > 0) {
            usdcToken.safeTransfer(trade.supplier, supplierPayoutAmount);
        }

        emit DisputeResolved(tradeId, buyerRefundAmount, supplierPayoutAmount);
    }

    /**
     * @notice Returns complete metadata for a given trade query.
     * @param tradeId The unique commercial agreement identifier.
     */
    function getTrade(string calldata tradeId)
        external
        view
        returns (
            string memory id,
            address buyer,
            address supplier,
            uint256 amount,
            uint256 depositedAmount,
            EscrowStatus status,
            uint256 createdAt,
            uint256 lockedAt,
            uint256 completedAt
        )
    {
        Trade storage trade = _trades[tradeId];
        require(trade.exists, "ArcTradeEscrow: trade does not exist");

        return (
            trade.tradeId,
            trade.buyer,
            trade.supplier,
            trade.amount,
            trade.depositedAmount,
            trade.status,
            trade.createdAt,
            trade.lockedAt,
            trade.completedAt
        );
    }

    // --- Emergency Control Functions ---

    /**
     * @notice Pause trade escrow creations and operations.
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Resume trade escrow creations and operations.
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
