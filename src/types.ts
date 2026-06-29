export type Role = 'buyer' | 'supplier' | 'compliance';

export interface User {
  fullName: string;
  companyName: string;
  email: string;
  role: Role;
  avatar?: string;
  walletBalance: number;
  walletAddress: string;
  isLoggedIn: boolean;
}

export type TradeStatus = 'draft' | 'created' | 'escrow_locked' | 'shipped' | 'completed' | 'disputed';

export interface Trade {
  id: string;
  title: string;
  description: string;
  hsCode?: string;
  quantity: number;
  valueUsdc: number;
  escrowFee: number;
  networkGas: number;
  totalPayable: number;
  supplierEmail: string;
  targetDeliveryDate: string;
  shippingMethod: string;
  status: TradeStatus;
  createdDate: string;
  lockedDate?: string;
  shippedDate?: string;
  completedDate?: string;
  verificationHash: string;
  agreementFile: string;
  buyerName: string;
  buyerCompany: string;
}

export type ShipmentStatus = 'created' | 'picked_up' | 'in_transit' | 'delivered';

export interface Shipment {
  tradeId: string;
  trackingNumber: string;
  carrier: string;
  service: string;
  weightKg: number;
  origin: string;
  destination: string;
  eta: string;
  currentLocation: string;
  status: ShipmentStatus;
  history: Array<{
    status: ShipmentStatus | 'order_created';
    title: string;
    subtitle: string;
    date: string;
  }>;
}

export type DisputeStatus = 'under_review' | 'resolved_refunded' | 'resolved_released';

export interface Dispute {
  id: string;
  tradeId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  buyerEvidenceText: string;
  buyerEvidenceFiles: string[];
  supplierEvidenceText?: string;
  supplierEvidenceFiles?: string[];
  dateOpened: string;
  mediationDate?: string;
  settlementValue: number;
  verifiedParty: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'trades' | 'shipments' | 'escrow';
  read: boolean;
  actionLabel?: string;
  actionScreen?: string;
}

export interface FlaggedTrade {
  id: string;
  assetPair: string;
  type: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  amount: string;
  userEntity: string;
  activityType: string;
}

export interface ExplorerTx {
  hash: string;
  block: number;
  timestamp: string;
  method: 'DeployEscrowContract' | 'LockEscrow' | 'DispatchCargo' | 'ReleaseEscrow' | 'FileQAClaim' | 'ArbitrateRefund' | 'ArbitrateRelease' | 'DeployLedgerRegistry';
  from: string;
  to: string;
  value: number;
  status: 'success' | 'pending' | 'failed';
  gasUsed: number;
  gasPrice: number;
  tradeId?: string;
  payload?: string;
}

