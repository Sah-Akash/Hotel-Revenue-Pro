import React, { useState, useEffect } from 'react';
import { InputState, SavedProject, MetricSummary, ViewType, AppSettings } from './types';
import { useCalculator } from './hooks/useCalculator';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase'; // Firestore instance
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

// Components
import InputSection from './components/InputSection';
import PrintableInputSummary from './components/PrintableInputSummary';
import SummaryCards from './components/SummaryCards';
import FinancialOverview from './components/FinancialOverview';
import RevenueTable from './components/RevenueTable';
import Visuals from './components/Visuals';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Login from './components/Login';

import { Building2, Eye, EyeOff, Loader2, Download, FileSpreadsheet, ArrowLeft, Save, CheckCircle, Menu } from 'lucide-react';
import { MAINTENANCE_BASE_COST, DEFAULT_LOAN_INTEREST } from './constants';

// Default initial state
const INITIAL_INPUTS: InputState = {
  hotelName: '',
  totalRooms: 32,
  occupancyPercent: 60,
  roomPrice: 1200,
  roundSRN: true,
  extraDeductions: [],
  maintenanceCostPerRoom: MAINTENANCE_BASE_COST,
  includeFinancials: false,
  propertyValue: 0,
  loanAmount: 0,
  interestRate: 0,
  loanTermYears: 0,
  hasKitchen: false,
  hasRestaurant: false,
  hasGym: false,
};

const DEFAULT_SETTINGS: AppSettings = {
    userName: '',
    currencySymbol: '₹',
    defaultInterestRate: DEFAULT_LOAN_INTEREST
};

