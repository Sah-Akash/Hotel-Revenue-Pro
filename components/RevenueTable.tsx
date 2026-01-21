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
  const showFinancials = metrics.monthlyEMI > 0 || metrics.roi > 0;

  return (
    <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
            <h3 className="text-lg font-bold text-slate-900">Financial Breakdown</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Detailed view of income and expenses</p>
        </div>
        {isOwnerView && <span className="text-xs font-bold bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full uppercase tracking-wide">Owner View</span>}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Category</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Daily</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Monthly</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Yearly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {/* Gross Revenue */}
            <tr className="group hover:bg-slate-50 transition-colors">
              <td className="px-8 py-5">
                <div className="font-bold text-slate-800 text-sm">Gross Revenue</div>
              </td>
              <td className="px-8 py-5 text-right font-semibold text-slate-700 font-mono text-sm">{formatCurrency(metrics.dailyRevenue)}</td>
              <td className="px-8 py-5 text-right font-semibold text-slate-700 font-mono text-sm">{formatCurrency(metrics.monthlyRevenue)}</td>
              <td className="px-8 py-5 text-right font-semibold text-slate-700 font-mono text-sm">{formatCurrency(metrics.yearlyRevenue)}</td>
            </tr>

            {/* Deductions */}
            {!isOwnerView && (
              <>
                <tr className="group hover:bg-red-50/10 transition-colors">
                  <td className="px-8 py-5 pl-12 relative">
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    <div className="font-medium text-slate-600 text-sm">OTA Commission (18%)</div>
                  </td>
                  <td className="px-8 py-5 text-right text-red-500 text-sm font-mono opacity-80">-{formatCurrency(metrics.dailyOta)}</td>
                  <td className="px-8 py-5 text-right text-red-500 text-sm font-mono opacity-80">-{formatCurrency(metrics.monthlyOta)}</td>
                  <td className="px-8 py-5 text-right text-red-500 text-sm font-mono opacity-80">-{formatCurrency(metrics.yearlyOta)}</td>
                </tr>
                <tr className="group hover:bg-red-50/10 transition-colors">
                  <td className="px-8 py-5 pl-12 relative">
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    <div className="font-medium text-slate-600 text-sm">Maintenance</div>
                  </td>
                  <td className="px-8 py-5 text-right text-red-500 text-sm font-mono opacity-80">-{formatCurrency(metrics.dailyMaintenance)}</td>
                  <td className="px-8 py-5 text-right text-red-500 text-sm font-mono opacity-80">-{formatCurrency(metrics.monthlyMaintenance)}</td>
                  <td className="px-8 py-5 text-right text-red-500 text-sm font-mono opacity-80">-{formatCurrency(metrics.yearlyMaintenance)}</td>
                </tr>
                
                {extraDeductions.map((deduction) => {
                   if (!deduction.amount) return null;
                   const monthly = deduction.amount;
                   const daily = monthly / DAYS_IN_MONTH;
                   const yearly = monthly * 12;

                   return (
                    <tr key={deduction.id} className="group hover:bg-red-50/10 transition-colors">
                        <td className="px-8 py-5 pl-12 relative">
                            <div className="absolute left-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-400"></div>
                            <div className="font-medium text-slate-600 text-sm">{deduction.name || 'Expense'}</div>
                        </td>
                        <td className="px-8 py-5 text-right text-red-500 text-sm font-mono opacity-80">-{formatCurrency(daily)}</td>
                        <td className="px-8 py-5 text-right text-red-500 text-sm font-mono opacity-80">-{formatCurrency(monthly)}</td>
                        <td className="px-8 py-5 text-right text-red-500 text-sm font-mono opacity-80">-{formatCurrency(yearly)}</td>
                    </tr>
                   );
                })}
              </>
            )}

            {isOwnerView && (
               <tr className="group hover:bg-red-50/10 transition-colors">
                  <td className="px-8 py-5 pl-12">
                    <div className="font-medium text-red-600 text-sm">Total Deductions</div>
                  </td>
                  <td className="px-8 py-5 text-right text-red-500 text-sm font-mono">-{formatCurrency(metrics.dailyOta + metrics.dailyMaintenance + metrics.dailyExtra)}</td>
                  <td className="px-8 py-5 text-right text-red-500 text-sm font-mono">-{formatCurrency(metrics.monthlyOta + metrics.monthlyMaintenance + metrics.monthlyExtra)}</td>
                  <td className="px-8 py-5 text-right text-red-500 text-sm font-mono">-{formatCurrency(metrics.yearlyOta + metrics.yearlyMaintenance + metrics.yearlyExtra)}</td>
                </tr>
            )}

            {/* NOI / Net Income */}
            <tr className="bg-slate-900/5 border-t border-slate-200">
              <td className="px-8 py-5">
                <div className="font-bold text-slate-900 text-sm uppercase tracking-wide">{showFinancials ? 'NOI (Operating Income)' : 'Net Income'}</div>
              </td>
              <td className="px-8 py-5 text-right font-bold text-slate-900 font-mono">{formatCurrency(metrics.dailyNet)}</td>
              <td className="px-8 py-5 text-right font-bold text-slate-900 font-mono">{formatCurrency(metrics.monthlyNet)}</td>
              <td className="px-8 py-5 text-right font-bold text-slate-900 font-mono">{formatCurrency(metrics.yearlyNet)}</td>
            </tr>

            {/* Financials: Debt Service & Cash Flow */}
            {showFinancials && (
                <>
                    <tr className="group hover:bg-indigo-50/10 transition-colors">
                        <td className="px-8 py-5 pl-12 relative">
                            <div className="absolute left-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                            <div className="font-medium text-slate-600 text-sm">Loan EMI</div>
                        </td>
                        <td className="px-8 py-5 text-right text-indigo-600 text-sm font-mono opacity-90">-{formatCurrency(metrics.monthlyEMI / 30)}</td>
                        <td className="px-8 py-5 text-right text-indigo-600 text-sm font-mono opacity-90">-{formatCurrency(metrics.monthlyEMI)}</td>
                        <td className="px-8 py-5 text-right text-indigo-600 text-sm font-mono opacity-90">-{formatCurrency(metrics.yearlyEMI)}</td>
                    </tr>
                    <tr className="bg-slate-900 text-white">
                        <td className="px-8 py-6">
                            <div className="font-bold text-sm uppercase tracking-wide">Net Cash Flow</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-1">Free Cash Flow after Debt Service</div>
                        </td>
                        <td className="px-8 py-6 text-right font-bold font-mono">{formatCurrency(metrics.monthlyCashFlow / 30)}</td>
                        <td className="px-8 py-6 text-right font-bold font-mono">{formatCurrency(metrics.monthlyCashFlow)}</td>
                        <td className="px-8 py-6 text-right font-bold font-mono">{formatCurrency(metrics.yearlyCashFlow)}</td>
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