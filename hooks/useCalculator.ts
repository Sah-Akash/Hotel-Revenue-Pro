import { useMemo } from 'react';
import { CalculationMetrics, InputState } from '../types';
import { DAYS_IN_MONTH, DAYS_IN_YEAR, OTA_COMMISSION_RATE, DEFAULT_CAP_RATE } from '../constants';

export const useCalculator = (inputs: InputState): CalculationMetrics => {
  return useMemo(() => {
    const { 
      totalRooms, 
      occupancyPercent, 
      roomPrice, 
      roundSRN, 
      extraDeductions, 
      maintenanceCostPerRoom,
      includeFinancials,
      propertyValue,
      loanAmount,
      interestRate,
      loanTermYears
    } = inputs;

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
    const maintenanceFactor = maintenanceCostPerRoom * occupancyDecimal * srn;
    
    const dailyMaintenance = maintenanceFactor * 1;
    const monthlyMaintenance = maintenanceFactor * DAYS_IN_MONTH;
    const yearlyMaintenance = maintenanceFactor * DAYS_IN_YEAR;

    // 7. Extra Deductions
    const monthlyExtra = extraDeductions.reduce((sum, item) => sum + (item.amount || 0), 0);
    const yearlyExtra = monthlyExtra * 12;
    const dailyExtra = monthlyExtra / DAYS_IN_MONTH;

    // 8. NOI (Net Operating Income) - previously called Net Income
    const dailyNet = dailyRevenue - (dailyOta + dailyMaintenance + dailyExtra);
    const monthlyNet = monthlyRevenue - (monthlyOta + monthlyMaintenance + monthlyExtra);
    const yearlyNet = yearlyRevenue - (yearlyOta + yearlyMaintenance + yearlyExtra);

    // 9. Financial Calculations
    let monthlyEMI = 0;
    let yearlyEMI = 0;
    let monthlyCashFlow = monthlyNet;
    let yearlyCashFlow = yearlyNet;
    let dscr = 0;
    let roi = 0;
    let paybackPeriod = 0;
    
    // Valuation based on Cap Rate (NOI / Cap Rate)
    // If NOI is negative, valuation logic breaks, so we floor it at 0 for display safety
    const valuation = yearlyNet > 0 ? yearlyNet / DEFAULT_CAP_RATE : 0;

    if (includeFinancials && loanAmount > 0 && interestRate > 0) {
      // EMI Calculation: P * r * (1 + r)^n / ((1 + r)^n - 1)
      const r = interestRate / 12 / 100; // Monthly interest rate
      const n = loanTermYears * 12; // Total months
      
      monthlyEMI = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      yearlyEMI = monthlyEMI * 12;
      
      monthlyCashFlow = monthlyNet - monthlyEMI;
      yearlyCashFlow = yearlyNet - yearlyEMI;
      
      // DSCR = Net Operating Income / Total Debt Service
      dscr = yearlyEMI > 0 ? yearlyNet / yearlyEMI : 0;
      
      // ROI (Cash on Cash) = Annual Cash Flow / Total Equity Invested
      // Equity = Property Value - Loan Amount (assuming the difference is down payment)
      // If Loan Amount > Property Value, math gets weird, assume Equity is at least 1 for div/0 safety
      const equity = Math.max(propertyValue - loanAmount, 0);
      roi = equity > 0 ? (yearlyCashFlow / equity) * 100 : 0;

      // Payback Period (Years) = Total Equity / Annual Cash Flow
      paybackPeriod = yearlyCashFlow > 0 ? equity / yearlyCashFlow : 999;
    } else if (includeFinancials && propertyValue > 0) {
       // All Cash Deal
       roi = (yearlyNet / propertyValue) * 100;
       paybackPeriod = yearlyNet > 0 ? propertyValue / yearlyNet : 999;
    }

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
      yearlyNet,
      monthlyEMI,
      yearlyEMI,
      monthlyCashFlow,
      yearlyCashFlow,
      dscr,
      roi,
      valuation,
      paybackPeriod
    };
  }, [inputs]);
};