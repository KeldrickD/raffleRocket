'use client';

import mixpanel from 'mixpanel-browser';

// Initialize with your project token
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';

// Analytics event types
export enum AnalyticsEvent {
  PAGE_VIEW = 'Page View',
  WALLET_CONNECTED = 'Wallet Connected',
  WALLET_DISCONNECTED = 'Wallet Disconnected',
  RAFFLE_CREATED = 'Raffle Created',
  TICKETS_PURCHASED = 'Tickets Purchased',
  RAFFLE_ENDED = 'Raffle Ended',
  PRIZE_CLAIMED = 'Prize Claimed',
  FILTER_CHANGED = 'Filter Changed',
  SORT_CHANGED = 'Sort Changed',
  SEARCH_PERFORMED = 'Search Performed',
  ERROR_OCCURRED = 'Error Occurred',
  PREFERENCE_CHANGED = 'Preference Changed',
}

// User properties we collect
export enum UserProperty {
  WALLET_ADDRESS = 'Wallet Address',
  TOTAL_RAFFLES_CREATED = 'Total Raffles Created',
  TOTAL_TICKETS_PURCHASED = 'Total Tickets Purchased',
  TOTAL_SOL_SPENT = 'Total SOL Spent',
  PRIZES_WON = 'Prizes Won',
  PREFERRED_VIEW_MODE = 'Preferred View Mode',
  COLOR_MODE = 'Color Mode',
}

class AnalyticsService {
  private initialized = false;

  init() {
    if (MIXPANEL_TOKEN && typeof window !== 'undefined') {
      mixpanel.init(MIXPANEL_TOKEN, { debug: process.env.NODE_ENV !== 'production' });
      this.initialized = true;
      console.log('Analytics initialized');
    } else {
      console.warn('Analytics disabled: No Mixpanel token provided');
    }
  }

  // Identify user by wallet address
  identify(walletAddress: string) {
    if (!this.initialized) return;
    
    // Set the distinct ID for this user
    mixpanel.identify(walletAddress);
    
    // Set user property for wallet address
    this.setUserProperty(UserProperty.WALLET_ADDRESS, walletAddress);
  }

  // Track an event
  track(event: AnalyticsEvent, properties?: Record<string, any>) {
    if (!this.initialized) return;
    
    // Add timestamp to track when events occur
    const eventProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
    };

    // Track the event
    mixpanel.track(event, eventProperties);
  }

  // Set a user property
  setUserProperty(property: UserProperty, value: any) {
    if (!this.initialized) return;
    
    mixpanel.people.set({ [property]: value });
  }

  // Increment a user property
  incrementUserProperty(property: UserProperty, value: number = 1) {
    if (!this.initialized) return;
    
    mixpanel.people.increment(property, value);
  }

  // Track page view
  pageView(pageName: string, pageProps?: Record<string, any>) {
    this.track(AnalyticsEvent.PAGE_VIEW, {
      page_name: pageName,
      ...pageProps,
    });
  }

  // Track wallet connection
  trackWalletConnected(walletAddress: string) {
    this.identify(walletAddress);
    this.track(AnalyticsEvent.WALLET_CONNECTED, {
      wallet_address: walletAddress,
    });
  }

  // Track wallet disconnection
  trackWalletDisconnected() {
    this.track(AnalyticsEvent.WALLET_DISCONNECTED);
  }

  // Track raffle creation
  trackRaffleCreated(raffleAddress: string, nftMint: string, ticketPrice: number, ticketCap: number) {
    this.track(AnalyticsEvent.RAFFLE_CREATED, {
      raffle_address: raffleAddress,
      nft_mint: nftMint,
      ticket_price: ticketPrice,
      ticket_cap: ticketCap,
    });
    
    this.incrementUserProperty(UserProperty.TOTAL_RAFFLES_CREATED);
  }

  // Track ticket purchase
  trackTicketPurchased(raffleAddress: string, quantity: number, totalPrice: number) {
    this.track(AnalyticsEvent.TICKETS_PURCHASED, {
      raffle_address: raffleAddress,
      quantity,
      total_price: totalPrice,
    });
    
    this.incrementUserProperty(UserProperty.TOTAL_TICKETS_PURCHASED, quantity);
    this.incrementUserProperty(UserProperty.TOTAL_SOL_SPENT, totalPrice);
  }

  // Track raffle ending
  trackRaffleEnded(raffleAddress: string, winner: string) {
    this.track(AnalyticsEvent.RAFFLE_ENDED, {
      raffle_address: raffleAddress,
      winner,
    });
  }

  // Track prize claim
  trackPrizeClaimed(raffleAddress: string, prizeValue: number) {
    this.track(AnalyticsEvent.PRIZE_CLAIMED, {
      raffle_address: raffleAddress,
      prize_value: prizeValue,
    });
    
    this.incrementUserProperty(UserProperty.PRIZES_WON);
  }

  // Track filter change
  trackFilterChanged(filterType: string, filterValue: string) {
    this.track(AnalyticsEvent.FILTER_CHANGED, {
      filter_type: filterType,
      filter_value: filterValue,
    });
  }

  // Track sort change
  trackSortChanged(sortValue: string) {
    this.track(AnalyticsEvent.SORT_CHANGED, {
      sort_value: sortValue,
    });
  }

  // Track search
  trackSearch(query: string, resultsCount: number) {
    this.track(AnalyticsEvent.SEARCH_PERFORMED, {
      query,
      results_count: resultsCount,
    });
  }

  // Track error
  trackError(errorType: string, errorMessage: string, errorCode?: number) {
    this.track(AnalyticsEvent.ERROR_OCCURRED, {
      error_type: errorType,
      error_message: errorMessage,
      error_code: errorCode,
    });
  }

  // Track preference change
  trackPreferenceChanged(preferenceName: string, preferenceValue: any) {
    this.track(AnalyticsEvent.PREFERENCE_CHANGED, {
      preference_name: preferenceName,
      preference_value: preferenceValue,
    });
    
    // Track specific user properties for certain preferences
    if (preferenceName === 'viewMode') {
      this.setUserProperty(UserProperty.PREFERRED_VIEW_MODE, preferenceValue);
    } else if (preferenceName === 'colorMode') {
      this.setUserProperty(UserProperty.COLOR_MODE, preferenceValue);
    }
  }
}

// Export a singleton instance
export const analytics = new AnalyticsService();

// Initialize analytics in the client side
if (typeof window !== 'undefined') {
  analytics.init();
} 