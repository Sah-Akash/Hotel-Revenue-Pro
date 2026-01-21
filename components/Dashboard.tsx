import React, { useState, useMemo } from 'react';
import { SavedProject } from '../types';
import { Plus, Trash2, Building2, Calendar, TrendingUp, PieChart, Search, ArrowUpDown } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Portfolio Dashboard</h1>
            <p className="text-slate-500 text-sm">Manage your hotel revenue projections and financial models.</p>
          </div>
          <button 
            onClick={onCreateNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Portfolio Stats Cards */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Building2 className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm font-medium text-slate-500">Total Projects</div>
                    <div className="text-2xl font-bold text-slate-800">{projects.length}</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm font-medium text-slate-500">Monthly Net Income</div>
                    <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalMonthlyNet)}</div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <PieChart className="w-6 h-6" />
                </div>
                <div>
                    <div className="text-sm font-medium text-slate-500">Portfolio Valuation</div>
                    <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalValuation)}</div>
                </div>
            </div>
          </div>
        )}

        {/* Controls Toolbar (Search & Sort) */}
        {projects.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search projects..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 text-sm"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="appearance-none bg-white border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:border-blue-400 cursor-pointer hover:bg-slate-50"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="valuation">Sort by Valuation</option>
                            <option value="net">Sort by Net Income</option>
                        </select>
                        <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        )}

        {/* Projects Grid */}
        <div className="space-y-4">
            {projects.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No calculations yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">Create your first hotel revenue projection to analyze income, expenses, and valuation.</p>
                    <button 
                        onClick={onCreateNew}
                        className="text-blue-600 font-semibold hover:text-blue-700 hover:underline flex items-center justify-center gap-2"
                    >
                        Start a new project <Plus className="w-4 h-4" />
                    </button>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-500">No projects found matching "{searchTerm}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div 
                            key={project.id} 
                            onClick={() => onOpen(project)}
                            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="bg-slate-50 p-3 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <button 
                                    onClick={(e) => onDelete(e, project.id)}
                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-20"
                                    title="Delete Project"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-6 relative z-10">
                                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1" title={project.inputs.hotelName}>
                                    {project.inputs.hotelName || 'Untitled Project'}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(project.lastModified).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 relative z-10">
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Monthly Net</div>
                                    <div className="font-bold text-slate-700">{formatCurrency(project.summary.monthlyNet)}</div>
                                </div>
                                <div>
                                    {project.inputs.includeFinancials ? (
                                        <>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">ROI</div>
                                            <div className="font-bold text-indigo-600">{formatNumber(project.summary.roi)}%</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Revenue</div>
                                            <div className="font-bold text-slate-700">{formatCurrency(project.summary.monthlyRevenue)}</div>
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