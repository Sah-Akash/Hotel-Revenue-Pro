
import React from 'react';
import { ViewType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, PieChart, Settings, HelpCircle, LogOut, X, ChevronRight, User, BookOpen, ShieldCheck } from 'lucide-react';

interface Props {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

const PremiumLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Classic Royal Crest Shield Shape */}
    <path d="M50 5C50 5 10 20 10 50C10 75 30 90 50 95C70 90 90 75 90 50C90 20 50 5 50 5Z" fill="url(#sidebar-logo-grad)" stroke="url(#sidebar-stroke-grad)" strokeWidth="1.5"/>
    
    {/* Inner detail lines for 'Old Style' feel */}
    <path d="M50 15V85" stroke="white" strokeWidth="0.5" strokeOpacity="0.2"/>
    <path d="M20 50H80" stroke="white" strokeWidth="0.5" strokeOpacity="0.2"/>

    {/* The Monogram 'R' & 'P' Interlocked - Serif Style */}
    <path d="M35 30H55C65 30 70 35 70 42C70 49 65 54 55 54H35V30Z" stroke="white" strokeWidth="3" fill="none"/>
    <path d="M35 30V70" stroke="white" strokeWidth="3" strokeLinecap="square"/>
    <path d="M45 54L65 70" stroke="white" strokeWidth="3" strokeLinecap="square"/>

    <defs>
      <linearGradient id="sidebar-logo-grad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" /> {/* Amber/Gold */}
        <stop offset="1" stopColor="#b45309" /> {/* Dark Gold */}
      </linearGradient>
      <linearGradient id="sidebar-stroke-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fcd34d" />
        <stop offset="1" stopColor="#78350f" />
      </linearGradient>
    </defs>
  </svg>
);

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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#020617] text-slate-400 transition-transform duration-300 ease-out border-r border-white/[0.05]
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-32 flex items-center justify-between px-8 border-b border-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-4 bg-amber-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div className="relative transform group-hover:scale-105 transition-transform duration-500">
                    <PremiumLogo className="w-10 h-10" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-white tracking-wide text-lg leading-none">REVENUE<span className="text-amber-500 ml-0.5">PRO</span></span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1.5">Est. 2024</span>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-10 space-y-1">
            <div className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em] px-5 mb-8">Operations</div>
            
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
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-sm font-medium transition-all duration-500 group mb-1 ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_4px_20px_-5px_rgba(245,158,11,0.2)]' 
                      : 'hover:bg-white/[0.03] text-slate-600 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon className={`w-5 h-5 transition-colors duration-500 ${isActive ? 'text-amber-500' : 'text-slate-700 group-hover:text-slate-500'}`} />
                    <span className={`tracking-tight ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]"></div>}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Footer */}
          <div className="p-8 border-t border-white/[0.03] bg-black/20">
             {user ? (
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="relative">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-11 h-11 rounded-full border border-white/10 shadow-sm grayscale group-hover:grayscale-0 transition-all" />
                        ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-amber-600 font-serif font-bold text-sm border border-white/5">
                                {user.displayName ? user.displayName.charAt(0) : 'U'}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#020617] rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate group-hover:text-amber-500 transition-colors">{user.displayName || 'User'}</div>
                        <div className="text-[9px] text-slate-600 truncate font-mono tracking-tighter mt-0.5">{user.email}</div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-slate-700 hover:text-red-400 p-2 rounded-xl transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
             ) : (
                <div className="flex items-center justify-between w-full">
                    <div className="text-slate-700 text-[10px] font-bold flex items-center gap-2 uppercase tracking-[0.2em]">
                        {isAdmin ? <ShieldCheck className="w-4 h-4 text-amber-500" /> : <User className="w-4 h-4" />}
                        {isAdmin ? 'System Admin' : 'Guest'}
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-slate-700 hover:text-white p-2"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
             )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
