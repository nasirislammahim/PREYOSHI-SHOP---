import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Permission, StaffRole } from '../types';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import {
  StaffService,
  SUPER_ADMIN_EMAIL,
  ALL_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS
} from '../services/staffService';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStaff: boolean;
  hasPermission: (permission: Permission) => boolean;
  login: (phoneOrEmail: string, name?: string) => void;
  loginWithGoogle: () => Promise<User | undefined>;
  loginAsAdmin: () => void;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  earnPoints: (amount: number, description: string, orderNumber?: string) => void;
  redeemPoints: (amount: number, description: string) => { success: boolean; message: string };
  // Customer verification
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; simulatedCode: string }>;
  verifyPhoneOtp: (code: string) => Promise<{ success: boolean; message: string }>;
  sendEmailVerification: () => Promise<{ success: boolean; message: string }>;
  confirmEmailVerification: () => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (identifier: string) => Promise<{ success: boolean; message: string }>;
  switchStaffRoleDemo: (role: StaffRole) => void;
}

const STORAGE_KEY = 'preyoshi_user_session';
const PENDING_OTP_KEY = 'preyoshi_pending_otp';

const calculateTier = (points: number) => {
  if (points >= 1000) return 'Platinum' as const;
  if (points >= 500) return 'Gold' as const;
  if (points >= 250) return 'Silver' as const;
  return 'Bronze' as const;
};

