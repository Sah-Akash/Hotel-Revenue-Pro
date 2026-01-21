import React from 'react';
import { CalculationMetrics } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { Bed, IndianRupee, TrendingUp, Percent } from 'lucide-react';

interface Props {
  metrics: CalculationMetrics;
  occupancyPercent: number;
  roomPrice: number;
}

const SummaryCards: React.FC<Props> = ({ metrics, occupancyPercent, roomPrice }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Sold Rooms */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Bed className="w-4 h-4 text-blue-500" />
          <span>Sold Rooms / Night</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-800">{formatNumber(metrics.srn, 0)}</div>
          <div className="text-xs text-slate-400 mt-1">Based on {occupancyPercent}% occupancy</div>
        </div>
      </div>

      {/* 2. Monthly Revenue */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <IndianRupee className="w-4 h-4 text-green-500" />
          <span>Monthly Revenue</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-800">{formatCurrency(metrics.monthlyRevenue)}</div>
          <div className="text-xs text-slate-400 mt-1">@ {formatCurrency(roomPrice)} / night</div>
        </div>
      </div>

      {/* 3. Monthly Net Income */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          <span>Monthly Net Income</span>
        </div>
        <div>
          <div className={`text-3xl font-bold ${metrics.monthlyNet >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
            {formatCurrency(metrics.monthlyNet)}
          </div>
          <div className="text-xs text-slate-400 mt-1">After OTA & Maint.</div>
        </div>
      </div>

      {/* 4. Yearly Net Income */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg shadow-blue-200 flex flex-col justify-between h-32 text-white">
        <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
          <Percent className="w-4 h-4" />
          <span>Yearly Net Income</span>
        </div>
        <div>
          <div className="text-3xl font-bold tracking-tight">{formatCurrency(metrics.yearlyNet)}</div>
          <div className="text-xs text-blue-200 mt-1 opacity-80">Projected Annual Profit</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;