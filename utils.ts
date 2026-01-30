
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number, decimals = 1): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  return Number(value.replace(/[^0-9.-]+/g, ""));
};

// Deterministic Device Fingerprinting
// In a real production app, use a library like 'fingerprintjs'. 
// This is a robust manual implementation for this scope.
export const generateDeviceFingerprint = async (): Promise<{hash: string, details: string}> => {
    const nav = window.navigator;
    const screen = window.screen;

    // Components to hash
    const components = [
        nav.userAgent,
        nav.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        nav.hardwareConcurrency || 'unknown',
        // @ts-ignore
        nav.deviceMemory || 'unknown',
    ];

    const rawString = components.join('||');
    
    // Generate SHA-256 Hash
    const msgBuffer = new TextEncoder().encode(rawString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Readable label
    const isMobile = /Mobi|Android/i.test(nav.userAgent);
    const platform = nav.platform.split(' ')[0];
    const browser = nav.userAgent.includes('Chrome') ? 'Chrome' : 
                    nav.userAgent.includes('Firefox') ? 'Firefox' : 
                    nav.userAgent.includes('Safari') ? 'Safari' : 'Browser';
    
    const details = `${browser} on ${platform} ${isMobile ? '(Mobile)' : '(Desktop)'}`;

    return {
        hash: hashHex,
        details
    };
};
