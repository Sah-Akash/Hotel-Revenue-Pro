
import React from 'react';
import { ViewType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, PieChart, Settings, HelpCircle, LogOut, Building2, X, ChevronRight, User, BookOpen, ShieldCheck } from 'lucide-react';

interface Props {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

const Sidebar: React.FC<Props> = ({ currentView, onChangeView, isOpen, onClose, isAdmin }) => {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Support', icon: HelpCircle },
  ];

  if (isAdmin) {
      menuItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  const handleLogout = async () => {
    // Clear admin keys on logout
    localStorage.removeItem('hrp_access_key');
    localStorage.removeItem('hrp_session_expiry');
    await logout();
    onChangeView('login');
    window.location.reload(); 
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#020617] text-slate-400 transition-transform duration-300 ease-out border-r border-slate-800
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-20 flex items-center justify-between px-8 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl shadow-glow">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-white tracking-tight block leading-none">RevenuePro</span>
                <span className="text--[10px] font-medium text-slate-500 uppercase tracking-widest">Hotel Analytics</span>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-1">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest px-4 mb-4 font-mono">Main Menu</div>
            
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'dashboard' && currentView === 'editor');
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeView(item.id as ViewType);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                      : 'hover:bg-slate-800/50 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Footer */}
          <div className="p-6 border-t border-slate-800/50 bg-[#020617]">
             {user ? (
                <div className="flex items-center gap-4 group cursor-pointer" title={user.displayName || 'User'}>
                    <div className="relative">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-700 shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                                {user.displayName ? user.displayName.charAt(0) : 'U'}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#020617] rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{user.displayName || 'User'}</div>
                        <div className="text-xs text-slate-500 truncate font-mono">{user.email}</div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
             ) : (
                <div className="flex items-center justify-between w-full">
                    <div className="text-slate-400 text-sm font-medium flex items-center gap-2">
                        {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <User className="w-4 h-4" />}
                        {isAdmin ? 'Admin Mode' : 'Guest'}
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
             )}

             {/* Credits */}
             <div className="mt-6 pt-6 border-t border-slate-800/50 text-center">
                <p className="text-[10px] text-slate-600 font-medium">
                    App created by <span className="text-slate-500 hover:text-slate-300 transition-colors cursor-default">Akash Sah</span>
                </p>
                <p className="text-[10px] text-slate-700 mt-0.5 font-medium">All rights reserved.</p>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
