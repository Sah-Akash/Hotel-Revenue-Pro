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
}

export interface InputState {
  hotelName: string;
  totalRooms: number;
  occupancyPercent: number;
  roomPrice: number;
  roundSRN: boolean;
  extraDeductions: ExtraDeduction[];
  maintenanceCostPerRoom: number;
}