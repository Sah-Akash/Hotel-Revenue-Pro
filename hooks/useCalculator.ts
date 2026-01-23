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
    // Note: For Deal Sheet display "SRNs" is often Inventory, but calculation uses sold.
    // We calculate Actual Sold Rooms here.
    let soldRooms = totalRooms * occupancyDecimal;
    if (roundSRN) {
      soldRooms = Math.round(soldRooms);
    }
    
    // Display SRN (Inventory) comes directly from inputs.totalRooms for the table

    // 2. Daily Revenue (Expected Revenue - Gross)
    const dailyRevenue = soldRooms * roomPrice;

    // 3. Monthly Revenue (Expected Revenue)
    const monthlyRevenue = dailyRevenue * DAYS_IN_MONTH;

    // 4. Yearly Revenue
    const yearlyRevenue = dailyRevenue * DAYS_IN_YEAR;

    // --- DEAL SHEET SPECIFIC CALCULATIONS (Matching Image Logic) ---

    // Rev minus GST = Exp Revenue / (1 + GST)
    const dealRevenueNetGst = monthlyRevenue / (1 + GST_RATE);
    const dealMonthlyGst = monthlyRevenue - dealRevenueNetGst;

    // OTA Approx = (Rev minus GST) * (OTA% / 100)
    // Note: Image had 143438 for 2049107 Net Rev => ~7%
    const dealOtaAbs = dealRevenueNetGst * (otaPercent / 100);

    // Opex Abs Value = Sold Rooms * 30 * OpexPerURN
    // Note: Image had 499500 for 45 sold rooms * 370 * 30.
    const dealOpexAbs = soldRooms * DAYS_IN_MONTH * maintenanceCostPerRoom;

    // Absolute CM = RevNet - OTA - Opex - MG
    // Note: Image 2049107 - 143438 - 499500 - 1200000 = 206169. (Image 206170). Matches.
    const dealAbsoluteCm = dealRevenueNetGst - dealOtaAbs - dealOpexAbs - monthlyMg;

    // CM% = (Absolute CM / RevNet) * 100
    // Note: Image 206170 / 2049107 = 10%.
    const dealCmPercent = dealRevenueNetGst > 0 ? (dealAbsoluteCm / dealRevenueNetGst) * 100 : 0;

    // PBP = ((BA + SD) / Absolute CM) * 100
    // Note: Image 1500000 / 206170 = 7.27 => 728%.
    const totalInvestment = securityDeposit + businessAdvance;
    const dealPbpPercent = dealAbsoluteCm > 0 ? (totalInvestment / dealAbsoluteCm) * 100 : 0;

    // MG Impact 6 Months (Text from Prompt)
    const dealMgImpactSixMonths = (dealRevenueNetGst * 0.10) * 6;


    // --- STANDARD LEGACY METRICS (For Dashboard/Visuals) ---
    // Approximations using standard formulas for visuals
    const dailyOta = dailyRevenue * OTA_COMMISSION_RATE; // 18% of Gross
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

    // Financials
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

    // --- INSIGHTS ---
    const breakEvenOccupancyDeal = dealAbsoluteCm < 0 
        ? occupancyPercent + (Math.abs(dealAbsoluteCm) / (dealRevenueNetGst/occupancyPercent)) // Rough linear approx
        : occupancyPercent - (dealAbsoluteCm / (dealRevenueNetGst/occupancyPercent)); 

    const deltaGross = 100 * soldRooms * 30;
    const deltaNetGst = deltaGross / (1 + GST_RATE);
    const deltaOta = deltaNetGst * (otaPercent / 100);
    const arrSensitivity = deltaNetGst - deltaOta;

    return {
      srn: soldRooms, // Export sold rooms for other charts, but display total rooms in Deal Table
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
      
      // Deal Specifics
      dealMonthlyGst,
      dealRevenueNetGst,
      dealOtaAbs,
      dealOpexAbs,
      dealAbsoluteCm,
      dealCmPercent,
      dealPbpPercent,
      dealMgImpactSixMonths,
      monthlyMg,
      operatorProfit: dealAbsoluteCm, // In this deal view, Absolute CM is the bottom line
      breakEvenOccupancyDeal,
      arrSensitivity
    };
  }, [inputs]);
};