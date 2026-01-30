import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BackendService } from '../services/backend'; 
import { generateDeviceFingerprint } from '../utils';
import { Loader2, ShieldAlert, MonitorX, Lock, LogOut, AlertTriangle, RefreshCw, WifiOff, Mail, ExternalLink, Ban } from 'lucide-react';

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

  useEffect(() => {
    if (authLoading) return;
    
    // 1. Check for Manual Admin Key override (Backdoor)
    const adminKey = localStorage.getItem('hrp_access_key');
    if (adminKey === 'ADMIN123') {
        onAdminAccess();
        return;
    }

    if (!user) {
        setLicenseState('checking'); 
        return;
    }

    // 2. Check for Admin Email
    if (user.email === ADMIN_EMAIL) {
        localStorage.setItem('hrp_access_key', 'ADMIN123'); // Persist admin session
        onAdminAccess();
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

  // --- RENDER STATES ---

  if (authLoading || licenseState === 'checking') {
      if (localStorage.getItem('hrp_access_key') === 'ADMIN123') return <>{children}</>;
      if (!user) return <>{children}</>; 
      if (user.email === ADMIN_EMAIL) return <>{children}</>;

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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                
                {/* 1. REVOKED ACCESS (Prioritized as requested) */}
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
                            onClick={() => contactSupport("Revoked License - Buying Pro")}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mb-3 shadow-lg shadow-emerald-900/20 transition-all"
                        >
                            <Mail className="w-4 h-4" /> Contact to Buy Pro
                        </button>
                        <p className="text-xs text-slate-500 mb-4 font-mono">{SUPPORT_EMAIL}</p>
                    </>
                )}

                {/* 2. EXPIRED / NO SUB */}
                {(licenseState === 'no_subscription' || licenseState === 'expired') && (
                    <>
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-500">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                             Trial Ended
                        </h2>
                        <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl mb-6">
                            <p className="text-blue-200 text-sm mb-1 font-medium">Your 7-day trial has expired.</p>
                            <p className="text-slate-400 text-xs">
                                To continue using RevenuePro with advanced financial modeling, please upgrade to a Pro plan.
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => contactSupport("Expired Trial - Upgrading")}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mb-3 shadow-lg shadow-blue-900/20 transition-all"
                        >
                            <Mail className="w-4 h-4" /> Contact Sales to Upgrade
                        </button>
                    </>
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
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>
    </div>
  );
};

export default LicenseGate;