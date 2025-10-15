'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { analytics, AnalyticsEvent, UserProperty } from '@/services/analytics';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export function useAnalytics() {
  const pathname = usePathname();
  const { publicKey, connected } = useWallet();
  const { preferences } = useUserPreferences();

  // Track page views
  useEffect(() => {
    if (pathname) {
      analytics.pageView(pathname);
    }
  }, [pathname]);

  // Track wallet connection
  useEffect(() => {
    if (connected && publicKey) {
      analytics.trackWalletConnected(publicKey.toString());
    } else if (!connected && publicKey) {
      analytics.trackWalletDisconnected();
    }
  }, [connected, publicKey]);

  // Track user preferences
  useEffect(() => {
    if (connected && publicKey) {
      analytics.setUserProperty(UserProperty.PREFERRED_VIEW_MODE, preferences.viewMode);
      analytics.setUserProperty(UserProperty.COLOR_MODE, preferences.colorMode);
    }
  }, [connected, publicKey, preferences.viewMode, preferences.colorMode]);

  return {
    trackRaffleCreated: analytics.trackRaffleCreated.bind(analytics),
    trackTicketPurchased: analytics.trackTicketPurchased.bind(analytics),
    trackRaffleEnded: analytics.trackRaffleEnded.bind(analytics),
    trackPrizeClaimed: analytics.trackPrizeClaimed.bind(analytics),
    trackFilterChanged: analytics.trackFilterChanged.bind(analytics),
    trackSortChanged: analytics.trackSortChanged.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPreferenceChanged: analytics.trackPreferenceChanged.bind(analytics),
  };
} 