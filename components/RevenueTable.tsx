import React from 'react';
import { CalculationMetrics, ExtraDeduction } from '../types';
import { formatCurrency } from '../utils';
import { DAYS_IN_MONTH, DAYS_IN_YEAR } from '../constants';

interface Props {
  metrics: CalculationMetrics;
  isOwnerView: boolean;
  extraDeductions: ExtraDeduction[];
}

const RevenueTable: React.FC<Props> = ({ metrics, isOwnerView, extraDeductions }) => {
  const hasExtraDeductions = extraDeductions.length > 0;
  // If financial metrics (EMI) are present > 0, we show the full waterfall
  const showFinancials = metrics.monthlyEMI > 0 || metrics.roi > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Revenue Breakdown</h3>
        {isOwnerView && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Simplified View</span>}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold text-right">Daily</th>
              <th className="p-4 font-semibold text-right">Monthly</th>
              <th className="p-4 font-semibold text-right">Yearly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* Gross Revenue */}
            <tr className="group hover:bg-slate-50/50 transition-colors">
              <td className="p-4">
                <div className="font-semibold text-slate-700">Gross Revenue</div>
                {!isOwnerView && <div className="text-xs text-slate-400">Total sales before deductions</div>}
              </td>
              <td className="p-4 text-right font-medium text-slate-600">{formatCurrency(metrics.dailyRevenue)}</td>
              <td className="p-4 text-right font-medium text-slate-600">{formatCurrency(metrics.monthlyRevenue)}</td>
              <td className="p-4 text-right font-medium text-slate-600">{formatCurrency(metrics.yearlyRevenue)}</td>
            </tr>

            {/* Deductions Section */}
            {!isOwnerView && (
              <>
                <tr className="group hover:bg-red-50/10 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-red-600">OTA Commission (18%)</div>
                    <div className="text-xs text-slate-400">Booking platforms fees</div>
                  </td>
                  <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(metrics.dailyOta)}</td>
                  <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(metrics.monthlyOta)}</td>
                  <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(metrics.yearlyOta)}</td>
                </tr>
                <tr className="group hover:bg-red-50/10 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-red-600">Maintenance Cost</div>
                    <div className="text-xs text-slate-400">Staff, Utilities, Upkeep</div>
                  </td>
                  <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(metrics.dailyMaintenance)}</td>
                  <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(metrics.monthlyMaintenance)}</td>
                  <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(metrics.yearlyMaintenance)}</td>
                </tr>
                
                {/* Individual Extra Deductions */}
                {extraDeductions.map((deduction) => {
                   if (!deduction.amount) return null;
                   const monthly = deduction.amount;
                   const daily = monthly / DAYS_IN_MONTH;
                   const yearly = monthly * 12;

                   return (
                    <tr key={deduction.id} className="group hover:bg-red-50/10 transition-colors">
                        <td className="p-4">
                            <div className="font-medium text-red-600">{deduction.name || 'Unnamed Expense'}</div>
                            <div className="text-xs text-slate-400">Additional fixed expense</div>
                        </td>
                        <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(daily)}</td>
                        <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(monthly)}</td>
                        <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(yearly)}</td>
                    </tr>
                   );
                })}
              </>
            )}

            {/* If Owner View, combine deductions */}
            {isOwnerView && (
               <tr className="group hover:bg-red-50/10 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-red-600">Total Deductions</div>
                    <div className="text-xs text-slate-400">OTA + Maintenance {hasExtraDeductions ? '+ Extras' : ''}</div>
                  </td>
                  <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(metrics.dailyOta + metrics.dailyMaintenance + metrics.dailyExtra)}</td>
                  <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(metrics.monthlyOta + metrics.monthlyMaintenance + metrics.monthlyExtra)}</td>
                  <td className="p-4 text-right text-red-500 text-sm">-{formatCurrency(metrics.yearlyOta + metrics.yearlyMaintenance + metrics.yearlyExtra)}</td>
                </tr>
            )}

            {/* NOI / Net Income */}
            <tr className={`bg-blue-50/30 ${showFinancials ? 'border-b border-slate-200' : ''}`}>
              <td className="p-4">
                <div className="font-bold text-blue-700">{showFinancials ? 'Net Operating Income (NOI)' : 'Net Income'}</div>
                <div className="text-xs text-blue-400">Operating profit before debt</div>
              </td>
              <td className="p-4 text-right font-bold text-blue-700">{formatCurrency(metrics.dailyNet)}</td>
              <td className="p-4 text-right font-bold text-blue-700">{formatCurrency(metrics.monthlyNet)}</td>
              <td className="p-4 text-right font-bold text-blue-700">{formatCurrency(metrics.yearlyNet)}</td>
            </tr>

            {/* Financials: Debt Service & Cash Flow */}
            {showFinancials && (
                <>
                    <tr className="group hover:bg-indigo-50/10 transition-colors">
                        <td className="p-4">
                            <div className="font-medium text-indigo-600">Debt Service (EMI)</div>
                            <div className="text-xs text-slate-400">Loan repayment (Principal + Interest)</div>
                        </td>
                        <td className="p-4 text-right text-indigo-500 text-sm">-{formatCurrency(metrics.monthlyEMI / 30)}</td>
                        <td className="p-4 text-right text-indigo-500 text-sm">-{formatCurrency(metrics.monthlyEMI)}</td>
                        <td className="p-4 text-right text-indigo-500 text-sm">-{formatCurrency(metrics.yearlyEMI)}</td>
                    </tr>
                    <tr className="bg-indigo-50 border-t border-indigo-100">
                        <td className="p-4">
                            <div className="font-bold text-indigo-900">Net Cash Flow</div>
                            <div className="text-xs text-indigo-400">Actual profit in hand after loan</div>
                        </td>
                        <td className="p-4 text-right font-bold text-indigo-900">{formatCurrency(metrics.monthlyCashFlow / 30)}</td>
                        <td className="p-4 text-right font-bold text-indigo-900">{formatCurrency(metrics.monthlyCashFlow)}</td>
                        <td className="p-4 text-right font-bold text-indigo-900">{formatCurrency(metrics.yearlyCashFlow)}</td>
                    </tr>
                </>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueTable;