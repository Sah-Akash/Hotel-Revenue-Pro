
import React from 'react';
import { SavedProject } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Building2, TrendingUp, IndianRupee, Layers } from 'lucide-react';

interface Props {
  projects: SavedProject[];
}

const Analytics: React.FC<Props> = ({ projects }) => {
  
  if (projects.length === 0) {
      return (
          <div className="p-12 text-center text-slate-400">
              <h2 className="text-xl font-bold text-slate-700 mb-2">No Data Available</h2>
              <p>Create some projects to see portfolio analytics.</p>
          </div>
      );
  }

  // Aggregate Data
  const totalValuation = projects.reduce((sum, p) => sum + (p.summary.valuation || 0), 0);
  const totalMonthlyRev = projects.reduce((sum, p) => sum + p.summary.monthlyRevenue, 0);
  const totalMonthlyNet = projects.reduce((sum, p) => sum + p.summary.monthlyNet, 0);
  const totalRooms = projects.reduce((sum, p) => sum + p.inputs.totalRooms, 0);
  const avgOccupancy = projects.reduce((sum, p) => sum + p.inputs.occupancyPercent, 0) / projects.length;

  // Chart Data
  const revenueDistribution = projects.map(p => ({
      name: p.inputs.hotelName || 'Untitled',
      value: p.summary.monthlyRevenue
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Portfolio Analytics</h1>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>Total Inventory</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{totalRooms} <span className="text-sm text-slate-400 font-normal">Rooms</span></div>
                <div className="text-xs text-slate-400 mt-1">Across {projects.length} properties</div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    <span>Avg Occupancy</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{formatNumber(avgOccupancy)}%</div>
                <div className="text-xs text-slate-400 mt-1">Portfolio wide average</div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                    <IndianRupee className="w-4 h-4 text-green-500" />
                    <span>Total Monthly Net</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalMonthlyNet)}</div>
                <div className="text-xs text-slate-400 mt-1">Consolidated Net Income</div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    <span>Total Valuation</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalValuation)}</div>
                <div className="text-xs text-slate-400 mt-1">Est. Market Value</div>
             </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Revenue Contribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Revenue Contribution by Property</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={revenueDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {revenueDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    {revenueDistribution.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-slate-600">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="truncate">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-6">Revenue vs Net Income</h3>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={projects.map(p => ({
                                name: p.inputs.hotelName || 'Untitled',
                                Revenue: p.summary.monthlyRevenue,
                                Net: p.summary.monthlyNet
                            }))}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" hide />
                            <YAxis 
                                tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} 
                                axisLine={false} 
                                tickLine={false}
                                tick={{fill: '#94a3b8', fontSize: 10}}
                            />
                            <Tooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 4, 4]} />
                            <Bar dataKey="Net" fill="#10b981" radius={[4, 4, 4, 4]} />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} All rights reserved by Akash Sah.</p>
        </div>
    </div>
  );
};

export default Analytics;
