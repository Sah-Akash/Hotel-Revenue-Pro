import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calculator, FileText, CheckCircle2, AlertOctagon, BookOpen, Briefcase, Zap, ShieldCheck, X, ArrowRight, Play, RotateCcw } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils';

type Category = 'All' | 'Revenue' | 'Deals' | 'Operations' | 'Formulas' | 'Audit' | 'Brands';

interface CalculatorInput {
    id: string;
    label: string;
    defaultValue: number;
    unit?: string;
    step?: number;
    description?: string;
}

interface InteractiveConfig {
    inputs: CalculatorInput[];
    calculate: (values: Record<string, number>) => number;
    resultLabel: string;
    resultUnit?: string;
    isCurrency?: boolean;
}

interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
  longDescription?: string;
  realWorldExample?: string;
  formula?: string;
  category: Exclude<Category, 'All'>;
  tags?: string[];
  interactive?: InteractiveConfig;
}

// --- DATA SOURCE ---
const GLOSSARY_DATA: GlossaryItem[] = [
  // --- REVENUE ---
  {
    id: 'rz',
    term: 'Realization (Rz)',
    definition: 'The ratio of Used Room Nights (URN) to Booked Room Nights (BRN).',
    longDescription: 'Realization measures the efficiency of converting bookings into actual stays. A low realization indicates high cancellations or no-shows. It is a critical metric for understanding demand quality.',
    realWorldExample: 'If you have 100 Bookings (BRN) and 80 of them actually check-out (URN), your Realization is 80%.',
    formula: '(URN ÷ BRN) * 100',
    category: 'Revenue',
    tags: ['Core Metric'],
    interactive: {
        inputs: [
            { id: 'urn', label: 'Used Room Nights (URN)', defaultValue: 80, step: 1 },
            { id: 'brn', label: 'Booked Room Nights (BRN)', defaultValue: 100, step: 1 }
        ],
        calculate: (vals) => vals.brn > 0 ? (vals.urn / vals.brn) * 100 : 0,
        resultLabel: 'Realization',
        resultUnit: '%'
    }
  },
  {
    id: 'revpar',
    term: 'RevPAR',
    definition: 'Revenue Per Available Room. The gold standard for hotel performance.',
    longDescription: 'RevPAR combines Occupancy and Rate into a single metric. It tells you how well you are filling rooms at what price. It is calculated by dividing total room revenue by the total number of available rooms, or by multiplying ARR by Occupancy %.',
    realWorldExample: 'Hotel A has 50% occupancy at ₹2000 ARR. RevPAR = ₹1000. Hotel B has 100% occupancy at ₹1000 ARR. RevPAR = ₹1000. Both generate the same revenue per available room.',
    formula: '(Occupancy% * ARR) / 100',
    category: 'Revenue',
    tags: ['Core Metric', 'KPI'],
    interactive: {
        inputs: [
            { id: 'occ', label: 'Occupancy', defaultValue: 60, unit: '%', step: 5 },
            { id: 'arr', label: 'Avg Room Rate (ARR)', defaultValue: 1500, unit: '₹', step: 100 }
        ],
        calculate: (vals) => (vals.occ * vals.arr) / 100,
        resultLabel: 'RevPAR',
        isCurrency: true
    }
  },
  {
    id: 'gmv',
    term: 'GMV (Gross Merchandise Value)',
    definition: 'Total revenue generated (OYO business + Hotel booking).',
    longDescription: 'GMV represents the total value of merchandise sold over a given period of time. In the hotel context, it effectively means the Gross Revenue before any deductions, commissions, or taxes.',
    formula: 'RevPAR * SRN',
    category: 'Revenue',
    interactive: {
        inputs: [
            { id: 'revpar', label: 'RevPAR', defaultValue: 1200, unit: '₹', step: 50 },
            { id: 'srn', label: 'Total Rooms (SRN)', defaultValue: 30, step: 1 }
        ],
        calculate: (vals) => vals.revpar * vals.srn,
        resultLabel: 'Daily GMV',
        isCurrency: true
    }
  },
  
  // --- OPERATIONS ---
  {
    id: 'no-show',
    term: 'No-Show %',
    definition: 'Percentage of guests who booked but did not arrive.',
    longDescription: 'Refers to a guest who made a confirmed reservation but neither arrived at the hotel nor cancelled. The hotel can mark a booking as No-Show if the guest does not check in. This functionality becomes available 3 hours after the scheduled check-out time.',
    realWorldExample: 'If 10 people booked rooms, but 2 people never showed up and didn\'t cancel, you have a 20% No-Show rate.',
    formula: '((BRN - URN) / BRN) * 100',
    category: 'Operations',
    interactive: {
        inputs: [
            { id: 'brn', label: 'Booked Room Nights (BRN)', defaultValue: 20, step: 1 },
            { id: 'urn', label: 'Used Room Nights (URN)', defaultValue: 18, step: 1 }
        ],
        calculate: (vals) => vals.brn > 0 ? ((vals.brn - vals.urn) / vals.brn) * 100 : 0,
        resultLabel: 'No-Show Rate',
        resultUnit: '%'
    }
  },
  {
      id: 'occupancy-formula',
      term: 'Occupancy %',
      definition: 'Percentage of rooms occupied out of total available rooms.',
      longDescription: 'Occupancy refers to the percentage of rooms occupied by guests during a specific period. It is a fundamental indicator of demand.',
      formula: '(Total Rooms Occupied / Total Rooms Available) * 100',
      category: 'Formulas',
      interactive: {
          inputs: [
              { id: 'occupied', label: 'Rooms Occupied', defaultValue: 15, step: 1 },
              { id: 'total', label: 'Total Rooms', defaultValue: 20, step: 1 }
          ],
          calculate: (vals) => vals.total > 0 ? (vals.occupied / vals.total) * 100 : 0,
          resultLabel: 'Occupancy',
          resultUnit: '%'
      }
  },
  {
    id: 'net-stuck',
    term: 'Net Stuck %',
    definition: 'Percentage of guests facing check-in issues vs total check-ins.',
    longDescription: 'Stuck refers to a condition when a guest faces an issue related to check-in at the property and escalates it. Net Stuck accounts for gross stuck cases minus excluded/resolved categories.',
    formula: '((Gross Stuck - Issues) / Check-ins) * 100',
    category: 'Formulas',
    interactive: {
        inputs: [
            { id: 'gross', label: 'Gross Stuck Count', defaultValue: 5, step: 1 },
            { id: 'issues', label: 'Valid Issues (Exclusions)', defaultValue: 2, step: 1 },
            { id: 'checkins', label: 'Total Check-ins', defaultValue: 50, step: 1 }
        ],
        calculate: (vals) => vals.checkins > 0 ? ((vals.gross - vals.issues) / vals.checkins) * 100 : 0,
        resultLabel: 'Net Stuck',
        resultUnit: '%'
    }
  },
  // --- DEALS (Static but detailed) ---
  {
    id: 'crystal',
    term: 'Crystal Deal',
    definition: 'A fixed commission deal on overall revenue.',
    longDescription: 'A type of deal in which OYO charges a fixed commission (flat take rate) on overall revenue. This applies to all booking channels including OYO app, OTA, OBA, Direct, and walk-in.',
    realWorldExample: 'If the Crystal Deal is 29%, OYO takes 29% of every Rupee earned by the hotel, regardless of where the booking came from.',
    category: 'Deals'
  },
  {
    id: 'flexi',
    term: 'Flexi Deal',
    definition: 'Reduced commission on Walk-ins.',
    longDescription: 'Designed to offer a reduced commission on Walk-in bookings while keeping the regular take on other channels. Ideally used to incentivize owners who have high walk-in potential.',
    realWorldExample: 'A "28 + 6 %" Flexi Deal means: 28% commission on OYO/Online bookings, but only 6% commission on Walk-in bookings.',
    category: 'Deals'
  },
  {
    id: 'aid',
    term: 'AID (All In Deal)',
    definition: 'Higher commission but fewer penalties.',
    longDescription: 'A deal type where the commission % is higher (30% or above) but OYO gives an exception on Digital Audit (DA) and Contractual Realization (CRz) penalties. RA Walk-in charge is usually still applicable.',
    category: 'Deals'
  },
  {
      id: 'srn-def',
      term: 'SRN',
      definition: 'Sellable Room Night',
      longDescription: 'Number of rooms available to be sold. If a hotel has 10 rooms and is open for 30 days, the monthly SRN is 300.',
      category: 'Revenue'
  },
  {
      id: 'urn-def',
      term: 'URN',
      definition: 'Used Room Night',
      longDescription: 'Number of rooms actually checked out. If a guest stays for 3 nights in 1 room, that is 3 URNs.',
      category: 'Revenue'
  },
  {
    id: 'da',
    term: 'DA (Digital Audit)',
    definition: 'Digital mechanism to detect revenue leakage.',
    longDescription: 'DA occurs when a guest cancels on OYO but stays at the hotel at a negotiated rate. OYO verifies this via Location (GPS), Wi-Fi connection logs, IVR calling, or ML prediction.',
    category: 'Audit',
    tags: ['Penalty']
  },
  {
    id: 'mg',
    term: 'MG (Minimum Guarantee)',
    definition: 'A fixed monthly payout guaranteed to the owner.',
    longDescription: 'Regardless of the actual business volume, the owner receives this fixed amount. If revenue share exceeds MG, they may get the higher amount (depending on contract). Used primarily in Sunday and Company Serviced (CS) deals.',
    category: 'Deals'
  }
];

