import React from 'react';
import { InputState, ExtraDeduction } from '../types';
import { OCCUPANCY_PRESETS, ROOM_PRESETS, PRICE_PRESETS, DEFAULT_LOAN_INTEREST, DEFAULT_LOAN_TERM, DEFAULT_PROPERTY_VALUE } from '../constants';
import { Users, BedDouble, IndianRupee, MinusCircle, Plus, Trash2, Wrench, Coins, Landmark, CalendarClock, ChevronDown } from 'lucide-react';
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

  // Extra Deductions Handlers
  const handleAddDeduction = () => {
    const newDeduction: ExtraDeduction = {
      id: Date.now().toString(),
      name: '',
      amount: 0
    };
    onChange({
      ...inputs,
      extraDeductions: [...inputs.extraDeductions, newDeduction]
    });
  };

  const handleRemoveDeduction = (id: string) => {
    onChange({
      ...inputs,
      extraDeductions: inputs.extraDeductions.filter(d => d.id !== id)
    });
  };

  const handleDeductionChange = (id: string, field: keyof ExtraDeduction, value: string | number) => {
    onChange({
      ...inputs,
      extraDeductions: inputs.extraDeductions.map(d => {
        if (d.id === id) {
          return { ...d, [field]: value };
        }
        return d;
      })
    });
  };

  const toggleFinancials = () => {
      const newState = !inputs.includeFinancials;
      const updates: Partial<InputState> = { includeFinancials: newState };
      
      // Initialize defaults if enabling for the first time
      if (newState && !inputs.propertyValue) {
          updates.propertyValue = DEFAULT_PROPERTY_VALUE;
          updates.loanAmount = DEFAULT_PROPERTY_VALUE * 0.7; // 70% LTV
          updates.interestRate = DEFAULT_LOAN_INTEREST;
          updates.loanTermYears = DEFAULT_LOAN_TERM;
      }
      onChange({ ...inputs, ...updates });
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Rooms */}
        <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <BedDouble className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Rooms</span>
             </div>
             <div className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded text-xs">{inputs.totalRooms} keys</div>
          </div>

          <div className="relative mb-6">
            <input
              type="number"
              min="0"
              value={inputs.totalRooms}
              onChange={(e) => handleChange('totalRooms', Number(e.target.value))}
              onFocus={handleFocus}
              className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 outline-none"
              placeholder="0"
            />
          </div>

          <div className="space-y-4">
             <input
                type="range"
                min="1"
                max="100"
                value={inputs.totalRooms}
                onChange={(e) => handleChange('totalRooms', Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
             />
             <div className="flex flex-wrap gap-2">
                {ROOM_PRESETS.map((val) => (
                <button
                    key={val}
                    onClick={() => handleChange('totalRooms', val)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    inputs.totalRooms === val
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                >
                    {val}
                </button>
                ))}
            </div>
          </div>
        </div>

        {/* Occupancy */}
        <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Users className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Occupancy</span>
             </div>
             <div className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded text-xs">{inputs.occupancyPercent}%</div>
          </div>

          <div className="relative mb-6">
            <input
                  type="number"
                  min="0"
                  max="100"
                  value={inputs.occupancyPercent}
                  onChange={(e) => {
                      let val = Number(e.target.value);
                      if (val > 100) val = 100;
                      handleChange('occupancyPercent', val);
                  }}
                  onFocus={handleFocus}
                  className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 outline-none"
                  placeholder="0"
            />
          </div>

           <div className="space-y-4">
             <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={inputs.occupancyPercent}
                onChange={(e) => handleChange('occupancyPercent', Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
             />
             <div className="flex flex-wrap gap-2">
                {OCCUPANCY_PRESETS.map((val) => (
                <button
                    key={val}
                    onClick={() => handleChange('occupancyPercent', val)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    inputs.occupancyPercent === val
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                >
                    {val}%
                </button>
                ))}
            </div>
          </div>
        </div>

        {/* Room Price */}
        <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
                    <IndianRupee className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Avg Rate</span>
             </div>
             <div className="text-violet-600 font-bold bg-violet-50 px-2 py-1 rounded text-xs">ARR</div>
          </div>
          
          <div className="relative mb-6">
             <span className="text-xl font-medium text-slate-300 absolute -left-4 top-2">₹</span>
             <input
              type="number"
              min="0"
              value={inputs.roomPrice}
              onChange={(e) => handleChange('roomPrice', Number(e.target.value))}
              onFocus={handleFocus}
              className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 outline-none pl-1"
              placeholder="0"
            />
          </div>

           <div className="space-y-4">
             <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={inputs.roomPrice}
                onChange={(e) => handleChange('roomPrice', Number(e.target.value))}
                className="w-full accent-violet-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
             />
             <div className="flex flex-wrap gap-2">
                {PRICE_PRESETS.map((val) => (
                <button
                    key={val}
                    onClick={() => handleChange('roomPrice', val)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    inputs.roomPrice === val
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                >
                    {formatCurrency(val)}
                </button>
                ))}
            </div>
          </div>
        </div>

        {/* Maintenance Cost */}
        <div className="bg-white p-6 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-slate-100 group">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <Wrench className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Ops Cost</span>
             </div>
             <div className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded text-xs">/ Room</div>
          </div>

          <div className="relative mb-6">
            <span className="text-xl font-medium text-slate-300 absolute -left-4 top-2">₹</span>
            <input
              type="number"
              min="0"
              value={inputs.maintenanceCostPerRoom}
              onChange={(e) => handleChange('maintenanceCostPerRoom', Number(e.target.value))}
              onFocus={handleFocus}
              className="w-full text-4xl font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 outline-none pl-1"
              placeholder="380"
            />
          </div>
          
           <div className="flex flex-wrap gap-2 mt-auto pt-4">
            {[200, 380, 500].map((val) => (
              <button
                key={val}
                onClick={() => handleChange('maintenanceCostPerRoom', val)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  inputs.maintenanceCostPerRoom === val
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Section Toggle */}
      <div className="mt-8">
        <div 
            onClick={toggleFinancials}
            className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer group ${
                inputs.includeFinancials 
                ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200' 
                : 'bg-white border-slate-100 hover:border-slate-200'
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${inputs.includeFinancials ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Landmark className="w-6 h-6" />
                </div>
                <div className="text-left">
                    <div className={`text-lg font-bold ${inputs.includeFinancials ? 'text-white' : 'text-slate-800'}`}>Investment Analysis</div>
                    <div className={`text-sm ${inputs.includeFinancials ? 'text-slate-400' : 'text-slate-500'}`}>Include loans, ROI, and Valuation metrics</div>
                </div>
            </div>
            <div className={`p-2 rounded-full border ${inputs.includeFinancials ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${inputs.includeFinancials ? 'rotate-180' : ''}`} />
            </div>
        </div>
      </div>

      {/* Financial Inputs */}
      {inputs.includeFinancials && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
             
             {[
               { label: "Property Value", icon: IndianRupee, key: 'propertyValue', suffix: '' },
               { label: "Loan Amount", icon: Coins, key: 'loanAmount', suffix: '' },
               { label: "Interest Rate", icon: Wrench, key: 'interestRate', suffix: '%' },
               { label: "Loan Tenure", icon: CalendarClock, key: 'loanTermYears', suffix: 'Yrs' }
             ].map((field) => (
                <div key={field.key} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{field.label}</label>
                    <div className="flex items-baseline gap-1">
                        {field.key === 'propertyValue' || field.key === 'loanAmount' ? <span className="text-slate-300 font-medium">₹</span> : null}
                        <input
                            type="number"
                            // @ts-ignore
                            value={inputs[field.key]}
                            // @ts-ignore
                            onChange={(e) => handleChange(field.key, Number(e.target.value))}
                            onFocus={handleFocus}
                            step={field.key === 'interestRate' ? "0.1" : "1"}
                            className="w-full text-2xl font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 outline-none"
                        />
                        <span className="text-sm font-bold text-slate-400">{field.suffix}</span>
                    </div>
                </div>
             ))}
         </div>
      )}

      {/* Extra Deduction Section */}
      {!isOwnerView && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                        <MinusCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Additional Expenses</h3>
                        <p className="text-xs text-slate-400 font-medium">Monthly recurring costs like salaries or marketing</p>
                    </div>
                </div>
                <button 
                    onClick={handleAddDeduction}
                    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all border border-slate-200 hover:border-blue-200"
                >
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </div>

            <div className="space-y-4">
                {inputs.extraDeductions.map((deduction) => (
                    <div key={deduction.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-slate-50 rounded-2xl animate-in fade-in slide-in-from-top-1 duration-200 border border-slate-100 focus-within:border-blue-300 focus-within:shadow-sm transition-all">
                        <input
                            type="text"
                            value={deduction.name}
                            onChange={(e) => handleDeductionChange(deduction.id, 'name', e.target.value)}
                            placeholder="Expense Name (e.g. Manager Salary)"
                            className="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-700 font-medium placeholder:text-slate-400 p-0"
                        />
                        <div className="flex w-full sm:w-auto items-center gap-4">
                            <div className="relative w-full sm:w-32 bg-white rounded-lg border border-slate-200 focus-within:border-blue-400 px-3 py-1.5 flex items-center">
                                <span className="text-slate-400 text-sm mr-1">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={deduction.amount || ''}
                                    onChange={(e) => handleDeductionChange(deduction.id, 'amount', Number(e.target.value))}
                                    placeholder="0"
                                    className="w-full bg-transparent border-none focus:ring-0 text-right font-bold text-slate-700 p-0"
                                />
                            </div>
                            <button
                                onClick={() => handleRemoveDeduction(deduction.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {inputs.extraDeductions.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl">
                        No extra expenses added yet.
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default InputSection;