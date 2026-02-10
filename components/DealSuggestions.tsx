
import React, { useState } from 'react';
import { CalculationMetrics, InputState } from '../types';
import { formatCurrency } from '../utils';
import { Sparkles, CheckCircle2, AlertTriangle, Target, Briefcase, Scale, MessageCircle, FileText, ChevronRight, Gavel, XCircle, Unlock } from 'lucide-react';

interface Props {
  metrics: CalculationMetrics;
  inputs: InputState;
}

const DealSuggestions: React.FC<Props> = ({ metrics, inputs }) => {
  const [activeTab, setActiveTab] = useState<'structuring' | 'negotiation'>('structuring');

  const isGoodDeal = metrics.monthlyMg <= metrics.maxSafeMg;
  const gap = inputs.monthlyMg - metrics.maxSafeMg;
  
  // Calculate Hybrid Model details
  const hybridBase = metrics.hybridFixedMg; // ~50% of NOI
  const hybridShare = metrics.hybridRevSharePercent; // 15%
  const hybridTotal = metrics.hybridProjectedPayout;
  const isHybridBetterForOwner = hybridTotal > inputs.monthlyMg;

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
                    <span className="text-sm font-bold tracking-widest uppercase opacity-70">Executive Deal Architect</span>
                </div>
                <h2 className="text-3xl font-serif font-medium tracking-tight">Deal Structuring & Strategy</h2>
                <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                    Analyzing financial exposure and providing institutional-grade negotiation levers to optimize asset acquisition.
                </p>
            </div>
            
            {/* Verdict Badge */}
            <div className={`px-6 py-4 rounded-2xl border backdrop-blur-xl ${isGoodDeal ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                <div className="text-xs font-bold uppercase tracking-widest mb-1">AI Verdict</div>
                <div className="text-2xl font-black flex items-center gap-2">
                    {isGoodDeal ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    {isGoodDeal ? 'VIABLE DEAL' : 'HIGH RISK'}
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Option A: Current (Usually Risky) */}
                        <div className={`p-6 rounded-2xl border-2 ${isGoodDeal ? 'bg-white border-slate-200' : 'bg-red-50/50 border-red-100'} relative group`}>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Option A: Current</div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">Fixed Lease</h3>
                            <div className="text-3xl font-black text-slate-900 mb-4">{formatCurrency(inputs.monthlyMg)} <span className="text-sm font-medium text-slate-400">/ mo</span></div>
                            
                            <ul className="space-y-3 text-sm text-slate-600 mb-6">
                                <li className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <span><strong>High Risk:</strong> You bear 100% of the occupancy risk.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Scale className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span><strong>Break-Even:</strong> Requires {Math.ceil(metrics.breakEvenOccupancyDeal)}% occupancy just to cover costs.</span>
                                </li>
                            </ul>

                            {!isGoodDeal && (
                                <div className="bg-red-100 text-red-700 text-xs font-bold p-3 rounded-lg text-center uppercase">
                                    Overleveraged by {formatCurrency(gap)}
                                </div>
                            )}
                        </div>

                        {/* Option B: Revenue Share (Safe) */}
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 relative group hover:border-slate-300 transition-colors">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Option B: Safety First</div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">Pure RevShare</h3>
                            <div className="text-3xl font-black text-slate-900 mb-4">35% <span className="text-sm font-medium text-slate-400">of Net Rev</span></div>
                            
                            <ul className="space-y-3 text-sm text-slate-600 mb-6">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span><strong>Zero Risk:</strong> If occupancy drops, your rent drops automatically.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Unlock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span><strong>Cash Flow:</strong> Maintains specific margins regardless of season.</span>
                                </li>
                            </ul>
                            <div className="text-xs text-slate-500 text-center mt-auto">
                                * Projected Payout: {formatCurrency(metrics.dealRevenueNetGst * 0.35)}
                            </div>
                        </div>

                        {/* Option C: The Smart Hybrid (Recommended) */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-500 relative shadow-xl shadow-indigo-100 transform md:-translate-y-2">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                                Expert Pick
                            </div>
                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Option C: The Smart Hybrid</div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">Base + Kicker</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-2xl font-black text-slate-900">{formatCurrency(hybridBase)}</span>
                                <span className="text-sm font-bold text-slate-500">+ {hybridShare}% RevShare</span>
                            </div>
                            
                            <div className="bg-white/60 p-4 rounded-xl border border-indigo-100 mb-4">
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                    <span>Proj. Owner Payout</span>
                                    <span className={isHybridBetterForOwner ? "text-emerald-600" : "text-slate-600"}>{formatCurrency(hybridTotal)}</span>
                                </div>
                                {isHybridBetterForOwner && (
                                    <p className="text-[10px] text-emerald-600 font-medium">
                                        * You pay the owner <strong>MORE</strong> than their fixed ask, but only when you earn it. Win-Win.
                                    </p>
                                )}
                            </div>

                            <ul className="space-y-3 text-sm text-slate-700">
                                <li className="flex items-start gap-2">
                                    <Target className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                    <span><strong>Downside Protection:</strong> Your fixed obligation drops by {formatCurrency(inputs.monthlyMg - hybridBase)}.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                    <span><strong>Pitch:</strong> "Mr. Owner, I will guarantee your basic costs ({formatCurrency(hybridBase)}) and share the upside. If we hit targets, you earn {formatCurrency(hybridTotal)}."</span>
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
                             <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">The Pitch Script</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border-l-4 border-indigo-500 shadow-sm italic text-slate-600 text-lg leading-relaxed font-serif relative">
                            <span className="absolute top-4 left-4 text-6xl text-slate-100 font-serif -z-10">“</span>
                            "I understand your expectation is {formatCurrency(inputs.monthlyMg)}. However, looking at the <span className="text-indigo-600 font-bold not-italic">market ARR of {formatCurrency(inputs.roomPrice)}</span>, a fixed lease at that level leaves zero room for operational variance. <br/><br/>
                            I propose a <strong>Partnership Model</strong>. I will lock in {formatCurrency(hybridBase)} as a safety net for you, plus {hybridShare}% of every rupee earned. In high season, you make more than your ask. In low season, we both survive."
                        </div>

                        <div className="space-y-3">
                             <div className="flex items-center gap-2 mb-2">
                                <Gavel className="w-5 h-5 text-slate-400" />
                                <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">Contract Clauses to Demand</h3>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200">
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="min-w-[24px] h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">Capex Holiday</div>
                                            <div className="text-xs text-slate-500 mt-0.5">"If I am investing {formatCurrency(inputs.businessAdvance)} in upgrades, I need a 2-month rent-free period to execute works."</div>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="min-w-[24px] h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">Structural Warranty</div>
                                            <div className="text-xs text-slate-500 mt-0.5">"Owner must retain liability for roof leakage, plumbing main lines, and electrical transformer issues. My maintenance covers internal wear and tear only."</div>
                                        </div>
                                    </li>
                                     <li className="flex gap-3">
                                        <div className="min-w-[24px] h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">Force Majeure Cap</div>
                                            <div className="text-xs text-slate-500 mt-0.5">"In case of lockdown or road closure, MG implies 50% waiver automatically."</div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* The Leverage Analysis */}
                    <div className="space-y-6">
                         <div className="flex items-center gap-2 mb-2">
                             <Scale className="w-5 h-5 text-slate-400" />
                             <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">Leverage Analysis</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {/* Leverage Point 1 */}
                            <div className="bg-slate-800 text-slate-300 p-5 rounded-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Financial Leverage</div>
                                    <h4 className="text-white font-bold mb-2">The "Skin in the Game" Argument</h4>
                                    <p className="text-sm leading-relaxed opacity-90">
                                        You are putting down <strong>{formatCurrency(inputs.securityDeposit + inputs.businessAdvance)}</strong> upfront. Use this.
                                        <br/><br/>
                                        <em>"Mr. Owner, I am deploying capital into your asset. That reduces your risk. Therefore, the monthly yield (MG) should be lower than a standard rental where no capital is deployed."</em>
                                    </p>
                                </div>
                            </div>

                             {/* Leverage Point 2 */}
                             <div className="bg-white border border-slate-200 p-5 rounded-2xl relative">
                                <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1">Operational Leverage</div>
                                <h4 className="text-slate-900 font-bold mb-2">The "Hidden Cost" Defense</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Calculate the <strong>Total Cost of Ownership (TCO)</strong>.
                                    <br/>
                                    Show them that your Ops Cost ({formatCurrency(metrics.monthlyMaintenance)}) + OTA Commissions ({formatCurrency(metrics.monthlyOta)}) equals <strong>{formatCurrency(metrics.monthlyMaintenance + metrics.monthlyOta)}</strong> per month.
                                    <br/><br/>
                                    <em>"These are costs you would incur if you ran it yourself. I am absorbing them. That value needs to be deducted from the Rent expectation."</em>
                                </p>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3">
                            <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                            <div className="text-xs text-indigo-900 leading-relaxed">
                                <strong>Pro Tip:</strong> Never negotiate the MG in isolation. Always trade it against the <strong>Security Deposit</strong> or the <strong>Lock-in Period</strong>. "I can match your MG, but I need the Lock-in reduced from 3 years to 1 year."
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
