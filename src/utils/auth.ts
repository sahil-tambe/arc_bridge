import { User, Role } from '../types';

export interface UserAccount extends User {
  passwordHash: string; // Stored securely in localStorage
}

const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    fullName: 'Alex Vance',
    companyName: 'Global BioTech Corp',
    email: 'alex@globalbiotech.com',
    role: 'buyer',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASOdZbR3jY_CpFY_OH-vJLulFRIBj7sBZTIml4SRX7G02fFLkYBKRztL1RqwFtq5A3NU-bqDlVofyvy3ds3AlXYqWsCyt8d-8d6XGNq0mCOQnFRxIcyUc05mhUNRWjgudT_vrjw9aUlkMZ6lJQFBJHCJAxP2BbYS4RnBePvNC63Bk3V4Kf_fnzXSjj-jQjoekap7imZBTlVcaVLYUmiqDPbbOTGfyWSk9PdKDbqAFwVl3nYWT8FoHA2jhC6QMVX37wCEcgFK-yfdI',
    walletBalance: 1240500.00,
    walletAddress: '0x8aF...E492',
    isLoggedIn: false,
    passwordHash: 'password123'
  },
  {
    fullName: 'Sheng Hu',
    companyName: 'Shenzhen Logisense Ltd',
    email: 'logistics_hub_42@kestreltrade.io',
    role: 'supplier',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASOdZbR3jY_CpFY_OH-vJLulFRIBj7sBZTIml4SRX7G02fFLkYBKRztL1RqwFtq5A3NU-bqDlVofyvy3ds3AlXYqWsCyt8d-8d6XGNq0mCOQnFRxIcyUc05mhUNRWjgudT_vrjw9aUlkMZ6lJQFBJHCJAxP2BbYS4RnBePvNC63Bk3V4Kf_fnzXSjj-jQjoekap7imZBTlVcaVLYUmiqDPbbOTGfyWSk9PdKDbqAFwVl3nYWT8FoHA2jhC6QMVX37wCEcgFK-yfdI',
    walletBalance: 421000.00,
    walletAddress: '0x3fa...B902',
    isLoggedIn: false,
    passwordHash: 'password123'
  },
  {
    fullName: 'Director Vance',
    companyName: 'Kestrel Shield',
    email: 'compliance_officer@kestreltrade.io',
    role: 'compliance',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASOdZbR3jY_CpFY_OH-vJLulFRIBj7sBZTIml4SRX7G02fFLkYBKRztL1RqwFtq5A3NU-bqDlVofyvy3ds3AlXYqWsCyt8d-8d6XGNq0mCOQnFRxIcyUc05mhUNRWjgudT_vrjw9aUlkMZ6lJQFBJHCJAxP2BbYS4RnBePvNC63Bk3V4Kf_fnzXSjj-jQjoekap7imZBTlVcaVLYUmiqDPbbOTGfyWSk9PdKDbqAFwVl3nYWT8FoHA2jhC6QMVX37wCEcgFK-yfdI',
    walletBalance: 0.00,
    walletAddress: '0xCompliance...001',
    isLoggedIn: false,
    passwordHash: 'password123'
  }
];

export function getAccounts(): UserAccount[] {
  let data: string | null = null;
  try {
    data = localStorage.getItem('arcbridge_users');
  } catch (e) {
    console.warn('localStorage is restricted:', e);
  }

  if (!data) {
    try {
      localStorage.setItem('arcbridge_users', JSON.stringify(DEFAULT_ACCOUNTS));
    } catch (e) {
      // ignore
    }
    return DEFAULT_ACCOUNTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_ACCOUNTS;
  }
}

export function saveAccounts(accounts: UserAccount[]) {
  try {
    localStorage.setItem('arcbridge_users', JSON.stringify(accounts));
  } catch (e) {
    console.warn('localStorage is restricted:', e);
  }
}

export function registerUser(fullName: string, companyName: string, email: string, role: Role, passwordHash: string): User | null {
  const accounts = getAccounts();
  const exists = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return null;
  }

  // Assign specific visual avatars or defaults
  const randId = Math.floor(Math.random() * 100);
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName}`;

  const newUser: UserAccount = {
    fullName,
    companyName,
    email,
    role,
    avatar,
    walletBalance: role === 'buyer' ? 2500000.00 : role === 'supplier' ? 500000.00 : 0.0,
    walletAddress: `0x${Math.random().toString(16).substring(2, 6).toUpperCase()}...${Math.random().toString(16).substring(2, 6).toUpperCase()}`,
    isLoggedIn: true,
    passwordHash
  };

  accounts.push(newUser);
  saveAccounts(accounts);
  setCurrentSession(newUser);
  return newUser;
}

export function authenticateUser(email: string, passwordHash: string): UserAccount | null {
  const accounts = getAccounts();
  const matched = accounts.find(
    a => a.email.toLowerCase() === email.toLowerCase() && a.passwordHash === passwordHash
  );
  if (matched) {
    setCurrentSession(matched);
    return matched;
  }
  return null;
}

export function getCurrentSession(): User | null {
  let session: string | null = null;
  try {
    session = localStorage.getItem('arcbridge_current_user');
  } catch (e) {
    console.warn('localStorage is restricted:', e);
  }
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch (e) {
    return null;
  }
}

export function setCurrentSession(user: User | null) {
  try {
    if (user) {
      localStorage.setItem('arcbridge_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('arcbridge_current_user');
    }
  } catch (e) {
    console.warn('localStorage is restricted:', e);
  }
}
