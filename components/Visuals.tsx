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
      { name: 'OTA Commission', value: metrics.monthlyOta, color: '#f43f5e' }, // Rose
      { name: 'Maintenance', value: metrics.monthlyMaintenance, color: '#f59e0b' }, // Amber
      { name: 'Extra Expenses', value: metrics.monthlyExtra, color: '#6366f1' }, // Indigo
    ];
    // Filter out zero values
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
    // Generate data points for occupancy from 0 to 100 in steps of 10
    for (let i = 0; i <= 100; i += 10) {
      const occupancyDecimal = i / 100;
      
      let srn = inputs.totalRooms * occupancyDecimal;
      if (inputs.roundSRN) srn = Math.round(srn);

      const dailyRev = srn * inputs.roomPrice;
      const monthlyRev = dailyRev * 30;

      // Calculate Expenses at this occupancy
      const dailyOta = dailyRev * 0.18; // 18% OTA
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
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-xs z-50">
          <p className="font-bold text-slate-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                 <span className="text-slate-500">{entry.name}:</span>
              </div>
              <span className="font-semibold text-slate-700">
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
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
        <div className="w-full mb-2">
            <h3 className="font-bold text-slate-800 text-sm">Monthly P&L Breakdown</h3>
            <p className="text-[10px] text-slate-400">Where the money goes</p>
        </div>
        <div className="h-[220px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={false}
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        iconType="circle" 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}
                    />
                </PieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Margin</p>
                    <p className="text-lg font-bold text-emerald-600">
                        {metrics.monthlyRevenue > 0 ? Math.round((metrics.monthlyNet / metrics.monthlyRevenue) * 100) : 0}%
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* 2. Revenue vs Net Income (Bar) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Revenue vs Net Income</h3>
            <p className="text-[10px] text-slate-400">Monthly vs Yearly Average</p>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10}}
                dy={10}
              />
              <YAxis 
                tick={{fill: '#94a3b8', fontSize: 10}} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Legend iconType="circle" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
              <Bar name="Gross Revenue" dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={24} isAnimationActive={false} />
              <Bar name="Net Income" dataKey="NetIncome" fill="#10b981" radius={[4, 4, 4, 4]} barSize={24} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Sensitivity (Area) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-4 flex justify-between items-start">
            <div>
                <h3 className="font-bold text-slate-800 text-sm">Occupancy Projection</h3>
                <p className="text-[10px] text-slate-400">Net Income at different occupancy levels</p>
            </div>
        </div>
        <div className="h-[200px] w-full">
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
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="occupancy" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10}}
                dy={10}
                tickFormatter={(val) => `${val}%`}
              />
              <YAxis 
                tick={{fill: '#94a3b8', fontSize: 10}} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={inputs.occupancyPercent} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Curr', fontSize: 9, fill: '#94a3b8' }} />
              <Area 
                type="monotone" 
                dataKey="NetIncome" 
                name="Net Income" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorNet)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Visuals;