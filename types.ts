
export interface ExtraDeduction {
  id: string;
  name: string;
  amount: number;
}

export interface CalculationMetrics {
  srn: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  dailyOta: number;
  monthlyOta: number;
  yearlyOta: number;
  dailyMaintenance: number;
  monthlyMaintenance: number;
  yearlyMaintenance: number;
  dailyExtra: number;
  monthlyExtra: number;
  yearlyExtra: number;
  dailyNet: number; 
  monthlyNet: number;
  yearlyNet: number;
  monthlyEMI: number;
  yearlyEMI: number;
  monthlyCashFlow: number;
  yearlyCashFlow: number;
  dscr: number; 
  roi: number; 
  valuation: number; 
  paybackPeriod: number; 
  dealMonthlyGst: number;
  dealRevenueNetGst: number; 
  dealOtaAbs: number;
  dealOpexAbs: number;
  dealAbsoluteCm: number;
  dealCmPercent: number;
  dealPbpPercent: number;
  dealMgImpactSixMonths: number;
  breakEvenOccupancyDeal: number;
  arrSensitivity: number;
  monthlyMg: number;
  operatorProfit: number;
}

export interface InputState {
  hotelName: string;
  totalRooms: number;
  occupancyPercent: number;
  roomPrice: number;
  roundSRN: boolean;
  extraDeductions: ExtraDeduction[];
  maintenanceCostPerRoom: number;
  includeFinancials: boolean;
  propertyValue: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  hasKitchen: boolean;
  hasRestaurant: boolean;
  hasGym: boolean;
  otaPercent: number;
  monthlyMg: number;
  securityDeposit: number;
  businessAdvance: number;
  dealType: 'owner' | 'lessee';
}

export interface MetricSummary {
    monthlyRevenue: number;
    monthlyNet: number;
    roi: number;
    valuation: number;
}

export interface SavedProject {
    id: string;
    userId?: string;
    lastModified: number;
    inputs: InputState;
    summary: MetricSummary;
}

export interface AppSettings {
    userName: string;
    currencySymbol: string;
    defaultInterestRate: number;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role?: 'admin' | 'user';
}

// --- NEW SAAS ARCHITECTURE TYPES ---

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial';

export interface Subscription {
    id: string;       // Usually same as User UID for 1:1 mapping
    userId: string;
    planId: 'trial' | 'pro_monthly' | 'pro_yearly' | 'enterprise';
    status: SubscriptionStatus;
    startedAt: number;
    expiresAt: number;
}

export interface License {
    id: string;
    userId: string;
    deviceId: string; // The fingerprint
    subscriptionId: string;
    issuedAt: number;
    lastCheckedAt: number;
    deviceLabel: string; // e.g., "Chrome on Windows"
    isRevoked: boolean;
}

export interface DeviceFingerprint {
    hash: string;
    details: string;
}

export type ViewType = 'dashboard' | 'editor' | 'analytics' | 'knowledge' | 'settings' | 'help' | 'login' | 'admin';
