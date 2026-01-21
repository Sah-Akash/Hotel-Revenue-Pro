import React from 'react';
import { CalculationMetrics, InputState } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { PieChart, Landmark, TrendingUp, Scale, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  metrics: CalculationMetrics;
  inputs: InputState;
}

const FinancialOverview: React.FC<Props> = ({ metrics, inputs }) => {
  if (!inputs.includeFinancials) return null;

  const isCashFlowNegative = metrics.monthlyCashFlow < 0;
  const equity = Math.max(inputs.propertyValue - inputs.loanAmount, 0);
  
  // Determine DSCR health color
  const getDSCRColor = (dscr: number) => {
    if (dscr >= 1.25) return 'text-emerald-600 bg-emerald-50';
    if (dscr >= 1.0) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 break-inside-avoid">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800">Investment Analysis</h3>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
            Equity: {formatCurrency(equity)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        {/* ROI Block */}
        <div className="p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>ROI (Cash-on-Cash)</span>
            </div>
            <div>
                <div className={`text-3xl font-bold ${metrics.roi >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                    {formatNumber(metrics.roi, 1)}%
                </div>
                <div className="text-xs text-slate-400 mt-1">Annual return on invested equity</div>
            </div>
        </div>

        {/* DSCR Block */}
        <div className="p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-3">
                <Scale className="w-4 h-4" />
                <span>DSCR</span>
            </div>
            <div>
                <div className={`text-3xl font-bold w-fit px-2 rounded ${getDSCRColor(metrics.dscr)}`}>
                    {formatNumber(metrics.dscr, 2)}x
                </div>
                <div className="text-xs text-slate-400 mt-1">
                    {metrics.dscr < 1 ? 'Critical: Income covers <100% debt' : 'Healthy: Income covers debt'}
                </div>
            </div>
        </div>

        {/* Valuation Block */}
        <div className="p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-3">
                <PieChart className="w-4 h-4" />
                <span>Est. Valuation</span>
            </div>
            <div>
                <div className="text-3xl font-bold text-slate-800">
                    {formatCurrency(metrics.valuation)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Based on 10% Cap Rate of NOI</div>
            </div>
        </div>

        {/* Payback Block */}
        <div className="p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-3">
                <Clock className="w-4 h-4" />
                <span>Payback Period</span>
            </div>
            <div>
                <div className="text-3xl font-bold text-slate-800">
                    {metrics.paybackPeriod > 50 ? '>50' : formatNumber(metrics.paybackPeriod, 1)} <span className="text-lg text-slate-500 font-medium">Yrs</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Time to recover equity</div>
            </div>
        </div>
      </div>

      {isCashFlowNegative && (
         <div className="bg-red-50 p-4 border-t border-red-100 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
                <strong>Warning: Negative Cash Flow.</strong> The property's Net Operating Income ({formatCurrency(metrics.monthlyNet)}) is insufficient to cover the monthly Loan EMI ({formatCurrency(metrics.monthlyEMI)}). You will need to inject capital of <strong>{formatCurrency(Math.abs(metrics.monthlyCashFlow))}</strong> monthly.
            </div>
         </div>
      )}
    </div>
  );
};

export default FinancialOverview;