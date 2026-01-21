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
  dailyNet: number; // This is effectively NOI
  monthlyNet: number;
  yearlyNet: number;
  // Financials
  monthlyEMI: number;
  yearlyEMI: number;
  monthlyCashFlow: number;
  yearlyCashFlow: number;
  dscr: number; // Debt Service Coverage Ratio
  roi: number; // Cash on Cash Return
  valuation: number; // Estimated Property Valuation
  paybackPeriod: number; // Years
}

export interface InputState {
  hotelName: string;
  totalRooms: number;
  occupancyPercent: number;
  roomPrice: number;
  roundSRN: boolean;
  extraDeductions: ExtraDeduction[];
  maintenanceCostPerRoom: number;
  // Financials
  includeFinancials: boolean;
  propertyValue: number;
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
}

export interface MetricSummary {
    monthlyRevenue: number;
    monthlyNet: number;
    roi: number;
    valuation: number;
}

export interface SavedProject {
    id: string;
    lastModified: number;
    inputs: InputState;
    summary: MetricSummary;
}

export interface AppSettings {
    userName: string;
    currencySymbol: string;
    defaultInterestRate: number;
}

export type ViewType = 'dashboard' | 'editor' | 'analytics' | 'settings' | 'help';