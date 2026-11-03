import { useState, useEffect, useRef, useCallback } from 'react';
import { db, DEFAULT_SESSION_SETTINGS, SessionSettingsConfig } from '../data/mockDatabase';
import { ActiveUserSession, RegularUser, BusinessProfile } from '../types';

interface UseSessionManagerProps {
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  currentSessionToken: string | null;
  envMode: 'LIVE' | 'TESTING';
  onLogout: () => void;
  onSessionNotice?: (msg: string) => void;
}

const STORAGE_ACTIVE_SESSION_KEY = 'truvaer_active_session_payload';
const STORAGE_PING_EVENT_KEY = 'truvaer_session_cross_tab_ping';
const BROADCAST_CHANNEL_NAME = 'truvaer_session_cross_tab_sync';

export function useSessionManager({
  currentUser,
  currentBusiness,
  currentSessionToken,
  envMode,
  onLogout,
  onSessionNotice,
}: UseSessionManagerProps) {
  const [sessionSettings, setSessionSettings] = useState<SessionSettingsConfig>(() =>
    db.getSessionSettings()
  );
  const [activeSession, setActiveSession] = useState<ActiveUserSession | null>(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(180);
  const [isExtending, setIsExtending] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const lastPingRef = useRef<number>(0);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const isDemoTriggerRef = useRef(false);

  // Initialize broadcast channel for zero-latency multi-tab sync
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannelRef.current = bc;

        bc.onmessage = (event) => {
          const data = event.data;
          if (!data) return;

          if (data.type === 'SESSION_PING' || data.type === 'SESSION_STAY_LOGGED_IN') {
            lastActivityRef.current = data.lastActiveAt || Date.now();
            setIsWarningModalOpen(false);
            isDemoTriggerRef.current = false;
            if (activeSession) {
              setActiveSession((prev) =>
                prev
                  ? {
                      ...prev,
                      lastActiveAt: lastActivityRef.current,
                      expiresAt:
                        lastActivityRef.current +
                        (prev.idleTimeoutMinutes || 45) * 60 * 1000,
                    }
                  : null
              );
            }
          } else if (data.type === 'SESSION_LOGOUT') {
            setIsWarningModalOpen(false);
            onLogout();
          } else if (data.type === 'SESSION_SETTINGS_UPDATE' && data.settings) {
            setSessionSettings(data.settings);
          }
        };

        return () => {
          bc.close();
        };
      } catch {
        // Fallback to storage event
      }
    }
  }, [activeSession, onLogout]);

  // Fallback storage event listener for cross-tab sync in older/restricted environments
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_PING_EVENT_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.type === 'SESSION_PING' || data.type === 'SESSION_STAY_LOGGED_IN') {
            lastActivityRef.current = data.lastActiveAt || Date.now();
            setIsWarningModalOpen(false);
            isDemoTriggerRef.current = false;
          } else if (data.type === 'SESSION_LOGOUT') {
            setIsWarningModalOpen(false);
            onLogout();
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, [onLogout]);

  // Keep activeSession in sync with current user/business login
  useEffect(() => {
    const activeIdentity = currentUser || currentBusiness;
    if (!activeIdentity || !currentSessionToken) {
      setActiveSession(null);
      setIsWarningModalOpen(false);
      try {
        sessionStorage.removeItem(STORAGE_ACTIVE_SESSION_KEY);
      } catch {}
      return;
    }

    const userType = currentUser ? 'regular' : 'business';
    const displayName = currentUser
      ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() ||
        currentUser.username
      : (currentBusiness as BusinessProfile).organization_name;
    const email = currentUser
      ? currentUser.email
      : (currentBusiness as BusinessProfile).business_email || 'corporate@truvaer.com';
    const role = currentUser
      ? currentUser.role || 'Aviator'
      : (currentBusiness as BusinessProfile).category || 'Corporate Aviation Entity';

    const session = db.registerActiveSession({
      token: currentSessionToken,
      userId: currentUser?.user_id,
      businessId: currentBusiness?.business_id,
      userType,
      displayName,
      email,
      role,
      deviceInfo: navigator.userAgent.includes('Mac')
        ? 'Mac OS • Chrome Aerospace Terminal'
        : 'Windows/Linux • Web Application Terminal',
    });

    setActiveSession(session);
    lastActivityRef.current = Date.now();
    lastPingRef.current = Date.now();

    try {
      sessionStorage.setItem(
        STORAGE_ACTIVE_SESSION_KEY,
        JSON.stringify({
          token: currentSessionToken,
          userId: currentUser?.user_id,
          businessId: currentBusiness?.business_id,
          userType,
          lastActiveAt: Date.now(),
        })
      );
    } catch {}
  }, [currentUser, currentBusiness, currentSessionToken]);

  // Background Keep-Alive Ping function
  const triggerKeepAlive = useCallback(
    (reason: string = 'USER_INTERACTION') => {
      if (!currentSessionToken || (!currentUser && !currentBusiness)) return;

      const now = Date.now();
      lastActivityRef.current = now;
      lastPingRef.current = now;

      // Call database keep-alive API endpoint
      const res = db.keepAliveSession(currentSessionToken);

      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              lastActiveAt: res.lastActiveAt,
              expiresAt: res.expiresAt,
            }
          : null
      );

      // Broadcast to other open tabs
      const pingPayload = {
        type: 'SESSION_PING',
        token: currentSessionToken,
        lastActiveAt: now,
        expiresAt: res.expiresAt,
        reason,
      };

      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(pingPayload);
        } catch {}
      }

      try {
        localStorage.setItem(STORAGE_PING_EVENT_KEY, JSON.stringify(pingPayload));
      } catch {}
    },
    [currentSessionToken, currentUser, currentBusiness]
  );

  // Manual 'Stay Logged In' handler
  const stayLoggedIn = useCallback(() => {
    setIsExtending(true);
    triggerKeepAlive('MANUAL_EXTENSION');
    setIsWarningModalOpen(false);
    isDemoTriggerRef.current = false;

    // Send cross-tab notification
    const stayPayload = {
      type: 'SESSION_STAY_LOGGED_IN',
      token: currentSessionToken,
      lastActiveAt: Date.now(),
    };

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(stayPayload);
      } catch {}
    }

    try {
      localStorage.setItem(STORAGE_PING_EVENT_KEY, JSON.stringify(stayPayload));
    } catch {}

    setTimeout(() => {
      setIsExtending(false);
    }, 400);
  }, [triggerKeepAlive, currentSessionToken]);

  // Listen for user interactions (scrolling, typing, mouse movement, clicks)
  useEffect(() => {
    if (!currentUser && !currentBusiness) return;

    const THROTTLE_MS = (sessionSettings.keepAlivePingIntervalSeconds || 20) * 1000;

    const handleUserActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;

      // If warning modal was open, user activity auto-refreshes session and dismisses warning
      if (isWarningModalOpen && !isDemoTriggerRef.current) {
        setIsWarningModalOpen(false);
        triggerKeepAlive('ACTIVITY_DISMISS_WARNING');
        return;
      }

      // Throttled background keep-alive ping
      if (now - lastPingRef.current >= THROTTLE_MS) {
        triggerKeepAlive('THROTTLED_INTERACTION');
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'wheel', 'click'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [currentUser, currentBusiness, sessionSettings, isWarningModalOpen, triggerKeepAlive]);

  // Handle Tab Visibility & Wake from Sleep
  useEffect(() => {
    if (!currentUser && !currentBusiness) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const elapsed = now - lastActivityRef.current;
        const totalTimeoutMs = (sessionSettings.idleTimeoutMinutes || 45) * 60 * 1000;

        if (elapsed >= totalTimeoutMs) {
          // Device woke up after long sleep / tab suspension exceeding timeout
          onLogout();
          if (onSessionNotice) {
            onSessionNotice(
              `⚠️ Session Expired: Your session timed out after ${sessionSettings.idleTimeoutMinutes || 45} minutes of inactivity while your device or tab was suspended.`
            );
          }
        } else {
          // Tab became visible and still valid: send keep-alive ping immediately
          triggerKeepAlive('TAB_FOCUSED');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, currentBusiness, sessionSettings, onLogout, onSessionNotice, triggerKeepAlive]);

  // Main Session Heartbeat Clock (Checks wall-clock Date.now() every second)
  useEffect(() => {
    if (!currentUser && !currentBusiness) {
      setIsWarningModalOpen(false);
      return;
    }

    const interval = setInterval(() => {
      // If demo mode preview is running, decrement demo timer
      if (isDemoTriggerRef.current) {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            isDemoTriggerRef.current = false;
            setIsWarningModalOpen(false);
            onLogout();
            if (onSessionNotice) {
              onSessionNotice('⚠️ Session auto-logged out due to idle timeout.');
            }
            return 0;
          }
          return prev - 1;
        });
        return;
      }

      const now = Date.now();
      const elapsedMs = now - lastActivityRef.current;
      const totalTimeoutMs = (sessionSettings.idleTimeoutMinutes || 45) * 60 * 1000;
      const warningWindowMs = (sessionSettings.warningMinutes || 3) * 60 * 1000;
      const remainingMs = totalTimeoutMs - elapsedMs;

      if (remainingMs <= 0) {
        // Inactivity timeout exceeded!
        setIsWarningModalOpen(false);
        onLogout();
        if (onSessionNotice) {
          onSessionNotice(
            `⚠️ Session Auto-Logout: You have been safely logged out after ${sessionSettings.idleTimeoutMinutes || 45} minutes of inactivity to protect your account.`
          );
        }
      } else if (remainingMs <= warningWindowMs) {
        // Within the warning threshold (e.g. last 3 minutes / 180 seconds)
        setIsWarningModalOpen(true);
        setRemainingSeconds(Math.max(1, Math.ceil(remainingMs / 1000)));
      } else {
        // Still plenty of time
        if (isWarningModalOpen) {
          setIsWarningModalOpen(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser, currentBusiness, sessionSettings, isWarningModalOpen, onLogout, onSessionNotice]);

  // Trigger Demo / Preview of warning modal (for QA, testing, and edge case verification)
  const triggerWarningModalDemo = useCallback((mockSeconds: number = 179) => {
    isDemoTriggerRef.current = true;
    setRemainingSeconds(mockSeconds);
    setIsWarningModalOpen(true);
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<SessionSettingsConfig>) => {
      const updated = db.updateSessionSettings(newSettings);
      setSessionSettings(updated);

      const payload = {
        type: 'SESSION_SETTINGS_UPDATE',
        settings: updated,
      };

      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(payload);
        } catch {}
      }
    },
    []
  );

  return {
    activeSession,
    sessionSettings,
    isWarningModalOpen,
    remainingSeconds,
    totalWarningSeconds: (sessionSettings.warningMinutes || 3) * 60,
    isExtending,
    stayLoggedIn,
    triggerKeepAlive,
    triggerWarningModalDemo,
    updateSettings,
    closeWarningModal: () => setIsWarningModalOpen(false),
  };
}
