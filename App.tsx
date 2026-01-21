import React, { useState } from 'react';
import { InputState } from './types';
import { useCalculator } from './hooks/useCalculator';
import InputSection from './components/InputSection';
import PrintableInputSummary from './components/PrintableInputSummary';
import SummaryCards from './components/SummaryCards';
import FinancialOverview from './components/FinancialOverview';
import RevenueTable from './components/RevenueTable';
import Visuals from './components/Visuals';
import { Building2, Printer, Eye, EyeOff, Loader2, Download } from 'lucide-react';
import { MAINTENANCE_BASE_COST, DEFAULT_LOAN_INTEREST, DEFAULT_LOAN_TERM, DEFAULT_PROPERTY_VALUE } from './constants';
import { formatCurrency } from './utils';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<InputState>({
    hotelName: '',
    totalRooms: 32,
    occupancyPercent: 60,
    roomPrice: 1200,
    roundSRN: true,
    extraDeductions: [],
    maintenanceCostPerRoom: MAINTENANCE_BASE_COST,
    // Financial defaults
    includeFinancials: false,
    propertyValue: 0,
    loanAmount: 0,
    interestRate: 0,
    loanTermYears: 0,
  });

  const [isOwnerView, setIsOwnerView] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const metrics = useCalculator(inputs);

  const handleDownloadPdf = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    setIsGeneratingPdf(true);

    // Industry Grade PDF Configuration
    const opt = {
      margin: 0, 
      filename: inputs.hotelName ? `${inputs.hotelName.replace(/\s+/g, '_')}_Financial_Report.pdf` : 'Hotel_Revenue_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, // High resolution
        useCORS: true, 
        scrollY: 0,
        windowWidth: 1200, // Fixed desktop width
        onclone: (clonedDoc: Document) => {
            // 1. Hide interactive elements
            const hiddenElements = clonedDoc.querySelectorAll('.print\\:hidden, .no-print');
            hiddenElements.forEach((el: any) => el.style.display = 'none');
            
            // 2. Hide interactive InputSection and Show Printable Summary
            const interactiveInputs = clonedDoc.getElementById('input-section');
            if (interactiveInputs) interactiveInputs.style.display = 'none';

            const printableSummary = clonedDoc.getElementById('printable-summary');
            if (printableSummary) printableSummary.style.display = 'block';

            // 3. Configure the wrapper styling
            const reportContainer = clonedDoc.getElementById('report-content');
            if (reportContainer) {
              reportContainer.style.width = '1200px'; 
              reportContainer.style.minHeight = '100vh';
              reportContainer.style.backgroundColor = '#ffffff';
            }

            // 4. Content styling
            const mainContent = clonedDoc.querySelector('main');
            if (mainContent) {
                mainContent.style.maxWidth = '100%'; 
                mainContent.style.padding = '40px 60px'; 
            }
            
            // 5. Enhance Header for Print
            const reportTitle = clonedDoc.getElementById('report-title');
            if (reportTitle) {
                reportTitle.style.marginBottom = '40px';
                reportTitle.style.paddingBottom = '20px';
                reportTitle.style.borderBottom = '2px solid #0f172a'; // Slate-900 strong underline
            }
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // @ts-ignore
      await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 print:static print:border-none no-print">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="font-bold text-slate-800 text-lg leading-tight">Hotel Revenue Pro</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Financial Calculator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOwnerView(!isOwnerView)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isOwnerView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{isOwnerView ? 'Detailed View' : 'Owner Pitch View'}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Report Content Container - This is what gets printed/downloaded */}
      <div id="report-content" className="flex-grow w-full flex flex-col bg-white">
        <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-grow">
            
            {/* Printable Report Header */}
            <div id="report-title" className="mb-8 text-center border-b border-slate-200 pb-6">
                <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-2 opacity-0 print:opacity-100" style={{ opacity: isGeneratingPdf ? 1 : undefined }}>
                        <div className="bg-blue-600 p-1.5 rounded">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-slate-700 tracking-tight">HotelRevenuePro</span>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Report Date</div>
                        <div className="text-sm font-medium text-slate-600">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                     </div>
                </div>

                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                    {inputs.hotelName || 'Property Revenue Projection'}
                </h1>
                <p className="text-slate-500 text-sm uppercase tracking-widest font-medium">Financial Analysis & Forecasting</p>
            </div>

            {/* Interactive Input Section (Hidden in PDF via onclone) */}
            <div id="input-section">
                <InputSection 
                    inputs={inputs} 
                    onChange={setInputs} 
                    isOwnerView={isOwnerView}
                />
            </div>

            {/* Read-Only Input Summary (Visible only in PDF via onclone) */}
            <PrintableInputSummary inputs={inputs} />

            {/* Summary Cards */}
            <div className="break-inside-avoid mb-8">
                <SummaryCards 
                    metrics={metrics} 
                    occupancyPercent={inputs.occupancyPercent}
                    roomPrice={inputs.roomPrice}
                />
            </div>

            {/* NEW: Financial Overview (ROI/Valuation) */}
            <FinancialOverview metrics={metrics} inputs={inputs} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <div className="break-inside-avoid mb-6">
                        <RevenueTable metrics={metrics} isOwnerView={isOwnerView} extraDeductions={inputs.extraDeductions} />
                    </div>
                    
                    {/* Disclaimer / Notes */}
                    <div className="break-inside-avoid mt-6 p-6 bg-slate-50 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-100">
                        <p className="font-bold text-slate-700 mb-2 uppercase tracking-wide text-[10px]">Methodology & Assumptions</p>
                        <ul className="list-disc pl-4 space-y-1.5 marker:text-slate-300">
                            <li><strong>OTA Commission:</strong> Calculated at 18% of Gross Revenue to account for booking platform fees.</li>
                            <li><strong>Operational Maintenance:</strong> Derived based on occupancy ({inputs.occupancyPercent}%) and a base cost of ₹{inputs.maintenanceCostPerRoom} per sold room.</li>
                            <li><strong>Annual Projection:</strong> Extrapolated based on 365 operational days. Seasonality adjustments are not applied in this linear model.</li>
                            {inputs.includeFinancials && (
                                <>
                                    <li><strong>Valuation:</strong> Estimated using a Capitalization Rate of 10% on Net Operating Income.</li>
                                    <li><strong>ROI:</strong> Calculated as Cash-on-Cash return (Annual Net Cash Flow / Initial Equity Investment).</li>
                                </>
                            )}
                            {inputs.extraDeductions.length > 0 && (
                            <li><strong>Fixed Costs:</strong> Includes additional monthly expenses totaling {formatCurrency(inputs.extraDeductions.reduce((a,b)=>a+b.amount,0))}.</li>
                            )}
                        </ul>
                    </div>
                </div>
                
                <div className="lg:col-span-1 order-1 lg:order-2">
                    <div className="break-inside-avoid">
                        <Visuals metrics={metrics} inputs={inputs} />
                    </div>
                </div>
            </div>

        </main>

        <footer className="max-w-6xl mx-auto px-4 py-6 text-center text-slate-300 text-[10px] border-t border-slate-50 w-full mt-auto print:block hidden uppercase tracking-widest">
            <p>Generated by Hotel Revenue Pro • Confidential Financial Document</p>
        </footer>
      </div>
    </div>
  );
};

export default App;