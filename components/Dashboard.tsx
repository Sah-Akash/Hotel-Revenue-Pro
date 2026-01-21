import React, { useState, useMemo } from 'react';
import { SavedProject } from '../types';
import { Plus, Trash2, Building2, Calendar, TrendingUp, PieChart, Search, ArrowUpDown, MoreVertical, Wallet } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils';

interface Props {
  projects: SavedProject[];
  onCreateNew: () => void;
  onOpen: (project: SavedProject) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const Dashboard: React.FC<Props> = ({ projects, onCreateNew, onOpen, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'valuation' | 'net'>('date');

  // Stats
  const totalValuation = projects.reduce((sum, p) => sum + (p.summary.valuation || 0), 0);
  const totalMonthlyNet = projects.reduce((sum, p) => sum + p.summary.monthlyNet, 0);

  // Filter & Sort Logic
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Portfolio Overview</h1>
            <p className="text-slate-500 text-lg">Track performance across your hotel assets.</p>
          </div>
          <button 
            onClick={onCreateNew}
            className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-7 py-4 rounded-2xl font-semibold transition-all shadow-xl shadow-slate-200 hover:shadow-2xl hover:shadow-slate-300 hover:-translate-y-1"
          >
            <Plus className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
            <span>New Property Model</span>
          </button>
        </div>

        {/* Portfolio Stats Cards */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Building2 className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg">Assets</span>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-slate-900 mb-1">{projects.length}</div>
                    <div className="text-sm font-medium text-slate-500">Active Properties</div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Wallet className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg">Cash Flow</span>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-slate-900 mb-1">{formatCurrency(totalMonthlyNet)}</div>
                    <div className="text-sm font-medium text-slate-500">Monthly Net Income</div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <PieChart className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg">Valuation</span>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-slate-900 mb-1">{formatCurrency(totalValuation)}</div>
                    <div className="text-sm font-medium text-slate-500">Total Portfolio Value</div>
                </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        {projects.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="relative flex-grow max-w-lg w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by property name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-transparent font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-3 px-2 w-full sm:w-auto">
                    <span className="text-sm font-medium text-slate-400 hidden sm:block">Sort by:</span>
                    <div className="relative flex-1 sm:flex-none">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all hover:bg-slate-100"
                        >
                            <option value="date">Last Modified</option>
                            <option value="valuation">Valuation (High to Low)</option>
                            <option value="net">Net Income (High to Low)</option>
                        </select>
                        <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        )}

        {/* Projects Grid */}
        <div className="space-y-8">
            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border-2 border-slate-100 border-dashed">
                    <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-inner">
                        <Building2 className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">No models created yet</h3>
                    <p className="text-slate-500 max-w-sm text-center mb-10 leading-relaxed">
                        Start by creating your first financial model to analyze revenue, expenses, and valuation.
                    </p>
                    <button 
                        onClick={onCreateNew}
                        className="text-white bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create First Model
                    </button>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-400 text-lg font-medium">No projects found matching "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm('')} className="text-blue-600 font-bold mt-2 hover:underline">Clear Search</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                    {filteredProjects.map((project) => (
                        <div 
                            key={project.id} 
                            onClick={() => onOpen(project)}
                            className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                                    <Building2 className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                                <div className="relative">
                                     <button 
                                        onClick={(e) => onDelete(e, project.id)}
                                        className="text-slate-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Project"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-auto">
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                                    {project.inputs.hotelName || 'Untitled Project'}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(project.lastModified).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">Monthly Net</div>
                                    <div className="text-lg font-bold text-slate-900">{formatCurrency(project.summary.monthlyNet)}</div>
                                </div>
                                <div>
                                    {project.inputs.includeFinancials ? (
                                        <>
                                            <div className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">ROI</div>
                                            <div className="text-lg font-bold text-emerald-600">{formatNumber(project.summary.roi)}%</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">Revenue</div>
                                            <div className="text-lg font-bold text-slate-900">{formatCurrency(project.summary.monthlyRevenue)}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;