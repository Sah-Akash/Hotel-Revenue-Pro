import React from 'react';
import { ViewType } from '../types';
import { LayoutDashboard, Calculator, PieChart, Settings, HelpCircle, LogOut, Building2, X } from 'lucide-react';

interface Props {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<Props> = ({ currentView, onChangeView, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">RevenuePro</span>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Menu</div>
            
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile / Footer */}
          <div className="p-4 border-t border-slate-800">
             <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                    US
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">User Account</div>
                    <div className="text-xs text-slate-500 truncate">Pro Plan</div>
                </div>
                <button className="text-slate-500 hover:text-white">
                    <LogOut className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;