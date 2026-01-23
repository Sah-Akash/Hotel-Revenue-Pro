import React from 'react';
import { CalculationMetrics, InputState } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { AlertTriangle, CheckCircle2, Lightbulb, TrendingUp, AlertOctagon } from 'lucide-react';

interface Props {
  metrics: CalculationMetrics;
  inputs: InputState;
}

const DealSummary: React.FC<Props> = ({ metrics, inputs }) => {
  
  // Traffic Light Logic for CM%
  const getCMStatus = (cm: number) => {
    if (cm < 8) return { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertOctagon, label: 'High Risk' };
    if (cm <= 12) return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: AlertTriangle, label: 'Moderate' };
    return { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2, label: 'Healthy' };
  };

  const cmStatus = getCMStatus(metrics.dealCmPercent);
  const StatusIcon = cmStatus.icon;

  // Determine Category Label
  const getCategoryLabel = () => {
    if (inputs.hasGym && inputs.hasRestaurant && inputs.hasKitchen) return "PALETTE";
    if (inputs.hasRestaurant && inputs.hasKitchen) return "OTH OAK";
    if (inputs.hasKitchen) return "COLLECTION O";
    return "FLAGSHIP";
  };

  return (
    <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden mb-8 break-inside-avoid">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
        <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
                <TrendingUp className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 text-lg">Deal Financial Summary</h3>
                <p className="text-xs text-slate-500 font-medium">Deal Sheet Analysis</p>
            </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${cmStatus.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{cmStatus.label} Deal</span>
        </div>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
            <thead>
                <tr className="bg-slate-900 text-white">
                     <th className="px-6 py-3 text-left font-bold w-1/2 border-r border-slate-700 bg-red-600">Status</th>
                     <th className="px-6 py-3 text-center font-bold w-1/2">BLR</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">Category</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{getCategoryLabel()}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">Deal</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800 capitalize">{inputs.dealType}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">SRNs</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{inputs.totalRooms}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">Assumed ARR</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{inputs.roomPrice}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">Assumed OCC%</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{inputs.occupancyPercent}%</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">BA(Value)</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{inputs.businessAdvance}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">Exp Revenue</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{metrics.monthlyRevenue.toFixed(0)}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">Rev minus GST</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{metrics.dealRevenueNetGst.toFixed(0)}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">SD ASK(Value)</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{inputs.securityDeposit}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">Opex per URN</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{inputs.maintenanceCostPerRoom}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">Opex Abs Value</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{metrics.dealOpexAbs.toFixed(0)}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">OTA Approx</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{metrics.dealOtaAbs.toFixed(0)}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-900 border-r border-slate-100 bg-yellow-300">MG</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-900 bg-yellow-300">{inputs.monthlyMg}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">Absolute CM</td>
                    <td className="px-6 py-2.5 text-center font-bold text-slate-800">{metrics.dealAbsoluteCm.toFixed(0)}</td>
                </tr>
                <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">CM%</td>
                    <td className={`px-6 py-2.5 text-center font-bold border-l border-slate-200 ${metrics.dealCmPercent > 12 ? 'bg-green-400 text-slate-900' : (metrics.dealCmPercent > 8 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}>
                        {metrics.dealCmPercent.toFixed(0)}%
                    </td>
                </tr>
                 <tr>
                    <td className="px-6 py-2.5 font-bold text-slate-800 border-r border-slate-100">PBP</td>
                    <td className={`px-6 py-2.5 text-center font-bold ${metrics.dealAbsoluteCm > 0 ? 'bg-green-400 text-slate-900' : 'bg-red-100 text-red-900'}`}>
                        {metrics.dealPbpPercent.toFixed(0)}%
                    </td>
                </tr>
            </tbody>
        </table>
      </div>

      {/* Auto Insights */}
      <div className="p-6 bg-indigo-50/50">
        <div className="flex items-center gap-2 mb-3">
             <Lightbulb className="w-4 h-4 text-indigo-600" />
             <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Deal Insights</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Profitability Threshold</p>
                <p className="text-sm font-medium text-slate-800">
                    Deal becomes profitable above <span className="font-bold text-indigo-600">{Math.ceil(metrics.breakEvenOccupancyDeal)}%</span> occupancy
                </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">MG Consumption</p>
                <p className="text-sm font-medium text-slate-800">
                    MG consumes <span className="font-bold text-indigo-600">{metrics.dealAbsoluteCm > 0 ? Math.round((inputs.monthlyMg / (inputs.monthlyMg + metrics.dealAbsoluteCm)) * 100) : '>100'}%</span> of gross margin
                </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">ARR Sensitivity</p>
                <p className="text-sm font-medium text-slate-800">
                    ₹100 ARR increase improves CM by <span className="font-bold text-emerald-600">{formatCurrency(metrics.arrSensitivity)}</span> / month
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DealSummary;