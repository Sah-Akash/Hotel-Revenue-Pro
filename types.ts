
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
  // Financials
  monthlyEMI: number;
  yearlyEMI: number;
  monthlyCashFlow: number;
  yearlyCashFlow: number;
  dscr: number; 
  roi: number; 
  valuation: number; 
  paybackPeriod: number; 
  
  // Deal Sheet Specific Metrics (Matching Image)
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
  maintenanceCostPerRoom: number; // Acts as Opex per URN
  // Financials
  includeFinancials: boolean;
  propertyValue: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  // Amenities / Classification
  hasKitchen: boolean;
  hasRestaurant: boolean;
  hasGym: boolean;
  
  // New Deal Specific Inputs
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
}

export interface AccessKey {
    id: string;
    key: string;
    expiresAt: number;
    createdAt: number;
    deviceId: string | null;
}

export interface AccessRequest {
    id: string;
    name: string;
    email: string;
    mobile: string;
    requestedAt: number;
    status: 'pending' | 'approved' | 'rejected';
}

export type ViewType = 'dashboard' | 'editor' | 'analytics' | 'knowledge' | 'settings' | 'help' | 'login' | 'admin';