const App: React.FC = () => {
  // --- AUTH HOOK ---
  const { user, loading: authLoading, isGuest } = useAuth();

  // --- STATE ---
  const [view, setView] = useState<ViewType>('login'); 
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Editor State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<InputState>(INITIAL_INPUTS);
  
  const [isOwnerView, setIsOwnerView] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  // --- CALCULATOR HOOK ---
  const metrics = useCalculator(inputs);

  // --- EFFECTS ---

  // Handle Authentication State Changes & Initial Data Load
  useEffect(() => {
    if (authLoading) return;

    if (user) {
        setView('dashboard');
        fetchProjectsFromCloud(user.uid);
    } else if (isGuest) {
        setView('dashboard');
        loadProjectsFromLocalStorage();
    } else {
        setView('login');
    }
  }, [user, authLoading, isGuest]);

  // Load Settings from LocalStorage (User preferences are usually local-first)
  useEffect(() => {
    const storedSettings = localStorage.getItem('hotel_revenue_pro_settings');
    if (storedSettings) {
        try {
            setAppSettings(JSON.parse(storedSettings));
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    }
  }, []);

  // --- DATA SYNC FUNCTIONS ---

  const loadProjectsFromLocalStorage = () => {
      const stored = localStorage.getItem('hotel_revenue_pro_projects');
      if (stored) {
          try {
              setSavedProjects(JSON.parse(stored));
          } catch (e) {
              console.error("Failed to load local projects", e);
          }
      } else {
          setSavedProjects([]);
      }
  };

  const fetchProjectsFromCloud = async (uid: string) => {
      if (!db) {
          loadProjectsFromLocalStorage();
          return;
      }
      setIsLoadingData(true);
      try {
          const q = query(collection(db, "projects"), where("userId", "==", uid));
          const querySnapshot = await getDocs(q);
          const projects: SavedProject[] = [];
          querySnapshot.forEach((doc) => {
              projects.push(doc.data() as SavedProject);
          });
          setSavedProjects(projects);
      } catch (error) {
          console.error("Error fetching projects: ", error);
          loadProjectsFromLocalStorage();
      } finally {
          setIsLoadingData(false);
      }
  };

  const saveProjectToCloud = async (project: SavedProject) => {
      if (!user || !db) return;
      try {
          await setDoc(doc(db, "projects", project.id), project);
      } catch (e) {
          console.error("Error saving to cloud", e);
      }
  };

  const deleteProjectFromCloud = async (id: string) => {
      if (!user || !db) return;
      try {
          await deleteDoc(doc(db, "projects", id));
      } catch (e) {
          console.error("Error deleting from cloud", e);
      }
  };

  // --- HANDLERS ---

  const handleSaveSettings = (newSettings: AppSettings) => {
      setAppSettings(newSettings);
      localStorage.setItem('hotel_revenue_pro_settings', JSON.stringify(newSettings));
  };

  const handleSaveProject = async () => {
    const summary: MetricSummary = {
        monthlyRevenue: metrics.monthlyRevenue,
        monthlyNet: metrics.monthlyNet,
        roi: metrics.roi,
        valuation: metrics.valuation
    };

    const now = Date.now();
    let projectToSave: SavedProject;

    if (currentId) {
        // Update existing
        const existing = savedProjects.find(p => p.id === currentId);
        projectToSave = { 
            ...(existing || {}), // keep existing props
            id: currentId,
            userId: user?.uid || 'guest',
            lastModified: now,
            inputs,
            summary 
        } as SavedProject;

        setSavedProjects(prev => prev.map(p => p.id === currentId ? projectToSave : p));
    } else {
        // Create new
        const newId = crypto.randomUUID();
        projectToSave = {
            id: newId,
            userId: user?.uid || 'guest',
            lastModified: now,
            inputs,
            summary
        };
        setSavedProjects(prev => [projectToSave, ...prev]);
        setCurrentId(newId);
    }

    // Persist
    // 1. Local (Optimistic UI & Guest Mode)
    const currentProjects = currentId 
        ? savedProjects.map(p => p.id === currentId ? projectToSave : p)
        : [projectToSave, ...savedProjects];
    localStorage.setItem('hotel_revenue_pro_projects', JSON.stringify(currentProjects));
    
    // 2. Cloud (Only if logged in)
    if (user) {
        await saveProjectToCloud(projectToSave);
    }

    setLastSavedTime(now);
    setTimeout(() => setLastSavedTime(null), 2000);
  };

  const handleCreateNew = () => {
    setInputs({
        ...INITIAL_INPUTS,
        interestRate: appSettings.defaultInterestRate || INITIAL_INPUTS.interestRate
    });
    setCurrentId(null);
    setView('editor');
    setIsOwnerView(false);
  };

  const handleOpenProject = (project: SavedProject) => {
    setInputs(project.inputs);
    setCurrentId(project.id);
    setView('editor');
    setIsOwnerView(false);
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this project?")) {
        const updated = savedProjects.filter(p => p.id !== id);
        setSavedProjects(updated);
        localStorage.setItem('hotel_revenue_pro_projects', JSON.stringify(updated));
        
        if (user) {
            await deleteProjectFromCloud(id);
        }
    }
  };

  const handleDownloadCsv = () => {
    // 1. Construct the Data Rows
    const csvRows = [
      ['Property Name', `"${inputs.hotelName || 'Untitled Property'}"`],
      ['Report Date', new Date().toLocaleDateString()],
      [],
      ['--- CONFIGURATION ---'],
      ['Total Rooms', inputs.totalRooms],
      ['Occupancy (%)', inputs.occupancyPercent],
      ['Avg Room Price', inputs.roomPrice],
      ['Maintenance Cost/Room', inputs.maintenanceCostPerRoom],
    ];

    if (inputs.includeFinancials) {
        csvRows.push(
            [],
            ['--- INVESTMENT & FINANCING ---'],
            ['Property Value', inputs.propertyValue],
            ['Loan Amount', inputs.loanAmount],
            ['Interest Rate (%)', inputs.interestRate],
            ['Loan Tenure (Years)', inputs.loanTermYears]
        );
    }

    csvRows.push(
        [],
        ['--- KEY METRICS ---'],
        ['Sold Rooms/Night (SRN)', metrics.srn.toFixed(1)],
        ['Monthly Net Income', metrics.monthlyNet.toFixed(2)],
        ['Yearly Net Income', metrics.yearlyNet.toFixed(2)]
    );

    if (inputs.includeFinancials) {
        csvRows.push(
            ['ROI (%)', metrics.roi.toFixed(1)],
            ['DSCR', metrics.dscr.toFixed(2)],
            ['Valuation', metrics.valuation.toFixed(2)],
            ['Payback Period (Years)', metrics.paybackPeriod.toFixed(1)]
        );
    }

    csvRows.push(
        [],
        ['--- REVENUE BREAKDOWN ---'],
        ['Item', 'Daily', 'Monthly', 'Yearly']
    );

    const addRow = (label: string, daily: number, monthly: number, yearly: number) => {
        csvRows.push([`"${label}"`, daily.toFixed(2), monthly.toFixed(2), yearly.toFixed(2)]);
    };

    addRow('Gross Revenue', metrics.dailyRevenue, metrics.monthlyRevenue, metrics.yearlyRevenue);
    addRow('OTA Commission (18%)', -metrics.dailyOta, -metrics.monthlyOta, -metrics.yearlyOta);
    addRow('Maintenance Cost', -metrics.dailyMaintenance, -metrics.monthlyMaintenance, -metrics.yearlyMaintenance);

    inputs.extraDeductions.forEach(d => {
        const m = d.amount || 0;
        addRow(d.name || 'Extra Expense', -(m/30), -m, -(m*12));
    });

    addRow('Net Operating Income (NOI)', metrics.dailyNet, metrics.monthlyNet, metrics.yearlyNet);

    if (inputs.includeFinancials) {
        addRow('Debt Service (EMI)', -(metrics.monthlyEMI/30), -metrics.monthlyEMI, -metrics.yearlyEMI);
        addRow('Net Cash Flow', metrics.monthlyCashFlow/30, metrics.monthlyCashFlow, metrics.yearlyCashFlow);
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = inputs.hotelName ? `${inputs.hotelName.replace(/\s+/g, '_')}_Revenue_Data.csv` : 'Hotel_Revenue_Data.csv';
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    setIsGeneratingPdf(true);

    const opt = {
      margin: 0, 
      filename: inputs.hotelName ? `${inputs.hotelName.replace(/\s+/g, '_')}_Financial_Report.pdf` : 'Hotel_Revenue_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        scrollY: 0,
        windowWidth: 1200, 
        onclone: (clonedDoc: Document) => {
            const hiddenElements = clonedDoc.querySelectorAll('.print\\:hidden, .no-print');
            hiddenElements.forEach((el: any) => el.style.display = 'none');
            
            const interactiveInputs = clonedDoc.getElementById('input-section');
            if (interactiveInputs) interactiveInputs.style.display = 'none';

            const printableSummary = clonedDoc.getElementById('printable-summary');
            if (printableSummary) printableSummary.style.display = 'block';

            const reportContainer = clonedDoc.getElementById('report-content');
            if (reportContainer) {
              reportContainer.style.width = '1200px'; 
              reportContainer.style.minHeight = '100vh';
              reportContainer.style.backgroundColor = '#ffffff';
            }

            const mainContent = clonedDoc.querySelector('main');
            if (mainContent) {
                mainContent.style.maxWidth = '100%'; 
                mainContent.style.padding = '40px 60px'; 
            }
            
            const reportTitle = clonedDoc.getElementById('report-title');
            if (reportTitle) {
                reportTitle.style.marginBottom = '40px';
                reportTitle.style.paddingBottom = '20px';
                reportTitle.style.borderBottom = '2px solid #0f172a';
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

  // --- EDITOR VIEW ---
  const renderEditor = () => (
      <div className="flex flex-col h-full bg-slate-50">
        {/* Editor Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-30 print:static print:border-none no-print">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setView('dashboard')}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg hidden sm:block">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-800 text-sm sm:text-lg leading-tight truncate max-w-[150px] sm:max-w-xs">
                                {inputs.hotelName || 'Untitled Project'}
                            </h1>
                        </div>
                    </div>
                </div>
            
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSaveProject}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            lastSavedTime 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {lastSavedTime ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        <span className="hidden sm:inline">{lastSavedTime ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                        onClick={() => setIsOwnerView(!isOwnerView)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        title={isOwnerView ? "Switch to Detailed View" : "Switch to Owner View"}
                    >
                        {isOwnerView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    
                    <button
                        onClick={handleDownloadCsv}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                        title="Export CSV"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isGeneratingPdf ? 'Wait...' : 'PDF'}</span>
                    </button>
                </div>
            </div>
        </header>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto">
             <div id="report-content" className="w-full bg-white min-h-full">
                <main className="max-w-6xl mx-auto px-4 py-8 w-full">
                    {/* Printable Report Header */}
                    <div id="report-title" className="mb-8 text-center border-b border-slate-200 pb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 opacity-0 print:opacity-100" style={{ opacity: isGeneratingPdf ? 1 : undefined }}>
                                <div className="bg-blue-600 p-1.5 rounded">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-slate-700 tracking-tight">RevenuePro</span>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Report Date</div>
                                <div className="text-sm font-medium text-slate-600">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                {(user || isGuest) && (
                                    <div className="text-xs text-slate-400 mt-1">
                                        Prepared by {user?.displayName || (isGuest ? 'Guest User' : '')}
                                    </div>
                                )}
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-slate-900 mb-2">
                            {inputs.hotelName || 'Property Revenue Projection'}
                        </h1>
                        <p className="text-slate-500 text-sm uppercase tracking-widest font-medium">Financial Analysis & Forecasting</p>
                    </div>

                    {/* Interactive Input Section */}
                    <div id="input-section">
                        <InputSection 
                            inputs={inputs} 
                            onChange={setInputs} 
                            isOwnerView={isOwnerView}
                        />
                    </div>

                    {/* Read-Only Input Summary */}
                    <PrintableInputSummary inputs={inputs} />

                    {/* Summary Cards */}
                    <div className="break-inside-avoid mb-8">
                        <SummaryCards 
                            metrics={metrics} 
                            occupancyPercent={inputs.occupancyPercent}
                            roomPrice={inputs.roomPrice}
                        />
                    </div>

                    {/* Financial Overview */}
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
                    <p>Generated by RevenuePro • Confidential Financial Document</p>
                </footer>
             </div>
        </div>
      </div>
  );

  // --- LOADING STATE ---
  if (authLoading) {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
    );
  }

  // --- LOGIN VIEW ---
  if (view === 'login') {
      return <Login />;
  }

  // --- MAIN LAYOUT RENDERING ---

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <Sidebar 
            currentView={view} 
            onChangeView={setView}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            
            {/* Mobile Header Toggle */}
            <div className="lg:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    RevenuePro
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-auto">
                {view === 'editor' && renderEditor()}
                
                {view === 'dashboard' && (
                    <>
                        {isLoadingData ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : (
                            <Dashboard 
                                projects={savedProjects}
                                onCreateNew={handleCreateNew}
                                onOpen={handleOpenProject}
                                onDelete={handleDeleteProject}
                            />
                        )}
                    </>
                )}

                {view === 'analytics' && (
                    <Analytics projects={savedProjects} />
                )}

                {view === 'settings' && (
                    <Settings settings={appSettings} onSave={handleSaveSettings} />
                )}

                {view === 'help' && (
                    <div className="p-12 max-w-3xl mx-auto text-slate-600">
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">Help & Support</h1>
                        <p className="mb-6">Welcome to Hotel Revenue Pro. This tool helps hotel owners and investors forecast revenue, calculate valuation, and analyze financial viability.</p>
                        
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Key Features:</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-8">
                            <li><strong>Revenue Calculator:</strong> Estimate daily, monthly, and yearly income based on occupancy and room rates.</li>
                            <li><strong>Financial Analysis:</strong> Calculate ROI, Debt Service Coverage Ratio (DSCR), and Property Valuation.</li>
                            <li><strong>Portfolio Dashboard:</strong> Save and manage multiple property projections in one place.</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default App;