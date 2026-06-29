import { Trade, Shipment, Dispute, Notification, FlaggedTrade, User } from './types';

export const INITIAL_USER: User = {
  fullName: 'Alex Vance',
  companyName: 'Global BioTech Corp',
  email: 'alex@globalbiotech.com',
  role: 'buyer',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASOdZbR3jY_CpFY_OH-vJLulFRIBj7sBZTIml4SRX7G02fFLkYBKRztL1RqwFtq5A3NU-bqDlVofyvy3ds3AlXYqWsCyt8d-8d6XGNq0mCOQnFRxIcyUc05mhUNRWjgudT_vrjw9aUlkMZ6lJQFBJHCJAxP2BbYS4RnBePvNC63Bk3V4Kf_fnzXSjj-jQjoekap7imZBTlVcaVLYUmiqDPbbOTGfyWSk9PdKDbqAFwVl3nYWT8FoHA2jhC6QMVX37wCEcgFK-yfdI',
  walletBalance: 1240500.00,
  walletAddress: '0x8aF...E492',
  isLoggedIn: true,
};

export const INITIAL_TRADES: Trade[] = [
  {
    id: 'TRD-8829-QX',
    title: 'Precision Medical Components (Lot A-12)',
    description: 'Detailed manifest of medical-grade surgical steel needles, sterile syringes, and customized titanium bone screws. All compliant with ISO 13485 standards.',
    hsCode: '8517.13.00',
    quantity: 1240,
    valueUsdc: 124500.00,
    escrowFee: 186.75,
    networkGas: 4.20,
    totalPayable: 124690.95,
    supplierEmail: 'sales@shenzhen-logisense.com',
    targetDeliveryDate: '2026-07-15',
    shippingMethod: 'Air Freight (Express)',
    status: 'escrow_locked',
    createdDate: 'Oct 24, 2023',
    lockedDate: 'Oct 25, 2023',
    verificationHash: '0x71ca84fa...a3f9',
    agreementFile: 'Trade_Agreement_V4.pdf',
    buyerName: 'Alex Vance',
    buyerCompany: 'Global BioTech Corp'
  },
  {
    id: 'TRD-4920',
    title: 'Industrial Copper Anodes Shipment',
    description: 'High-purity electrolytic copper anodes for electroplating machinery fabrication.',
    hsCode: '7403.11.00',
    quantity: 500,
    valueUsdc: 450000.00,
    escrowFee: 675.00,
    networkGas: 4.20,
    totalPayable: 450679.20,
    supplierEmail: 'shipping@global-logistics.com',
    targetDeliveryDate: '2026-07-20',
    shippingMethod: 'Ocean Freight (Eco)',
    status: 'shipped',
    createdDate: 'Oct 22, 2023',
    lockedDate: 'Oct 23, 2023',
    shippedDate: 'Oct 24, 2023',
    verificationHash: '0x32ba51ff...c502',
    agreementFile: 'Copper_Trade_Manifest_V2.pdf',
    buyerName: 'Alex Vance',
    buyerCompany: 'Global BioTech Corp'
  },
  {
    id: 'TRD-MK002',
    title: 'Premium Silicon Wafers Tier-1',
    description: '300mm ultra-flat raw silicon wafers for semiconductor microchip etching.',
    hsCode: '3818.00.00',
    quantity: 2000,
    valueUsdc: 980000.00,
    escrowFee: 1470.00,
    networkGas: 4.20,
    totalPayable: 981474.20,
    supplierEmail: 'contracts@secure-escrow.com',
    targetDeliveryDate: '2026-08-01',
    shippingMethod: 'Air Freight (Express)',
    status: 'created',
    createdDate: 'Oct 26, 2023',
    verificationHash: '0x99ff248a...eef2',
    agreementFile: 'Silicon_Agreement_Signed.pdf',
    buyerName: 'Alex Vance',
    buyerCompany: 'Global BioTech Corp'
  },
  {
    id: 'TRD-DISP-01',
    title: 'Heavy Machining Drill Heads',
    description: 'High-durability diamond-tipped commercial drill bits for heavy metal extraction.',
    hsCode: '8207.50.00',
    quantity: 350,
    valueUsdc: 248500.00,
    escrowFee: 372.75,
    networkGas: 4.20,
    totalPayable: 248876.95,
    supplierEmail: 'orders@starlight-logistics.com',
    targetDeliveryDate: '2026-06-10',
    shippingMethod: 'Ocean Freight (Eco)',
    status: 'disputed',
    createdDate: 'Oct 20, 2023',
    lockedDate: 'Oct 21, 2023',
    shippedDate: 'Oct 23, 2023',
    verificationHash: '0xbc94df11...11ff',
    agreementFile: 'Drill_Heads_Spec_Approved.pdf',
    buyerName: 'Alex Vance',
    buyerCompany: 'Global BioTech Corp'
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    tradeId: 'TRD-8829-QX',
    trackingNumber: 'AB-992-X401-22',
    carrier: 'Global AeroLogix',
    service: 'Express Port-to-Port',
    weightKg: 1240,
    origin: 'ORD, Chicago',
    destination: 'LHR, London',
    eta: 'In 14 Hours',
    currentLocation: 'Over the Atlantic Ocean (En route: London)',
    status: 'in_transit',
    history: [
      {
        status: 'order_created',
        title: 'Order Created',
        subtitle: 'Shipment data received',
        date: 'Nov 23, 10:45 AM'
      },
      {
        status: 'picked_up',
        title: 'Picked Up',
        subtitle: "O'Hare Logistics Center",
        date: 'Nov 23, 04:12 PM'
      },
      {
        status: 'in_transit',
        title: 'In Transit',
        subtitle: 'International Flight AF-203',
        date: 'Nov 24, 08:30 AM'
      },
      {
        status: 'delivered',
        title: 'Delivered',
        subtitle: 'Expected at Heathrow Terminal 4',
        date: 'Scheduled Nov 25'
      }
    ]
  },
  {
    tradeId: 'TRD-4920',
    trackingNumber: 'MAERSK-991204',
    carrier: 'Maersk Line',
    service: 'Eco Sea Cargo',
    weightKg: 8500,
    origin: 'Port of Shanghai',
    destination: 'Port of Los Angeles, US',
    eta: '5 Days',
    currentLocation: 'Pacific Ocean Corridor',
    status: 'in_transit',
    history: [
      {
        status: 'order_created',
        title: 'Cargo Dispatched',
        subtitle: 'Shanghai Logistics Hub',
        date: 'Oct 24, 02:00 PM'
      }
    ]
  }
];

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'ABC-98441-22',
    tradeId: 'TRD-DISP-01',
    reason: 'Damaged Goods / QC Failure',
    description: 'The shipment arrived 4 days late and 15% of the inventory (Model ZX-10) was found to have significant water damage. Supplier\'s logistics provider failed to use moisture-proof crating as specified in the Bill of Lading.',
    status: 'under_review',
    buyerEvidenceText: 'Water marks are clearly visible across the copper casing of the equipment. Humidity meters in the shipment box show it exceeded critical 85% thresholds.',
    buyerEvidenceFiles: ['Damaged_Box_Photo.png', 'Humidity_Log.csv'],
    supplierEvidenceText: 'We have provided internal photos showing all crates were perfectly sealed and wrapped before leaving the warehouse. The damage appears to have occurred during the final mile delivery which was booked by the buyer, not the supplier.',
    supplierEvidenceFiles: ['Departure_Logs.xlsx', 'Warehouse_Exit_Checklist.pdf'],
    dateOpened: 'Oct 24, 14:02',
    mediationDate: 'Oct 25, 09:15',
    settlementValue: 248500.00,
    verifiedParty: 'Starlight Logistics Ltd.'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Escrow Funds Released',
    message: 'The escrow amount of $142,500.00 for Trade ID #TRD-8821 has been successfully released to your primary wallet.',
    timestamp: '2m ago',
    type: 'escrow',
    read: false,
    actionLabel: 'View Wallet',
    actionScreen: 'wallet'
  },
  {
    id: 'notif-2',
    title: 'Trade Proposal Received',
    message: 'Global Logistics Corp has proposed a new trade for 500 Metric Tons of Industrial Copper. Action required for approval.',
    timestamp: '45m ago',
    type: 'trades',
    read: false,
    actionLabel: 'Review Proposal',
    actionScreen: 'incoming_orders'
  },
  {
    id: 'notif-3',
    title: 'Shipment Delayed',
    message: 'Carrier reported a logistical delay for B/L #SHP-9902 at Port of Singapore. New ETA: Oct 24, 2023.',
    timestamp: '1d ago',
    type: 'shipments',
    read: true,
    actionLabel: 'Track Shipment',
    actionScreen: 'shipment_tracker'
  },
  {
    id: 'notif-4',
    title: 'Compliance Verified',
    message: 'Annual KYC documentation for ArcBridge Institutional Account has been verified and approved.',
    timestamp: '1d ago',
    type: 'escrow',
    read: true,
    actionLabel: 'View Certificate',
    actionScreen: 'settings'
  }
];

