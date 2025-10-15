import { NFTActivity, NFTActivityType, ActivityFilters } from '@/types/activity';
import { apiClient } from './apiClient';

export interface SubscriptionSettings {
  enabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  activityTypes: {
    [key in NFTActivityType]?: boolean;
  };
  collections: string[];
  specificNFTs: string[];
  priceThreshold: number | null;
}

export interface Webhook {
  id: string;
  url: string;
  events: NFTActivityType[];
  createdAt: Date;
}

/**
 * Get activity for NFTs matching the provided filters
 * @param filters Optional filters to apply
 * @param limit Optional limit for the number of activities to return
 * @returns Promise with array of NFTActivity objects
 */
export async function getActivity(filters?: ActivityFilters, limit?: number): Promise<NFTActivity[]> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters) {
      if (filters.types && filters.types.length > 0) {
        filters.types.forEach(type => queryParams.append('types', type));
      }
      
      if (filters.mintIds && filters.mintIds.length > 0) {
        filters.mintIds.forEach(mint => queryParams.append('mints', mint));
      }
      
      if (filters.collectionIds && filters.collectionIds.length > 0) {
        filters.collectionIds.forEach(id => queryParams.append('collections', id));
      }
      
      if (filters.fromDate) {
        queryParams.set('fromDate', filters.fromDate.toISOString());
      }
      
      if (filters.toDate) {
        queryParams.set('toDate', filters.toDate.toISOString());
      }
      
      if (filters.walletAddress) {
        queryParams.set('wallet', filters.walletAddress);
      }
    }
    
    // Add limit parameter if provided
    if (limit) {
      queryParams.set('limit', limit.toString());
    }
    
    const response = await apiClient.get<NFTActivity[]>(`/api/activity?${queryParams.toString()}`);
    
    // Convert timestamp strings to Date objects
    return response.data.map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }));
  } catch (error) {
    console.error('Error fetching activity:', error);
    throw error;
  }
}

/**
 * Get activity for a specific NFT
 */
export async function getNFTActivity(mintId: string): Promise<NFTActivity[]> {
  return getActivity({ mintIds: [mintId] });
}

/**
 * Get activity for a specific collection
 */
export async function getCollectionActivity(collectionId: string): Promise<NFTActivity[]> {
  return getActivity({ collectionIds: [collectionId] });
}

/**
 * Get activities for the current authenticated user
 * 
 * @param limit Optional limit for number of activities to return
 * @returns Promise with array of NFTActivity objects
 */
