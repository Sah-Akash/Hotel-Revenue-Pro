import { useMemo } from 'react';
import { CalculationMetrics, InputState } from '../types';
import { DAYS_IN_MONTH, DAYS_IN_YEAR, OTA_COMMISSION_RATE } from '../constants';

export const useCalculator = (inputs: InputState): CalculationMetrics => {
  return useMemo(() => {
    const { totalRooms, occupancyPercent, roomPrice, roundSRN, extraDeductions, maintenanceCostPerRoom } = inputs;
    const occupancyDecimal = occupancyPercent / 100;

    // 1. SRN (Sold Rooms per Night)
    let srn = totalRooms * occupancyDecimal;
    if (roundSRN) {
      srn = Math.round(srn);
    }

    // 2. Daily Revenue
    const dailyRevenue = srn * roomPrice;

    // 3. Monthly Revenue
    const monthlyRevenue = dailyRevenue * DAYS_IN_MONTH;

    // 4. Yearly Revenue
    const yearlyRevenue = dailyRevenue * DAYS_IN_YEAR;

    // 5. OTA Deduction (18%)
    const dailyOta = dailyRevenue * OTA_COMMISSION_RATE;
    const monthlyOta = monthlyRevenue * OTA_COMMISSION_RATE;
    const yearlyOta = yearlyRevenue * OTA_COMMISSION_RATE;

    // 6. Maintenance Cost
    // Logic: CostPerRoom * Occupancy % * SRN * Number of Days
    const maintenanceFactor = maintenanceCostPerRoom * occupancyDecimal * srn;
    
    const dailyMaintenance = maintenanceFactor * 1;
    const monthlyMaintenance = maintenanceFactor * DAYS_IN_MONTH;
    const yearlyMaintenance = maintenanceFactor * DAYS_IN_YEAR;

    // 7. Extra Deductions (Sum of all items in array)
    const monthlyExtra = extraDeductions.reduce((sum, item) => sum + (item.amount || 0), 0);
    const yearlyExtra = monthlyExtra * 12;
    const dailyExtra = monthlyExtra / DAYS_IN_MONTH;

    // 8. Net Income
    const dailyNet = dailyRevenue - (dailyOta + dailyMaintenance + dailyExtra);
    const monthlyNet = monthlyRevenue - (monthlyOta + monthlyMaintenance + monthlyExtra);
    const yearlyNet = yearlyRevenue - (yearlyOta + yearlyMaintenance + yearlyExtra);

    return {
      srn,
      dailyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      dailyOta,
      monthlyOta,
      yearlyOta,
      dailyMaintenance,
      monthlyMaintenance,
      yearlyMaintenance,
      dailyExtra,
      monthlyExtra,
      yearlyExtra,
      dailyNet,
      monthlyNet,
      yearlyNet
    };
  }, [inputs]);
};