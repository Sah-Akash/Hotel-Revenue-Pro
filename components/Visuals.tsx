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
  Legend,
  ReferenceLine,
} from 'recharts';
import { CalculationMetrics, InputState } from '../types';
import { formatCurrency, formatNumber } from '../utils';

interface Props {
  metrics: CalculationMetrics;
  inputs: InputState;
}

const Visuals: React.FC<Props> = ({ metrics, inputs }) => {
  
  // 1. Expense Breakdown Data (Donut Chart)
  const pieData = useMemo(() => {
    const data = [
      { name: 'Net Profit', value: metrics.monthlyNet, color: '#10b981' }, // Emerald
      { name: 'OTA Fees', value: metrics.monthlyOta, color: '#f43f5e' }, // Rose
      { name: 'Maintenance', value: metrics.monthlyMaintenance, color: '#f59e0b' }, // Amber
      { name: 'Extra Costs', value: metrics.monthlyExtra, color: '#6366f1' }, // Indigo
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

  // 3. Sensitivity Analysis Data
  const sensitivityData = useMemo(() => {
    const data = [];
    for (let i = 0; i <= 100; i += 10) {
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
      const net = monthlyRev - (monthlyOta + monthlyMaint + monthlyExtra);
      
      data.push({
        occupancy: i,
        NetIncome: net,
        GrossRevenue: monthlyRev,
      });
    }
    return data;
  }, [inputs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 p-4 border border-slate-800 shadow-2xl rounded-xl text-xs z-50 text-white min-w-[150px]">
          <p className="font-bold text-slate-300 mb-3 border-b border-slate-800 pb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-2 last:mb-0">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                 <span className="text-slate-400 font-medium">{entry.name}</span>
              </div>
              <span className="font-bold font-mono">
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
      
      {/* 1. Profit & Loss Distribution (Donut) */}
      <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100 flex flex-col items-center">
        <div className="w-full mb-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Expense Ratio</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Cost distribution analysis</p>
        </div>
        <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={true}
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Margin</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                        {metrics.monthlyRevenue > 0 ? Math.round((metrics.monthlyNet / metrics.monthlyRevenue) * 100) : 0}%
                    </p>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full mt-2">
            {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                     <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }}></div>
                     <div className="flex justify-between w-full">
                        <span className="text-slate-500">{entry.name}</span>
                     </div>
                </div>
            ))}
        </div>
      </div>

      {/* 2. Revenue vs Net Income (Bar) */}
      <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100">
        <div className="mb-6">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Performance</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Revenue vs. Net Income</p>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}}
                dy={10}
              />
              <YAxis 
                tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace'}} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Bar name="Gross Revenue" dataKey="Revenue" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={32} />
              <Bar name="Net Income" dataKey="NetIncome" fill="#10b981" radius={[6, 6, 6, 6]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Sensitivity (Area) */}
      <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100">
        <div className="mb-6">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Occupancy Projection</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Net Income Forecast Curve</p>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sensitivityData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="occupancy" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}}
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
              <ReferenceLine x={inputs.occupancyPercent} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Curr', fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
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
      </div>

    </div>
  );
};

export default Visuals;