export const getMyActivity = async (limit: number = 100): Promise<NFTActivity[]> => {
  try {
    // This would make an API call to the backend service
    // For now, we'll simulate it with mock data
    const mockUserWallet = "FakeUserWalletAddress123"; // This would come from auth context
    
    // Fetch activities where the user is either the sender or receiver
    const response = await fetch(`/api/activities?walletAddress=${mockUserWallet}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user activities: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert timestamp strings to Date objects
    return data.map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }));
  } catch (error) {
    console.error("Error fetching user activities:", error);
    
    // In a real app, we would handle this better, but for demo we'll return mock data
    return getMockUserActivities();
  }
};

/**
 * Helper function to get mock user activities for development
 */
const getMockUserActivities = (): NFTActivity[] => {
  const now = new Date();
  const mockUserWallet = "FakeUserWalletAddress123";
  
  return [
    {
      id: "ua1",
      type: "mint",
      mint: "nft123",
      nftName: "Cosmic Horizon #42",
      nftImage: "https://via.placeholder.com/150/3498db/FFFFFF?text=NFT",
      collectionId: "cosmic-horizon",
      collectionName: "Cosmic Horizon",
      timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      toAddress: mockUserWallet,
      transactionSignature: "tx123mint"
    },
    {
      id: "ua2",
      type: "list",
      mint: "nft123",
      nftName: "Cosmic Horizon #42",
      nftImage: "https://via.placeholder.com/150/3498db/FFFFFF?text=NFT",
      collectionId: "cosmic-horizon",
      collectionName: "Cosmic Horizon",
      price: 5.5,
      timestamp: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      fromAddress: mockUserWallet,
      transactionSignature: "tx123list"
    },
    {
      id: "ua3",
      type: "sale",
      mint: "nft123",
      nftName: "Cosmic Horizon #42",
      nftImage: "https://via.placeholder.com/150/3498db/FFFFFF?text=NFT",
      collectionId: "cosmic-horizon",
      collectionName: "Cosmic Horizon",
      price: 6.25,
      timestamp: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      fromAddress: mockUserWallet,
      toAddress: "Buyer123",
      transactionSignature: "tx123sale"
    },
    {
      id: "ua4",
      type: "sale",
      mint: "nft456",
      nftName: "Space Voyagers #7",
      nftImage: "https://via.placeholder.com/150/2ecc71/FFFFFF?text=NFT",
      collectionId: "space-voyagers",
      collectionName: "Space Voyagers",
      price: 3.75,
      timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      fromAddress: "Seller456",
      toAddress: mockUserWallet,
      transactionSignature: "tx456sale"
    },
    {
      id: "ua5",
      type: "list",
      mint: "nft456",
      nftName: "Space Voyagers #7",
      nftImage: "https://via.placeholder.com/150/2ecc71/FFFFFF?text=NFT",
      collectionId: "space-voyagers",
      collectionName: "Space Voyagers",
      price: 4.2,
      timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      fromAddress: mockUserWallet,
      transactionSignature: "tx456list"
    },
    {
      id: "ua6",
      type: "sale",
      mint: "nft456",
      nftName: "Space Voyagers #7",
      nftImage: "https://via.placeholder.com/150/2ecc71/FFFFFF?text=NFT",
      collectionId: "space-voyagers",
      collectionName: "Space Voyagers",
      price: 4.5,
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      fromAddress: mockUserWallet,
      toAddress: "Buyer789",
      transactionSignature: "tx456sale2"
    },
    {
      id: "ua7",
      type: "mint",
      mint: "nft789",
      nftName: "Digital Dreams #15",
      nftImage: "https://via.placeholder.com/150/9b59b6/FFFFFF?text=NFT",
      collectionId: "digital-dreams",
      collectionName: "Digital Dreams Collection",
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      toAddress: mockUserWallet,
      transactionSignature: "tx789mint"
    }
  ];
};

/**
 * Get recent activity across the platform
 * @param limit Maximum number of activities to return
 * @param collectionId Optional collection ID to filter activities
 * @returns Promise with array of NFTActivity objects
 */
export async function getRecentActivity(limit = 20, collectionId?: string): Promise<NFTActivity[]> {
  try {
    let url = `/api/activity/recent?limit=${limit}`;
    
    // Add collection ID if provided
    if (collectionId) {
      url += `&collectionId=${encodeURIComponent(collectionId)}`;
    }
    
    const response = await apiClient.get<NFTActivity[]>(url);
    
    // Convert timestamp strings to Date objects
    return response.data.map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp)
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
}

/**
 * Record a new activity
 */
export async function recordActivity(activity: Omit<NFTActivity, 'id' | 'timestamp'>): Promise<NFTActivity> {
  try {
    const response = await apiClient.post<NFTActivity>('/api/activity', activity);
    
    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp)
    };
  } catch (error) {
    console.error('Error recording activity:', error);
    throw error;
  }
}

/**
 * Get user notification subscription settings
 */
export async function getSubscriptionSettings(): Promise<SubscriptionSettings> {
  try {
    const response = await apiClient.get<SubscriptionSettings>('/api/user/subscriptions');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription settings:', error);
    
    // Return default settings if fetch fails
    return {
      enabled: true,
      emailNotifications: true,
      pushNotifications: false,
      activityTypes: {
        mint: true,
        sale: true,
        list: true,
        delist: true,
        transfer: true,
        offer: true,
        burn: true,
        raffle_create: true,
        raffle_join: false,
        raffle_complete: true
      },
      collections: [],
      specificNFTs: [],
      priceThreshold: null
    };
  }
}

/**
 * Save user notification subscription settings
 */
export async function saveSubscriptionSettings(settings: SubscriptionSettings): Promise<void> {
  try {
    await apiClient.post('/api/user/subscriptions', settings);
  } catch (error) {
    console.error('Error saving subscription settings:', error);
    throw error;
  }
}

/**
 * Register a webhook for external integration
 */
export async function registerWebhook(url: string, secret: string, events: NFTActivityType[]): Promise<{ id: string }> {
  try {
    const response = await apiClient.post<{ id: string }>('/api/webhooks', {
      url,
      secret,
      events
    });
    
    return response.data;
  } catch (error) {
    console.error('Error registering webhook:', error);
    throw error;
  }
}

/**
 * Get webhooks for the authenticated user
 */
export async function getWebhooks(): Promise<Webhook[]> {
  try {
    const response = await apiClient.get<any[]>('/api/webhooks');
    
    return response.data.map(webhook => ({
      ...webhook,
      createdAt: new Date(webhook.createdAt)
    }));
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    throw error;
  }
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/webhooks/${id}`);
  } catch (error) {
    console.error(`Error deleting webhook ${id}:`, error);
    throw error;
  }
}

/**
 * Export activities to CSV format
 */
export function exportActivitiesToCSV(activities: NFTActivity[]): string {
  // CSV header
  const header = [
    'Activity ID',
    'Type',
    'NFT ID',
    'NFT Name',
    'Collection ID',
    'Collection Name',
    'Price (SOL)',
    'From Address',
    'To Address',
    'Transaction Signature',
    'Timestamp'
  ].join(',');
  
  // CSV rows
  const rows = activities.map(activity => [
    activity.id,
    activity.type,
    activity.mint,
    `"${(activity.nftName || '').replace(/"/g, '""')}"`, // Escape quotes in CSV
    activity.collectionId || '',
    activity.collectionName ? `"${activity.collectionName.replace(/"/g, '""')}"` : '',
    activity.price !== undefined ? activity.price : '',
    activity.fromAddress || '',
    activity.toAddress || '',
    activity.transactionSignature || '',
    activity.timestamp.toISOString()
  ].join(','));
  
  return [header, ...rows].join('\n');
} 