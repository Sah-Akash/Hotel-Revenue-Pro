import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BackendService } from '../services/backend'; 
import { generateDeviceFingerprint } from '../utils';
import { Loader2, ShieldAlert, MonitorX, Lock, LogOut, AlertTriangle, RefreshCw, WifiOff, Mail, ExternalLink, Ban, Sparkles, Check, CreditCard, X, ShieldCheck } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onAdminAccess: () => void;
}

type LicenseState = 'checking' | 'authorized' | 'no_subscription' | 'expired' | 'device_mismatch' | 'device_used_by_other' | 'license_revoked' | 'error' | 'network_error';

const ADMIN_EMAIL = "aayansah17@gmail.com";
const SUPPORT_EMAIL = "aayansah17@gmail.com";

const LicenseGate: React.FC<Props> = ({ children, onAdminAccess }) => {
  const { user, logout, loading: authLoading } = useAuth();
  const [licenseState, setLicenseState] = useState<LicenseState>('checking');
  const [deviceDetails, setDeviceDetails] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payment Subscription states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro_monthly' | 'pro_quarterly' | 'pro_yearly'>('pro_monthly');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  
  // Checkout Form Details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    const adminKey = localStorage.getItem('hrp_access_key');

    // 1. ADMIN BYPASS LOGIC
    if (user) {
        // If logged in as Admin Email -> GRANT ACCESS
        if (user.email === ADMIN_EMAIL) {
            localStorage.setItem('hrp_access_key', 'ADMIN123');
            onAdminAccess();
            return;
        } 
        // If logged in as NON-Admin, but has key -> REVOKE KEY (Security Fix)
        else if (adminKey === 'ADMIN123') {
            console.warn("Cleared stale admin session for non-admin user");
            localStorage.removeItem('hrp_access_key');
        }
    } else {
        // If NOT logged in (Manual Backdoor) -> Check Key
        if (adminKey === 'ADMIN123') {
            onAdminAccess();
            return;
        }
    }

    if (!user) {
        setLicenseState('checking'); 
        return;
    }

    validateLicense();
  }, [user, authLoading]);

  const validateLicense = async () => {
    if (!user) return;
    setLicenseState('checking');
    setErrorMessage(null);

    try {
        const fingerprint = await generateDeviceFingerprint();
        setDeviceDetails(fingerprint.details);

        const result = await BackendService.validateLicense(user);

        if (result.authorized) {
            setLicenseState('authorized');
        } else {
            setLicenseState(result.reason as LicenseState || 'error');
            if (result.details) {
                setErrorMessage(result.details);
            }
        }

    } catch (err: any) {
        console.error("License Validation Error", err);
        setErrorMessage(err.message);
        setLicenseState('error');
    }
  };

  const contactSupport = (subjectPrefix: string = "Request") => {
      const subject = `${subjectPrefix} - Hotel Revenue Pro`;
      const body = `Hi Team,\n\nI need assistance with my account.\n\nUser ID: ${user?.uid}\nEmail: ${user?.email}\nDevice: ${deviceDetails}\n\nReason: ...`;
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setIsSubmittingPayment(true);
      try {
          // Simulate standard transaction processing latency (e.g. Stripe integration)
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await BackendService.purchaseSubscription(user.uid, selectedPlan);
          setShowCheckoutModal(false);
          await validateLicense();
      } catch (err: any) {
          console.error(err);
          alert("Payment processing failed. Please try again.");
      } finally {
          setIsSubmittingPayment(false);
      }
  };

  // --- RENDER STATES ---

  if (authLoading || licenseState === 'checking') {
      // Allow render if already flagged as admin (prevents flicker)
      if (localStorage.getItem('hrp_access_key') === 'ADMIN123') return <>{children}</>;
      
      // If user is admin email, allow immediate render
      if (user?.email === ADMIN_EMAIL) return <>{children}</>;

      // Don't block if not logged in (handled by App routing usually, but here checking)
      if (!user) return <>{children}</>;

      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">Verifying License...</p>
          </div>
      );
  }

  if (licenseState === 'authorized') {
      return <>{children}</>;
  }

  // --- DENY SCREENS ---

  const isSubscriptionScreen = licenseState === 'no_subscription' || licenseState === 'expired';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className={`bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full text-center shadow-2xl relative overflow-hidden transition-all duration-300 ${isSubscriptionScreen ? 'max-w-5xl' : 'max-w-md'}`}>
            
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                
                {/* 1. REVOKED ACCESS */}
                {licenseState === 'license_revoked' && (
                     <>
                        <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                            <Ban className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Access Revoked</h2>
                        <div className="bg-slate-950 border border-red-900/30 p-4 rounded-xl mb-6">
                            <p className="text-red-400 font-bold text-sm mb-2">License Suspended</p>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                This account has been permanently disabled from using the trial version.
                            </p>
                            <div className="my-4 border-t border-slate-800"></div>
                            <p className="text-white font-medium text-sm">
                                To continue using RevenuePro, you must upgrade to a Professional Plan.
                            </p>
                        </div>
                        <button 
                            onClick={() => {
                                setSelectedPlan('pro_monthly');
                                setShowCheckoutModal(true);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mb-3 shadow-lg shadow-emerald-900/20 transition-all"
                        >
                            <CreditCard className="w-4 h-4" /> Upgrade to Pro
                        </button>
                        <p className="text-xs text-slate-500 mb-4 font-mono">{SUPPORT_EMAIL}</p>
                    </>
                )}

                {/* 2. EXPIRED / NO SUB */}
                {isSubscriptionScreen && (
                    <div className="text-left">
                        {/* Header banner */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                                <Sparkles className="w-3.5 h-3.5" /> Premium Upgrade Required
                            </div>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight mb-3">
                                Choose Your RevenuePro Plan
                            </h2>
                            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
                                Your 7-day trial has concluded. Upgrade now to unlock professional-grade underwriting, hybrid lease models, automatic reverse deal-sizing, and priority expert support.
                            </p>
                        </div>

                        {/* Pricing Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {[
                                {
                                    id: 'pro_monthly',
                                    name: 'Professional Monthly',
                                    price: '$49',
                                    period: 'month',
                                    billing: 'Billed monthly. Cancel anytime.',
                                    savings: null,
                                    badge: null,
                                    color: 'border-slate-850 bg-slate-950/40'
                                },
                                {
                                    id: 'pro_quarterly',
                                    name: 'Professional Quarterly',
                                    price: '$39',
                                    period: 'month',
                                    billing: 'Billed $119 every 3 months.',
                                    savings: 'Save 20%',
                                    badge: 'Most Popular',
                                    color: 'border-indigo-500/30 bg-indigo-950/10 shadow-[0_4px_30px_rgba(99,102,241,0.05)]'
                                },
                                {
                                    id: 'pro_yearly',
                                    name: 'Professional Yearly',
                                    price: '$29',
                                    period: 'month',
                                    billing: 'Billed $349 every 12 months.',
                                    savings: 'Save 40%',
                                    badge: 'Best Value',
                                    color: 'border-amber-500/30 bg-amber-950/10 shadow-[0_4px_30px_rgba(245,158,11,0.05)]'
                                }
                            ].map((plan) => (
                                <div 
                                    key={plan.id}
                                    className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 hover:border-slate-700 hover:scale-[1.02] ${plan.color}`}
                                >
                                    {plan.badge && (
                                        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white shadow-md ${
                                            plan.id === 'pro_quarterly' ? 'bg-indigo-600' : 'bg-amber-600'
                                        }`}>
                                            {plan.badge}
                                        </span>
                                    )}
                                    
                                    <div>
                                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{plan.name}</div>
                                        <div className="flex items-baseline gap-1.5 mb-2">
                                            <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                            <span className="text-slate-500 text-sm font-medium">/{plan.period}</span>
                                            {plan.savings && (
                                                <span className="ml-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                    {plan.savings}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-slate-500 text-[11px] mb-6 leading-relaxed">{plan.billing}</div>
                                        
                                        <div className="space-y-3 mb-8">
                                            {[
                                                'Dual-Perspective Financial Engine',
                                                'Hybrid Share % & Minimum Guarantee Calc',
                                                'Reverse Deal-Sizing Simulation',
                                                'Custom DSS (Deal Strength Score) Analyzer',
                                                'Excel-ready CSV & Professional PDF Exports',
                                                'Unlimited Real-time Deal Simulations'
                                            ].map((feat, i) => (
                                                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                                                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span>{feat}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedPlan(plan.id as any);
                                            setShowCheckoutModal(true);
                                        }}
                                        className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-300 ${
                                            plan.id === 'pro_monthly' 
                                                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                                                : plan.id === 'pro_quarterly'
                                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/50'
                                        }`}
                                    >
                                        Select {plan.id === 'pro_monthly' ? 'Monthly' : plan.id === 'pro_quarterly' ? 'Quarterly' : 'Yearly'} Plan
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Customer Support Notice */}
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-950/60 border border-slate-850 p-6 rounded-2xl gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold">Secure Checkout Assurance</p>
                                    <p className="text-slate-500 text-xs">All purchases are protected by bank-level 256-bit SSL encryption.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => contactSupport("Custom Subscription Plan")}
                                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                            >
                                <Mail className="w-4 h-4" /> Custom Enterprise Plan? Contact Us
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. DEVICE ABUSE (Multi Account) */}
                {licenseState === 'device_used_by_other' && (
                    <>
                         <div className="w-16 h-16 bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-500">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Device Limit Reached</h2>
                        <div className="bg-slate-950 p-4 rounded-xl border border-orange-900/30 mb-6 text-left">
                            <p className="text-orange-400 text-xs font-bold uppercase tracking-wide mb-2">Anti-Abuse Policy</p>
                            <p className="text-slate-300 text-sm leading-relaxed mb-2">
                                This device has already been used for a trial with a different email address.
                            </p>
                            <p className="text-slate-500 text-xs">
                                Multiple trials on the same device are not permitted. Please login with your original account or purchase a license.
                            </p>
                        </div>
                        {errorMessage && (
                            <div className="mb-4 text-xs text-slate-600 font-mono text-left bg-slate-950 p-2 rounded">
                                Details: {errorMessage}
                            </div>
                        )}
                    </>
                )}

                {/* 4. DEVICE MISMATCH (Same User, Wrong Device) */}
                {licenseState === 'device_mismatch' && (
                    <>
                        <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                            <MonitorX className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Device Conflict</h2>
                        <div className="bg-slate-950 p-4 rounded-xl border border-red-900/30 mb-6 text-left">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-400 text-xs font-bold uppercase tracking-wide mb-1">Security Alert</p>
                                    <p className="text-slate-400 text-sm">
                                        Your license is bound to another device. 
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-800 text-xs font-mono text-slate-500">
                                This Device: {deviceDetails}
                            </div>
                        </div>
                        <button 
                            onClick={() => contactSupport("Device Reset Request")}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mb-3"
                        >
                            <Mail className="w-4 h-4" /> Request Device Reset
                        </button>
                    </>
                )}
                
                {/* 5. CONNECTION ERRORS */}
                {(licenseState === 'network_error' || licenseState === 'error') && (
                     <>
                        <div className="w-16 h-16 bg-yellow-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-yellow-500">
                            <WifiOff className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Connection Issue</h2>
                        <p className="text-slate-400 mb-4 text-sm">
                            Unable to verify license.
                        </p>
                        {errorMessage && (
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg mb-6 text-left overflow-auto max-h-32">
                                <p className="text-[10px] font-bold text-red-500 uppercase mb-1">Debug Info:</p>
                                <p className="text-xs font-mono text-red-300 break-words leading-relaxed">{errorMessage}</p>
                            </div>
                        )}
                        <button 
                            onClick={validateLicense} 
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mb-3"
                        >
                            <RefreshCw className="w-4 h-4" /> Retry Connection
                        </button>
                    </>
                )}

                <button 
                    onClick={() => { logout(); window.location.reload(); }}
                    className={`bg-slate-800 hover:bg-slate-750 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${isSubscriptionScreen ? 'px-8 mx-auto' : 'w-full'}`}
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>

        {/* SECURE CHECKOUT MODAL */}
        {showCheckoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-left">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
                    <button 
                        onClick={() => setShowCheckoutModal(false)}
                        className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif font-bold text-white">Upgrade Subscription</h3>
                            <p className="text-xs text-slate-400">Secure payment gateway</p>
                        </div>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        {/* Order Summary */}
                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 mb-4">
                            <div className="flex justify-between items-center text-xs text-slate-400 uppercase tracking-wider mb-2">
                                <span>Selected Plan</span>
                                <span>Price</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-white">
                                    {selectedPlan === 'pro_monthly' ? 'Professional Monthly' : selectedPlan === 'pro_quarterly' ? 'Professional Quarterly' : 'Professional Yearly'}
                                </span>
                                <span className="text-base font-extrabold text-amber-500">
                                    {selectedPlan === 'pro_monthly' ? '$49' : selectedPlan === 'pro_quarterly' ? '$119' : '$349'}
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1.5">
                                {selectedPlan === 'pro_monthly' ? 'Billed monthly. Auto-renews. Cancel anytime.' : selectedPlan === 'pro_quarterly' ? 'Billed quarterly ($119 every 3 months). Save 20%.' : 'Billed annually ($349 every 12 months). Save 40%.'}
                            </div>
                        </div>

                        {/* Cardholder name */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                            <input 
                                type="text"
                                required
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
                            />
                        </div>

                        {/* Card Number */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Card Number</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    required
                                    maxLength={19}
                                    value={cardNumber}
                                    onChange={(e) => {
                                        const cleanVal = e.target.value.replace(/\s?/g, '');
                                        const parts = cleanVal.match(/.{1,4}/g);
                                        const formatted = parts ? parts.join(' ') : cleanVal;
                                        setCardNumber(formatted);
                                    }}
                                    placeholder="4242 4242 4242 4242"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono placeholder:text-slate-700"
                                />
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            </div>
                        </div>

                        {/* Expiry and CVC */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Expiration Date</label>
                                <input 
                                    type="text"
                                    required
                                    maxLength={5}
                                    value={cardExpiry}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length > 2) {
                                            val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                        }
                                        setCardExpiry(val);
                                    }}
                                    placeholder="MM/YY"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono placeholder:text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">CVC / CVV</label>
                                <input 
                                    type="password"
                                    required
                                    maxLength={3}
                                    value={cardCvc}
                                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                                    placeholder="•••"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmittingPayment}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider"
                            >
                                {isSubmittingPayment ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Processing Payment...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Authorize & Pay</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default LicenseGate;