
import React, { useState } from 'react';
import { CalculationMetrics, InputState } from '../types';
import { formatCurrency } from '../utils';
import { Sparkles, CheckCircle2, AlertTriangle, Target, Briefcase, Scale, MessageCircle, FileText, ChevronRight, Gavel, XCircle, Unlock, Calculator, ArrowRight, Minus } from 'lucide-react';

interface Props {
  metrics: CalculationMetrics;
  inputs: InputState;
}

const DealSuggestions: React.FC<Props> = ({ metrics, inputs }) => {
  const [activeTab, setActiveTab] = useState<'structuring' | 'negotiation'>('structuring');

  const isGoodDeal = metrics.monthlyMg <= metrics.maxSafeMg;
  const gap = inputs.monthlyMg - metrics.maxSafeMg;
  
  // Hybrid Model details
  const hybridBase = metrics.hybridFixedMg; // Safety Base
  const hybridShare = metrics.hybridRevSharePercent; // 45%
  const hybridTotal = metrics.hybridProjectedPayout;
  
  // Determine if Hybrid beats MG
  const isRevShareTriggered = hybridTotal > hybridBase;

  return (
    <div className="bg-white rounded-[32px] shadow-xl border border-slate-200 overflow-hidden mb-10 break-inside-avoid relative">
        {/* Header Background */}
        <div className="absolute top-0 w-full h-32 bg-slate-900 z-0">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Header Content */}
        <div className="relative z-10 p-8 pb-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-white mb-8">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase opacity-70">Deal Architect</span>
                </div>
                <h2 className="text-3xl font-serif font-medium tracking-tight">Strategy & Structuring</h2>
                <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                    AI-driven deal structures modeled on institutional hospitality standards.
                </p>
            </div>
            
            {/* Verdict Badge */}
            <div className={`px-6 py-4 rounded-2xl border backdrop-blur-xl ${isGoodDeal ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                <div className="text-xs font-bold uppercase tracking-widest mb-1">Current Ask</div>
                <div className="text-2xl font-black flex items-center gap-2">
                    {isGoodDeal ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    {isGoodDeal ? 'VIABLE' : 'HIGH RISK'}
                </div>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-8 flex gap-8 border-b border-slate-200 bg-white relative z-10 rounded-t-3xl mt-[-20px] pt-6">
            <button 
                onClick={() => setActiveTab('structuring')}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors relative ${activeTab === 'structuring' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                1. Structure Options
                {activeTab === 'structuring' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('negotiation')}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors relative ${activeTab === 'negotiation' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                2. Negotiation Playbook
                {activeTab === 'negotiation' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
            </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-8 bg-slate-50/50">
            
            {/* TAB 1: STRUCTURING */}
            {activeTab === 'structuring' && (
                <div className="space-y-8">
                    
                    {/* The "Paper Math" - Replicating User Image Logic */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-slate-500">
                             <Calculator className="w-4 h-4" />
                             <span className="text-xs font-bold uppercase tracking-widest">Revenue Share Logic (Gross vs Net)</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 text-sm">
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Gross Rev</div>
                                <div className="font-bold text-slate-900">{formatCurrency(metrics.monthlyRevenue)}</div>
                            </div>
                            <div className="flex justify-center text-slate-300"><Minus className="w-4 h-4" /></div>
                            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                <div className="text-[10px] uppercase text-red-400 font-bold mb-1">Tax/Ins (12%)</div>
                                <div className="font-bold text-red-700">{formatCurrency(metrics.dealMonthlyGst)}</div>
                            </div>
                            <div className="flex justify-center text-slate-300"><ArrowRight className="w-4 h-4" /></div>
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="text-[10px] uppercase text-emerald-600 font-bold mb-1">Net Revenue</div>
                                <div className="font-bold text-emerald-700 text-lg">{formatCurrency(metrics.dealRevenueNetGst)}</div>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-400 italic">
                            *This "Net Revenue" figure is the base for all Revenue Share calculations below.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Option A: Fixed Lease (Current Input) */}
                        <div className={`p-6 rounded-2xl border-2 ${isGoodDeal ? 'bg-white border-slate-200' : 'bg-red-50/50 border-red-100'} relative group`}>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Option A: Fixed</div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">Standard Lease</h3>
                            <div className="text-3xl font-black text-slate-900 mb-4">{formatCurrency(inputs.monthlyMg)} <span className="text-sm font-medium text-slate-400">/ mo</span></div>
                            
                            <ul className="space-y-3 text-sm text-slate-600 mb-6">
                                <li className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <span><strong>Risk:</strong> 100% on Operator.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Scale className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span><strong>Break-Even:</strong> {Math.ceil(metrics.breakEvenOccupancyDeal)}% Occupancy.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Option B: Pure Revenue Share */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 relative group hover:border-slate-300 transition-colors">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Option B: Variable</div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">Pure Rev Share</h3>
                            <div className="text-3xl font-black text-slate-900 mb-4">48% <span className="text-sm font-medium text-slate-400">of Net Rev</span></div>
                            
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                                <div className="text-xs text-slate-500 mb-1">Est. Payout</div>
                                <div className="font-bold text-slate-900">{formatCurrency(metrics.dealRevenueNetGst * 0.48)}</div>
                            </div>
                            
                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span><strong>Zero Risk:</strong> Rent scales down with demand.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Option C: MG + Revenue Share (Hybrid) */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-500 relative shadow-xl shadow-indigo-100 transform md:-translate-y-2">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                                Expert Strategy
                            </div>
                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Option C: MG + RevShare</div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">Hybrid Model</h3>
                            <div className="text-sm font-bold text-slate-500 mb-4">
                                MG <span className="text-indigo-600 underline decoration-dotted underline-offset-4" title="Minimum Guarantee">Floor</span> + Upside Share
                            </div>
                            
                            <div className="bg-white/80 p-4 rounded-xl border border-indigo-100 mb-5 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">1. Minimum Guarantee</span>
                                    <span className="font-bold text-slate-900">{formatCurrency(hybridBase)}</span>
                                </div>
                                <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">- OR -</div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">2. {hybridShare}% of Net Rev</span>
                                    <span className="font-bold text-slate-900">{formatCurrency(metrics.dealRevenueNetGst * (hybridShare/100))}</span>
                                </div>
                                <div className="pt-2 border-t border-indigo-100 flex justify-between items-center">
                                    <span className="text-indigo-600 font-bold text-xs uppercase">Owner Gets (Higher)</span>
                                    <span className="font-black text-indigo-700 text-lg">{formatCurrency(hybridTotal)}</span>
                                </div>
                            </div>

                            <ul className="space-y-2 text-sm text-slate-700">
                                <li className="flex items-start gap-2 text-xs leading-relaxed">
                                    <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Pitch:</strong> "I give you a safety net of {formatCurrency(hybridBase)}, so your EMI is covered. If we perform well, you switch to the 45% share and earn more."
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: NEGOTIATION PLAYBOOK */}
            {activeTab === 'negotiation' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* The Script */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                             <MessageCircle className="w-5 h-5 text-slate-400" />
                             <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">The "Hybrid" Pitch Script</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border-l-4 border-indigo-500 shadow-sm italic text-slate-600 text-lg leading-relaxed font-serif relative">
                            <span className="absolute top-4 left-4 text-6xl text-slate-100 font-serif -z-10">“</span>
                            "Sir, a purely Fixed Lease at {formatCurrency(inputs.monthlyMg)} assumes 80% occupancy year-round, which is unrealistic in this market. <br/><br/>
                            I propose a <strong>Minimum Guarantee of {formatCurrency(hybridBase)}</strong> to cover your base risk. <br/><br/>
                            However, to be fair, I will add a <strong>Revenue Share Clause</strong>: If 45% of our Net Revenue exceeds that MG, I will pay you the higher amount. This way, your downside is protected, but you also participate in the upside during high season."
                        </div>
                    </div>

                    {/* Technical Clauses */}
                    <div className="space-y-6">
                         <div className="flex items-center gap-2 mb-2">
                             <Gavel className="w-5 h-5 text-slate-400" />
                             <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">Crucial Definitions</h3>
                        </div>
                        
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                             <div className="p-4 border-b border-slate-100 bg-amber-50/50">
                                <h4 className="font-bold text-slate-900 text-sm">1. Define "Net Revenue" Clearly</h4>
                                <p className="text-xs text-slate-500 mt-1">Avoid disputes later by defining the exact base for RevShare.</p>
                             </div>
                             <div className="p-4 text-sm text-slate-600 leading-relaxed font-mono text-xs bg-slate-50">
                                "Net Revenue shall be defined as Gross Room Revenue minus Applicable Taxes (GST @ 12%) and OTA Commissions. Food & Beverage revenue shall be calculated separately."
                             </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                             <div className="p-4 border-b border-slate-100 bg-blue-50/50">
                                <h4 className="font-bold text-slate-900 text-sm">2. The "MG Reset" Clause</h4>
                             </div>
                             <div className="p-4 text-sm text-slate-600 leading-relaxed">
                                "The Minimum Guarantee is subject to the property being operational for 30 days. In case of Force Majeure (Pandemic, Road Closure), the MG obligation converts to a pure Revenue Share model for that period."
                             </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default DealSuggestions;
