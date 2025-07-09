import { firestore } from '@/firebase'; // Assuming your Firebase setup is here
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export type AnalyticsEvent =
  | 'app_opened'
  | 'guest_session_started'
  | 'user_signed_up'
  | 'user_logged_in'
  | 'server_config_generated' // When config.json (server) is downloaded
  | 'client_config_generated' // When VLESS link/QR is shown
  | 'ip_scan_started'
  | 'ip_selected_from_scan'
  | 'connection_test_run'
  | 'deployment_script_downloaded';

interface AnalyticsData {
  event: AnalyticsEvent;
  timestamp: Timestamp;
  userId?: string; // Firebase User UID
  isAnonymous?: boolean;
  locale?: string; // e.g., 'en', 'fa'
  sessionId?: string; // Optional: if you implement session tracking
  eventData?: Record<string, any>; // Any additional data specific to the event
}

// Simple session ID generator (for demo purposes, not robust for production uniqueness)
const getSessionId = (): string => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    let sessionId = window.sessionStorage.getItem('analyticsSessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      window.sessionStorage.setItem('analyticsSessionId', sessionId);
    }
    return sessionId;
  }
  return `server_session_${Date.now()}`; // Fallback for non-browser
};


export const logAnalyticsEvent = async (
  event: AnalyticsEvent,
  currentUser: User | null,
  currentLocale: string, // 'en' | 'fa'
  eventData?: Record<string, any>
): Promise<void> => {
  try {
    const analyticsCollectionRef = collection(firestore, 'usage_analytics');

    const dataToLog: AnalyticsData = {
      event,
      timestamp: serverTimestamp() as Timestamp, // Firestore will set this on the server
      userId: currentUser?.uid,
      isAnonymous: currentUser?.isAnonymous || !currentUser, // Treat no user as anonymous for this log
      locale: currentLocale,
      sessionId: getSessionId(),
      eventData,
    };

    await addDoc(analyticsCollectionRef, dataToLog);
    console.log(`Analytics event logged: ${event}`, dataToLog);
  } catch (error) {
    console.error('Error logging analytics event:', error);
    // Fail silently in production for analytics, or have a more robust error handling/queueing
  }
};

// Example of how to call it:
// import { useAuth } from '@/contexts/AuthContext';
// import { useLanguage } from '@/contexts/LanguageContext';
// const { currentUser } = useAuth();
// const { locale } = useLanguage();
// logAnalyticsEvent('app_opened', currentUser, locale);
// logAnalyticsEvent('server_config_generated', currentUser, locale, { sni: 'example.com', port: 443 });
