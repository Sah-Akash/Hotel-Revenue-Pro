import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Label,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CalculationMetrics, InputState } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { TrendingUp, TrendingDown, AlertCircle, Info, Target, ShieldCheck, Zap, Activity } from 'lucide-react';

interface Props {
  metrics: CalculationMetrics;
  inputs: InputState;
}

const Visuals: React.FC<Props> = ({ metrics, inputs }) => {
  
  // 1. Deal Health Radar Data
  const radarData = useMemo(() => {
    // Normalize metrics to 0-100 scale for the radar
    // ROI: Target 30% -> 100
    const roiScore = Math.min(Math.max((metrics.roi / 30) * 100, 0), 100);
    
    // Cash Flow Margin: Target 25% -> 100
    const margin = metrics.monthlyRevenue > 0 ? (metrics.monthlyNet / metrics.monthlyRevenue) * 100 : 0;
    const marginScore = Math.min(Math.max((margin / 25) * 100, 0), 100);
    
    // Safety (Break Even Buffer): Target 20% buffer -> 100
    const breakEven = metrics.breakEvenOccupancyDeal;
    const buffer = inputs.occupancyPercent - breakEven;
    const safetyScore = Math.min(Math.max((buffer / 20) * 100, 0), 100);
    
    // Payback Speed: Target 3 years -> 100, 10 years -> 0
    const pbp = metrics.paybackPeriod;
    const pbpScore = pbp <= 0 ? 0 : Math.min(Math.max((1 - (pbp - 1) / 9) * 100, 0), 100);

    return [
      { subject: 'ROI Potential', A: roiScore, fullMark: 100 },
      { subject: 'Cash Flow', A: marginScore, fullMark: 100 },
      { subject: 'Safety Margin', A: safetyScore, fullMark: 100 },
      { subject: 'Payback Speed', A: pbpScore, fullMark: 100 },
    ];
  }, [metrics, inputs.occupancyPercent]);

  // 2. Sensitivity & Profit Zone (Composed Chart)
  const { sensitivityData, breakEvenOccupancy } = useMemo(() => {
    const data = [];
    let breakEven = null;

    for (let i = 0; i <= 100; i += 10) {
      const occupancyDecimal = i / 100;
      let srn = inputs.totalRooms * occupancyDecimal;
      if (inputs.roundSRN) srn = Math.round(srn);

      const dailyRev = srn * inputs.roomPrice;
      const monthlyRev = dailyRev * 30;

      // Variable Costs
      const monthlyOta = monthlyRev * (inputs.otaPercent / 100); // Using Deal OTA %
      const monthlyMaint = srn * 30 * inputs.maintenanceCostPerRoom;
      
      // Fixed Costs
      const monthlyExtra = inputs.extraDeductions.reduce((sum, item) => sum + (item.amount || 0), 0);
      const monthlyLoan = inputs.includeFinancials && inputs.loanAmount > 0 ? metrics.monthlyEMI : 0;
      const mg = inputs.monthlyMg;

      // Total Fixed for this occupancy point calculation
      const totalCost = monthlyOta + monthlyMaint + monthlyExtra + monthlyLoan + mg;
      
      const net = monthlyRev - totalCost;
      
      if (breakEven === null && net >= 0) {
        breakEven = i; 
      }
      
      data.push({
        occupancy: i,
        NetIncome: net,
        GrossRevenue: monthlyRev,
        TotalCost: totalCost
      });
    }
    return { sensitivityData: data, breakEvenOccupancy: breakEven };
  }, [inputs, metrics]);

  // 3. Expense Breakdown (Pie)
  const pieData = useMemo(() => {
    const data = [
      { name: 'Net Profit', value: metrics.monthlyNet, color: '#10b981' }, 
      { name: 'MG / Lease', value: inputs.monthlyMg, color: '#f59e0b' },
      { name: 'Ops & OTA', value: metrics.monthlyOta + metrics.monthlyMaintenance, color: '#6366f1' }, 
      { name: 'Debt & Others', value: metrics.monthlyEMI + metrics.monthlyExtra, color: '#ef4444' }, 
    ];
    return data.filter(d => d.value > 0);
  }, [metrics, inputs.monthlyMg]);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-xl p-3 border border-white/10 shadow-2xl rounded-xl text-xs z-50 text-white min-w-[150px]">
           <p className="font-bold text-slate-300 mb-2 border-b border-white/10 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 mb-1 last:mb-0">
              <span className="text-slate-400 capitalize">{entry.name}</span>
              <span className="font-mono font-bold">{typeof entry.value === 'number' && entry.name !== 'occupancy' ? formatCurrency(entry.value) : entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 print:break-inside-avoid">
      
      {/* 1. Deal Health Radar */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
         <div className="flex justify-between items-start mb-2 z-10">
            <div>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg"><Activity className="w-4 h-4" /></div>
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Deal Health</h3>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1 pl-9">Multi-dimensional Score</p>
            </div>
            <div className="text-2xl font-black text-slate-900/10 absolute top-4 right-6 group-hover:text-violet-500/10 transition-colors">SCORE</div>
         </div>
         
         <div className="h-[250px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Deal Score"
                        dataKey="A"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fill="#8b5cf6"
                        fillOpacity={0.2}
                    />
                    <Tooltip cursor={false} content={({ active, payload }) => {
                         if (active && payload && payload.length) {
                             return (
                                 <div className="bg-slate-900 text-white text-xs py-1 px-2 rounded font-bold">
                                     {payload[0].value}/100
                                 </div>
                             )
                         }
                         return null;
                    }}/>
                </RadarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* 2. Profit Zone (Composed) */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start mb-6 z-10">
            <div>
                 <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Target className="w-4 h-4" /></div>
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Profit Zone</h3>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1 pl-9">Revenue vs Cost Analysis</p>
            </div>
             {metrics.breakEvenOccupancyDeal < 100 ? (
                 <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold border border-emerald-100">
                    BEP: {Math.ceil(metrics.breakEvenOccupancyDeal)}% Occ
                 </div>
             ) : (
                 <div className="bg-red-50 text-red-700 px-2 py-1 rounded text-[10px] font-bold border border-red-100">
                    High Risk
                 </div>
             )}
        </div>

        <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sensitivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="occupancy" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={v => `${v}%`} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    
                    <Area type="monotone" dataKey="GrossRevenue" stroke="#3b82f6" fill="url(#colorRev)" strokeWidth={2} />
                    <Line type="monotone" dataKey="TotalCost" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="NetIncome" stroke="#10b981" strokeWidth={3} dot={{r: 3, strokeWidth: 2}} />
                    
                    <ReferenceLine x={inputs.occupancyPercent} stroke="#64748b" strokeDasharray="3 3" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
      </div>

       {/* 3. Distribution (Pie) */}
       <div className="xl:col-span-2 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 group hover:shadow-md transition-all duration-300">
            <div className="h-[200px] w-[200px] relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-400 font-bold uppercase">Margin</span>
                    <span className={`text-2xl font-black ${metrics.monthlyNet > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {metrics.monthlyRevenue > 0 ? Math.round((metrics.monthlyNet / metrics.monthlyRevenue) * 100) : 0}%
                    </span>
                </div>
            </div>
            
            <div className="flex-1 w-full grid grid-cols-2 gap-4">
                 {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{entry.name}</div>
                            <div className="text-sm font-bold text-slate-800 font-mono">{formatCurrency(entry.value)}</div>
                        </div>
                    </div>
                ))}
                <div className="col-span-2 mt-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
                    <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-800 leading-relaxed">
                        <strong>Insight:</strong> Your fixed costs (MG + Debt) account for <span className="font-bold">{Math.round(((inputs.monthlyMg + metrics.monthlyEMI) / metrics.monthlyRevenue) * 100)}%</span> of revenue at current occupancy.
                    </p>
                </div>
            </div>
       </div>

    </div>
  );
};

export default Visuals;