// --- SUB-COMPONENT: Interactive Calculator ---
const Playground: React.FC<{ config: InteractiveConfig }> = ({ config }) => {
    const [values, setValues] = useState<Record<string, number>>({});
    const [result, setResult] = useState<number>(0);

    // Initialize defaults
    useEffect(() => {
        const defaults: Record<string, number> = {};
        config.inputs.forEach(input => {
            defaults[input.id] = input.defaultValue;
        });
        setValues(defaults);
    }, [config]);

    // Calculate on change
    useEffect(() => {
        if (Object.keys(values).length > 0) {
            setResult(config.calculate(values));
        }
    }, [values, config]);

    const handleReset = () => {
        const defaults: Record<string, number> = {};
        config.inputs.forEach(input => {
            defaults[input.id] = input.defaultValue;
        });
        setValues(defaults);
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Play className="w-4 h-4 fill-current" />
                </div>
                <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Try it yourself</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {config.inputs.map(input => (
                        <div key={input.id}>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">{input.label}</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={values[input.id] || ''}
                                    step={input.step || 1}
                                    onChange={(e) => setValues(prev => ({ ...prev, [input.id]: parseFloat(e.target.value) || 0 }))}
                                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                                {input.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">{input.unit}</span>}
                            </div>
                        </div>
                    ))}
                    <button onClick={handleReset} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline mt-2">
                        <RotateCcw className="w-3 h-3" /> Reset Defaults
                    </button>
                </div>

                <div className="flex flex-col justify-center items-center bg-white rounded-xl border border-blue-100 p-6 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{config.resultLabel}</span>
                    <div className="text-3xl sm:text-4xl font-black text-blue-600">
                        {config.isCurrency ? formatCurrency(result) : formatNumber(result)}
                        {!config.isCurrency && config.resultUnit && <span className="text-lg sm:text-xl ml-1 text-slate-400">{config.resultUnit}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const KnowledgeBase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedItem, setSelectedItem] = useState<GlossaryItem | null>(null);

  const filteredItems = useMemo(() => {
    return GLOSSARY_DATA.filter(item => {
      const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const categories: { id: Category; label: string; icon: any }[] = [
    { id: 'All', label: 'All', icon: BookOpen },
    { id: 'Revenue', label: 'Revenue', icon: Calculator },
    { id: 'Deals', label: 'Deals', icon: Briefcase },
    { id: 'Operations', label: 'Ops', icon: Zap }, // Shortened for mobile
    { id: 'Formulas', label: 'Formulas', icon: FileText },
    { id: 'Audit', label: 'Audit', icon: ShieldCheck },
    { id: 'Brands', label: 'Brands', icon: CheckCircle2 },
  ];

  const getCategoryColor = (cat: string) => {
      switch(cat) {
          case 'Revenue': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'Deals': return 'bg-violet-100 text-violet-700 border-violet-200';
          case 'Operations': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'Audit': return 'bg-red-100 text-red-700 border-red-200';
          case 'Formulas': return 'bg-amber-100 text-amber-700 border-amber-200';
          default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
  };

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto min-h-screen relative font-sans">
      
      {/* Header */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">Knowledge Base</h1>
        <p className="text-slate-500 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl">
            Definitions, formulas, and deal structures explained simply.
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
                type="text"
                placeholder="Search terms like 'RevPAR', 'Crystal Deal'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-base sm:text-lg appearance-none"
            />
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
        {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
                <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border whitespace-nowrap ${
                        isSelected 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {cat.label}
                </button>
            );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-20">
        {filteredItems.map((item) => (
            <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-1 transition-all group flex flex-col h-full cursor-pointer relative"
            >
                <div className="flex justify-between items-start mb-4">
                     <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${getCategoryColor(item.category)}`}>
                        {item.category}
                     </span>
                     {item.tags?.includes('Penalty') && <AlertOctagon className="w-4 h-4 text-red-400" />}
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {item.term}
                </h3>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.definition}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors">
                    <span>{item.interactive ? 'Click to Calculate' : 'Read More'}</span>
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        ))}
        
        {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
                <p className="text-lg font-medium">No results found for "{searchTerm}"</p>
                <button onClick={() => {setSearchTerm(''); setSelectedCategory('All')}} className="text-blue-600 font-bold mt-2 hover:underline">
                    Reset Filters
                </button>
            </div>
        )}
      </div>

      {/* --- SLIDE OVER DETAIL VIEW --- */}
      {selectedItem && (
          <div className="fixed inset-0 z-[60] flex justify-end">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setSelectedItem(null)}
              ></div>

              {/* Panel */}
              <div className="relative w-full md:max-w-2xl bg-white shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right duration-300">
                  <div className="sticky top-0 right-0 z-10 flex justify-end p-4 bg-white/80 backdrop-blur-md md:bg-transparent md:absolute md:top-6 md:right-6 md:p-0">
                    <button 
                        onClick={() => setSelectedItem(null)}
                        className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 md:p-12 pb-20">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getCategoryColor(selectedItem.category)}`}>
                        {selectedItem.category}
                      </span>
                      
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 mb-2">{selectedItem.term}</h2>
                      <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50/50 py-3 rounded-r-lg">
                          {selectedItem.definition}
                      </p>

                      <div className="mt-8 space-y-8">
                          
                          {/* Long Description */}
                          {selectedItem.longDescription && (
                              <div>
                                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-slate-400" /> Details
                                  </h3>
                                  <p className="text-slate-600 leading-7 text-sm sm:text-base">
                                      {selectedItem.longDescription}
                                  </p>
                              </div>
                          )}

                          {/* Example */}
                          {selectedItem.realWorldExample && (
                              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                                  <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                                      <Zap className="w-4 h-4" /> Real World Example
                                  </h3>
                                  <p className="text-emerald-700 text-sm sm:text-base italic">
                                      "{selectedItem.realWorldExample}"
                                  </p>
                              </div>
                          )}

                          {/* Formula Display */}
                          {selectedItem.formula && (
                              <div>
                                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                      <Calculator className="w-4 h-4 text-slate-400" /> Formula
                                  </h3>
                                  <div className="bg-slate-900 text-white p-4 rounded-xl font-mono text-sm shadow-lg overflow-x-auto">
                                      {selectedItem.formula}
                                  </div>
                              </div>
                          )}

                          {/* Interactive Playground */}
                          {selectedItem.interactive && (
                              <Playground config={selectedItem.interactive} />
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default KnowledgeBase;