import React from 'react';
import { InputState } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  inputs: InputState;
}

const PrintableInputSummary: React.FC<Props> = ({ inputs }) => {
  return (
    <div className="mb-8 hidden" id="printable-summary">
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Configuration & Assumptions</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-medium bg-white px-2 py-1 rounded border border-slate-100">
                AUTO-GENERATED
            </span>
        </div>
        
        <div className="bg-white">
            <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
                <div className="p-5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Total Inventory</div>
                    <div className="text-2xl font-bold text-slate-900">{inputs.totalRooms} <span className="text-sm font-medium text-slate-400">Rooms</span></div>
                </div>
                <div className="p-5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Occupancy Rate</div>
                    <div className="text-2xl font-bold text-slate-900">{inputs.occupancyPercent}%</div>
                </div>
                <div className="p-5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Avg. Room Rate (ARR)</div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(inputs.roomPrice)}</div>
                </div>
                <div className="p-5">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Ops Cost / Room</div>
                    <div className="text-2xl font-bold text-slate-900">₹{inputs.maintenanceCostPerRoom} <span className="text-xs font-medium text-slate-400">/ day</span></div>
                </div>
            </div>

            {/* Financial Summary Row for Print */}
            {inputs.includeFinancials && (
                <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/30">
                     <div className="p-5">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Project Cost</div>
                        <div className="text-lg font-bold text-indigo-900">{formatCurrency(inputs.propertyValue)}</div>
                    </div>
                    <div className="p-5">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Loan Amount</div>
                        <div className="text-lg font-bold text-indigo-900">{formatCurrency(inputs.loanAmount)}</div>
                    </div>
                    <div className="p-5">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Interest Rate</div>
                        <div className="text-lg font-bold text-indigo-900">{inputs.interestRate}%</div>
                    </div>
                     <div className="p-5">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Loan Tenure</div>
                        <div className="text-lg font-bold text-indigo-900">{inputs.loanTermYears} Years</div>
                    </div>
                </div>
            )}

            {inputs.extraDeductions.length > 0 && (
                <div className="p-5 bg-slate-50/50">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-3">Additional Monthly Fixed Costs</div>
                    <div className="grid grid-cols-3 gap-y-2 gap-x-8">
                        {inputs.extraDeductions.map(d => (
                            <div key={d.id} className="flex justify-between items-center text-sm border-b border-slate-200 border-dashed pb-1">
                                <span className="text-slate-600 font-medium">{d.name}</span>
                                <span className="font-bold text-slate-800">{formatCurrency(d.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PrintableInputSummary;