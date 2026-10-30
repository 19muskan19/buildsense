import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'usr-ce',
    name: 'Er. Julian Thorne, PE',
    email: 'julian.thorne@apexinfra-group.com',
    role: 'CHIEF_ENGINEER',
    roleTitle: 'VP of Infrastructure & Chief Structural Engineer',
    department: 'Corporate Asset Governance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-se',
    name: 'Er. Victoria Sterling, SE',
    email: 'victoria.sterling@apexinfra-group.com',
    role: 'SUPERINTENDING_ENGINEER',
    roleTitle: 'Principal Asset Director & Structural Lead',
    department: 'Portfolio Integrity & Engineering',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-ee-metro',
    name: 'Er. Marcus Vance, PE',
    email: 'marcus.vance@apexinfra-group.com',
    role: 'EXECUTIVE_ENGINEER',
    roleTitle: 'Executive Facilities Engineer (Metro Central)',
    department: 'Metro Central Facilities Directorate',
    divisionId: 'div-metro-central',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-ae-metro',
    name: 'Er. Nathan Brooks, PE',
    email: 'nathan.brooks@apexinfra-group.com',
    role: 'ASSISTANT_ENGINEER',
    roleTitle: 'Senior Inspection & QA Engineer',
    department: 'Structural Diagnostics Cell',
    divisionId: 'div-metro-central',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-je-01',
    name: 'Er. Maya Patel, EIT',
    email: 'maya.patel@apexinfra-group.com',
    role: 'JUNIOR_ENGINEER',
    roleTitle: 'Certified Field Inspector & Testing Specialist',
    department: 'On-Site Diagnostic Inspections',
    divisionId: 'div-metro-central',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-ctr-01',
    name: 'Apex Commercial Builders Ltd.',
    email: 'projects@apexbuildcorp.com',
    role: 'CONTRACTOR',
    roleTitle: 'Empanelled Prime General Contractor',
    department: 'Commercial Restoration Division',
    contractorCompany: 'Apex Commercial Builders Ltd.',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-auditor',
    name: 'Veritas Global Risk & Quality Assurance',
    email: 'audit.compliance@veritasaudit.com',
    role: 'AUDITOR',
    roleTitle: 'Senior Independent Compliance Auditor',
    department: 'Independent Structural Assurance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'usr-occupant',
    name: 'Corporate Tenant / Facility Occupant',
    email: 'tenant.services@apexinfra-group.com',
    role: 'OCCUPANT',
    roleTitle: 'Building Occupant & QR Issue Reporter',
    department: 'Facility Services & Tenant Portal',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  }
];

interface AuthContextType {
  currentUser: User;
  switchUser: (role: Role) => void;
  canVerifyDefect: boolean;
  canApproveWorkOrder: boolean;
  canSubmitInspection: boolean;
  canSubmitRepair: boolean;
  isAuditor: boolean;
  isPublicOccupant: boolean;
  isSeniorExecutive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('buildsense_active_role');
    if (saved) {
      const found = DEMO_USERS.find((u) => u.role === saved);
      if (found) return found;
    }
    // Default to Executive Engineer (good operational overview) or Junior Engineer
    return DEMO_USERS[2]; // Er. Ranjit Barua, EE
  });

  const switchUser = (role: Role) => {
    const user = DEMO_USERS.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('buildsense_active_role', role);
    }
  };

  const role = currentUser.role;

  const canVerifyDefect = ['CHIEF_ENGINEER', 'SUPERINTENDING_ENGINEER', 'EXECUTIVE_ENGINEER', 'ASSISTANT_ENGINEER'].includes(role);
  const canApproveWorkOrder = ['CHIEF_ENGINEER', 'SUPERINTENDING_ENGINEER', 'EXECUTIVE_ENGINEER'].includes(role);
  const canSubmitInspection = ['JUNIOR_ENGINEER', 'ASSISTANT_ENGINEER'].includes(role);
  const canSubmitRepair = role === 'CONTRACTOR';
  const isAuditor = role === 'AUDITOR';
  const isPublicOccupant = role === 'OCCUPANT';
  const isSeniorExecutive = ['CHIEF_ENGINEER', 'SUPERINTENDING_ENGINEER'].includes(role);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchUser,
        canVerifyDefect,
        canApproveWorkOrder,
        canSubmitInspection,
        canSubmitRepair,
        isAuditor,
        isPublicOccupant,
        isSeniorExecutive
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
