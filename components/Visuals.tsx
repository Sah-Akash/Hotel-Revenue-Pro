import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  ReferenceDot,
  Label
} from 'recharts';
import { CalculationMetrics, InputState } from '../types';
import { formatCurrency } from '../utils';
import { TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';

interface Props {
  metrics: CalculationMetrics;
  inputs: InputState;
}

const Visuals: React.FC<Props> = ({ metrics, inputs }) => {
  
  // 1. Expense Breakdown Data (Donut Chart)
  const pieData = useMemo(() => {
    const data = [
      { name: 'Net Profit', value: metrics.monthlyNet, color: '#10b981', gradientId: 'colorProfit' }, 
      { name: 'OTA Fees', value: metrics.monthlyOta, color: '#f43f5e', gradientId: 'colorOta' }, 
      { name: 'Maintenance', value: metrics.monthlyMaintenance, color: '#f59e0b', gradientId: 'colorMaint' }, 
      { name: 'Extra Costs', value: metrics.monthlyExtra, color: '#6366f1', gradientId: 'colorExtra' }, 
    ];
    return data.filter(d => d.value > 0);
  }, [metrics]);

  // 2. Comparative Bar Chart Data
  const barData = [
    {
      name: 'Monthly',
      Revenue: metrics.monthlyRevenue,
      NetIncome: metrics.monthlyNet,
    },
    {
      name: 'Yearly (Avg)',
      Revenue: metrics.yearlyRevenue / 12,
      NetIncome: metrics.yearlyNet / 12,
    }
  ];

  // 3. Sensitivity & Break-Even Analysis
  const { sensitivityData, breakEvenOccupancy } = useMemo(() => {
    const data = [];
    let breakEven = null;

    // Constant K for Break Even Calc: Net = Occupancy * K - FixedCosts
    // K = Rooms * 30 * (Price * (1 - 0.18) - MaintenanceBase)
    // This is an approximation as Maintenance varies with occupancy in the calculator, 
    // but usually linear.
    
    for (let i = 0; i <= 100; i += 5) {
      const occupancyDecimal = i / 100;
      let srn = inputs.totalRooms * occupancyDecimal;
      if (inputs.roundSRN) srn = Math.round(srn);

      const dailyRev = srn * inputs.roomPrice;
      const monthlyRev = dailyRev * 30;

      const dailyOta = dailyRev * 0.18; 
      const monthlyOta = dailyOta * 30;
      const maintFactor = inputs.maintenanceCostPerRoom * occupancyDecimal * srn;
      const monthlyMaint = maintFactor * 30;
      const monthlyExtra = inputs.extraDeductions.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      // Financials (Loan) are fixed costs relative to occupancy
      const monthlyLoan = inputs.includeFinancials && inputs.loanAmount > 0 ? metrics.monthlyEMI : 0;

      const net = monthlyRev - (monthlyOta + monthlyMaint + monthlyExtra + monthlyLoan);
      
      // Rough Break-even detection
      if (breakEven === null && net >= 0) {
        breakEven = i; 
      }
      
      data.push({
        occupancy: i,
        NetIncome: net,
        GrossRevenue: monthlyRev,
      });
    }
    return { sensitivityData: data, breakEvenOccupancy: breakEven };
  }, [inputs, metrics.monthlyEMI]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md p-4 border border-slate-700 shadow-2xl rounded-2xl text-xs z-50 text-white min-w-[180px] ring-1 ring-white/10">
          <p className="font-bold text-slate-200 mb-3 border-b border-slate-700 pb-2 flex justify-between">
            <span>{label}</span>
            {payload[0].payload.occupancy !== undefined && <span className="text-slate-500 font-mono">{payload[0].payload.occupancy}% Occ</span>}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-2 last:mb-0">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: entry.color || entry.fill }} />
                 <span className="text-slate-400 font-medium">{entry.name}</span>
              </div>
              <span className={`font-bold font-mono ${entry.value < 0 ? 'text-red-400' : 'text-white'}`}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 print:break-inside-avoid">
      
      {/* 1. Profit Margin & Distribution (Donut) */}
      <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100 flex flex-col items-center relative overflow-hidden">
        <div className="w-full mb-4 flex justify-between items-start z-10">
            <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Expense Structure</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Cost vs Profit Analysis</p>
            </div>
             <div className="bg-slate-50 p-2 rounded-lg">
                <Info className="w-4 h-4 text-slate-400" />
            </div>
        </div>

        <div className="h-[260px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={6}
                        dataKey="value"
                        cornerRadius={6}
                        stroke="none"
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
             
             {/* Center Label */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Net Margin</span>
                <span className={`text-4xl font-extrabold ${metrics.monthlyNet >= 0 ? 'text-slate-900' : 'text-red-500'}`}>
                    {metrics.monthlyRevenue > 0 ? Math.round((metrics.monthlyNet / metrics.monthlyRevenue) * 100) : 0}%
                </span>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium px-2 py-1 rounded-full ${metrics.monthlyNet >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                     {metrics.monthlyNet >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                     {metrics.monthlyNet >= 0 ? 'Profitable' : 'Loss Making'}
                </div>
            </div>
        </div>

        {/* Custom Legend */}
        <div className="grid grid-cols-2 gap-3 w-full mt-4">
            {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                     <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }}></div>
                     <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{entry.name}</span>
                        <span className="text-sm font-bold text-slate-700 font-mono">{formatCurrency(entry.value)}</span>
                     </div>
                </div>
            ))}
        </div>
      </div>

      {/* 2. Revenue vs Net Income (Bar) */}
      <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100">
        <div className="mb-6 flex justify-between items-end">
            <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Performance Overview</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Revenue vs. Net Income</p>
            </div>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              barGap={12}
            >
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={1}/>
                </linearGradient>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}}
                dy={10}
              />
              <YAxis 
                tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace'}} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc', radius: 8}} />
              <Bar name="Gross Revenue" dataKey="Revenue" fill="url(#blueGradient)" radius={[6, 6, 6, 6]} barSize={40} />
              <Bar name="Net Income" dataKey="NetIncome" fill="url(#emeraldGradient)" radius={[6, 6, 6, 6]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Sensitivity (Area) */}
      <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100">
        <div className="mb-6 flex justify-between items-start">
            <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Occupancy Sensitivity</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Projected Net Income at different occupancy levels</p>
            </div>
             {breakEvenOccupancy && (
                <div className="bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-800">
                        Break-even: {breakEvenOccupancy}%
                    </span>
                </div>
            )}
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sensitivityData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="occupancy" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}}
                dy={10}
                tickFormatter={(val) => `${val}%`}
              />
              <YAxis 
                tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace'}} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Zero Line */}
              <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
              
              {/* Current Occupancy Line */}
              <ReferenceLine 
                x={inputs.occupancyPercent} 
                stroke="#3b82f6" 
                strokeDasharray="3 3" 
              >
                  <Label 
                    value="Current" 
                    position="insideTop" 
                    fill="#3b82f6" 
                    fontSize={10} 
                    fontWeight="bold"
                    offset={10}
                  />
              </ReferenceLine>

              {/* Break Even Point */}
              {breakEvenOccupancy && (
                 <ReferenceDot 
                    x={breakEvenOccupancy} 
                    y={0} 
                    r={4} 
                    fill="#6366f1" 
                    stroke="white" 
                    strokeWidth={2}
                 />
              )}

              <Area 
                type="monotone" 
                dataKey="NetIncome" 
                name="Net Income" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorNet)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
         {breakEvenOccupancy && inputs.occupancyPercent < breakEvenOccupancy && (
            <div className="mt-4 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4" />
                <span>
                    <strong>Warning:</strong> Current occupancy ({inputs.occupancyPercent}%) is below the break-even point ({breakEvenOccupancy}%). Increase occupancy or rates to become profitable.
                </span>
            </div>
         )}
      </div>

    </div>
  );
};

export default Visuals;