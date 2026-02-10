
import { useMemo } from 'react';
import { CalculationMetrics, InputState } from '../types';
import { DAYS_IN_MONTH, DAYS_IN_YEAR, OTA_COMMISSION_RATE, DEFAULT_CAP_RATE, GST_RATE } from '../constants';

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
      loanTermYears,
      otaPercent,
      monthlyMg,
      securityDeposit,
      businessAdvance
    } = inputs;

    const occupancyDecimal = occupancyPercent / 100;

    // 1. SRN (Sold Rooms per Night)
    let soldRooms = totalRooms * occupancyDecimal;
    if (roundSRN) {
      soldRooms = Math.round(soldRooms);
    }
    
    // 2. Daily Revenue (Expected Revenue - Gross)
    const dailyRevenue = soldRooms * roomPrice;
    const monthlyRevenue = dailyRevenue * DAYS_IN_MONTH;
    const yearlyRevenue = dailyRevenue * DAYS_IN_YEAR;

    // --- DEAL SHEET SPECIFIC CALCULATIONS ---
    const dealRevenueNetGst = monthlyRevenue / (1 + GST_RATE);
    const dealMonthlyGst = monthlyRevenue - dealRevenueNetGst;
    const dealOtaAbs = dealRevenueNetGst * (otaPercent / 100);
    const dealOpexAbs = soldRooms * DAYS_IN_MONTH * maintenanceCostPerRoom;
    
    // Core Business Logic: NOI Before MG
    const noiBeforeMg = dealRevenueNetGst - dealOtaAbs - dealOpexAbs;

    // Absolute CM (Net Profit)
    const dealAbsoluteCm = noiBeforeMg - monthlyMg;

    // CM% 
    const dealCmPercent = dealRevenueNetGst > 0 ? (dealAbsoluteCm / dealRevenueNetGst) * 100 : 0;

    // PBP
    const totalInvestment = securityDeposit + businessAdvance;
    const dealPbpPercent = dealAbsoluteCm > 0 ? (totalInvestment / dealAbsoluteCm) * 100 : 0;
    const dealMgImpactSixMonths = (dealRevenueNetGst * 0.10) * 6;

    // --- REVERSE CALCULATIONS (New Logic) ---
    
    // 1. Max Safe MG (Buffer of 20% margin safety)
    // A safe deal usually means the MG shouldn't exceed 70-80% of the NOI (Net Operating Income)
    const maxSafeMg = Math.max(0, noiBeforeMg * 0.75);

    // 2. Target MG for 24% ROI (Aggressive Target)
    // Formula: (Annual NOI - (Equity * 0.24)) / 12 = Max Monthly MG
    // Equity = SD + BA (or Property Value - Loan if Owner view, but let's assume Deal view)
    const effectiveEquity = inputs.includeFinancials ? Math.max(propertyValue - loanAmount, 0) : totalInvestment;
    const targetAnnualReturn = effectiveEquity * 0.24; // 24% annual return
    const targetMgFor20Roi = Math.max(0, (noiBeforeMg * 12 - targetAnnualReturn) / 12);

    // 3. Recommendation Engine
    let recommendedDealType: 'lessee' | 'owner' | 'hybrid' = 'hybrid';
    let dealStrengthScore = 50;

    // Calculate Score based on risk
    const occupancyScore = occupancyPercent; // 60
    const marginScore = dealRevenueNetGst > 0 ? (noiBeforeMg / dealRevenueNetGst) * 100 : 0; // ~40%
    dealStrengthScore = (occupancyScore * 0.6) + (marginScore * 0.4);

    if (dealStrengthScore > 65) {
        // High Occupancy + High Margin = Safe to take fixed obligation
        recommendedDealType = 'lessee'; // Take the lease, keep the upside
    } else if (dealStrengthScore < 40) {
        // Low Occupancy/Margin = High Risk
        recommendedDealType = 'owner'; // Stay as Owner (Rev Share) to avoid MG trap
    }

    // --- STANDARD LEGACY METRICS ---
    const dailyOta = dailyRevenue * OTA_COMMISSION_RATE;
    const monthlyOta = monthlyRevenue * OTA_COMMISSION_RATE;
    const yearlyOta = yearlyRevenue * OTA_COMMISSION_RATE;

    const maintenanceFactor = soldRooms * maintenanceCostPerRoom; 
    const dailyMaintenance = maintenanceFactor;
    const monthlyMaintenance = maintenanceFactor * DAYS_IN_MONTH;
    const yearlyMaintenance = maintenanceFactor * DAYS_IN_YEAR;

    const monthlyExtra = extraDeductions.reduce((sum, item) => sum + (item.amount || 0), 0);
    const yearlyExtra = monthlyExtra * 12;
    const dailyExtra = monthlyExtra / DAYS_IN_MONTH;

    const dailyNet = dailyRevenue - (dailyOta + dailyMaintenance + dailyExtra);
    const monthlyNet = monthlyRevenue - (monthlyOta + monthlyMaintenance + monthlyExtra);
    const yearlyNet = yearlyRevenue - (yearlyOta + yearlyMaintenance + yearlyExtra);

    let monthlyEMI = 0;
    let yearlyEMI = 0;
    let monthlyCashFlow = monthlyNet;
    let yearlyCashFlow = yearlyNet;
    let dscr = 0;
    let roi = 0;
    let paybackPeriod = 0;
    const valuation = yearlyNet > 0 ? yearlyNet / DEFAULT_CAP_RATE : 0;

    if (includeFinancials && loanAmount > 0 && interestRate > 0) {
      const r = interestRate / 12 / 100;
      const n = loanTermYears * 12;
      monthlyEMI = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      yearlyEMI = monthlyEMI * 12;
      monthlyCashFlow = monthlyNet - monthlyEMI;
      yearlyCashFlow = yearlyNet - yearlyEMI;
      dscr = yearlyEMI > 0 ? yearlyNet / yearlyEMI : 0;
      const equity = Math.max(propertyValue - loanAmount, 0);
      roi = equity > 0 ? (yearlyCashFlow / equity) * 100 : 0;
      paybackPeriod = yearlyCashFlow > 0 ? equity / yearlyCashFlow : 999;
    } else if (includeFinancials && propertyValue > 0) {
       roi = (yearlyNet / propertyValue) * 100;
       paybackPeriod = yearlyNet > 0 ? propertyValue / yearlyNet : 999;
    }

    const breakEvenOccupancyDeal = dealAbsoluteCm < 0 
        ? occupancyPercent + (Math.abs(dealAbsoluteCm) / (dealRevenueNetGst/occupancyPercent)) 
        : occupancyPercent - (dealAbsoluteCm / (dealRevenueNetGst/occupancyPercent)); 

    const deltaGross = 100 * soldRooms * 30;
    const deltaNetGst = deltaGross / (1 + GST_RATE);
    const deltaOta = deltaNetGst * (otaPercent / 100);
    const arrSensitivity = deltaNetGst - deltaOta;

    return {
      srn: soldRooms,
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
      paybackPeriod,
      dealMonthlyGst,
      dealRevenueNetGst,
      dealOtaAbs,
      dealOpexAbs,
      dealAbsoluteCm,
      dealCmPercent,
      dealPbpPercent,
      dealMgImpactSixMonths,
      monthlyMg,
      operatorProfit: dealAbsoluteCm,
      breakEvenOccupancyDeal,
      arrSensitivity,
      // New Exports
      noiBeforeMg,
      maxSafeMg,
      targetMgFor20Roi,
      recommendedDealType,
      dealStrengthScore
    };
  }, [inputs]);
};
