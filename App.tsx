import React, { useState, useEffect } from 'react';
import { InputState, SavedProject, MetricSummary, ViewType, AppSettings } from './types';
import { useCalculator } from './hooks/useCalculator';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase'; 
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

// Components
import AccessGate from './components/AccessGate';
import InputSection from './components/InputSection';
import PrintableInputSummary from './components/PrintableInputSummary';
import SummaryCards from './components/SummaryCards';
import FinancialOverview from './components/FinancialOverview';
import DealSummary from './components/DealSummary'; 
import RevenueTable from './components/RevenueTable';
import Visuals from './components/Visuals';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Login from './components/Login';
import KnowledgeBase from './components/KnowledgeBase';

import { Building2, Eye, EyeOff, Loader2, Download, FileSpreadsheet, ArrowLeft, Save, CheckCircle, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { MAINTENANCE_BASE_COST, DEFAULT_LOAN_INTEREST, DEAL_OTA_RATE } from './constants';

// Default initial state
const INITIAL_INPUTS: InputState = {
  hotelName: '',
  totalRooms: 32,
  occupancyPercent: 60,
  roomPrice: 1700,
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
  // New Deal Inputs
  otaPercent: DEAL_OTA_RATE,
  monthlyMg: 0,
  securityDeposit: 0,
  businessAdvance: 0,
  dealType: 'owner'
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
  const [isInputPanelOpen, setIsInputPanelOpen] = useState(true);

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

  // Load Settings from LocalStorage
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
        const existing = savedProjects.find(p => p.id === currentId);
        projectToSave = { 
            ...(existing || {}),
            id: currentId,
            userId: user?.uid || 'guest',
            lastModified: now,
            inputs,
            summary 
        } as SavedProject;

        setSavedProjects(prev => prev.map(p => p.id === currentId ? projectToSave : p));
    } else {
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

    const currentProjects = currentId 
        ? savedProjects.map(p => p.id === currentId ? projectToSave : p)
        : [projectToSave, ...savedProjects];
    localStorage.setItem('hotel_revenue_pro_projects', JSON.stringify(currentProjects));
    
    if (user) await saveProjectToCloud(projectToSave);

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
    setInputs({
        ...INITIAL_INPUTS,
        ...project.inputs,
        dealType: project.inputs.dealType || 'owner'
    });
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
        if (user) await deleteProjectFromCloud(id);
    }
  };

  const handleDownloadCsv = () => {
    const csvRows = [
      ['Property Name', `"${inputs.hotelName || 'Untitled Property'}"`],
      ['Report Date', new Date().toLocaleDateString()],
      [],
      ['--- DEAL METRICS ---'],
      ['Deal Type', inputs.dealType.toUpperCase()],
      ['SRNs', metrics.srn],
      ['Assumed ARR', inputs.roomPrice],
      ['Assumed OCC%', `${inputs.occupancyPercent}%`],
      ['Exp Revenue', metrics.monthlyRevenue.toFixed(0)],
      ['Rev minus GST', metrics.dealRevenueNetGst.toFixed(0)],
      ['MG', metrics.monthlyMg.toFixed(0)],
      ['Absolute CM', metrics.dealAbsoluteCm.toFixed(0)],
      ['CM%', `${metrics.dealCmPercent.toFixed(0)}%`],
      ['PBP%', `${metrics.dealPbpPercent.toFixed(0)}%`],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = inputs.hotelName ? `${inputs.hotelName.replace(/\s+/g, '_')}_Deal_Sheet.csv` : 'Deal_Sheet.csv';
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
      html2canvas: { scale: 2, useCORS: true, scrollY: 0, windowWidth: 1200 },
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

  // WRAP CONTENT IN ACCESS GATE
  return (
    <AccessGate>
        {authLoading ? (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        ) : view === 'login' ? (
            <Login />
        ) : (
            <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
                <Sidebar currentView={view} onChangeView={setView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                
                <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                    
                    {/* Mobile Header */}
                    <div className="lg:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0 z-40">
                        <div className="flex items-center gap-2 font-bold text-slate-800"><Building2 className="w-5 h-5 text-blue-600" />RevenuePro</div>
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600"><Menu className="w-6 h-6" /></button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-hidden relative">
                        
                        {view === 'editor' ? (
                        <div className="flex flex-col h-full bg-slate-50/50">
                            
                            {/* Editor Header */}
                            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shrink-0">
                                <div className="w-full px-6 h-16 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                                        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                                        <h1 className="font-bold text-slate-800 text-lg truncate max-w-[200px] sm:max-w-md">{inputs.hotelName || 'Untitled Project'}</h1>
                                        <button onClick={() => setIsInputPanelOpen(!isInputPanelOpen)} className="hidden xl:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:text-slate-800 transition-colors">
                                            {isInputPanelOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
                                            {isInputPanelOpen ? 'Hide Inputs' : 'Show Inputs'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleSaveProject} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${lastSavedTime ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                                            {lastSavedTime ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                            <span className="hidden sm:inline">{lastSavedTime ? 'Saved' : 'Save Changes'}</span>
                                        </button>
                                        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                                        <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50" title="Export PDF">
                                            {isGeneratingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                        </button>
                                        <button onClick={handleDownloadCsv} className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" title="Export CSV">
                                            <FileSpreadsheet className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </header>

                            {/* Split View Container */}
                            <div className="flex-1 flex overflow-hidden relative">
                                <aside className={`
                                    absolute inset-y-0 left-0 z-20 w-full md:w-[400px] xl:w-[420px] bg-white border-r border-slate-200 shadow-xl xl:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col
                                    ${isInputPanelOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-[-100%]'}
                                    xl:static xl:translate-x-0
                                    ${!isInputPanelOpen && 'xl:hidden'}
                                `}>
                                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                                        <div className="mb-6 pb-6 border-b border-slate-100">
                                            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Configuration</h2>
                                            <InputSection inputs={inputs} onChange={setInputs} isOwnerView={isOwnerView} />
                                        </div>
                                    </div>
                                </aside>

                                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 relative" id="report-content">
                                    <div className="max-w-6xl mx-auto space-y-8 pb-20">
                                        <SummaryCards metrics={metrics} occupancyPercent={inputs.occupancyPercent} roomPrice={inputs.roomPrice} />
                                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                            <div className="xl:col-span-2 space-y-8">
                                                <Visuals metrics={metrics} inputs={inputs} />
                                                <RevenueTable metrics={metrics} isOwnerView={isOwnerView} extraDeductions={inputs.extraDeductions} />
                                            </div>
                                            <div className="xl:col-span-1 space-y-8">
                                                <DealSummary metrics={metrics} inputs={inputs} />
                                                <FinancialOverview metrics={metrics} inputs={inputs} />
                                            </div>
                                        </div>
                                        <PrintableInputSummary inputs={inputs} />
                                    </div>
                                </main>

                                <button 
                                    onClick={() => setIsInputPanelOpen(!isInputPanelOpen)}
                                    className={`xl:hidden absolute bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl text-white transition-all ${isInputPanelOpen ? 'bg-slate-900 rotate-180' : 'bg-blue-600'}`}
                                >
                                {isInputPanelOpen ? <ArrowLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                        ) : (
                        <div className="h-full overflow-y-auto bg-slate-50/50 scroll-smooth">
                            {view === 'dashboard' && <Dashboard projects={savedProjects} onCreateNew={handleCreateNew} onOpen={handleOpenProject} onDelete={handleDeleteProject} />}
                            {view === 'analytics' && <Analytics projects={savedProjects} />}
                            {view === 'knowledge' && <KnowledgeBase />}
                            {view === 'settings' && <Settings settings={appSettings} onSave={handleSaveSettings} />}
                            {view === 'help' && <div className="p-12 max-w-3xl mx-auto text-slate-600"><h1 className="text-3xl font-bold text-slate-900 mb-4">Help & Support</h1></div>}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </AccessGate>
  );
};

export default App;