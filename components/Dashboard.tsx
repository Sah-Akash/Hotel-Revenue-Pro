
import React, { useState, useMemo } from 'react';
import { SavedProject, InputState } from '../types';
import { 
  Plus, Trash2, Building2, Calendar, TrendingUp, 
  PieChart, Search, ArrowUpDown, Wallet, 
  MoreVertical, MapPin, BedDouble, Users, Briefcase, ChevronRight
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, YAxis } from 'recharts';

interface Props {
  projects: SavedProject[];
  onCreateNew: () => void;
  onOpen: (project: SavedProject) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

// Helper to determine category (duplicated logic for display)
const getCategoryDetails = (inputs: InputState) => {
    if (inputs.hasGym && inputs.hasRestaurant && inputs.hasKitchen) {
        return { label: "Palette", color: "text-purple-600 bg-purple-50 border-purple-100" };
    }
    if (inputs.hasRestaurant && inputs.hasKitchen) {
        return { label: "Townhouse", color: "text-rose-600 bg-rose-50 border-rose-100" };
    }
    if (inputs.hasKitchen) {
        return { label: "Collection O", color: "text-amber-600 bg-amber-50 border-amber-100" };
    }
    return { label: "Flagship", color: "text-blue-600 bg-blue-50 border-blue-100" };
};

// Helper to generate sparkline data for revenue potential
const generateRevenueSparkline = (inputs: InputState) => {
    const points = [20, 40, 60, 80, 100]; // Occupancy points
    return points.map(occ => {
        // Simplified Revenue Calc: Rooms * Occ% * Price * 30
        const revenue = inputs.totalRooms * (occ / 100) * inputs.roomPrice * 30;
        return { occ, value: revenue };
    });
};

const Dashboard: React.FC<Props> = ({ projects, onCreateNew, onOpen, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'valuation' | 'net'>('date');

  // Stats
  const totalValuation = projects.reduce((sum, p) => sum + (p.summary.valuation || 0), 0);
  const totalMonthlyNet = projects.reduce((sum, p) => sum + p.summary.monthlyNet, 0);
  const totalRooms = projects.reduce((sum, p) => sum + p.inputs.totalRooms, 0);

  // Filter & Sort
  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => (p.inputs.hotelName || '').toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'date') return b.lastModified - a.lastModified;
        if (sortBy === 'valuation') return (b.summary.valuation || 0) - (a.summary.valuation || 0);
        if (sortBy === 'net') return b.summary.monthlyNet - a.summary.monthlyNet;
        return 0;
      });
  }, [projects, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 pb-20 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Portfolio Overview</h1>
            <p className="text-slate-500 text-lg font-medium">Manage and analyze your property assets.</p>
          </div>
          <button 
            onClick={onCreateNew}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Property Model</span>
          </button>
        </div>

        {/* Portfolio Stats Bar */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-blue-100 transition-colors">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building2 className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Properties</div>
                    <div className="text-2xl font-extrabold text-slate-900">{projects.length}</div>
                </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-emerald-100 transition-colors">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Wallet className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Monthly Net</div>
                    <div className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalMonthlyNet)}</div>
                </div>
            </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-indigo-100 transition-colors">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <PieChart className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Valuation</div>
                    <div className="text-2xl font-extrabold text-slate-900">{formatCurrency(totalValuation)}</div>
                </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-amber-100 transition-colors">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <BedDouble className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Inventory</div>
                    <div className="text-2xl font-extrabold text-slate-900">{totalRooms} <span className="text-sm font-medium text-slate-400">Rooms</span></div>
                </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4">
             <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search projects..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 shadow-sm"
                />
            </div>
            <div className="relative min-w-[200px]">
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full appearance-none bg-white border border-slate-200 pl-4 pr-10 py-3 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer shadow-sm"
                >
                    <option value="date">Last Modified</option>
                    <option value="valuation">Valuation (High - Low)</option>
                    <option value="net">Net Income (High - Low)</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
                const category = getCategoryDetails(project.inputs);
                const sparklineData = generateRevenueSparkline(project.inputs);
                const dealType = project.inputs.dealType || 'owner';
                
                return (
                    <div 
                        key={project.id} 
                        onClick={() => onOpen(project)}
                        className="bg-white rounded-[24px] border border-slate-200/60 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden"
                    >
                        {/* Card Top: Header & Visual */}
                        <div className="p-6 pb-2 relative">
                            {/* Tags */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-2">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${category.color}`}>
                                        {category.label}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide flex items-center gap-1 ${dealType === 'owner' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                        <Briefcase className="w-3 h-3" />
                                        {dealType}
                                    </span>
                                </div>
                                <button 
                                    onClick={(e) => onDelete(e, project.id)}
                                    className="p-2 -mr-2 -mt-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{project.inputs.hotelName || 'Untitled Project'}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(project.lastModified).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>

                            {/* Revenue Potential Sparkline */}
                            <div className="h-24 w-full -mx-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparklineData}>
                                        <defs>
                                            <linearGradient id={`gradient-${project.id}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Area 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke="#3b82f6" 
                                            strokeWidth={2}
                                            fill={`url(#gradient-${project.id})`} 
                                            isAnimationActive={false}
                                        />
                                        <RechartsTooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg font-mono">
                                                        {payload[0].payload.occ}% Occ: {formatCurrency(payload[0].value as number)}
                                                    </div>
                                                );
                                                }
                                                return null;
                                            }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-between px-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider -mt-4 relative z-10 pointer-events-none">
                                <span>20% Occ</span>
                                <span>Potential</span>
                                <span>100% Occ</span>
                            </div>
                        </div>

                        {/* Card Bottom: Metrics Grid */}
                        <div className="mt-auto bg-slate-50/50 border-t border-slate-100 p-6 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">Monthly Net</div>
                                <div className={`text-lg font-bold ${project.summary.monthlyNet >= 0 ? 'text-slate-900' : 'text-red-500'}`}>
                                    {formatCurrency(project.summary.monthlyNet)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                                    {project.inputs.includeFinancials ? 'ROI' : 'Gross Revenue'}
                                </div>
                                <div className={`text-lg font-bold ${project.inputs.includeFinancials ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {project.inputs.includeFinancials ? `${formatNumber(project.summary.roi)}%` : formatCurrency(project.summary.monthlyRevenue)}
                                </div>
                            </div>
                            <div className="col-span-2 pt-3 border-t border-slate-100 flex items-center justify-between">
                                 <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                    <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                                    {project.inputs.totalRooms} Rooms
                                 </div>
                                 <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold group-hover:underline">
                                    View Details <ChevronRight className="w-3 h-3" />
                                 </div>
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {/* Create New Card (Empty State filler if few projects, or just always at end? No, kept seperate logic) */}
            {filteredProjects.length === 0 && searchTerm === '' && (
                 <div 
                    onClick={onCreateNew}
                    className="min-h-[340px] rounded-[24px] border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center p-8 group"
                >
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Create New Model</h3>
                    <p className="text-sm text-slate-400">Start a fresh financial analysis</p>
                </div>
            )}
        </div>
        
        {/* Empty Search State */}
        {filteredProjects.length === 0 && searchTerm !== '' && (
            <div className="text-center py-20">
                <p className="text-slate-400 text-lg font-medium">No projects found matching "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="text-blue-600 font-bold mt-2 hover:underline">Clear Search</button>
            </div>
        )}

        <div className="mt-20 pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-400 text-sm font-medium">© {new Date().getFullYear()} All rights reserved by Akash Sah.</p>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
