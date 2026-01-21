import React from 'react';
import { InputState, ExtraDeduction } from '../types';
import { OCCUPANCY_PRESETS, ROOM_PRESETS, PRICE_PRESETS } from '../constants';
import { Users, BedDouble, IndianRupee, MinusCircle, Plus, Trash2, Wrench } from 'lucide-react';
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

  return (
    <div className="mb-8 print:hidden">
      
      {/* Hotel Name Input */}
      <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
         <label className="block text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Property Name</label>
         <input
            type="text"
            value={inputs.hotelName}
            onChange={(e) => handleChange('hotelName', e.target.value)}
            placeholder="Enter Hotel Name (e.g. Grand Seaside Resort)"
            className="w-full text-xl font-bold text-slate-800 border-b border-slate-200 focus:border-blue-500 outline-none pb-2 bg-transparent transition-colors placeholder:font-normal placeholder:text-slate-300"
         />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Rooms */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-2 mb-4 text-slate-500 font-medium">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
              <BedDouble className="w-5 h-5" />
            </div>
            <span>Total Rooms</span>
          </div>
          <div className="mb-4 relative">
            <input
              type="number"
              min="0"
              value={inputs.totalRooms}
              onChange={(e) => handleChange('totalRooms', Number(e.target.value))}
              onFocus={handleFocus}
              className="w-full text-3xl font-bold text-slate-800 border-b-2 border-slate-100 focus:border-blue-500 outline-none pb-2 bg-transparent transition-colors"
              placeholder="0"
            />
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={inputs.totalRooms}
            onChange={(e) => handleChange('totalRooms', Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-4 hover:bg-slate-200 transition-colors"
          />
          <div className="flex flex-wrap gap-2">
            {ROOM_PRESETS.map((val) => (
              <button
                key={val}
                onClick={() => handleChange('totalRooms', val)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  inputs.totalRooms === val
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Occupancy */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-2 mb-4 text-slate-500 font-medium">
            <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
               <Users className="w-5 h-5" />
            </div>
            <span>Occupancy (%)</span>
          </div>
          
          <div className="mb-4 relative flex items-center">
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
                  className="w-full text-3xl font-bold text-slate-800 border-b-2 border-slate-100 focus:border-green-500 outline-none pb-2 bg-transparent transition-colors"
                  placeholder="0"
              />
          </div>
          
          {/* Toggle Rounding */}
          {!isOwnerView && (
               <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
                  <input 
                      type="checkbox" 
                      id="roundSrn" 
                      checked={inputs.roundSRN} 
                      onChange={(e) => handleChange('roundSRN', e.target.checked)}
                      className="accent-green-600 rounded"
                  />
                  <label htmlFor="roundSrn" className="cursor-pointer hover:text-slate-600">Round rooms</label>
               </div>
          )}

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={inputs.occupancyPercent}
            onChange={(e) => handleChange('occupancyPercent', Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-green-600 mb-4 hover:bg-slate-200 transition-colors"
          />
          <div className="flex flex-wrap gap-2">
            {OCCUPANCY_PRESETS.map((val) => (
              <button
                key={val}
                onClick={() => handleChange('occupancyPercent', val)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  inputs.occupancyPercent === val
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-green-200 hover:text-green-600'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>

        {/* Room Price */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-2 mb-4 text-slate-500 font-medium">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span>Avg Room Price</span>
          </div>
          <div className="mb-4">
            <input
              type="number"
              min="0"
              value={inputs.roomPrice}
              onChange={(e) => handleChange('roomPrice', Number(e.target.value))}
              onFocus={handleFocus}
              className="w-full text-3xl font-bold text-slate-800 border-b-2 border-slate-100 focus:border-purple-500 outline-none pb-2 bg-transparent transition-colors"
              placeholder="0"
            />
          </div>
          <input
            type="range"
            min="500"
            max="10000"
            step="100"
            value={inputs.roomPrice}
            onChange={(e) => handleChange('roomPrice', Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600 mb-4 hover:bg-slate-200 transition-colors"
          />
          <div className="flex flex-wrap gap-2">
            {PRICE_PRESETS.map((val) => (
              <button
                key={val}
                onClick={() => handleChange('roomPrice', val)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  inputs.roomPrice === val
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-purple-200 hover:text-purple-600'
                }`}
              >
                {formatCurrency(val)}
              </button>
            ))}
          </div>
        </div>

        {/* Maintenance Cost Per Room */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-2 mb-4 text-slate-500 font-medium">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600 group-hover:bg-orange-100 transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
            <span>Maint. Cost / Room</span>
          </div>
          <div className="mb-4">
            <input
              type="number"
              min="0"
              value={inputs.maintenanceCostPerRoom}
              onChange={(e) => handleChange('maintenanceCostPerRoom', Number(e.target.value))}
              onFocus={handleFocus}
              className="w-full text-3xl font-bold text-slate-800 border-b-2 border-slate-100 focus:border-orange-500 outline-none pb-2 bg-transparent transition-colors"
              placeholder="380"
            />
          </div>
          <div className="mb-4 text-xs text-slate-400">
             Base operational cost per sold room per day (e.g. laundry, utilities, cleaning supplies).
          </div>
           <div className="flex flex-wrap gap-2">
            {[200, 380, 500].map((val) => (
              <button
                key={val}
                onClick={() => handleChange('maintenanceCostPerRoom', val)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  inputs.maintenanceCostPerRoom === val
                    ? 'bg-orange-50 border-orange-200 text-orange-700'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-orange-200 hover:text-orange-600'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extra Deduction Section */}
      {!isOwnerView && (
        <div className="bg-slate-50/50 rounded-xl border border-slate-200 border-dashed p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-500">
                    <MinusCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium">Additional Deductions (Monthly)</span>
                </div>
                <button 
                    onClick={handleAddDeduction}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200"
                >
                    <Plus className="w-3 h-3" /> Add Expense
                </button>
            </div>

            <div className="space-y-3">
                {inputs.extraDeductions.map((deduction) => (
                    <div key={deduction.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center animate-in fade-in slide-in-from-top-1 duration-200">
                        <input
                            type="text"
                            value={deduction.name}
                            onChange={(e) => handleDeductionChange(deduction.id, 'name', e.target.value)}
                            placeholder="Expense Name (e.g. Manager Salary)"
                            className="flex-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                        />
                        <div className="flex w-full sm:w-auto items-center gap-2">
                            <div className="relative w-full sm:w-32">
                                <span className="absolute left-3 top-2 text-slate-400 text-sm">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={deduction.amount || ''}
                                    onChange={(e) => handleDeductionChange(deduction.id, 'amount', Number(e.target.value))}
                                    placeholder="0"
                                    className="w-full px-3 py-2 pl-7 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                                />
                            </div>
                            <button
                                onClick={() => handleRemoveDeduction(deduction.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove deduction"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {inputs.extraDeductions.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm bg-white rounded-lg border border-slate-100">
                        No extra deductions added. Click "Add Expense" to add monthly costs.
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default InputSection;