const INITIAL_LOYALTY_HISTORY = [
  {
    id: 'TXN-001',
    date: '2026-10-25T11:00:00Z',
    amount: 100,
    type: 'earned' as const,
    description: 'স্বাগতম বোনাস পয়েন্ট (Welcome Gift Points)'
  },
  {
    id: 'TXN-002',
    date: '2026-10-29T10:15:00Z',
    amount: 250,
    type: 'earned' as const,
    description: 'অর্ডার #PRY-2026-0813 কেনাকাটায় পয়েন্ট অর্জন',
    orderNumber: 'PRY-2026-0813'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.loyaltyPoints === undefined) {
          parsed.loyaltyPoints = 350;
          parsed.loyaltyTier = calculateTier(350);
          parsed.loyaltyHistory = INITIAL_LOYALTY_HISTORY;
        }
        // Super Admin enforcement: If user has Super Admin email, lock role to super_admin
        if (parsed.email && parsed.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) {
          parsed.role = 'super_admin';
          parsed.permissions = [...ALL_PERMISSIONS];
          parsed.isEmailVerified = true;
          parsed.isPhoneVerified = true;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    // Default guest customer session for seamless demo experience
    return {
      id: 'USR-GUEST',
      name: 'Mahim Islam',
      email: SUPER_ADMIN_EMAIL,
      phone: '01712-345678',
      role: 'super_admin',
      permissions: [...ALL_PERMISSIONS],
      address: 'House 14, Road 5, Block B, Mirpur-10',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Mirpur',
      isEmailVerified: true,
      isPhoneVerified: true,
      loyaltyPoints: 350,
      loyaltyTier: 'Silver',
      loyaltyHistory: INITIAL_LOYALTY_HISTORY,
      createdAt: new Date().toISOString()
    };
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  // Synchronize with Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        const isSuperAdminEmail = user.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
        const staffRecord = user.email ? StaffService.getStaffByEmail(user.email) : undefined;

        setCurrentUser(prev => {
          if (prev && prev.id === user.uid) {
            if (isSuperAdminEmail) {
              return {
                ...prev,
                role: 'super_admin',
                permissions: [...ALL_PERMISSIONS],
                isEmailVerified: true
              };
            }
            return prev;
          }

          let resolvedRole: StaffRole | 'customer' = 'customer';
          let permissions: Permission[] | undefined = undefined;

          if (isSuperAdminEmail) {
            resolvedRole = 'super_admin';
            permissions = [...ALL_PERMISSIONS];
          } else if (staffRecord && staffRecord.status === 'active') {
            resolvedRole = staffRecord.role;
            permissions = staffRecord.permissions;
          }

          return {
            id: user.uid,
            name: user.displayName || prev?.name || 'Valued Customer',
            email: user.email || prev?.email || '',
            phone: user.phoneNumber || prev?.phone || '01712-345678',
            role: resolvedRole,
            permissions,
            staffProfile: staffRecord,
            isEmailVerified: user.emailVerified || isSuperAdminEmail,
            isPhoneVerified: !!user.phoneNumber || isSuperAdminEmail,
            loyaltyPoints: prev?.loyaltyPoints || 350,
            loyaltyTier: prev?.loyaltyTier || 'Silver',
            loyaltyHistory: prev?.loyaltyHistory || INITIAL_LOYALTY_HISTORY,
            createdAt: prev?.createdAt || new Date().toISOString()
          };
        });
      }
    });
    return () => unsub();
  }, []);

  const isSuperAdmin = StaffService.isSuperAdmin(currentUser);
  const isStaff = currentUser ? currentUser.role !== 'customer' : false;
  const isAdmin = isSuperAdmin || (currentUser ? ['admin', 'managing_director', 'manager', 'order_manager', 'inventory_manager', 'accounts_staff', 'customer_support', 'delivery_staff', 'marketing_staff', 'employee'].includes(currentUser.role) : false);

  const hasPermission = (permission: Permission): boolean => {
    return StaffService.hasPermission(currentUser, permission);
  };

  const loginWithGoogle = async (): Promise<User | undefined> => {
    if (!isFirebaseConfigured || !auth) {
      const fallbackUser: User = {
        id: 'USR-ADMIN-01',
        name: 'Mahim Islam',
        email: SUPER_ADMIN_EMAIL,
        phone: '01712-345678',
        role: 'super_admin',
        permissions: [...ALL_PERMISSIONS],
        isEmailVerified: true,
        isPhoneVerified: true,
        loyaltyPoints: 1200,
        loyaltyTier: 'Platinum',
        loyaltyHistory: INITIAL_LOYALTY_HISTORY,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(fallbackUser);
      return fallbackUser;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const isSuperAdminEmail = user.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
      const staffRecord = user.email ? StaffService.getStaffByEmail(user.email) : undefined;

      const newUser: User = {
        id: user.uid,
        name: user.displayName || (isSuperAdminEmail ? 'Mahim Islam (Super Admin)' : 'Valued Customer'),
        email: user.email || '',
        phone: user.phoneNumber || '01712-345678',
        role: isSuperAdminEmail ? 'super_admin' : (staffRecord?.status === 'active' ? staffRecord.role : 'customer'),
        permissions: isSuperAdminEmail ? [...ALL_PERMISSIONS] : staffRecord?.permissions,
        staffProfile: staffRecord,
        isEmailVerified: user.emailVerified || isSuperAdminEmail,
        isPhoneVerified: !!user.phoneNumber || isSuperAdminEmail,
        loyaltyPoints: 350,
        loyaltyTier: 'Silver',
        loyaltyHistory: INITIAL_LOYALTY_HISTORY,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(newUser);

      StaffService.logAction(
        newUser,
        'LOGIN_GOOGLE',
        'Google Auth Session',
        `User logged in via Google with role: ${newUser.role}`
      );

      return newUser;
    } catch (err) {
      console.warn('Google sign in error:', err);
      return undefined;
    }
  };

  const login = (phoneOrEmail: string, name = 'Valued Customer') => {
    const isEmail = phoneOrEmail.includes('@');
    const emailCandidate = isEmail ? phoneOrEmail.toLowerCase().trim() : '';
    const isSuperAdminEmail = emailCandidate === SUPER_ADMIN_EMAIL.toLowerCase();
    const staffRecord = emailCandidate ? StaffService.getStaffByEmail(emailCandidate) : undefined;

    let role: StaffRole | 'customer' = 'customer';
    let permissions: Permission[] | undefined = undefined;

    if (isSuperAdminEmail) {
      role = 'super_admin';
      permissions = [...ALL_PERMISSIONS];
    } else if (staffRecord && staffRecord.status === 'active') {
      role = staffRecord.role;
      permissions = staffRecord.permissions;
    }

    const newUser: User = {
      id: 'USR-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      name: isSuperAdminEmail ? 'Mahim Islam (Super Admin)' : name,
      email: isEmail ? phoneOrEmail : '',
      phone: !isEmail ? phoneOrEmail : '01700-000000',
      role,
      permissions,
      staffProfile: staffRecord,
      isEmailVerified: isSuperAdminEmail,
      isPhoneVerified: isSuperAdminEmail,
      loyaltyPoints: 100, // 100 pts welcome bonus
      loyaltyTier: 'Bronze',
      loyaltyHistory: [
        {
          id: 'TXN-' + Date.now(),
          date: new Date().toISOString(),
          amount: 100,
          type: 'earned',
          description: 'নতুন রেজিস্ট্রেশন স্বাগতম উপহার'
        }
      ],
      createdAt: new Date().toISOString()
    };

    setCurrentUser(newUser);

    StaffService.logAction(
      newUser,
      'LOGIN_STANDARD',
      'Customer Portal',
      `Session established for ${newUser.name} (Role: ${newUser.role})`
    );
  };

  const loginAsAdmin = () => {
    const adminUser: User = {
      id: 'USR-ADMIN-01',
      name: 'Mahim Islam (Super Admin)',
      email: SUPER_ADMIN_EMAIL,
      phone: '01712-345678',
      role: 'super_admin',
      permissions: [...ALL_PERMISSIONS],
      isEmailVerified: true,
      isPhoneVerified: true,
      loyaltyPoints: 1500,
      loyaltyTier: 'Platinum',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(adminUser);

    StaffService.logAction(
      adminUser,
      'SUPER_ADMIN_SESSION',
      'Enterprise Terminal',
      'Sole Super Admin logged in directly.'
    );
  };

  const switchStaffRoleDemo = (role: StaffRole) => {
    if (!currentUser) return;
    if (role === 'super_admin') {
      loginAsAdmin();
      return;
    }
    const perms = ROLE_DEFAULT_PERMISSIONS[role] || [];
    setCurrentUser({
      ...currentUser,
      role,
      permissions: perms
    });

    StaffService.logAction(
      currentUser,
      'ROLE_SIMULATION_SWITCH',
      `Switched to ${role}`,
      `Temporarily previewing admin permissions for ${role}`
    );
  };

  const logout = async () => {
    if (currentUser) {
      StaffService.logAction(currentUser, 'LOGOUT', 'Session Closed', 'User logged out.');
    }
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch {}
    }
    setCurrentUser(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      // Protect Super Admin role from downgrade
      if (prev.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        delete updatedData.role;
      }
      const updated = { ...prev, ...updatedData };
      if (updated.loyaltyPoints !== undefined) {
        updated.loyaltyTier = calculateTier(updated.loyaltyPoints);
      }
      return updated;
    });
  };

  const earnPoints = (amount: number, description: string, orderNumber?: string) => {
    if (amount <= 0) return;
    setCurrentUser(prev => {
      if (!prev) return null;
      const currentPoints = prev.loyaltyPoints || 0;
      const newPoints = currentPoints + amount;
      const newTxn = {
        id: 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        date: new Date().toISOString(),
        amount,
        type: 'earned' as const,
        description,
        orderNumber
      };
      return {
        ...prev,
        loyaltyPoints: newPoints,
        loyaltyTier: calculateTier(newPoints),
        loyaltyHistory: [newTxn, ...(prev.loyaltyHistory || [])]
      };
    });
  };

  const redeemPoints = (amount: number, description: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'লগইন আবশ্যক।' };
    const currentPoints = currentUser.loyaltyPoints || 0;
    if (currentPoints < amount) {
      return { success: false, message: `আপনার পর্যাপ্ত পয়েন্ট নেই। বর্তমান পয়েন্ট: ${currentPoints}` };
    }

    const newPoints = currentPoints - amount;
    const newTxn = {
      id: 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      date: new Date().toISOString(),
      amount,
      type: 'redeemed' as const,
      description
    };

    setCurrentUser({
      ...currentUser,
      loyaltyPoints: newPoints,
      loyaltyTier: calculateTier(newPoints),
      loyaltyHistory: [newTxn, ...(currentUser.loyaltyHistory || [])]
    });

    return {
      success: true,
      message: `${amount} পয়েন্ট সফলভাবে রিডিম হয়েছে!`
    };
  };

  // Customer Verification Methods
  const sendPhoneOtp = async (phone: string): Promise<{ success: boolean; simulatedCode: string }> => {
    // Generate secure 6-digit verification code
    const simulatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify({ phone, code: simulatedCode, timestamp: Date.now() }));
    return { success: true, simulatedCode };
  };

  const verifyPhoneOtp = async (code: string): Promise<{ success: boolean; message: string }> => {
    const stored = sessionStorage.getItem(PENDING_OTP_KEY);
    if (!stored) {
      return { success: false, message: 'ওটিপি সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে পুনরায় ওটিপি পাঠান।' };
    }
    try {
      const { code: expectedCode, phone } = JSON.parse(stored);
      if (code.trim() === expectedCode) {
        sessionStorage.removeItem(PENDING_OTP_KEY);
        if (currentUser) {
          updateProfile({ isPhoneVerified: true, phone: phone || currentUser.phone });
        }
        return { success: true, message: 'অভিনন্দন! আপনার ফোন নম্বর সফলভাবে ভেরিফাই হয়েছে।' };
      }
    } catch {}
    return { success: false, message: 'ভুল ওটিপি কোড প্রদান করেছেন। অনুগ্রহ করে সঠিক ৬ সংখ্যার কোড লিখুন।' };
  };

  const sendEmailVerification = async (): Promise<{ success: boolean; message: string }> => {
    return {
      success: true,
      message: `ভেরিফিকেশন লিঙ্ক ${currentUser?.email || 'আপনার ইমেইলে'} পাঠানো হয়েছে। লিঙ্কে ক্লিক করে নিশ্চিত করুন।`
    };
  };

  const confirmEmailVerification = async (): Promise<{ success: boolean; message: string }> => {
    if (currentUser) {
      updateProfile({ isEmailVerified: true });
      return { success: true, message: 'ইমেইল সফলভাবে ভেরিফাই ও সুরক্ষিত হয়েছে!' };
    }
    return { success: false, message: 'লগইন করুন।' };
  };

  const requestPasswordReset = async (identifier: string): Promise<{ success: boolean; message: string }> => {
    return {
      success: true,
      message: `${identifier}-এ পাসওয়ার্ড রিসেট সংক্রান্ত নির্দেশাবলি পাঠানো হয়েছে।`
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isSuperAdmin,
        isStaff,
        hasPermission,
        login,
        loginWithGoogle,
        loginAsAdmin,
        logout,
        updateProfile,
        earnPoints,
        redeemPoints,
        sendPhoneOtp,
        verifyPhoneOtp,
        sendEmailVerification,
        confirmEmailVerification,
        requestPasswordReset,
        switchStaffRoleDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
