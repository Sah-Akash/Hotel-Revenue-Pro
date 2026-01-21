import React from 'react';
import { CalculationMetrics } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { TrendingUp, Bed, Percent, Wallet } from 'lucide-react';

interface Props {
  metrics: CalculationMetrics;
  occupancyPercent: number;
  roomPrice: number;
}

const SummaryCards: React.FC<Props> = ({ metrics, occupancyPercent, roomPrice }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* SRN */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Bed className="w-4 h-4" />
          <span>Sold Rooms (SRN)</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-800">{formatNumber(metrics.srn, 1)}</div>
          <div className="text-xs text-slate-400 mt-1">Per day average</div>
        </div>
      </div>

      {/* ARR */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          <span>ARR</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-800">{formatCurrency(roomPrice)}</div>
          <div className="text-xs text-slate-400 mt-1">Average Room Rate</div>
        </div>
      </div>

      {/* Occupancy */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Percent className="w-4 h-4" />
          <span>Occupancy</span>
        </div>
        <div className="flex items-end justify-between">
            <div>
                <div className="text-3xl font-bold text-slate-800">{occupancyPercent}%</div>
                <div className="text-xs text-slate-400 mt-1">Utilization</div>
            </div>
             {/* Mini Pie Chart Representation using SVG */}
             <div className="relative w-12 h-12 hidden sm:block">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path
                        className="text-slate-100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="text-blue-500 transition-all duration-1000 ease-out"
                        strokeDasharray={`${occupancyPercent}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                </svg>
            </div>
        </div>
      </div>

      {/* Net Monthly Income - Highlighted */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg shadow-blue-200 flex flex-col justify-between h-32 text-white">
        <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
          <Wallet className="w-4 h-4" />
          <span>Net Monthly Income</span>
        </div>
        <div>
          <div className="text-3xl font-bold tracking-tight">{formatCurrency(metrics.monthlyNet)}</div>
          <div className="text-xs text-blue-200 mt-1">After all deductions</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;