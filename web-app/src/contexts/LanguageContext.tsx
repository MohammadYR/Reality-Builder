'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type Locale = 'en' | 'fa';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, section?: string) => string; // Translation function
}

// Define your translations here
// For a larger app, these would be in separate JSON files per language
const translations: Record<Locale, Record<string, any>> = {
  en: {
    common: {
      loading: 'Loading...',
      signInAsGuest: 'Enter as Guest',
      signOut: 'Sign Out',
      realityBuilder: 'Reality Builder',
      tagline: 'Automate your VLESS+Reality VPN configurations.',
      loggedInAs: 'Logged in as: {{email}}',
      guestMode: 'Currently in Guest Mode.',
      serverParams: '1. Server Parameters',
      clientConfig: '2. Client Configuration',
      deploymentScript: '3. Deployment Script',
      ipScanner: 'IP Scanner (Cloudflare)',
      connectionTester: 'Connection Tester',
      download: 'Download',
      generate: 'Generate',
      copy: 'Copy',
      copied: 'Copied!',
      error: 'Error',
      success: 'Success',
    },
    authForm: {
      login: 'Login',
      signUp: 'Sign Up',
      emailAddress: 'Email address',
      password: 'Password',
      processing: 'Processing...',
      needAccount: 'Need an account? Sign Up',
      haveAccount: 'Already have an account? Login',
      signInFailed: 'Failed to sign in. Please check your credentials.',
      signUpFailed: 'Failed to sign up. The email might already be in use or password is too weak.',
      signedUpSuccess: 'Signed up successfully! You are now logged in.',
      signedInSuccess: 'Signed in successfully!',
    },
    serverConfigForm: {
      vpsIp: 'VPS IP Address',
      vpsIpPlaceholder: 'e.g., 1.2.3.4',
      port: 'Port',
      uuid: 'UUID',
      publicKey: 'Public Key (x25519)',
      privateKey: 'Private Key (x25519)',
      regenerateKeys: 'Regenerate UUID & Keys',
      sni: 'Server Name Indication (SNI)',
      customSni: 'Custom SNI',
      customSniPlaceholder: 'e.g., yourdomain.com',
      requiredField: 'Required',
    },
    clientConfigOutput: {
        title: 'Client Configuration',
        vlessLink: 'VLESS Link:',
        qrCode: 'QR Code:',
        scanQr: 'Scan with your client app.',
        downloadQr: 'Download QR Code (.png)',
        serverConfigJson: 'Server `config.json`:',
        downloadServerConfig: 'Download Server config.json',
        cliSnippets: 'CLI Snippets:',
        cliSnippetsSoon: '(Coming soon: Copyable snippets for v2rayNG, Clash, Shadowrocket, etc.)',
        incompleteConfig: 'Server configuration not yet available or complete.',
        pleaseCompleteConfig: 'Please complete all required server settings (IP, Port, SNI) to generate client configs.',
    },
    deploymentScriptDownloader: {
        title: 'Deployment Script',
        downloadButton: 'Download install.sh (Linux/Systemd Template)',
        instructionsTitle: 'This is a template script. You\'ll need to:',
        instruction1: 'Review and customize it for your specific VPS environment.',
        instruction2: 'Ensure the downloaded server `config.json` (from Step 2) is placed at `/usr/local/etc/xray/config.json` on your server, or modify the script to fetch/include it.',
        dynamicNote: 'Dynamic script generation with your specific configuration values will be available in a future update.',
    },
    ipScanner: {
        title: 'IP Scanner (Cloudflare)',
        fetchError: 'Failed to fetch Cloudflare IP list. This might be a CORS issue if not using a proxy.',
        refetchButton: 'Re-fetch Cloudflare IP List',
        fetchingButton: 'Fetching IP List...',
        scanButton: 'Scan Top IPs (Max 10 for demo)',
        scanningButton: 'Scanning...',
        ipListEmpty: 'IP list is empty. Fetch IPs first.',
        scanNote: 'Note: Full scan tests a limited number of IPs from the fetched list for this demo. Actual scanning requires backend/CLI integration for `xray-knife`.',
        resultsTitle: 'Scan Results (SNI: {{sni}}):',
        ipHeader: 'IP',
        latencyHeader: 'Latency',
        lossHeader: 'Loss',
        realityOkHeader: 'Reality OK?',
        actionHeader: 'Action',
        statusOk: '✅ Yes',
        statusNo: '❌ No',
        statusNA: 'N/A',
        useThisIp: 'Use this IP',
    },
    connectionTester: {
        title: 'Connection Tester',
        runTestsButton: 'Run Connection Tests',
        testingButton: 'Testing...',
        incompleteConfigError: 'Please ensure server configuration (IP, Port, UUID, Public Key, SNI) is complete before testing.',
        testNamePing: 'Basic Connectivity (ping-like)',
        testPingSuccess: 'VPS seems reachable.',
        testPingFailure: 'VPS IP or Port might be unreachable.',
        testNameCurl: 'TLS Handshake & SNI Match (curl-like)',
        testCurlMissingParams: 'Missing IP, Port or SNI for test.',
        testCurlSuccess: 'TLS handshake successful with SNI.',
        testCurlFailure: 'TLS handshake or SNI match failed.',
        testCurlDetailsOk: 'Simulated: curl --resolve {{sni}}:{{port}}:{{ip}} https://{{sni}} -v OK',
        testCurlDetailsFail: 'Simulated: curl --resolve {{sni}}:{{port}}:{{ip}} https://{{sni}} -v FAILED (check SNI, port, firewall, or if Xray is running)',
        testNameXray: 'Xray Reality Probe (xray-knife)',
        testXrayMissingParams: 'Missing UUID or Public Key for test.',
        testXraySuccess: 'Xray Reality probe successful.',
        testXrayFailure: 'Xray Reality probe failed.',
        testXrayDetailsOk: 'Simulated: xray-knife probe reported OK.',
        testXrayDetailsFail: 'Simulated: xray-knife probe failed. Check Reality config, keys, UUID, SNI.',
        testStatusPending: 'Pending',
        testStatusRunning: 'Running',
        testStatusSuccess: 'Success',
        testStatusFailure: 'Failure',
        testStatusError: 'Error',
        testExecutionError: 'Test execution error',
        simulatedTestNote: 'Note: Tests are simulated. Actual testing requires backend/CLI integration for ping, curl, and xray-knife.',
    }
    // ... other sections like serverConfigForm, ipScanner etc.
  },
  fa: {
    common: {
      loading: 'در حال بارگذاری...',
      signInAsGuest: 'ورود به عنوان مهمان',
      signOut: 'خروج از حساب',
      realityBuilder: 'Reality Builder', // Name might remain in English or be translated
      tagline: 'پیکربندی‌های VLESS+Reality خود را خودکار کنید.',
      loggedInAs: 'وارد شده به عنوان: {{email}}',
      guestMode: 'در حال حاضر در حالت مهمان هستید.',
      serverParams: '۱. پارامترهای سرور',
      clientConfig: '۲. پیکربندی کلاینت',
      deploymentScript: '۳. اسکریپت راه‌اندازی',
      ipScanner: 'اسکنر IP (کلادفلر)',
      connectionTester: 'تست کننده اتصال',
      download: 'دانلود',
      generate: 'تولید',
      copy: 'کپی',
      copied: 'کپی شد!',
      error: 'خطا',
      success: 'موفقیت',
    },
    authForm: {
      login: 'ورود',
      signUp: 'ثبت نام',
      emailAddress: 'آدرس ایمیل',
      password: 'رمز عبور',
      processing: 'در حال پردازش...',
      needAccount: 'حساب کاربری ندارید؟ ثبت نام کنید',
      haveAccount: 'قبلاً ثبت نام کرده‌اید؟ وارد شوید',
      signInFailed: 'ورود ناموفق بود. لطفاً اطلاعات خود را بررسی کنید.',
      signUpFailed: 'ثبت نام ناموفق بود. ایمیل ممکن است قبلاً استفاده شده باشد یا رمز عبور ضعیف است.',
      signedUpSuccess: 'ثبت نام با موفقیت انجام شد! شما اکنون وارد شده‌اید.',
      signedInSuccess: 'ورود با موفقیت انجام شد!',
    },
    serverConfigForm: {
      vpsIp: 'آدرس IP سرور مجازی',
      vpsIpPlaceholder: 'مثال: 1.2.3.4',
      port: 'پورت',
      uuid: 'UUID',
      publicKey: 'کلید عمومی (x25519)',
      privateKey: 'کلید خصوصی (x25519)',
      regenerateKeys: 'تولید مجدد UUID و کلیدها',
      sni: 'Server Name Indication (SNI)',
      customSni: 'SNI سفارشی',
      customSniPlaceholder: 'مثال: yourdomain.com',
      requiredField: 'اجباری',
    },
    clientConfigOutput: {
        title: 'پیکربندی کلاینت',
        vlessLink: 'لینک VLESS:',
        qrCode: 'کد QR:',
        scanQr: 'با برنامه کلاینت خود اسکن کنید.',
        downloadQr: 'دانلود کد QR (.png)',
        serverConfigJson: 'فایل `config.json` سرور:',
        downloadServerConfig: 'دانلود config.json سرور',
        cliSnippets: 'اسنیپت‌های CLI:',
        cliSnippetsSoon: '(به زودی: اسنیپت‌های قابل کپی برای v2rayNG، Clash، Shadowrocket و غیره)',
        incompleteConfig: 'پیکربندی سرور هنوز کامل یا در دسترس نیست.',
        pleaseCompleteConfig: 'لطفاً تمام تنظیمات مورد نیاز سرور (IP، پورت، SNI) را برای تولید پیکربندی کلاینت کامل کنید.',
    },
    deploymentScriptDownloader: {
        title: 'اسکریپت راه‌اندازی',
        downloadButton: 'دانلود install.sh (قالب لینوکس/Systemd)',
        instructionsTitle: 'این یک اسکریپت نمونه است. شما باید:',
        instruction1: 'آن را بررسی و برای محیط VPS خاص خود سفارشی کنید.',
        instruction2: 'اطمینان حاصل کنید که فایل `config.json` سرور دانلود شده (از مرحله ۲) در مسیر `/usr/local/etc/xray/config.json` سرور شما قرار گرفته یا اسکریپت را برای دریافت/شامل کردن آن تغییر دهید.',
        dynamicNote: 'تولید اسکریپت پویا با مقادیر پیکربندی خاص شما در به‌روزرسانی آینده در دسترس خواهد بود.',
    },
     ipScanner: {
        title: 'اسکنر IP (کلادفلر)',
        fetchError: 'خطا در دریافت لیست IP کلادفلر. ممکن است به دلیل مشکل CORS باشد اگر از پراکسی استفاده نمی‌کنید.',
        refetchButton: 'دریافت مجدد لیست IP کلادفلر',
        fetchingButton: 'در حال دریافت لیست IP...',
        scanButton: 'اسکن IPهای برتر (حداکثر ۱۰ برای دمو)',
        scanningButton: 'در حال اسکن...',
        ipListEmpty: 'لیست IP خالی است. ابتدا IPها را دریافت کنید.',
        scanNote: 'توجه: اسکن کامل تعداد محدودی از IPهای دریافت شده را برای این دمو آزمایش می‌کند. اسکن واقعی نیازمند یکپارچه‌سازی با بک‌اند/CLI برای `xray-knife` است.',
        resultsTitle: 'نتایج اسکن (SNI: {{sni}}):',
        ipHeader: 'IP',
        latencyHeader: 'تأخیر',
        lossHeader: 'Packet Loss',
        realityOkHeader: 'Reality سالم است؟',
        actionHeader: 'عملیات',
        statusOk: '✅ بله',
        statusNo: '❌ خیر',
        statusNA: 'N/A',
        useThisIp: 'استفاده از این IP',
    },
    connectionTester: {
        title: 'تست کننده اتصال',
        runTestsButton: 'اجرای تست‌های اتصال',
        testingButton: 'در حال تست...',
        incompleteConfigError: 'لطفاً قبل از تست، از کامل بودن پیکربندی سرور (IP، پورت، UUID، کلید عمومی، SNI) اطمینان حاصل کنید.',
        testNamePing: 'اتصال پایه (مشابه پینگ)',
        testPingSuccess: 'به نظر می‌رسد سرور مجازی در دسترس است.',
        testPingFailure: 'IP یا پورت سرور مجازی ممکن است غیرقابل دسترس باشد.',
        testNameCurl: 'TLS Handshake و تطابق SNI (مشابه curl)',
        testCurlMissingParams: 'IP، پورت یا SNI برای تست موجود نیست.',
        testCurlSuccess: 'TLS handshake با SNI موفقیت‌آمیز بود.',
        testCurlFailure: 'TLS handshake یا تطابق SNI ناموفق بود.',
        testCurlDetailsOk: 'شبیه‌سازی شده: curl --resolve {{sni}}:{{port}}:{{ip}} https://{{sni}} -v موفق',
        testCurlDetailsFail: 'شبیه‌سازی شده: curl --resolve {{sni}}:{{port}}:{{ip}} https://{{sni}} -v ناموفق (SNI، پورت، فایروال یا اجرای Xray را بررسی کنید)',
        testNameXray: 'پروب Xray Reality (xray-knife)',
        testXrayMissingParams: 'UUID یا کلید عمومی برای تست موجود نیست.',
        testXraySuccess: 'پروب Xray Reality موفقیت‌آمیز بود.',
        testXrayFailure: 'پروب Xray Reality ناموفق بود.',
        testXrayDetailsOk: 'شبیه‌سازی شده: xray-knife probe گزارش OK داد.',
        testXrayDetailsFail: 'شبیه‌سازی شده: xray-knife probe ناموفق بود. پیکربندی Reality، کلیدها، UUID، SNI را بررسی کنید.',
        testStatusPending: 'در انتظار',
        testStatusRunning: 'در حال اجرا',
        testStatusSuccess: 'موفق',
        testStatusFailure: 'ناموفق',
        testStatusError: 'خطا',
        testExecutionError: 'خطا در اجرای تست',
        simulatedTestNote: 'توجه: تست‌ها شبیه‌سازی شده‌اند. تست واقعی نیازمند یکپارچه‌سازی با بک‌اند/CLI برای پینگ، curl و xray-knife است.',
    }
    // ... other sections
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en'); // Default to English

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newLocale === 'fa' ? 'rtl' : 'ltr';
    }
  }, []);

  useEffect(() => {
    // Set initial lang and dir
    if (typeof document !== 'undefined') {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
    }
  }, [locale]);


  // Simple translation function, can be improved with nested keys and parameter substitution
  const t = useCallback((key: string, section: string = 'common') => {
    const sectionTranslations = translations[locale][section] || translations[locale]['common'];
    let translation = sectionTranslations[key] || key;

    // Basic {{variable}} replacement
    if (typeof arguments[2] === 'object') {
        const params = arguments[2] as Record<string, string | number>;
        Object.keys(params).forEach(paramKey => {
            translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(params[paramKey]));
        });
    }
    return translation;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
