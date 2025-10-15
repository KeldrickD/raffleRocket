import { NFTActivity, ActivityFilters, ActivityType } from '@/types/activity';

/**
 * Fetch activity history with optional filters
 */
export async function fetchActivityHistory(filters?: ActivityFilters): Promise<NFTActivity[]> {
  try {
    const url = new URL('/api/activity', window.location.origin);
    
    // Add query parameters if filters are provided
    if (filters) {
      if (filters.types && filters.types.length > 0) {
        url.searchParams.append('type', filters.types.join(','));
      }
      
      if (filters.mint) {
        url.searchParams.append('mint', filters.mint);
      }
      
      if (filters.fromAddress) {
        url.searchParams.append('fromAddress', filters.fromAddress);
      }
      
      if (filters.toAddress) {
        url.searchParams.append('toAddress', filters.toAddress);
      }
      
      if (filters.collectionId) {
        url.searchParams.append('collectionId', filters.collectionId);
      }
      
      if (filters.startDate) {
        url.searchParams.append('startDate', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        url.searchParams.append('endDate', filters.endDate.toISOString());
      }
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Error fetching activity: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert date strings to Date objects
    return data.map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp),
    }));
  } catch (error) {
    console.error('Error fetching activity history:', error);
    throw error;
  }
}

/**
 * Fetch activity history for a specific NFT by mint address
 */
export async function fetchNFTActivityHistory(mint: string): Promise<NFTActivity[]> {
  return fetchActivityHistory({ mint });
}

/**
 * Fetch activity history for a specific collection
 */
export async function fetchCollectionActivityHistory(collectionId: string): Promise<NFTActivity[]> {
  return fetchActivityHistory({ collectionId });
}

/**
 * Record a new activity when an action is performed
 * In a real app, this would call the API to persist the activity
 */
export async function recordActivity(activity: Omit<NFTActivity, 'id' | 'timestamp'>): Promise<NFTActivity> {
  try {
    // In a real app, this would be a POST request to the API
    // For now, we'll just simulate it with a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newActivity: NFTActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date(),
    };
    
    console.log('Activity recorded:', newActivity);
    
    return newActivity;
  } catch (error) {
    console.error('Error recording activity:', error);
    throw error;
  }
} 