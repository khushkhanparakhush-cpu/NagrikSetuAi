import React, { createContext, useContext, useState } from 'react';
import { UserRole, UserProfile } from '../types/civic';
import { CITIZEN_LOGO_URL } from '../config/assets';

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  citizen: {
    uid: 'citizen-user-01',
    name: 'Citizen',
    email: 'citizen@nagriksetu.gov.in',
    role: 'citizen',
    phone: '+91 98790 12345',
    location: 'Ward 10, Municipal Zone',
    avatarUrl: CITIZEN_LOGO_URL,
  },
  admin: {
    uid: 'admin-mehta-03',
    name: 'S. Mehta, IAS (Admin)',
    email: 'admin@nagriksetu.gov.in',
    role: 'admin',
    phone: '+91 79 2539 1234',
    location: 'Central Municipal Administrative Office',
    department: 'Urban Development & Municipal Engineering',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
};

interface AuthContextType {
  currentUser: UserProfile;
  userRole: UserRole;
  switchRole: (role: UserRole) => void;
  verifyAdmin: (passcode: string) => boolean;
  logoutToCitizen: () => void;
  getAuthHeaders: () => Record<string, string>;
  isCitizen: boolean;
  isAdmin: boolean;
  canAccessAdminConsole: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Requirement 1: Users default to "Citizen", or admin if active in session
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const storedRole = sessionStorage.getItem('nagriksetu_active_role');
      if (storedRole === 'admin') {
        return PRESET_USERS.admin;
      }
    } catch {
      // ignore
    }
    return PRESET_USERS.citizen;
  });

  const switchRole = (role: UserRole) => {
    const newUser = PRESET_USERS[role];
    setCurrentUser(newUser);
    try {
      sessionStorage.setItem('nagriksetu_active_role', role);
    } catch {
      // ignore
    }
  };

  const verifyAdmin = (_passcode?: string): boolean => {
    switchRole('admin');
    return true;
  };

  const logoutToCitizen = () => {
    switchRole('citizen');
  };

  const getAuthHeaders = (): Record<string, string> => ({
    'x-user-id': currentUser.uid,
    'x-user-role': currentUser.role,
    'x-user-email': currentUser.email,
  });

  const isCitizen = currentUser.role === 'citizen';
  const isAdmin = currentUser.role === 'admin';
  const canAccessAdminConsole = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole: currentUser.role,
        switchRole,
        verifyAdmin,
        logoutToCitizen,
        getAuthHeaders,
        isCitizen,
        isAdmin,
        canAccessAdminConsole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
