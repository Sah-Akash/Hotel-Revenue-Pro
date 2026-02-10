
import React from 'react';
import { CalculationMetrics, InputState } from '../types';
import { formatCurrency } from '../utils';
import { Sparkles, ArrowRight, ShieldCheck, TrendingUp, AlertTriangle, Calculator, Target, CheckCircle2 } from 'lucide-react';

interface Props {
  metrics: CalculationMetrics;
  inputs: InputState;
}

const DealSuggestions: React.FC<Props> = ({ metrics, inputs }) => {
  
  const isGoodDeal = metrics.monthlyMg <= metrics.maxSafeMg;
  const currentDealType = inputs.dealType === 'owner' ? 'Revenue Share' : 'Fixed Lease';

  // Recommendation Text Logic
  const getRecommendation = () => {
    if (metrics.recommendedDealType === 'lessee') {
        return {
            title: "Recommended: Fixed Lease (Lessee Model)",
            reason: "Your occupancy and margins are strong. Locking in a Fixed MG allows you to keep the upside profit as revenue grows.",
            color: "bg-emerald-50 border-emerald-100 text-emerald-900"
        };
    } else if (metrics.recommendedDealType === 'owner') {
        return {
            title: "Recommended: Revenue Share (Owner Model)",
            reason: "Current metrics suggest volatility. A Revenue Share model reduces your fixed monthly obligation and shares the risk with the brand.",
            color: "bg-amber-50 border-amber-100 text-amber-900"
        };
    } else {
        return {
            title: "Recommended: Hybrid / Flexi Deal",
            reason: "The asset is stable but sensitive to rate changes. Consider a lower MG with a higher profit share above a certain threshold.",
            color: "bg-blue-50 border-blue-100 text-blue-900"
        };
    }
  };

  const rec = getRecommendation();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8 break-inside-avoid">
        
        {/* 1. THE ARCHITECT: Suggestions */}
        <div className="bg-white rounded-[24px] shadow-card border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
            
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="bg-slate-900 text-white p-2 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">Deal Architect</h3>
                    <p className="text-xs text-slate-500 font-medium">AI-Driven Strategy Suggestions</p>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Recommendation Box */}
                <div className={`p-5 rounded-2xl border ${rec.color} relative overflow-hidden`}>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 font-black uppercase text-xs tracking-wider opacity-80">
                            <Target className="w-4 h-4" /> Strategy
                        </div>
                        <h4 className="text-xl font-bold mb-2">{rec.title}</h4>
                        <p className="text-sm opacity-90 leading-relaxed font-medium">{rec.reason}</p>
                    </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                            <span>Deal Strength Score</span>
                            <span>{metrics.dealStrengthScore.toFixed(0)}/100</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${metrics.dealStrengthScore > 60 ? 'bg-emerald-500' : (metrics.dealStrengthScore > 40 ? 'bg-amber-500' : 'bg-red-500')}`} 
                                style={{ width: `${metrics.dealStrengthScore}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="text-right">
                         <div className="text-[10px] font-bold text-slate-400 uppercase">Current Model</div>
                         <div className="font-bold text-slate-900">{currentDealType}</div>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. THE SOLVER: Reverse Calculation */}
        <div className="bg-slate-900 text-white rounded-[24px] shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
            
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 text-white p-2 rounded-lg backdrop-blur-sm">
                        <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Reverse Solver</h3>
                        <p className="text-xs text-slate-400 font-medium">Optimize your Minimum Guarantee</p>
                    </div>
                </div>
                <div className="text-[10px] font-bold bg-indigo-600 px-2 py-1 rounded text-white uppercase tracking-wider">
                    Auto-Calc
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                
                {/* Metric 1: Max Viable MG */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> Max Safe MG
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                        {formatCurrency(metrics.maxSafeMg)}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        The highest MG you can pay while maintaining a 25% safety margin on operational income.
                    </p>
                </div>

                {/* Metric 2: Target MG for ROI */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-widest">
                        <TrendingUp className="w-4 h-4" /> 24% ROI Target
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                        {formatCurrency(metrics.targetMgFor20Roi)}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Limit your MG to this amount to ensure a minimum 24% Annual Return on Investment.
                    </p>
                </div>

                {/* Status Indicator */}
                <div className="md:col-span-2 pt-6 border-t border-white/10">
                    <div className="flex items-start gap-3">
                        {isGoodDeal ? (
                            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        ) : (
                            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <h5 className={`font-bold text-sm ${isGoodDeal ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isGoodDeal ? 'Current Deal is Viable' : 'Current MG is Risky'}
                            </h5>
                            <p className="text-slate-400 text-xs mt-1">
                                Your current MG of <span className="text-white font-bold">{formatCurrency(inputs.monthlyMg)}</span> is 
                                {isGoodDeal ? ' within ' : ' above '} the recommended safe limit of {formatCurrency(metrics.maxSafeMg)}.
                                {!isGoodDeal && " Consider negotiating a lower fixed rent or switching to Revenue Share."}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </div>
  );
};

export default DealSuggestions;
