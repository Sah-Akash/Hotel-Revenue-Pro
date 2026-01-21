import React from 'react';
import { CalculationMetrics } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { Bed, IndianRupee, TrendingUp, Wallet } from 'lucide-react';

interface Props {
  metrics: CalculationMetrics;
  occupancyPercent: number;
  roomPrice: number;
}

const SummaryCards: React.FC<Props> = ({ metrics, occupancyPercent, roomPrice }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* 1. Sold Rooms */}
      <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
             <Bed className="w-24 h-24 text-blue-600" />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Bed className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{formatNumber(metrics.srn, 0)}</div>
            <div className="text-sm text-slate-500 font-medium">Sold Rooms / Night</div>
        </div>
      </div>

      {/* 2. Monthly Revenue */}
      <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
             <IndianRupee className="w-24 h-24 text-emerald-600" />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <IndianRupee className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{formatCurrency(metrics.monthlyRevenue)}</div>
            <div className="text-sm text-slate-500 font-medium">Gross Monthly Sales</div>
        </div>
      </div>

      {/* 3. Monthly Net Income */}
      <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
             <Wallet className="w-24 h-24 text-indigo-600" />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Wallet className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Income</span>
            </div>
            <div className={`text-3xl font-extrabold mb-1 ${metrics.monthlyNet >= 0 ? 'text-slate-900' : 'text-red-500'}`}>
                {formatCurrency(metrics.monthlyNet)}
            </div>
            <div className="text-sm text-slate-500 font-medium">Monthly Profit</div>
        </div>
      </div>

      {/* 4. Yearly Net Income (Highlighted) */}
      <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group text-white">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
             <TrendingUp className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 text-white rounded-lg backdrop-blur-sm">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected</span>
            </div>
            <div className="text-3xl font-extrabold text-white mb-1 tracking-tight">{formatCurrency(metrics.yearlyNet)}</div>
            <div className="text-sm text-slate-400 font-medium">Annual Net Income</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;