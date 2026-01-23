import React from 'react';
import { InputState, ExtraDeduction } from '../types';
import { OCCUPANCY_PRESETS, ROOM_PRESETS, PRICE_PRESETS, DEFAULT_PROPERTY_VALUE } from '../constants';
import { Users, BedDouble, IndianRupee, MinusCircle, Plus, Trash2, Wrench, Coins, Landmark, CalendarClock, ChevronDown, Utensils, Dumbbell, ChefHat, Tag, Briefcase } from 'lucide-react';
import { formatCurrency } from '../utils';

interface Props {
  inputs: InputState;
  onChange: (inputs: InputState) => void;
  isOwnerView: boolean;
}

const InputSection: React.FC<Props> = ({ inputs, onChange, isOwnerView }) => {
  const handleChange = (field: keyof InputState, value: any) => {
    if (typeof value === 'number' && value < 0) return;
    onChange({ ...inputs, [field]: value });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // Detect Property Category
  const getCategory = () => {
    if (inputs.hasGym && inputs.hasRestaurant && inputs.hasKitchen) {
        return { label: "Palette", color: "bg-purple-100 text-purple-700 border-purple-200" };
    }
    if (inputs.hasRestaurant && inputs.hasKitchen) {
        return { label: "Townhouse", color: "bg-rose-100 text-rose-700 border-rose-200" };
    }
    if (inputs.hasKitchen) {
        return { label: "Collection O", color: "bg-amber-100 text-amber-700 border-amber-200" };
    }
    return { label: "Flagship", color: "bg-blue-100 text-blue-700 border-blue-200" };
  };

  const category = getCategory();

  return (
    <div className="space-y-8 font-sans">
      
      {/* Property Identity */}
      <div className="space-y-4">
         <div className="relative">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">Property Name</label>
            <input
                type="text"
                value={inputs.hotelName}
                onChange={(e) => handleChange('hotelName', e.target.value)}
                placeholder="e.g. Grand Plaza"
                className="w-full text-lg font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
         </div>
      </div>

      {/* Core Metrics */}
      <div className="space-y-6">
        
        {/* Total Rooms */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-300 transition-colors">
            <div className="flex justify-between items-center mb-3">
                 <div className="flex items-center gap-2 text-slate-500 font-medium text-sm"><BedDouble className="w-4 h-4" />Inventory</div>
                 <div className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{inputs.totalRooms} Rooms</div>
            </div>
            <div className="flex items-end gap-2">
                 <input type="number" value={inputs.totalRooms} onChange={(e) => handleChange('totalRooms', Number(e.target.value))} className="w-20 text-2xl font-bold text-slate-900 bg-transparent border-b-2 border-slate-100 focus:border-blue-500 outline-none p-0 pb-1" />
                 <input type="range" min="5" max="100" value={inputs.totalRooms} onChange={(e) => handleChange('totalRooms', Number(e.target.value))} className="flex-1 accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer mb-2" />
            </div>
        </div>

        {/* Occupancy */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-center mb-3">
                 <div className="flex items-center gap-2 text-slate-500 font-medium text-sm"><Users className="w-4 h-4" />Occupancy</div>
                 <div className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{inputs.occupancyPercent}%</div>
            </div>
            <div className="flex items-end gap-2">
                 <input type="number" value={inputs.occupancyPercent} onChange={(e) => handleChange('occupancyPercent', Number(e.target.value))} className="w-20 text-2xl font-bold text-slate-900 bg-transparent border-b-2 border-slate-100 focus:border-emerald-500 outline-none p-0 pb-1" />
                 <input type="range" min="0" max="100" step="5" value={inputs.occupancyPercent} onChange={(e) => handleChange('occupancyPercent', Number(e.target.value))} className="flex-1 accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer mb-2" />
            </div>
             <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                {[40, 60, 80].map(val => (
                    <button key={val} onClick={() => handleChange('occupancyPercent', val)} className={`px-2 py-1 text-[10px] font-bold rounded border ${inputs.occupancyPercent === val ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'}`}>{val}%</button>
                ))}
             </div>
        </div>

        {/* ARR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm group hover:border-violet-300 transition-colors">
            <div className="flex justify-between items-center mb-3">
                 <div className="flex items-center gap-2 text-slate-500 font-medium text-sm"><IndianRupee className="w-4 h-4" />Avg Rate (ARR)</div>
                 <div className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">₹{inputs.roomPrice}</div>
            </div>
            <div className="flex items-end gap-2">
                 <input type="number" value={inputs.roomPrice} onChange={(e) => handleChange('roomPrice', Number(e.target.value))} className="w-24 text-2xl font-bold text-slate-900 bg-transparent border-b-2 border-slate-100 focus:border-violet-500 outline-none p-0 pb-1" />
                 <input type="range" min="500" max="5000" step="100" value={inputs.roomPrice} onChange={(e) => handleChange('roomPrice', Number(e.target.value))} className="flex-1 accent-violet-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer mb-2" />
            </div>
        </div>

      </div>

      {/* Deal Specifics - Sidebar Version */}
      <div className="pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-4">
             <Briefcase className="w-4 h-4 text-slate-400" />
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Deal Structure</h3>
        </div>
        
        <div className="space-y-4">
             {/* Deal Type Switcher */}
             <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
                 <button onClick={() => handleChange('dealType', 'owner')} className={`py-1.5 text-xs font-bold rounded-lg transition-all ${inputs.dealType === 'owner' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Owner</button>
                 <button onClick={() => handleChange('dealType', 'lessee')} className={`py-1.5 text-xs font-bold rounded-lg transition-all ${inputs.dealType === 'lessee' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}>Lessee</button>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly MG</label>
                    <input type="number" value={inputs.monthlyMg} onChange={(e) => handleChange('monthlyMg', Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Sec. Deposit</label>
                    <input type="number" value={inputs.securityDeposit} onChange={(e) => handleChange('securityDeposit', Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Bus. Advance</label>
                    <input type="number" value={inputs.businessAdvance} onChange={(e) => handleChange('businessAdvance', Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">OTA (%)</label>
                    <input type="number" value={inputs.otaPercent} onChange={(e) => handleChange('otaPercent', Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
             </div>
        </div>
      </div>

       {/* Amenities / Category */}
       <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
             <Tag className="w-4 h-4 text-slate-400" />
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category & Amenities</h3>
          </div>
          
          <div className="space-y-2">
              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={inputs.hasKitchen} onChange={(e) => handleChange('hasKitchen', e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="text-sm font-medium text-slate-700">Kitchen</span>
              </label>
               <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={inputs.hasRestaurant} onChange={(e) => handleChange('hasRestaurant', e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="text-sm font-medium text-slate-700">Restaurant</span>
              </label>
               <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={inputs.hasGym} onChange={(e) => handleChange('hasGym', e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
                  <span className="text-sm font-medium text-slate-700">Gym / Spa</span>
              </label>
          </div>

          <div className={`mt-4 p-3 rounded-xl border text-center ${category.color}`}>
              <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Calculated Tier</div>
              <div className="text-lg font-black tracking-tight">{category.label}</div>
          </div>
       </div>

    </div>
  );
};

export default InputSection;