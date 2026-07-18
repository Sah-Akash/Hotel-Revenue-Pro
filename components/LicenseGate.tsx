import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BackendService } from '../services/backend'; 
import { generateDeviceFingerprint } from '../utils';
import { Loader2, ShieldAlert, MonitorX, Lock, LogOut, AlertTriangle, RefreshCw, WifiOff, Mail, ExternalLink, Ban, Sparkles, Check, CreditCard, X, ShieldCheck, Copy, Clock, Send } from 'lucide-react';

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
  
  // UPI / Manual verification states
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentSubmittedAt, setPaymentSubmittedAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins
  const [isCopied, setIsCopied] = useState(false);
  const [isUidCopied, setIsUidCopied] = useState(false);

  // Checkout Form Details (Kept for backwards compatibility but not used in UPI)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Load payment pending state on mount / user change
  useEffect(() => {
    if (!user) return;
    const pending = localStorage.getItem(`hrp_payment_pending_${user.uid}`) === 'true';
    const submittedAtStr = localStorage.getItem(`hrp_payment_submitted_at_${user.uid}`);
    if (pending && submittedAtStr) {
        const submittedAt = parseInt(submittedAtStr, 10);
        const elapsed = Math.floor((Date.now() - submittedAt) / 1000);
        if (elapsed < 900) {
            setPaymentPending(true);
            setPaymentSubmittedAt(submittedAt);
            setTimeLeft(900 - elapsed);
        } else {
            setPaymentPending(true);
            setPaymentSubmittedAt(submittedAt);
            setTimeLeft(0);
        }
    } else {
        setPaymentPending(false);
        setPaymentSubmittedAt(null);
    }
  }, [user]);

  // Handle countdown interval
  useEffect(() => {
    if (!paymentPending || !paymentSubmittedAt) return;
    
    const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - paymentSubmittedAt) / 1000);
        const remaining = 900 - elapsed;
        if (remaining <= 0) {
            setTimeLeft(0);
            clearInterval(interval);
        } else {
            setTimeLeft(remaining);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentPending, paymentSubmittedAt]);

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
            // Clear pending payment states since user is now active!
            localStorage.removeItem(`hrp_payment_pending_${user.uid}`);
            localStorage.removeItem(`hrp_payment_submitted_at_${user.uid}`);
            localStorage.removeItem(`hrp_pending_plan_${user.uid}`);
            setPaymentPending(false);
            setPaymentSubmittedAt(null);
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

  const handlePaymentDone = () => {
      if (!user) return;
      setIsSubmittingPayment(true);

      const planName = selectedPlan === 'pro_monthly' 
          ? 'Professional Monthly (₹99)' 
          : selectedPlan === 'pro_quarterly' 
              ? 'Professional Quarterly Plus (₹237)' 
              : 'Professional Yearly Plus (₹588)';

      const subject = `Hotel Revenue Pro Activation - Payment Completed`;
      const body = `Hi Admin,\n\nI have successfully completed the payment of ${planName} via UPI to akashsah17-4@okhdfcbank.\n\nPlease activate my subscription.\n\nMy Account Details:\n- Email Address: ${user.email}\n- User ID: ${user.uid}\n- Selected Plan: ${selectedPlan}\n\n[Please attach a screenshot of your UPI payment receipt here]\n\nThank you!`;

      // Redirect to their default email client with all pre-filled details
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Save to localStorage so state persists across reloads
      const now = Date.now();
      localStorage.setItem(`hrp_payment_pending_${user.uid}`, 'true');
      localStorage.setItem(`hrp_payment_submitted_at_${user.uid}`, now.toString());
      localStorage.setItem(`hrp_pending_plan_${user.uid}`, selectedPlan);

      setPaymentPending(true);
      setPaymentSubmittedAt(now);
      setTimeLeft(900); // Reset timer to 15 minutes (900 seconds)
      setShowCheckoutModal(false);
      setIsSubmittingPayment(false);
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

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (paymentPending && user) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md text-center shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 animate-pulse">
                          <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                      
                      <h2 className="text-2xl font-serif font-bold text-white mb-2">Activation Pending</h2>
                      <p className="text-slate-400 text-sm mb-6">
                          Our admin is verifying your UPI payment. Your subscription will be activated shortly.
                      </p>

                      {/* Timer */}
                      <div className="bg-slate-950/80 border border-slate-850 px-6 py-4 rounded-2xl w-full mb-6 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Expected Activation Within</p>
                          <div className="text-4xl font-mono font-extrabold text-amber-500 tracking-wider">
                              {timeLeft > 0 ? formatTime(timeLeft) : "00:00"}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2">
                              {timeLeft > 0 ? "Please do not close this page." : "Taking longer than usual. Admin is checking now!"}
                          </p>
                      </div>

                      {/* User ID Box */}
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 w-full text-left mb-6">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Your User ID</p>
                          <div className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-850/50 font-mono text-xs text-indigo-300 select-all">
                              <span className="truncate">{user.uid}</span>
                              <button 
                                  onClick={() => {
                                      navigator.clipboard.writeText(user.uid);
                                      setIsUidCopied(true);
                                      setTimeout(() => setIsUidCopied(false), 2000);
                                  }}
                                  className="text-slate-500 hover:text-white shrink-0 p-1 hover:bg-slate-850 rounded transition-all"
                                  title="Copy User ID"
                              >
                                  {isUidCopied ? <span className="text-[10px] text-emerald-400 font-sans font-semibold">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2">
                              Send this ID to support if you haven't done so.
                          </p>
                      </div>

                      {/* Actions */}
                      <div className="space-y-3 w-full">
                          <button 
                              onClick={validateLicense}
                              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-950/40 text-sm"
                          >
                              <RefreshCw className="w-4 h-4" /> Verify Activation Now
                          </button>

                          <button 
                              onClick={() => {
                                  const planName = localStorage.getItem(`hrp_pending_plan_${user.uid}`) || 'pro_monthly';
                                  const fullPlanName = planName === 'pro_monthly' ? 'Professional Monthly (₹99)' : planName === 'pro_quarterly' ? 'Professional Quarterly Plus (₹237)' : 'Professional Yearly Plus (₹588)';
                                  const subject = `Hotel Revenue Pro Activation - Payment Completed`;
                                  const body = `Hi Admin,\n\nI have successfully completed the payment of ${fullPlanName} via UPI to akashsah17-4@okhdfcbank.\n\nPlease activate my subscription.\n\nMy Account Details:\n- Email Address: ${user.email}\n- User ID: ${user.uid}\n\n[Please attach a screenshot of your UPI payment receipt here]\n\nThank you!`;
                                  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                              }}
                              className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs"
                          >
                              <Send className="w-3.5 h-3.5" /> Re-send Payment Details (Email)
                          </button>

                          <div className="pt-2 border-t border-slate-800/60 mt-4 flex gap-3 justify-center">
                              <button 
                                  onClick={() => {
                                      if (confirm("Are you sure you want to cancel this pending activation window?")) {
                                          localStorage.removeItem(`hrp_payment_pending_${user.uid}`);
                                          localStorage.removeItem(`hrp_payment_submitted_at_${user.uid}`);
                                          localStorage.removeItem(`hrp_pending_plan_${user.uid}`);
                                          setPaymentPending(false);
                                      }
                                  }}
                                  className="text-[11px] text-slate-500 hover:text-slate-400 font-medium"
                              >
                                  Cancel Request
                              </button>
                              <span className="text-slate-800">•</span>
                              <button 
                                  onClick={() => logout()}
                                  className="text-[11px] text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                              >
                                  <LogOut className="w-3 h-3" /> Sign Out
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
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
                                    price: '₹99',
                                    period: 'month',
                                    billing: 'Billed monthly. Cancel anytime.',
                                    savings: null,
                                    badge: null,
                                    color: 'border-slate-850 bg-slate-950/40',
                                    features: [
                                        'Dual-Perspective Underwriting',
                                        'Hybrid Share & Min Guarantee Calc',
                                        'Reverse Deal-Sizing Simulation',
                                        'Standard PDF & CSV Exports',
                                        'Real-time Deal Strength Score (DSS)'
                                    ]
                                },
                                {
                                    id: 'pro_quarterly',
                                    name: 'Professional Quarterly Plus',
                                    price: '₹79',
                                    period: 'month',
                                    billing: 'Billed ₹237 every 3 months.',
                                    savings: 'Save 20%',
                                    badge: 'Most Popular',
                                    color: 'border-indigo-500/30 bg-indigo-950/10 shadow-[0_4px_30px_rgba(99,102,241,0.05)]',
                                    features: [
                                        'Everything in Monthly plan',
                                        'Plus Benefit: Multi-Scenario Comparisons (Up to 3 deals side-by-side)',
                                        'Plus Benefit: Custom Deal-Sizing Goal Suggestions',
                                        'Plus Benefit: Premium Executive PDF Layouts',
                                        'Priority Email Customer Support'
                                    ]
                                },
                                {
                                    id: 'pro_yearly',
                                    name: 'Professional Yearly Plus',
                                    price: '₹49',
                                    period: 'month',
                                    billing: 'Billed ₹588 every 12 months.',
                                    savings: 'Save 50%',
                                    badge: 'Best Value',
                                    color: 'border-amber-500/30 bg-amber-950/10 shadow-[0_4px_30px_rgba(245,158,11,0.05)]',
                                    features: [
                                        'Everything in Monthly & Quarterly plans',
                                        'Plus Benefit: Dynamic Holiday Seasonality Curve Modeler',
                                        'Plus Benefit: White-label Report Branding (Insert your custom resort logo)',
                                        'Plus Benefit: Priority Live Expert Underwriting Audits',
                                        'VIP 24/7 Phone & Zoom Support'
                                    ]
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
                                            {plan.features.map((feat, i) => (
                                                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                                                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span className={feat.startsWith('Plus Benefit:') ? "font-semibold text-indigo-300" : ""}>{feat}</span>
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

        {/* SECURE CHECKOUT MODAL (UPI INTERACTION) */}
        {showCheckoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-left">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 text-white">
                    <button 
                        onClick={() => setShowCheckoutModal(false)}
                        className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-lg font-serif font-bold text-white">Complete UPI Payment</h3>
                            <p className="text-xs text-slate-400">Direct instant manual activation</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Order Summary */}
                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
                            <div className="flex justify-between items-center text-xs text-slate-400 uppercase tracking-wider mb-2">
                                <span>Selected Plan</span>
                                <span>Amount Payable</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-white">
                                    {selectedPlan === 'pro_monthly' ? 'Professional Monthly' : selectedPlan === 'pro_quarterly' ? 'Professional Quarterly Plus' : 'Professional Yearly Plus'}
                                </span>
                                <span className="text-base font-extrabold text-amber-500">
                                    {selectedPlan === 'pro_monthly' ? '₹99' : selectedPlan === 'pro_quarterly' ? '₹237' : '₹588'}
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1.5">
                                {selectedPlan === 'pro_monthly' ? 'Billed monthly. Auto-renews. Cancel anytime.' : selectedPlan === 'pro_quarterly' ? 'Billed quarterly (₹237 every 3 months). Save 20%.' : 'Billed annually (₹588 every 12 months). Save 50%.'}
                            </div>
                        </div>

                        {/* UPI Copy Box */}
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Recipient UPI ID</label>
                            <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-sm text-amber-400 select-all">
                                <span className="truncate font-semibold">akashsah17-4@okhdfcbank</span>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText("akashsah17-4@okhdfcbank");
                                        setIsCopied(true);
                                        setTimeout(() => setIsCopied(false), 2000);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 transition-all"
                                    title="Copy UPI ID"
                                >
                                    {isCopied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-emerald-400 text-[11px] font-bold">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Payment Instructions */}
                        <div className="text-xs text-slate-300 space-y-2.5 bg-slate-950/20 p-4 rounded-2xl border border-slate-850/40">
                            <p className="font-bold text-slate-200">How to pay:</p>
                            <ol className="list-decimal pl-4 space-y-1.5 text-slate-400">
                                <li><strong>Copy</strong> the UPI ID shown above.</li>
                                <li>Open any UPI app (e.g. <strong>GPay, PhonePe, Paytm, BHIM</strong>).</li>
                                <li>Pay the exact amount of <strong className="text-amber-500">{selectedPlan === 'pro_monthly' ? '₹99' : selectedPlan === 'pro_quarterly' ? '₹237' : '₹588'}</strong> to this address.</li>
                                <li>Once transaction completes, click <strong>Payment Done</strong> below.</li>
                            </ol>
                        </div>

                        <div className="pt-2 text-center text-[11px] text-slate-400/80 leading-relaxed">
                            ⚠️ Clicking "Payment Done" will redirect you to email your <strong>User ID</strong> and payment proof so we can manually activate your subscription. A 15-minute countdown timer will start.
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handlePaymentDone}
                                disabled={isSubmittingPayment}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider"
                            >
                                {isSubmittingPayment ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Recording Payment...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Payment Done (Activate My Account)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default LicenseGate;