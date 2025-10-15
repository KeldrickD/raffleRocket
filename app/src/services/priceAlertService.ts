import { apiClient } from './apiClient';
import realTimeService from './realTimeService';

export interface PriceAlert {
  id: string;
  userId: string;
  targetType: 'nft' | 'collection';
  targetId: string;
  targetName?: string;
  targetImage?: string;
  condition: 'above' | 'below' | 'equal';
  price: number;
  currency: string;
  status: 'active' | 'triggered' | 'disabled';
  createdAt: Date;
  triggeredAt?: Date;
  notificationSent: boolean;
}

export interface CreatePriceAlertParams {
  targetType: 'nft' | 'collection';
  targetId: string;
  condition: 'above' | 'below' | 'equal';
  price: number;
  currency?: string;
}

/**
 * Get all price alerts for the current user
 */
export async function getUserPriceAlerts(): Promise<PriceAlert[]> {
  try {
    const response = await apiClient.get<any[]>('/api/alerts/price');
    
    // Convert date strings to Date objects
    return response.data.map(alert => ({
      ...alert,
      createdAt: new Date(alert.createdAt),
      triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
    }));
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    throw error;
  }
}

/**
 * Create a new price alert
 */
export async function createPriceAlert(params: CreatePriceAlertParams): Promise<PriceAlert> {
  try {
    const response = await apiClient.post<PriceAlert>('/api/alerts/price', {
      ...params,
      currency: params.currency || 'SOL'
    });
    
    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      triggeredAt: response.data.triggeredAt ? new Date(response.data.triggeredAt) : undefined
    };
  } catch (error) {
    console.error('Error creating price alert:', error);
    throw error;
  }
}

/**
 * Delete a price alert
 */
export async function deletePriceAlert(alertId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/alerts/price/${alertId}`);
  } catch (error) {
    console.error('Error deleting price alert:', error);
    throw error;
  }
}

/**
 * Update a price alert
 */
export async function updatePriceAlert(alertId: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
  try {
    const response = await apiClient.put<PriceAlert>(`/api/alerts/price/${alertId}`, updates);
    
    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      triggeredAt: response.data.triggeredAt ? new Date(response.data.triggeredAt) : undefined
    };
  } catch (error) {
    console.error('Error updating price alert:', error);
    throw error;
  }
}

/**
 * Toggle a price alert's status (active/disabled)
 */
export async function togglePriceAlert(alertId: string, active: boolean): Promise<PriceAlert> {
  return updatePriceAlert(alertId, { status: active ? 'active' : 'disabled' });
}

/**
 * Subscribe to price alert notifications
 */
export function subscribeToPriceAlerts(callback: (alert: PriceAlert) => void): () => void {
  // Use the realTimeService to subscribe to price alert events
  return realTimeService.subscribeToPriceAlerts(callback);
}

/**
 * Check if an NFT has any active price alerts
 */
export async function checkNFTHasAlerts(mintId: string): Promise<boolean> {
  try {
    const alerts = await getUserPriceAlerts();
    return alerts.some(alert => 
      alert.targetType === 'nft' && 
      alert.targetId === mintId && 
      alert.status === 'active'
    );
  } catch (error) {
    console.error('Error checking NFT alerts:', error);
    return false;
  }
}

/**
 * Get price alerts for a specific NFT
 */
export async function getNFTPriceAlerts(mintId: string): Promise<PriceAlert[]> {
  try {
    const alerts = await getUserPriceAlerts();
    return alerts.filter(alert => 
      alert.targetType === 'nft' && 
      alert.targetId === mintId
    );
  } catch (error) {
    console.error('Error getting NFT alerts:', error);
    return [];
  }
}

/**
 * Check if a collection has any active price alerts
 */
export async function checkCollectionHasAlerts(collectionId: string): Promise<boolean> {
  try {
    const alerts = await getUserPriceAlerts();
    return alerts.some(alert => 
      alert.targetType === 'collection' && 
      alert.targetId === collectionId && 
      alert.status === 'active'
    );
  } catch (error) {
    console.error('Error checking collection alerts:', error);
    return false;
  }
}

/**
 * Get price alerts for a specific collection
 */
export async function getCollectionPriceAlerts(collectionId: string): Promise<PriceAlert[]> {
  try {
    const alerts = await getUserPriceAlerts();
    return alerts.filter(alert => 
      alert.targetType === 'collection' && 
      alert.targetId === collectionId
    );
  } catch (error) {
    console.error('Error getting collection alerts:', error);
    return [];
  }
}

/**
 * Format price alert condition for display
 */
export function formatAlertCondition(alert: PriceAlert): string {
  const condition = alert.condition === 'above' ? 'above' : 
                   alert.condition === 'below' ? 'below' : 
                   'equal to';
  
  return `${alert.targetName || alert.targetId} price ${condition} ${alert.price} ${alert.currency}`;
}

// For demo purposes, test price alerts
export function createDemoPriceAlert(params: CreatePriceAlertParams): PriceAlert {
  const now = new Date();
  return {
    id: `alert_${Math.random().toString(36).substring(2, 10)}`,
    userId: 'demo_user',
    targetType: params.targetType,
    targetId: params.targetId,
    targetName: params.targetType === 'nft' ? `NFT #${params.targetId.substring(0, 4)}` : `Collection ${params.targetId}`,
    targetImage: 'https://via.placeholder.com/150',
    condition: params.condition,
    price: params.price,
    currency: params.currency || 'SOL',
    status: 'active',
    createdAt: now,
    notificationSent: false
  };
}

export default {
  getUserPriceAlerts,
  createPriceAlert,
  deletePriceAlert,
  updatePriceAlert,
  togglePriceAlert,
  subscribeToPriceAlerts,
  checkNFTHasAlerts,
  getNFTPriceAlerts,
  checkCollectionHasAlerts,
  getCollectionPriceAlerts,
  formatAlertCondition,
  createDemoPriceAlert
}; 