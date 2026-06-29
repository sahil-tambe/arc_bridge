import { useState, useEffect } from 'react';
import {
  Shield,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  User,
  ArrowLeftRight,
  Menu,
  X,
  PlusCircle,
  Truck,
  AlertTriangle,
  LayoutDashboard,
  ClipboardList,
  Search,
  Globe,
  Cpu
} from 'lucide-react';

import {
  User as UserType,
  Trade,
  Shipment,
  Dispute,
  Notification,
  FlaggedTrade,
  Role,
  TradeStatus,
  ShipmentStatus,
  ExplorerTx
} from './types';

import {
  INITIAL_USER,
  INITIAL_TRADES,
  INITIAL_SHIPMENTS,
  INITIAL_DISPUTES,
  INITIAL_NOTIFICATIONS,
  INITIAL_FLAGGED_TRADES,
  INCOMING_SUPPLIER_ORDERS
} from './mockData';

import { getCurrentSession, setCurrentSession } from './utils/auth';

// View Imports
import CreateAccount from './components/CreateAccount';
import Login from './components/Login';
import BuyerDashboard from './components/BuyerDashboard';
import NewTrade from './components/NewTrade';
import TradeDetails from './components/TradeDetails';
import ShipmentTracker from './components/ShipmentTracker';
import DisputeCenter from './components/DisputeCenter';
import SupplierDashboard from './components/SupplierDashboard';
import PlatformOverview from './components/PlatformOverview';
import DisputeResolution from './components/DisputeResolution';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import ShipmentManager from './components/ShipmentManager';
import ArcExplorer from './components/ArcExplorer';
import WalletTreasury from './components/WalletTreasury';

const INITIAL_EXPLORER_TXS: ExplorerTx[] = [
  {
    hash: '0xarc0591fbe3a4c582df2c178a9d0c1b2a3f4e5d6c810a9f390022f48f2cbba05',
    block: 4219888,
    timestamp: '5 min ago',
    method: 'LockEscrow',
    from: '0x8aF2e49c81a20A2F7C2B30D19c6934A0a77FE492', // Alex Vance
    to: '0xArcBridgeEscrowVaultContract',
    value: 124500.00,
    status: 'success',
    gasUsed: 62450,
    gasPrice: 0.000000015,
    tradeId: 'TRD-8829-QX',
    payload: `{\n  "method": "LockEscrow",\n  "caller": "0x8aF...E492",\n  "args": {\n    "tradeId": "TRD-8829-QX",\n    "valueUsdc": 124500.00,\n    "supplierEmail": "sales@shenzhen-logisense.com"\n  }\n}`
  },
  {
    hash: '0xarc9522bf095b3d2a1c3e5f7b8a9d0c1b2a3f4e5d6c812bcde38ef50293fa910dcc',
    block: 4219882,
    timestamp: '25 min ago',
    method: 'DispatchCargo',
    from: '0x3fa99b2c3fa88d9018a9d0c1b2a3f4e5d6c812bc', // Sheng Hu / Supplier
    to: '0xArcBridgeEscrowVaultContract',
    value: 0,
    status: 'success',
    gasUsed: 45230,
    gasPrice: 0.000000015,
    tradeId: 'TRD-4920',
    payload: `{\n  "method": "DispatchCargo",\n  "caller": "0x3fa...B902",\n  "args": {\n    "tradeId": "TRD-4920",\n    "trackingNumber": "MAERSK-991204",\n    "carrier": "Maersk Line"\n  }\n}`
  },
  {
    hash: '0xarc1bf811a4c582df2c178a9d0c1b2a3f4e5d6c810a9f390022f48f2cbbba51f',
    block: 4219875,
    timestamp: '1 hour ago',
    method: 'LockEscrow',
    from: '0x8aF2e49c81a20A2F7C2B30D19c6934A0a77FE492', // Alex Vance
    to: '0xArcBridgeEscrowVaultContract',
    value: 450000.00,
    status: 'success',
    gasUsed: 62450,
    gasPrice: 0.000000015,
    tradeId: 'TRD-4920',
    payload: `{\n  "method": "LockEscrow",\n  "caller": "0x8aF...E492",\n  "args": {\n    "tradeId": "TRD-4920",\n    "valueUsdc": 450000.00,\n    "supplierEmail": "shipping@global-logistics.com"\n  }\n}`
  },
  {
    hash: '0xarc2c11095b3d2a1c3e5f7b8a9d0c1b2a3f4e5d6c810a9f390022f48f2cbba0567',
    block: 4219861,
    timestamp: '3 hours ago',
    method: 'DeployEscrowContract',
    from: '0x8aF2e49c81a20A2F7C2B30D19c6934A0a77FE492', // Alex Vance
    to: '0xArcBridgeRegistryContract',
    value: 0,
    status: 'success',
    gasUsed: 125000,
    gasPrice: 0.000000015,
    tradeId: 'TRD-MK002',
    payload: `{\n  "method": "DeployEscrowContract",\n  "caller": "0x8aF...E492",\n  "args": {\n    "tradeId": "TRD-MK002",\n    "buyerCompany": "Global BioTech Corp",\n    "escrowFee": 1470.00\n  }\n}`
  },
  {
    hash: '0xarc552aefbc94df110d293eb0415aefc00127e6dbff9a12bcde38ef50293fa910dcc',
    block: 4219842,
    timestamp: '5 hours ago',
    method: 'FileQAClaim',
    from: '0x8aF2e49c81a20A2F7C2B30D19c6934A0a77FE492', // Alex Vance
    to: '0xArcBridgeComplianceArbiterContract',
    value: 248500.00,
    status: 'success',
    gasUsed: 82400,
    gasPrice: 0.000000015,
    tradeId: 'TRD-DISP-01',
    payload: `{\n  "method": "FileQAClaim",\n  "caller": "0x8aF...E492",\n  "args": {\n    "tradeId": "TRD-DISP-01",\n    "reason": "Damaged during transit - seal broken",\n    "settlementValue": 248500.00\n  }\n}`
  },
  {
    hash: '0xarcdd9911ff095b3d2a1c3e5f7b8a9d0c1b2a3f4e5d6c810a9f390022f48f2cbba',
    block: 4219810,
    timestamp: '1 day ago',
    method: 'DeployLedgerRegistry',
    from: '0xComplianceOfficerOfficer001',
    to: '0xArcBridgeRegistryContract',
    value: 0,
    status: 'success',
    gasUsed: 350000,
    gasPrice: 0.000000015,
    payload: `{\n  "method": "DeployLedgerRegistry",\n  "caller": "0xCompliance...001",\n  "args": {\n    "version": "1.4.2",\n    "authorizedRoles": ["buyer", "supplier", "compliance"]\n  }\n}`
  }
];

// Safe localStorage wrappers to prevent issues in secure sandboxed iframes
const safeStorage = {
  getItem: (key: string, defaultValue: string = ''): string => {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Ignore
    }
  }
};

