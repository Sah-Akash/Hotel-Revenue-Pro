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
    // Room + Reception + Kitchen + Restaurant + Gym -> Palette
    if (inputs.hasGym && inputs.hasRestaurant && inputs.hasKitchen) {
        return { 
            label: "Palette", 
            description: "Premium Resort Category", 
            color: "bg-purple-100 text-purple-700 border-purple-200" 
        };
    }
    // Room + Reception + Kitchen + Restaurant -> OTH
    if (inputs.hasRestaurant && inputs.hasKitchen) {
        return { 
            label: "Townhouse (OTH)", 
            description: "Mid-scale Premium", 
            color: "bg-rose-100 text-rose-700 border-rose-200" 
        };
    }
    // Room + Reception + Kitchen -> Collection O
    if (inputs.hasKitchen) {
        return { 
            label: "Collection O", 
            description: "Business & Leisure", 
            color: "bg-amber-100 text-amber-700 border-amber-200" 
        };
    }
    // Room + Reception -> Flagship (Default)
    return { 
        label: "Flagship", 
        description: "Budget Friendly", 
        color: "bg-blue-100 text-blue-700 border-blue-200" 
    };
  };

  const category = getCategory();

  return (
    <div className="mb-12 print:hidden space-y-8">
      
      {/* Hotel Name Input */}
      <div className="group relative">
         <input
            type="text"
            value={inputs.hotelName}
            onChange={(e) => handleChange('hotelName', e.target.value)}
            placeholder="Property Name (e.g. Grand Plaza)"
            className="w-full text-4xl md:text-5xl font-extrabold text-slate-900 bg-transparent border-none placeholder:text-slate-300 focus:ring-0 px-0 transition-colors tracking-tight"
         />
         <div className="h-1 w-20 bg-blue-600 rounded-full mt-4 group-focus-within:w-full transition-all duration-500 ease-out opacity-20 group-focus-within:opacity-100"></div>
      </div>

      {/* Property Classification Section */}
      <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                <Tag className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">Property Category</h3>
                <p className="text-xs text-slate-400">Select available amenities to determine brand tier</p>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full space-y-3">
                 <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${inputs.hasKitchen ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${inputs.hasKitchen ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                        {inputs.hasKitchen && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                    </div>
                    <input type="checkbox" checked={inputs.hasKitchen} onChange={(e) => handleChange('hasKitchen', e.target.checked)} className="hidden" />
                    <div className="flex items-center gap-2"><ChefHat className="w-4 h-4 text-slate-400" /><span className="text-slate-600 font-medium">Kitchen</span></div>
                 </label>
                 <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${inputs.hasRestaurant ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                     <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${inputs.hasRestaurant ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                         {inputs.hasRestaurant && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                    </div>
                    <input type="checkbox" checked={inputs.hasRestaurant} onChange={(e) => handleChange('hasRestaurant', e.target.checked)} className="hidden" />
                    <div className="flex items-center gap-2"><Utensils className="w-4 h-4 text-slate-400" /><span className="text-slate-600 font-medium">Restaurant / AC Dining</span></div>
                 </label>
                 <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${inputs.hasGym ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                     <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${inputs.hasGym ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                         {inputs.hasGym && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                    </div>
                    <input type="checkbox" checked={inputs.hasGym} onChange={(e) => handleChange('hasGym', e.target.checked)} className="hidden" />
                    <div className="flex items-center gap-2"><Dumbbell className="w-4 h-4 text-slate-400" /><span className="text-slate-600 font-medium">Gym / Entertainment</span></div>
                 </label>
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center self-stretch">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Detected Category</div>
                 <div className={`text-2xl font-extrabold px-6 py-3 rounded-2xl border-2 mb-2 transition-all duration-300 transform shadow-sm ${category.color}`}>{category.label}</div>
                 <div className="text-sm text-slate-500 font-medium">{category.description}</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Rooms */}
        <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3"><div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><BedDouble className="w-5 h-5" /></div><span className="text-sm font-bold text-slate-500 uppercase tracking-wide">SRNs (Rooms)</span></div>
             <div className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded text-xs">{inputs.totalRooms} keys</div>
          </div>
          <div className="relative mb-6"><input type="number" min="0" value={inputs.totalRooms} onChange={(e) => handleChange('totalRooms', Number(e.target.value))} onFocus={handleFocus} className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 outline-none" placeholder="0" /></div>
          <div className="space-y-4">
             <input type="range" min="1" max="100" value={inputs.totalRooms} onChange={(e) => handleChange('totalRooms', Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
             <div className="flex flex-wrap gap-2">{ROOM_PRESETS.map((val) => (<button key={val} onClick={() => handleChange('totalRooms', val)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${inputs.totalRooms === val ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{val}</button>))}</div>
          </div>
        </div>

        {/* Occupancy */}
        <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3"><div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Users className="w-5 h-5" /></div><span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Assumed OCC%</span></div>
             <div className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded text-xs">{inputs.occupancyPercent}%</div>
          </div>
          <div className="relative mb-6"><input type="number" min="0" max="100" value={inputs.occupancyPercent} onChange={(e) => handleChange('occupancyPercent', Number(e.target.value))} onFocus={handleFocus} className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 outline-none" placeholder="0" /></div>
          <div className="space-y-4">
             <input type="range" min="0" max="100" step="5" value={inputs.occupancyPercent} onChange={(e) => handleChange('occupancyPercent', Number(e.target.value))} className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
             <div className="flex flex-wrap gap-2">{OCCUPANCY_PRESETS.map((val) => (<button key={val} onClick={() => handleChange('occupancyPercent', val)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${inputs.occupancyPercent === val ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{val}%</button>))}</div>
          </div>
        </div>

        {/* Room Price */}
        <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3"><div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl"><IndianRupee className="w-5 h-5" /></div><span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Assumed ARR</span></div>
             <div className="text-violet-600 font-bold bg-violet-50 px-2 py-1 rounded text-xs">ARR</div>
          </div>
          <div className="relative mb-6"><span className="text-xl font-medium text-slate-300 absolute -left-4 top-2">₹</span><input type="number" min="0" value={inputs.roomPrice} onChange={(e) => handleChange('roomPrice', Number(e.target.value))} onFocus={handleFocus} className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 outline-none pl-1" placeholder="0" /></div>
           <div className="space-y-4">
             <input type="range" min="500" max="10000" step="100" value={inputs.roomPrice} onChange={(e) => handleChange('roomPrice', Number(e.target.value))} className="w-full accent-violet-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
             <div className="flex flex-wrap gap-2">{PRICE_PRESETS.map((val) => (<button key={val} onClick={() => handleChange('roomPrice', val)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${inputs.roomPrice === val ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{formatCurrency(val)}</button>))}</div>
          </div>
        </div>

        {/* Maintenance Cost (Opex per URN) */}
        <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3"><div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Wrench className="w-5 h-5" /></div><span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Opex per URN</span></div>
             <div className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded text-xs">Cost</div>
          </div>
          <div className="relative mb-6"><span className="text-xl font-medium text-slate-300 absolute -left-4 top-2">₹</span><input type="number" min="0" value={inputs.maintenanceCostPerRoom} onChange={(e) => handleChange('maintenanceCostPerRoom', Number(e.target.value))} onFocus={handleFocus} className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 outline-none pl-1" placeholder="380" /></div>
           <div className="flex flex-wrap gap-2 mt-auto pt-4">{[200, 370, 500].map((val) => (<button key={val} onClick={() => handleChange('maintenanceCostPerRoom', val)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${inputs.maintenanceCostPerRoom === val ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{val}</button>))}</div>
        </div>
      </div>

      {/* Deal Parameters Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
            <div>
                <h3 className="font-bold text-slate-800">Deal Specifics</h3>
                <p className="text-xs text-slate-400 font-medium">MG, Security Deposit & Advances</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Monthly MG</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input type="number" value={inputs.monthlyMg} onChange={(e) => handleChange('monthlyMg', Number(e.target.value))} onFocus={handleFocus} className="w-full pl-7 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="0" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">SD ASK (Value)</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input type="number" value={inputs.securityDeposit} onChange={(e) => handleChange('securityDeposit', Number(e.target.value))} onFocus={handleFocus} className="w-full pl-7 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="0" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">BA (Value)</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input type="number" value={inputs.businessAdvance} onChange={(e) => handleChange('businessAdvance', Number(e.target.value))} onFocus={handleFocus} className="w-full pl-7 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="0" />
                </div>
            </div>

            <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">OTA Approx (%)</label>
                 <div className="relative">
                    <input type="number" value={inputs.otaPercent} onChange={(e) => handleChange('otaPercent', Number(e.target.value))} onFocus={handleFocus} className="w-full pl-4 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="7" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InputSection;