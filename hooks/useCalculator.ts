
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

    // --- REVENUE SHARE LOGIC (Based on User Image) ---
    // Image Logic: Revenue - (12% Tax/Insurance) = Net Base for Share
    // 8190000 Gross -> 7207200 Net. (8190000 * 0.88 = 7207200). Matches exactly.
    const taxDeductionRate = 0.12; 
    const monthlyTaxDeduction = monthlyRevenue * taxDeductionRate;
    const netRevenueForShare = monthlyRevenue - monthlyTaxDeduction; // The "Net" column in image

    // --- DEAL SHEET SPECIFIC CALCULATIONS ---
    // We use the same Net Revenue logic for consistency
    const dealRevenueNetGst = netRevenueForShare; 
    const dealMonthlyGst = monthlyTaxDeduction;
    
    // Expenses
    const dealOtaAbs = dealRevenueNetGst * (otaPercent / 100);
    const dealOpexAbs = soldRooms * DAYS_IN_MONTH * maintenanceCostPerRoom;
    
    // Core Business Logic: NOI Before MG (Net Operating Income)
    const noiBeforeMg = dealRevenueNetGst - dealOtaAbs - dealOpexAbs;

    // Absolute CM (Net Profit)
    const dealAbsoluteCm = noiBeforeMg - monthlyMg;

    // CM% 
    const dealCmPercent = dealRevenueNetGst > 0 ? (dealAbsoluteCm / dealRevenueNetGst) * 100 : 0;

    // PBP
    const totalInvestment = securityDeposit + businessAdvance;
    const dealPbpPercent = dealAbsoluteCm > 0 ? (totalInvestment / dealAbsoluteCm) * 100 : 0;
    const dealMgImpactSixMonths = (dealRevenueNetGst * 0.10) * 6;

    // --- STRATEGY ENGINE (30-Year Veteran Logic) ---
    
    // 1. Max Safe MG (Buffer of 30% margin safety)
    // A safe fixed rent should not exceed 70% of your NOI.
    const maxSafeMg = Math.max(0, noiBeforeMg * 0.70);

    // 2. Target MG for 24% ROI (Aggressive Target)
    const effectiveEquity = inputs.includeFinancials ? Math.max(propertyValue - loanAmount, 0) : totalInvestment;
    const targetAnnualReturn = effectiveEquity * 0.24; // 24% annual return
    const targetMgFor20Roi = Math.max(0, (noiBeforeMg * 12 - targetAnnualReturn) / 12);

    // 3. HYBRID MODEL (MG + RevShare)
    // Standard Industry Hybrid: "Minimum Guarantee OR % Share, whichever is higher"
    // We propose a lower "Safety MG" (to cover owner's EMIs) + a Share %
    
    // Proposed Hybrid Params
    const hybridFixedMg = maxSafeMg; // We propose the Max Safe MG as the base
    const hybridRevSharePercent = 45; // 45% of Net Revenue (Standard Split is 40-50%)
    
    // Projected Payout Calculation: Max(MG, Share)
    const shareAmount = netRevenueForShare * (hybridRevSharePercent / 100);
    const hybridProjectedPayout = Math.max(hybridFixedMg, shareAmount);

    // 4. Recommendation Logic
    let recommendedDealType: 'lessee' | 'owner' | 'hybrid' = 'hybrid';
    let dealStrengthScore = 50;

    // Score: Higher Occupancy/Margin = Safer for Lessee (Fixed Rent)
    // Lower = Safer for Owner (Rev Share)
    const occupancyScore = occupancyPercent; 
    const marginScore = dealRevenueNetGst > 0 ? (noiBeforeMg / dealRevenueNetGst) * 100 : 0; 
    dealStrengthScore = (occupancyScore * 0.5) + (marginScore * 0.5);

    if (dealStrengthScore > 65 && metricsIsStable(inputs)) {
        recommendedDealType = 'lessee'; // High confidence? Lock in fixed rent.
    } else if (dealStrengthScore < 45 || occupancyPercent < 50) {
        recommendedDealType = 'owner'; // Volatile? Rev Share only.
    } else {
        recommendedDealType = 'hybrid'; // The golden middle.
    }

    // --- STANDARD METRICS ---
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
      dealStrengthScore,
      hybridFixedMg,
      hybridRevSharePercent,
      hybridProjectedPayout
    };
  }, [inputs]);
};

function metricsIsStable(inputs: InputState): boolean {
    return inputs.occupancyPercent >= 60 && inputs.totalRooms >= 20;
}