export default function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState<UserType>(() => {
    const session = getCurrentSession();
    if (session) return session;
    return { ...INITIAL_USER, isLoggedIn: false }; // Logged out by default
  });
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [flaggedTrades, setFlaggedTrades] = useState<FlaggedTrade[]>(INITIAL_FLAGGED_TRADES);
  const [incomingOrders, setIncomingOrders] = useState(INCOMING_SUPPLIER_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Navigation state
  // Initial screen depends on logged-in session, default to 'login'
  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    const session = getCurrentSession();
    if (session && session.isLoggedIn) {
      if (session.role === 'buyer') return 'dashboard';
      if (session.role === 'supplier') return 'supplier_dashboard';
      if (session.role === 'compliance') return 'platform_overview';
    }
    return 'login';
  });
  const [selectedTradeId, setSelectedTradeId] = useState<string>('TRD-8829-QX');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string>('ABC-98441-22');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Arc Testnet & Wallet Connection states
  const [walletConnected, setWalletConnected] = useState<boolean>(() => {
    return safeStorage.getItem('arc_wallet_connected') === 'true';
  });
  const [walletAddress, setWalletAddress] = useState<string>(() => {
    return safeStorage.getItem('arc_wallet_address') || '0xArcB429188aFb902f1a3e5d6c810a9f390022E492';
  });
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = safeStorage.getItem('arc_wallet_balance');
    return saved ? parseFloat(saved) : 250000;
  });
  const [currentBlock, setCurrentBlock] = useState<number>(4219890);
  const [testnetTransactions, setTestnetTransactions] = useState<ExplorerTx[]>(INITIAL_EXPLORER_TXS);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [connectingWalletProvider, setConnectingWalletProvider] = useState<string | null>(null);

  // Sync wallet to current user's profile if connected
  useEffect(() => {
    if (walletConnected) {
      setCurrentUser(prev => ({
        ...prev,
        walletAddress: walletAddress,
        walletBalance: walletBalance
      }));
    }
  }, [walletConnected, walletAddress, walletBalance]);

  // Live Mine Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlock(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const broadcastTestnetTransaction = (
    method: ExplorerTx['method'],
    tradeId: string | undefined,
    value: number,
    payloadArgs: Record<string, any>
  ) => {
    const txHash = `0xarc${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}b${Math.random().toString(16).substring(2, 6)}`;
    const nextBlock = currentBlock + 1;
    setCurrentBlock(nextBlock);

    const newTx: ExplorerTx = {
      hash: txHash,
      block: nextBlock,
      timestamp: 'Just now',
      method,
      from: walletConnected ? walletAddress : (currentUser.walletAddress || '0xunknown'),
      to: '0xArcBridgeEscrowVaultContract',
      value,
      status: 'success',
      gasUsed: Math.floor(40000 + Math.random() * 80000),
      gasPrice: 0.000000015,
      tradeId,
      payload: JSON.stringify({
        method,
        caller: walletConnected ? walletAddress : (currentUser.walletAddress || '0xunknown'),
        block: nextBlock,
        timestamp: 'Just now',
        args: {
          tradeId,
          value,
          ...payloadArgs
        }
      }, null, 2)
    };

    setTestnetTransactions(prev => [newTx, ...prev]);

    // Push notification pop-up
    const newNotif: Notification = {
      id: `notif-tx-${Date.now()}`,
      title: `Consensus Verified: ${method}`,
      message: `Tx ${txHash.substring(0, 12)}... confirmed in Block #${nextBlock} on Arc Testnet.`,
      timestamp: 'Just now',
      type: 'escrow',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleWalletTreasuryBroadcast = (
    method: 'LockEscrow' | 'ReleaseEscrow',
    tradeId: string,
    value: number,
    payloadArgs: any
  ) => {
    broadcastTestnetTransaction(method, tradeId, value, payloadArgs);
    if (method === 'LockEscrow') {
      setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'escrow_locked', lockedDate: 'Just now' } : t));
    } else if (method === 'ReleaseEscrow') {
      setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'completed', completedDate: 'Just now' } : t));
    }
  };

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  const handleSelectWalletProvider = (providerName: string) => {
    setConnectingWalletProvider(providerName);
    setTimeout(() => {
      const generatedAddress = '0xArcB' + Math.random().toString(16).substring(2, 10).toUpperCase() + Math.random().toString(16).substring(2, 10).toUpperCase() + 'E492';
      setWalletConnected(true);
      setWalletAddress(generatedAddress);
      safeStorage.setItem('arc_wallet_connected', 'true');
      safeStorage.setItem('arc_wallet_address', generatedAddress);
      
      // Notify
      const newNotif: Notification = {
        id: `notif-wallet-${Date.now()}`,
        title: 'Wallet Linked to Arc Testnet',
        message: `Successfully connected ${providerName} wallet. Address: ${generatedAddress.substring(0, 10)}... linked.`,
        timestamp: 'Just now',
        type: 'escrow',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);

      setConnectingWalletProvider(null);
      setIsWalletModalOpen(false);
    }, 1500);
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    safeStorage.removeItem('arc_wallet_connected');
    safeStorage.removeItem('arc_wallet_address');
    
    const newNotif: Notification = {
      id: `notif-wallet-${Date.now()}`,
      title: 'Wallet Disconnected',
      message: 'Arc Testnet Wallet session was terminated.',
      timestamp: 'Just now',
      type: 'escrow',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleFaucetRequest = () => {
    setWalletBalance(prev => {
      const newVal = prev + 10000;
      safeStorage.setItem('arc_wallet_balance', newVal.toString());
      return newVal;
    });

    const newNotif: Notification = {
      id: `notif-faucet-${Date.now()}`,
      title: 'Faucet Tokens Minted',
      message: 'Successfully minted +10,000 T-USDC testnet funds to your connected address.',
      timestamp: 'Just now',
      type: 'escrow',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Derived Values
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const currentTrade = trades.find(t => t.id === selectedTradeId) || trades[0];
  const currentShipment = shipments.find(s => s.tradeId === selectedTradeId) || shipments[0];
  const currentDispute = disputes.find(d => d.id === selectedDisputeId) || disputes[0];

  const getSearchResults = () => {
    if (!searchQuery.trim()) return { trades: [], shipments: [], disputes: [], notifications: [] };
    const query = searchQuery.toLowerCase();

    return {
      trades: trades.filter(t =>
        t.id.toLowerCase().includes(query) ||
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        (t.hsCode && t.hsCode.toLowerCase().includes(query)) ||
        t.buyerCompany.toLowerCase().includes(query) ||
        t.supplierEmail.toLowerCase().includes(query)
      ).slice(0, 3),

      shipments: shipments.filter(s =>
        s.trackingNumber.toLowerCase().includes(query) ||
        s.carrier.toLowerCase().includes(query) ||
        s.origin.toLowerCase().includes(query) ||
        s.destination.toLowerCase().includes(query)
      ).slice(0, 3),

      disputes: disputes.filter(d =>
        d.id.toLowerCase().includes(query) ||
        d.reason.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query)
      ).slice(0, 3),

      notifications: notifications.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      ).slice(0, 3)
    };
  };

  const searchResults = getSearchResults();
  const hasSearchResults = searchQuery.trim().length > 0 && (
    searchResults.trades.length > 0 ||
    searchResults.shipments.length > 0 ||
    searchResults.disputes.length > 0 ||
    searchResults.notifications.length > 0
  );

  // Helper callbacks
  const handleCreateAccount = (newUser: UserType) => {
    setCurrentUser(newUser);
    setCurrentSession(newUser);
    if (newUser.role === 'buyer') {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('supplier_dashboard');
    }
  };

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    setCurrentSession(user);

    if (user.role === 'buyer') {
      setCurrentScreen('dashboard');
    } else if (user.role === 'supplier') {
      setCurrentScreen('supplier_dashboard');
    } else {
      setCurrentScreen('platform_overview');
    }
  };

  const handleLogout = () => {
    setCurrentUser(prev => {
      const loggedOut = { ...prev, isLoggedIn: false };
      setCurrentSession(null);
      return loggedOut;
    });
    setCurrentScreen('login');
  };

  // Lifecycle flows (State synchronizations)
  const handleInitiateTrade = (tradeData: Omit<Trade, 'id' | 'createdDate' | 'verificationHash' | 'agreementFile' | 'buyerName' | 'buyerCompany'>) => {
    const tradeId = `TRD-${Math.floor(1000 + Math.random() * 9000)}-QX`;
    const newTrade: Trade = {
      ...tradeData,
      id: tradeId,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      verificationHash: `0x${Math.random().toString(16).substring(2, 10)}fa...${Math.random().toString(16).substring(2, 6)}`,
      agreementFile: 'Trade_Agreement_V4.pdf',
      buyerName: currentUser.fullName,
      buyerCompany: currentUser.companyName
    };

    setTrades(prev => [newTrade, ...prev]);

    // Create a matching shipment shell
    const newShipment: Shipment = {
      tradeId: tradeId,
      trackingNumber: `AB-992-X${Math.floor(100 + Math.random() * 900)}-22`,
      carrier: 'Global AeroLogix',
      service: 'Express Port-to-Port',
      weightKg: tradeData.quantity * 2,
      origin: 'SZX, Shenzhen',
      destination: 'LHR, London',
      eta: 'Awaiting dispatch',
      currentLocation: 'Supplier warehouse',
      status: 'created',
      history: [
        {
          status: 'order_created',
          title: 'Order Created',
          subtitle: 'Cargo dispatch pending supplier confirmation',
          date: 'Just now'
        }
      ]
    };
    setShipments(prev => [newShipment, ...prev]);

    // Add alert notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Trade Proposal Sent',
      message: `Your contract proposal for ${tradeData.title} was sent to ${tradeData.supplierEmail}.`,
      timestamp: 'Just now',
      type: 'trades',
      read: false,
      actionLabel: 'View Details',
      actionScreen: 'trade_details'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Deduct total payable from wallet balance (simulating real escrow locking!)
    if (walletConnected) {
      setWalletBalance(prev => {
        const newVal = parseFloat((prev - tradeData.totalPayable).toFixed(2));
        safeStorage.setItem('arc_wallet_balance', newVal.toString());
        return newVal;
      });
    } else {
      setCurrentUser(prev => ({
        ...prev,
        walletBalance: parseFloat((prev.walletBalance - tradeData.totalPayable).toFixed(2))
      }));
    }

    broadcastTestnetTransaction('LockEscrow', tradeId, tradeData.valueUsdc, {
      title: tradeData.title,
      supplierEmail: tradeData.supplierEmail,
      totalPayable: tradeData.totalPayable
    });

    setSelectedTradeId(tradeId);
    setCurrentScreen('trade_details');
  };

  const handleRaiseDispute = (disputeData: Omit<Dispute, 'id' | 'status' | 'dateOpened' | 'settlementValue' | 'verifiedParty'>) => {
    const disputeId = `ABC-${Math.floor(10000 + Math.random() * 90000)}-22`;
    const newDispute: Dispute = {
      ...disputeData,
      id: disputeId,
      status: 'under_review',
      dateOpened: 'Just now',
      settlementValue: currentTrade?.valueUsdc || 248500.00,
      verifiedParty: currentUser.companyName
    };

    setDisputes(prev => [newDispute, ...prev]);

    // Update trade status to disputed
    setTrades(prev => prev.map(t => t.id === disputeData.tradeId ? { ...t, status: 'disputed' } : t));

    // Notify compliance officer
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Dispute Raised',
      message: `Buyer raised an QA Rejection dispute for Trade #${disputeData.tradeId}. Case #${disputeId} is now under review.`,
      timestamp: 'Just now',
      type: 'escrow',
      read: false,
      actionLabel: 'Resolve Claim',
      actionScreen: 'dispute_resolver'
    };
    setNotifications(prev => [newNotif, ...prev]);

    broadcastTestnetTransaction('FileQAClaim', disputeData.tradeId, currentTrade?.valueUsdc || 248500.00, {
      disputeId,
      reason: disputeData.reason,
      description: disputeData.description
    });

    setSelectedDisputeId(disputeId);
    setCurrentScreen('dashboard');
  };

  const handleDispatchTrade = (tradeId: string, trackingNumber: string, carrier: string) => {
    // Supplier dispatches cargo
    setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'shipped', shippedDate: 'Just now' } : t));

    setShipments(prev => prev.map(s => {
      if (s.tradeId === tradeId) {
        return {
          ...s,
          trackingNumber,
          carrier,
          status: 'in_transit',
          currentLocation: 'En route: Port Corridor',
          eta: '14 Hours',
          history: [
            ...s.history,
            {
              status: 'in_transit',
              title: 'In Transit',
              subtitle: `Cargo received and loaded onto international carrier ${carrier}`,
              date: 'Just now'
            }
          ]
        };
      }
      return s;
    }));

    // Add notification
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Cargo Dispatched',
      message: `Supplier深圳 Logisense Ltd has dispatched your cargo under Tracking #${trackingNumber}.`,
      timestamp: 'Just now',
      type: 'shipments',
      read: false,
      actionLabel: 'Track Route',
      actionScreen: 'shipment_tracker'
    };
    setNotifications(prev => [newNotif, ...prev]);

    broadcastTestnetTransaction('DispatchCargo', tradeId, 0, {
      trackingNumber,
      carrier
    });
  };

  const handleDeliverShipment = (tradeId: string) => {
    // Deliver & Settle
    setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'completed', completedDate: 'Just now' } : t));

    setShipments(prev => prev.map(s => {
      if (s.tradeId === tradeId) {
        return {
          ...s,
          status: 'delivered',
          currentLocation: s.destination,
          history: [
            ...s.history,
            {
              status: 'delivered',
              title: 'Delivered',
              subtitle: 'Signature verified and customs clearance complete',
              date: 'Just now'
            }
          ]
        };
      }
      return s;
    }));

    // Notify buyer & transfer escrow funds to supplier balance
    const tradeObj = trades.find(t => t.id === tradeId);
    const payoutAmount = tradeObj ? tradeObj.valueUsdc : 124500.00;

    // Add alert
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Funds Released to Supplier',
      message: `Delivery of cargo ${tradeId} confirmed. $${payoutAmount.toLocaleString()} USDC released from escrow vault.`,
      timestamp: 'Just now',
      type: 'escrow',
      read: false,
      actionLabel: 'Check Wallet',
      actionScreen: 'wallet'
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Give some simulation cash to supplier user
    if (walletConnected && currentUser.role === 'supplier') {
      setWalletBalance(prev => {
        const newVal = parseFloat((prev + payoutAmount).toFixed(2));
        safeStorage.setItem('arc_wallet_balance', newVal.toString());
        return newVal;
      });
    } else if (currentUser.role === 'supplier') {
      setCurrentUser(prev => ({
        ...prev,
        walletBalance: parseFloat((prev.walletBalance + payoutAmount).toFixed(2))
      }));
    }

    broadcastTestnetTransaction('ReleaseEscrow', tradeId, payoutAmount, {
      recipient: 'Supplier Shenzhen Logisense Ltd',
      status: 'released'
    });
  };

  const handleResolveDispute = (disputeId: string, resolution: 'resolved_refunded' | 'resolved_released') => {
    // Arbiter resolves dispute
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: resolution, mediationDate: 'Just now' } : d));

    const disp = disputes.find(d => d.id === disputeId);
    if (disp) {
      const tradeId = disp.tradeId;
      const statusValue: TradeStatus = resolution === 'resolved_refunded' ? 'completed' : 'completed';
      
      setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: statusValue, completedDate: 'Just now' } : t));

      if (resolution === 'resolved_refunded') {
        // Give money back to buyer
        if (walletConnected && currentUser.role === 'buyer') {
          setWalletBalance(prev => {
            const newVal = parseFloat((prev + disp.settlementValue).toFixed(2));
            safeStorage.setItem('arc_wallet_balance', newVal.toString());
            return newVal;
          });
        } else if (currentUser.role === 'buyer') {
          setCurrentUser(prev => ({
            ...prev,
            walletBalance: parseFloat((prev.walletBalance + disp.settlementValue).toFixed(2))
          }));
        }
      } else {
        // Give money to supplier
        if (walletConnected && currentUser.role === 'supplier') {
          setWalletBalance(prev => {
            const newVal = parseFloat((prev + disp.settlementValue).toFixed(2));
            safeStorage.setItem('arc_wallet_balance', newVal.toString());
            return newVal;
          });
        } else if (currentUser.role === 'supplier') {
          setCurrentUser(prev => ({
            ...prev,
            walletBalance: parseFloat((prev.walletBalance + disp.settlementValue).toFixed(2))
          }));
        }
      }

      broadcastTestnetTransaction(
        resolution === 'resolved_refunded' ? 'ArbitrateRefund' : 'ArbitrateRelease',
        disp.tradeId,
        disp.settlementValue,
        {
          disputeId,
          resolution,
          reason: disp.reason
        }
      );
    }
  };

  const handleOrderAction = (orderId: string, action: 'accept' | 'reject') => {
    setIncomingOrders(prev => prev.filter(o => o.id !== orderId));

    if (action === 'accept') {
      const matched = incomingOrders.find(o => o.id === orderId);
      if (matched) {
        // Automatically spawn as active locked trade contract!
        const tradeId = `TRD-${Math.floor(1000 + Math.random() * 9000)}-QX`;
        const newTrade: Trade = {
          id: tradeId,
          title: `Contract Fulfillment for ${matched.buyer}`,
          description: `Bulk raw industrial supplies and raw assets booked by ${matched.buyer}.`,
          quantity: 1500,
          valueUsdc: matched.valueUsdc,
          escrowFee: matched.valueUsdc * 0.0015,
          networkGas: 4.20,
          totalPayable: matched.valueUsdc + (matched.valueUsdc * 0.0015) + 4.20,
          supplierEmail: 'sales@shenzhen-logisense.com',
          targetDeliveryDate: '2026-08-10',
          shippingMethod: 'Ocean Freight (Eco)',
          status: 'escrow_locked',
          createdDate: 'Just now',
          lockedDate: 'Just now',
          verificationHash: `0x${Math.random().toString(16).substring(2, 10)}fa...`,
          agreementFile: 'Consignment_Contract_V3.pdf',
          buyerName: matched.buyer,
          buyerCompany: matched.buyer
        };

        setTrades(prev => [newTrade, ...prev]);

        // Spawn shipment shell
        const newShipment: Shipment = {
          tradeId: tradeId,
          trackingNumber: `AB-992-X${Math.floor(100 + Math.random() * 900)}-22`,
          carrier: 'Maersk Line',
          service: 'Eco Sea Cargo',
          weightKg: 5400,
          origin: 'Port of Shenzhen',
          destination: `Port of ${matched.country}`,
          eta: 'Awaiting dispatch',
          currentLocation: 'Supplier warehouse',
          status: 'created',
          history: [
            {
              status: 'order_created',
              title: 'Order Approved',
              subtitle: 'Awaiting cargo dispatch by supplier',
              date: 'Just now'
            }
          ]
        };
        setShipments(prev => [newShipment, ...prev]);

        alert(`Proposal approved! Trade ${tradeId} created with funds safely locked in escrow.`);
      }
    }
  };

  const handleActionOnFlagged = (id: string, action: 'approve' | 'freeze') => {
    setFlaggedTrades(prev => prev.filter(f => f.id !== id));
    alert(`Transaction hash ${id} has been securely ${action === 'approve' ? 'APPROVED & COMPLETED' : 'FROZEN & BLACKLISTED'}.`);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Quick switch roles directly from top bar to make testing extremely seamless
  const quickSwitchRole = (newRole: Role) => {
    let screen = 'dashboard';
    if (newRole === 'supplier') screen = 'supplier_dashboard';
    if (newRole === 'compliance') screen = 'platform_overview';

    const updatedUser = {
      ...currentUser,
      role: newRole,
      fullName: newRole === 'buyer' ? 'Alex Vance' : newRole === 'supplier' ? 'Sheng Hu' : 'Director Vance',
      companyName: newRole === 'buyer' ? 'Global BioTech Corp' : newRole === 'supplier' ? 'Shenzhen Logisense Ltd' : 'ArcBridge Shield',
      walletAddress: newRole === 'buyer' ? '0x8aF...E492' : newRole === 'supplier' ? '0x3fa...B902' : '0xCompliance...001',
      walletBalance: newRole === 'buyer' ? 1240500.00 : newRole === 'supplier' ? 421000.00 : 0.00,
      isLoggedIn: true
    };
    setCurrentUser(updatedUser);
    setCurrentSession(updatedUser);
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans selection:bg-primary/20 selection:text-on-background" id="main-root">
      {/* Top Banner Navigation Shell (Only visible if logged in) */}
      {currentUser.isLoggedIn && currentScreen !== 'login' && currentScreen !== 'create_account' && (
        <header className="bg-surface-container-lowest border-b-2 border-on-surface sticky top-0 z-50" id="top-nav-bar">
          <div className="max-w-7xl mx-auto px-md md:px-lg h-16 flex items-center justify-between">
            {/* Logo area */}
            <div className="flex items-center gap-md cursor-pointer" onClick={() => quickSwitchRole(currentUser.role)}>
              <div className="w-10 h-10 border-2 border-on-surface bg-on-surface text-background flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-5 h-5 text-background" />
              </div>
              <div>
                <span className="font-sans font-black text-lg md:text-xl text-on-surface tracking-tighter uppercase block">Arc Bridge</span>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.1em] block -mt-1">Programmable Trade Settlement • Powered by Arc</span>
              </div>
            </div>

            {/* Desktop Navigation Link Tabs */}
            <nav className="hidden md:flex items-center gap-xs">
              {currentUser.role === 'buyer' && (
                <>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className={`px-md py-2 border border-transparent text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      currentScreen === 'dashboard' ? 'bg-on-surface text-background border-on-surface' : 'text-on-surface hover:border-on-surface/30'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentScreen('new_trade')}
                    className={`px-md py-2 border border-transparent text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      currentScreen === 'new_trade' ? 'bg-on-surface text-background border-on-surface' : 'text-on-surface hover:border-on-surface/30'
                    }`}
                  >
                    Initiate Trade
                  </button>
                </>
              )}

              {currentUser.role === 'supplier' && (
                <>
                  <button
                    onClick={() => setCurrentScreen('supplier_dashboard')}
                    className={`px-md py-2 border border-transparent text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      currentScreen === 'supplier_dashboard' ? 'bg-on-surface text-background border-on-surface' : 'text-on-surface hover:border-on-surface/30'
                    }`}
                  >
                    Supplier Hub
                  </button>
                  <button
                    onClick={() => setCurrentScreen('shipment_manager')}
                    className={`px-md py-2 border border-transparent text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      currentScreen === 'shipment_manager' ? 'bg-on-surface text-background border-on-surface' : 'text-on-surface hover:border-on-surface/30'
                    }`}
                  >
                    Shipments Manager
                  </button>
                </>
              )}

              {currentUser.role === 'compliance' && (
                <>
                  <button
                    onClick={() => setCurrentScreen('platform_overview')}
                    className={`px-md py-2 border border-transparent text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      currentScreen === 'platform_overview' ? 'bg-on-surface text-background border-on-surface' : 'text-on-surface hover:border-on-surface/30'
                    }`}
                  >
                    Compliance Queue
                  </button>
                  <button
                    onClick={() => setCurrentScreen('dispute_resolver')}
                    className={`px-md py-2 border border-transparent text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      currentScreen === 'dispute_resolver' ? 'bg-on-surface text-background border-on-surface' : 'text-on-surface hover:border-on-surface/30'
                    }`}
                  >
                    Disputes Arbiter
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentScreen('settings')}
                className={`px-md py-2 border border-transparent text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  currentScreen === 'settings' ? 'bg-on-surface text-background border-on-surface' : 'text-on-surface hover:border-on-surface/30'
                }`}
              >
                Settings
              </button>

              <button
                onClick={() => setCurrentScreen('wallet_treasury')}
                className={`px-md py-2 border border-transparent text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-xs ${
                  currentScreen === 'wallet_treasury' ? 'bg-on-surface text-background border-on-surface' : 'text-on-surface hover:border-on-surface/30'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-on-surface" />
                <span>Wallet & Treasury</span>
              </button>

              <button
                onClick={() => setCurrentScreen('arc_explorer')}
                className={`px-md py-2 border border-transparent text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-xs ${
                  currentScreen === 'arc_explorer' ? 'bg-on-surface text-background border-on-surface' : 'text-on-surface hover:border-on-surface/30'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Arc Explorer</span>
              </button>
            </nav>

            {/* Central Search Bar */}
            <div className="relative hidden md:block w-48 xl:w-64">
              <div className="relative border-b-2 border-transparent">
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full px-sm py-1.5 pl-lg bg-surface border-2 border-on-surface text-xs outline-none focus:bg-white font-medium transition-all"
                />
                <Search className="w-3.5 h-3.5 absolute left-sm top-1/2 -translate-y-1/2 text-on-surface/50" />
              </div>

              {/* Dropdown search results */}
              {isSearchFocused && searchQuery.trim() && (
                <div className="absolute right-0 top-12 w-80 md:w-96 bg-white border-2 border-on-surface shadow-lg z-50 p-sm space-y-md max-h-[400px] overflow-y-auto">
                  {!hasSearchResults ? (
                    <div className="p-sm text-center text-xs text-on-surface-variant font-medium">
                      No records match "<span className="font-bold">{searchQuery}</span>"
                    </div>
                  ) : (
                    <>
                      {/* Trades Section */}
                      {searchResults.trades.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[9px] font-black uppercase text-[#A09E97] tracking-widest px-sm pb-1 border-b border-on-surface/10">Trades & Escrows</div>
                          <div className="space-y-1">
                            {searchResults.trades.map(t => (
                              <button
                                key={t.id}
                                onMouseDown={() => {
                                  setSelectedTradeId(t.id);
                                  setCurrentScreen('trade_details');
                                  setSearchQuery('');
                                }}
                                className="w-full text-left p-sm hover:bg-surface-container-low transition-colors text-xs font-bold block"
                              >
                                <div className="flex justify-between">
                                  <span className="font-mono text-on-surface">{t.id}</span>
                                  <span className="text-[10px] text-[#A09E97]">${t.valueUsdc.toLocaleString()}</span>
                                </div>
                                <div className="text-[10px] text-on-surface-variant font-medium truncate">{t.title}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shipments Section */}
                      {searchResults.shipments.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[9px] font-black uppercase text-[#A09E97] tracking-widest px-sm pb-1 border-b border-on-surface/10">In-Transit Freight</div>
                          <div className="space-y-1">
                            {searchResults.shipments.map(s => (
                              <button
                                key={s.tradeId}
                                onMouseDown={() => {
                                  setSelectedTradeId(s.tradeId);
                                  setCurrentScreen(currentUser.role === 'supplier' ? 'shipment_manager' : 'shipment_tracker');
                                  setSearchQuery('');
                                }}
                                className="w-full text-left p-sm hover:bg-surface-container-low transition-colors text-xs font-bold block"
                              >
                                <div className="flex justify-between">
                                  <span className="font-mono text-on-surface">{s.trackingNumber}</span>
                                  <span className="text-[10px] uppercase text-[#A09E97]">{s.status}</span>
                                </div>
                                <div className="text-[10px] text-on-surface-variant font-medium truncate">{s.origin} to {s.destination}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Disputes Section */}
                      {searchResults.disputes.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[9px] font-black uppercase text-[#A09E97] tracking-widest px-sm pb-1 border-b border-on-surface/10">Active Claims</div>
                          <div className="space-y-1">
                            {searchResults.disputes.map(d => (
                              <button
                                key={d.id}
                                onMouseDown={() => {
                                  setSelectedDisputeId(d.id);
                                  setCurrentScreen(currentUser.role === 'compliance' ? 'dispute_resolver' : 'dispute_center');
                                  setSearchQuery('');
                                }}
                                className="w-full text-left p-sm hover:bg-surface-container-low transition-colors text-xs font-bold block"
                              >
                                <div className="flex justify-between">
                                  <span className="font-mono text-on-surface">{d.id}</span>
                                  <span className="text-[10px] uppercase text-[#A09E97]">{d.status.replace('_', ' ')}</span>
                                </div>
                                <div className="text-[10px] text-on-surface-variant font-medium truncate">{d.reason}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notifications Section */}
                      {searchResults.notifications.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[9px] font-black uppercase text-[#A09E97] tracking-widest px-sm pb-1 border-b border-on-surface/10">Notifications</div>
                          <div className="space-y-1">
                            {searchResults.notifications.map(n => (
                              <button
                                key={n.id}
                                onMouseDown={() => {
                                  setCurrentScreen('notifications');
                                  setSearchQuery('');
                                }}
                                className="w-full text-left p-sm hover:bg-surface-container-low transition-colors text-xs font-bold block"
                              >
                                <div className="text-[10px] text-on-surface truncate">{n.title}</div>
                                <div className="text-[9px] text-on-surface-variant font-medium truncate">{n.message}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick Demo Selector + Notifications & Profile Area */}
            <div className="flex items-center gap-xs md:gap-sm">
              {/* Arc Testnet Wallet Connect Badge */}
              <div className="block shrink-0">
                {walletConnected ? (
                  <button
                    onClick={handleDisconnectWallet}
                    className="bg-green-50 border-2 border-green-600 px-2 py-1 text-[9px] md:text-[10px] font-mono font-bold text-green-700 flex items-center gap-1 cursor-pointer transition-all hover:bg-red-50 hover:border-red-600 hover:text-red-700"
                    title="Disconnect Wallet"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0"></div>
                    <span>{walletAddress.substring(0, 6)}..</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    className="bg-[#E2DFD4] border-2 border-on-surface px-2 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-on-surface flex items-center gap-1 cursor-pointer hover:bg-on-surface hover:text-background transition-colors"
                  >
                    <Cpu className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span>Wallet</span>
                  </button>
                )}
              </div>

              {/* Institutional Switcher: VERY important to test screens */}
              <div className="relative group hidden sm:block">
                <select
                  aria-label="Select institutional role"
                  className="bg-surface-container-low border-2 border-on-surface px-sm py-1 text-xs font-bold text-on-surface uppercase tracking-wider outline-none cursor-pointer"
                  value={currentUser.role}
                  onChange={e => quickSwitchRole(e.target.value as Role)}
                >
                  <option value="buyer">Buyer Mode</option>
                  <option value="supplier">Supplier Mode</option>
                  <option value="compliance">Compliance Mode</option>
                </select>
              </div>

              {/* Notification icon */}
              <button
                onClick={() => setCurrentScreen('notifications')}
                className="p-2 border border-transparent hover:border-on-surface text-on-surface relative cursor-pointer"
                aria-label={`${unreadNotificationsCount} unread notifications`}
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-on-surface text-[9px] font-black text-background rounded-none flex items-center justify-center border border-background">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Profile details */}
              <div className="flex items-center gap-sm">
                <div
                  className="w-9 h-9 overflow-hidden border border-on-surface shrink-0 cursor-pointer bg-slate-100"
                  onClick={() => setCurrentScreen('settings')}
                >
                  <img
                    src={currentUser.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuASOdZbR3jY_CpFY_OH-vJLulFRIBj7sBZTIml4SRX7G02fFLkYBKRztL1RqwFtq5A3NU-bqDlVofyvy3ds3AlXYqWsCyt8d-8d6XGNq0mCOQnFRxIcyUc05mhUNRWjgudT_vrjw9aUlkMZ6lJQFBJHCJAxP2BbYS4RnBePvNC63Bk3V4Kf_fnzXSjj-jQjoekap7imZBTlVcaVLYUmiqDPbbOTGfyWSk9PdKDbqAFwVl3nYWT8FoHA2jhC6QMVX37wCEcgFK-yfdI'}
                    alt="Current user avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden lg:block text-left">
                  <span className="font-bold text-xs text-on-surface block leading-tight">{currentUser.fullName}</span>
                  <span className="text-[10px] text-outline font-semibold block uppercase leading-none">{currentUser.companyName}</span>
                </div>
              </div>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant md:hidden cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown navigation menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-outline-variant bg-surface-container-lowest p-md space-y-xs animate-in slide-in-from-top-3 duration-200">
              <div className="pb-sm border-b border-outline-variant flex justify-between items-center">
                <span className="text-xs font-bold text-outline">Switch Demo Sandbox Role:</span>
                <select
                  aria-label="Select institutional role"
                  className="bg-surface-container border border-outline-variant rounded px-sm py-1 text-xs font-bold text-on-surface outline-none cursor-pointer"
                  value={currentUser.role}
                  onChange={e => {
                    quickSwitchRole(e.target.value as Role);
                    setMobileMenuOpen(false);
                  }}
                >
                  <option value="buyer">Buyer View</option>
                  <option value="supplier">Supplier View</option>
                  <option value="compliance">Compliance View</option>
                </select>
              </div>

              {/* Mobile Search Bar */}
              <div className="py-sm border-b border-outline-variant relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-full px-sm py-2 pl-lg bg-surface border-2 border-on-surface text-xs outline-none focus:bg-white font-medium transition-all"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-sm top-1/2 -translate-y-1/2 text-on-surface/50" />
                </div>

                {/* Dropdown search results for Mobile */}
                {isSearchFocused && searchQuery.trim() && (
                  <div className="absolute left-0 right-0 top-12 bg-white border-2 border-on-surface shadow-lg z-50 p-sm space-y-md max-h-[300px] overflow-y-auto">
                    {!hasSearchResults ? (
                      <div className="p-sm text-center text-xs text-on-surface-variant font-medium">
                        No records match "{searchQuery}"
                      </div>
                    ) : (
                      <>
                        {/* Trades */}
                        {searchResults.trades.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[9px] font-black uppercase text-[#A09E97] tracking-widest px-sm pb-1 border-b border-on-surface/10">Trades</div>
                            {searchResults.trades.map(t => (
                              <button
                                key={t.id}
                                onMouseDown={() => {
                                  setSelectedTradeId(t.id);
                                  setCurrentScreen('trade_details');
                                  setSearchQuery('');
                                  setMobileMenuOpen(false);
                                }}
                                className="w-full text-left p-sm hover:bg-surface-container-low transition-colors text-xs font-bold block"
                              >
                                <span className="font-mono text-on-surface">{t.id}</span>
                                <div className="text-[10px] text-on-surface-variant font-medium truncate">{t.title}</div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Shipments */}
                        {searchResults.shipments.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[9px] font-black uppercase text-[#A09E97] tracking-widest px-sm pb-1 border-b border-on-surface/10">Shipments</div>
                            {searchResults.shipments.map(s => (
                              <button
                                key={s.tradeId}
                                onMouseDown={() => {
                                  setSelectedTradeId(s.tradeId);
                                  setCurrentScreen(currentUser.role === 'supplier' ? 'shipment_manager' : 'shipment_tracker');
                                  setSearchQuery('');
                                  setMobileMenuOpen(false);
                                }}
                                className="w-full text-left p-sm hover:bg-surface-container-low transition-colors text-xs font-bold block"
                              >
                                <span className="font-mono text-on-surface">{s.trackingNumber}</span>
                                <div className="text-[10px] text-on-surface-variant font-medium truncate">{s.origin} to {s.destination}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {currentUser.role === 'buyer' && (
                <>
                  <button
                    onClick={() => { setCurrentScreen('dashboard'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2.5 px-md text-xs font-bold uppercase text-on-surface hover:bg-surface-container rounded-lg"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setCurrentScreen('new_trade'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2.5 px-md text-xs font-bold uppercase text-on-surface hover:bg-surface-container rounded-lg"
                  >
                    Initiate Trade
                  </button>
                </>
              )}

              {currentUser.role === 'supplier' && (
                <>
                  <button
                    onClick={() => { setCurrentScreen('supplier_dashboard'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2.5 px-md text-xs font-bold uppercase text-on-surface hover:bg-surface-container rounded-lg"
                  >
                    Supplier Hub
                  </button>
                  <button
                    onClick={() => { setCurrentScreen('shipment_manager'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2.5 px-md text-xs font-bold uppercase text-on-surface hover:bg-surface-container rounded-lg"
                  >
                    Shipments Manager
                  </button>
                </>
              )}

              {currentUser.role === 'compliance' && (
                <>
                  <button
                    onClick={() => { setCurrentScreen('platform_overview'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2.5 px-md text-xs font-bold uppercase text-on-surface hover:bg-surface-container rounded-lg"
                  >
                    Compliance Queue
                  </button>
                  <button
                    onClick={() => { setCurrentScreen('dispute_resolver'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2.5 px-md text-xs font-bold uppercase text-on-surface hover:bg-surface-container rounded-lg"
                  >
                    Disputes Arbiter
                  </button>
                </>
              )}

              <button
                onClick={() => { setCurrentScreen('settings'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-md text-xs font-bold uppercase text-on-surface hover:bg-surface-container rounded-lg"
              >
                Settings
              </button>

              <button
                onClick={() => { setCurrentScreen('wallet_treasury'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-md text-xs font-bold uppercase text-on-surface hover:bg-surface-container rounded-lg flex items-center gap-sm"
              >
                <Cpu className="w-4 h-4 text-on-surface-variant" />
                <span>Wallet & Treasury</span>
              </button>

              <button
                onClick={() => { setCurrentScreen('arc_explorer'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-md text-xs font-bold uppercase text-on-surface hover:bg-surface-container rounded-lg flex items-center gap-sm"
              >
                <Globe className="w-4 h-4 text-on-surface-variant" />
                <span>Arc Explorer</span>
              </button>

              <div className="py-2 px-md border-t border-on-surface/10 mt-sm pt-sm">
                {walletConnected ? (
                  <div className="flex justify-between items-center bg-green-50 p-2 border-2 border-green-600">
                    <div className="flex items-center gap-xs">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-mono text-[10px] font-bold text-green-700">{walletAddress.substring(0, 10)}...</span>
                    </div>
                    <button
                      onClick={() => { handleDisconnectWallet(); setMobileMenuOpen(false); }}
                      className="text-[9px] font-black text-on-surface hover:underline uppercase tracking-wider"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { handleConnectWallet(); setMobileMenuOpen(false); }}
                    className="w-full py-2 bg-on-surface text-background text-[10px] font-black uppercase tracking-wider text-center cursor-pointer border-2 border-on-surface hover:bg-on-surface/90"
                  >
                    Connect Wallet to Arc Testnet
                  </button>
                )}
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Container Workspace */}
      <main className={`flex-1 flex flex-col p-md md:p-lg lg:p-xl max-w-7xl w-full mx-auto ${
        currentScreen === 'login' || currentScreen === 'create_account' ? 'items-center justify-center' : 'items-stretch justify-start'
      }`}>
        {currentScreen === 'login' && (
          <Login
            onNavigate={setCurrentScreen}
            onLogin={handleLogin}
          />
        )}

        {currentScreen === 'create_account' && (
          <CreateAccount
            onNavigate={setCurrentScreen}
            onCreateAccount={handleCreateAccount}
          />
        )}

        {currentScreen === 'dashboard' && currentUser.role === 'buyer' && (
          <BuyerDashboard
            onNavigate={setCurrentScreen}
            onSelectTrade={(id) => {
              setSelectedTradeId(id);
            }}
            trades={trades}
          />
        )}

        {currentScreen === 'new_trade' && currentUser.role === 'buyer' && (
          <NewTrade
            onNavigate={setCurrentScreen}
            onInitiateTrade={handleInitiateTrade}
          />
        )}

        {currentScreen === 'trade_details' && (
          <TradeDetails
            onNavigate={setCurrentScreen}
            trade={currentTrade}
            shipment={currentShipment}
          />
        )}

        {currentScreen === 'shipment_tracker' && (
          <ShipmentTracker
            onNavigate={setCurrentScreen}
            trade={currentTrade}
            shipment={currentShipment}
          />
        )}

        {currentScreen === 'dispute_center' && (
          <DisputeCenter
            onNavigate={setCurrentScreen}
            trade={currentTrade}
            onRaiseDispute={handleRaiseDispute}
          />
        )}

        {/* Supplier Views */}
        {currentScreen === 'supplier_dashboard' && currentUser.role === 'supplier' && (
          <SupplierDashboard
            onNavigate={setCurrentScreen}
            incomingOrders={incomingOrders}
            onOrderAction={handleOrderAction}
            trades={trades}
          />
        )}

        {currentScreen === 'shipment_manager' && currentUser.role === 'supplier' && (
          <ShipmentManager
            onNavigate={setCurrentScreen}
            trades={trades}
            shipments={shipments}
            onDispatchTrade={handleDispatchTrade}
            onDeliverShipment={handleDeliverShipment}
          />
        )}

        {/* Compliance Views */}
        {currentScreen === 'platform_overview' && currentUser.role === 'compliance' && (
          <PlatformOverview
            onNavigate={setCurrentScreen}
            flaggedTrades={flaggedTrades}
            onActionOnFlagged={handleActionOnFlagged}
          />
        )}

        {currentScreen === 'dispute_resolver' && currentUser.role === 'compliance' && (
          <DisputeResolution
            onNavigate={setCurrentScreen}
            dispute={currentDispute}
            trade={currentTrade}
            onResolveDispute={handleResolveDispute}
          />
        )}

        {/* Shared views */}
        {currentScreen === 'settings' && (
          <Settings
            user={currentUser}
            onLogout={handleLogout}
            onUpdateLanguage={(lang) => {
              alert(`System language updated to: ${lang}`);
            }}
          />
        )}

        {currentScreen === 'notifications' && (
          <Notifications
            onNavigate={setCurrentScreen}
            onSelectTrade={setSelectedTradeId}
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={handleMarkAllNotificationsRead}
          />
        )}

        {currentScreen === 'arc_explorer' && (
          <ArcExplorer
            transactions={testnetTransactions}
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            walletBalance={walletBalance}
            onConnectWallet={handleConnectWallet}
            onDisconnectWallet={handleDisconnectWallet}
            onFaucetRequest={handleFaucetRequest}
            currentBlock={currentBlock}
          />
        )}

        {currentScreen === 'wallet_treasury' && (
          <WalletTreasury
            user={currentUser}
            trades={trades}
            transactions={testnetTransactions}
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            walletBalance={walletBalance}
            onConnectWallet={handleConnectWallet}
            onDisconnectWallet={handleDisconnectWallet}
            onFaucetRequest={handleFaucetRequest}
            onBroadcastTx={handleWalletTreasuryBroadcast}
            currentBlock={currentBlock}
          />
        )}
      </main>

      {/* Floating Global Sandbox Utility Bar for Easy Demonstration (Anti-Tech-Larping but highly functional Sandbox selector) */}
      {currentUser.isLoggedIn && (
        <div className="fixed bottom-md left-md bg-surface-container-lowest border-2 border-on-surface shadow-md px-sm md:px-md py-2 flex items-center gap-xs z-40 select-none animate-in fade-in" id="demo-tester-panel">
          <div className="w-2.5 h-2.5 bg-on-surface shrink-0"></div>
          <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider hidden md:inline">Ledger Sandbox:</span>
          <div className="flex gap-1">
            <button
              onClick={() => quickSwitchRole('buyer')}
              className={`px-2 py-1 text-[10px] font-black uppercase transition-all cursor-pointer ${
                currentUser.role === 'buyer' ? 'bg-on-surface text-background' : 'hover:bg-surface-container-low border border-transparent hover:border-on-surface text-on-surface'
              }`}
            >
              Buyer View
            </button>
            <button
              onClick={() => quickSwitchRole('supplier')}
              className={`px-2 py-1 text-[10px] font-black uppercase transition-all cursor-pointer ${
                currentUser.role === 'supplier' ? 'bg-on-surface text-background' : 'hover:bg-surface-container-low border border-transparent hover:border-on-surface text-on-surface'
              }`}
            >
              Supplier View
            </button>
            <button
              onClick={() => quickSwitchRole('compliance')}
              className={`px-2 py-1 text-[10px] font-black uppercase transition-all cursor-pointer ${
                currentUser.role === 'compliance' ? 'bg-on-surface text-background' : 'hover:bg-surface-container-low border border-transparent hover:border-on-surface text-on-surface'
              }`}
            >
              Compliance View
            </button>
          </div>
        </div>
      )}

      {/* Legal Footer */}
      <footer className="py-md border-t-2 border-on-surface text-center bg-surface-container-lowest text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mt-auto">
        <div className="max-w-7xl mx-auto px-lg flex flex-col md:flex-row justify-between items-center gap-sm">
          <span>© 2026 ARC BRIDGE • PROGRAMMABLE TRADE SETTLEMENT • POWERED BY ARC</span>
          <span className="flex items-center gap-xs">
            <Shield className="w-3.5 h-3.5 text-on-surface" />
            <span>SECURE ESCROW LEDGER ACTIVE</span>
          </span>
        </div>
      </footer>

      {/* Stark Bold Wallet Connect Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-on-surface/70 z-50 flex items-center justify-center p-md backdrop-blur-xs select-none">
          <div className="bg-[#FAF8F5] border-4 border-on-surface p-lg max-w-md w-full relative shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsWalletModalOpen(false)}
              className="absolute top-md right-md text-xs font-black uppercase tracking-wider text-on-surface hover:underline cursor-pointer"
            >
              [ Close ]
            </button>

            {connectingWalletProvider ? (
              <div className="py-xl text-center space-y-md">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 border-4 border-on-surface/10 rounded-none"></div>
                  <div className="absolute inset-0 border-4 border-t-on-surface rounded-none animate-spin"></div>
                </div>
                <div className="space-y-xs">
                  <h3 className="font-sans font-black text-lg uppercase tracking-tight">Linking Provider...</h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Initializing secure RPC handshake with <span className="font-bold text-on-surface">{connectingWalletProvider}</span>...
                  </p>
                </div>
                <div className="text-[10px] font-mono text-[#A09E97] animate-pulse">
                  GENERATING TESTNET SEED PROOF
                </div>
              </div>
            ) : (
              <div className="space-y-md">
                <div>
                  <span className="text-[10px] font-bold text-[#A09E97] uppercase tracking-widest block">Arc Testnet Gateway</span>
                  <h2 className="font-sans font-black text-3xl uppercase tracking-tight leading-none">Connect Wallet</h2>
                  <p className="text-xs text-on-surface-variant mt-1 font-medium">
                    Authorize a cryptographic keyspace to lock escrow balances, execute compliance clearances, and mediate disputes directly on the Arc Testnet ledger explorer.
                  </p>
                </div>

                <div className="space-y-sm">
                  {[
                    { name: 'Arc Ledger (Native)', desc: 'Optimized local node simulator', icon: Globe },
                    { name: 'MetaMask Extension', desc: 'Secure browser keyvault bridge', icon: Shield },
                    { name: 'WalletConnect Pro', desc: 'Mobile QR protocol handshake', icon: ArrowLeftRight },
                  ].map((prov) => {
                    const Icon = prov.icon;
                    return (
                      <button
                        key={prov.name}
                        onClick={() => handleSelectWalletProvider(prov.name)}
                        className="w-full border-2 border-on-surface p-sm text-left flex items-center justify-between hover:bg-on-surface hover:text-background transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-sm">
                          <div className="p-1.5 border border-on-surface group-hover:border-background bg-surface-container-low text-on-surface group-hover:bg-on-surface group-hover:text-background transition-colors shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black uppercase tracking-wider block">{prov.name}</span>
                            <span className="text-[10px] text-on-surface-variant group-hover:text-background/80 font-medium block leading-none">{prov.desc}</span>
                          </div>
                        </div>
                        <span className="text-xs font-black uppercase group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-surface-container border-2 border-dashed border-on-surface/20 p-xs text-center text-[9px] font-bold text-on-surface-variant">
                  ⚠️ Simulated client-authoritative keystore. No real assets at risk.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