export const INITIAL_FLAGGED_TRADES: FlaggedTrade[] = [
  {
    id: 'TX-904221',
    assetPair: 'USD/SGD',
    type: 'Spot',
    riskLevel: 'HIGH',
    amount: '$14,250,000',
    userEntity: 'Alpha Assets Ltd (KYB Tier 3)',
    activityType: 'Inbound Transfer'
  },
  {
    id: 'TX-884029',
    assetPair: 'EUR/GBP',
    type: 'Forward',
    riskLevel: 'MEDIUM',
    amount: '$125,000',
    userEntity: 'Nordic Trust (KYB Tier 4)',
    activityType: 'Escrow Release'
  },
  {
    id: 'TX-771239',
    assetPair: 'USD/BRL',
    type: 'Swap',
    riskLevel: 'LOW',
    amount: '--',
    userEntity: 'Blue Horizon Intl (KYB Tier 2)',
    activityType: 'Account Modification'
  },
  {
    id: 'TX-910444',
    assetPair: 'AUD/JPY',
    type: 'Spot',
    riskLevel: 'HIGH',
    amount: '$4,250,100',
    userEntity: 'Horizon Ventures (KYB Tier 1)',
    activityType: 'Bulk Withdraw'
  }
];

export const INCOMING_SUPPLIER_ORDERS = [
  {
    id: 'SO-1',
    buyer: 'Nordic Alpha Capital',
    country: 'Norway',
    valueUsdc: 1420500,
    status: 'pending'
  },
  {
    id: 'SO-2',
    buyer: 'Sahara Logistics Ltd',
    country: 'Egypt',
    valueUsdc: 85200,
    status: 'pending'
  },
  {
    id: 'SO-3',
    buyer: 'Pacific Wealth LP',
    country: 'Singapore',
    valueUsdc: 3000000,
    status: 'pending'
  },
  {
    id: 'SO-4',
    buyer: 'Mercado Global Ltd',
    country: 'Brazil',
    valueUsdc: 240000,
    status: 'pending'
  }
];
