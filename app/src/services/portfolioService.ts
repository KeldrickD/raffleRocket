import { apiClient } from './apiClient';
import { NFTActivity } from '@/types/activity';

export interface NFTItem {
  mintId: string;
  name?: string;
  image?: string;
  collection?: {
    id: string;
    name: string;
    image?: string;
  };
  acquiredAt?: Date;
  acquiredPrice?: number;
  currentPrice?: number;
  lastSalePrice?: number;
  lastSaleDate?: Date;
  rarityRank?: number;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
  floorPrice?: number;
}

export interface NFTCollection {
  id: string;
  name: string;
  image?: string;
  itemCount: number;
  floorPrice?: number;
  totalValue?: number;
  volumeDay?: number;
  volumeWeek?: number;
  volumeMonth?: number;
  priceChangeDay?: number;
  priceChangeWeek?: number;
  priceChangeMonth?: number;
}

export interface Portfolio {
  userId: string;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  collections: NFTCollection[];
  items: NFTItem[];
  recentActivity: NFTActivity[];
  historicalValue: {
    date: Date;
    value: number;
  }[];
}

export interface PortfolioStats {
  totalNFTs: number;
  uniqueCollections: number;
  bestPerformer: {
    mintId?: string;
    name?: string;
    profitLoss: number;
    profitLossPercentage: number;
  };
  worstPerformer: {
    mintId?: string;
    name?: string;
    profitLoss: number;
    profitLossPercentage: number;
  };
  mostValuable: {
    mintId?: string;
    name?: string;
    value: number;
  };
  valueChangeDay: number;
  valueChangeWeek: number;
  valueChangeMonth: number;
}

/**
 * Get the current user's portfolio
 */
export async function getUserPortfolio(): Promise<Portfolio> {
  try {
    const response = await apiClient.get<Portfolio>('/api/portfolio');
    
    // Convert date strings to Date objects
    return {
      ...response.data,
      items: response.data.items.map(item => ({
        ...item,
        acquiredAt: item.acquiredAt ? new Date(item.acquiredAt) : undefined,
        lastSaleDate: item.lastSaleDate ? new Date(item.lastSaleDate) : undefined
      })),
      historicalValue: response.data.historicalValue.map(entry => ({
        ...entry,
        date: new Date(entry.date)
      })),
      recentActivity: response.data.recentActivity.map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }))
    };
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
}

/**
 * Get portfolio stats
 */
export async function getPortfolioStats(): Promise<PortfolioStats> {
  try {
    const response = await apiClient.get<PortfolioStats>('/api/portfolio/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio stats:', error);
    throw error;
  }
}

/**
 * Get specific NFT from portfolio
 */
export async function getPortfolioNFT(mintId: string): Promise<NFTItem> {
  try {
    const response = await apiClient.get<NFTItem>(`/api/portfolio/nft/${mintId}`);
    
    // Convert date strings to Date objects
    return {
      ...response.data,
      acquiredAt: response.data.acquiredAt ? new Date(response.data.acquiredAt) : undefined,
      lastSaleDate: response.data.lastSaleDate ? new Date(response.data.lastSaleDate) : undefined
    };
  } catch (error) {
    console.error('Error fetching portfolio NFT:', error);
    throw error;
  }
}

/**
 * Get specific collection from portfolio
 */
export async function getPortfolioCollection(collectionId: string): Promise<{
  collection: NFTCollection,
  items: NFTItem[]
}> {
  try {
    const response = await apiClient.get<{
      collection: NFTCollection,
      items: NFTItem[]
    }>(`/api/portfolio/collection/${collectionId}`);
    
    // Convert date strings to Date objects
    return {
      collection: response.data.collection,
      items: response.data.items.map(item => ({
        ...item,
        acquiredAt: item.acquiredAt ? new Date(item.acquiredAt) : undefined,
        lastSaleDate: item.lastSaleDate ? new Date(item.lastSaleDate) : undefined
      }))
    };
  } catch (error) {
    console.error('Error fetching portfolio collection:', error);
    throw error;
  }
}

/**
 * Export portfolio as CSV or JSON
 */
export async function exportPortfolio(format: 'csv' | 'json'): Promise<string> {
  try {
    const response = await apiClient.get<{ data: string }>(`/api/portfolio/export?format=${format}`);
    return response.data.data;
  } catch (error) {
    console.error('Error exporting portfolio:', error);
    throw error;
  }
}

/**
 * Get historical portfolio value
 */
export async function getHistoricalValue(timeframe: '1d' | '7d' | '30d' | '90d' | '1y' | 'all'): Promise<{
  date: Date;
  value: number;
}[]> {
  try {
    const response = await apiClient.get<{
      date: string;
      value: number;
    }[]>(`/api/portfolio/history?timeframe=${timeframe}`);
    
    // Convert date strings to Date objects
    return response.data.map(entry => ({
      date: new Date(entry.date),
      value: entry.value
    }));
  } catch (error) {
    console.error('Error fetching historical value:', error);
    throw error;
  }
}

/**
 * Add a note to an NFT in the portfolio
 */
export async function addNFTNote(mintId: string, note: string): Promise<void> {
  try {
    await apiClient.post(`/api/portfolio/nft/${mintId}/note`, { note });
  } catch (error) {
    console.error('Error adding note to NFT:', error);
    throw error;
  }
}

/**
 * Update portfolio settings
 */
export async function updatePortfolioSettings(settings: {
  public: boolean;
  showValues: boolean;
  displayName?: string;
  profileImage?: string;
}): Promise<void> {
  try {
    await apiClient.put('/api/portfolio/settings', settings);
  } catch (error) {
    console.error('Error updating portfolio settings:', error);
    throw error;
  }
}

/**
 * Calculate estimated profit/loss for a specific NFT
 */
export function calculateNFTProfitLoss(nft: NFTItem): {
  profit: number;
  profitPercentage: number;
  isProfit: boolean;
} {
  const currentValue = nft.currentPrice || nft.floorPrice || 0;
  const costBasis = nft.acquiredPrice || 0;
  
  if (costBasis === 0) {
    return {
      profit: currentValue,
      profitPercentage: 100,
      isProfit: true
    };
  }
  
  const profit = currentValue - costBasis;
  const profitPercentage = (profit / costBasis) * 100;
  
  return {
    profit,
    profitPercentage,
    isProfit: profit >= 0
  };
}

// For demo/development
export function createMockPortfolio(): Portfolio {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const collections: NFTCollection[] = [
    {
      id: 'coll_1',
      name: 'Solana Monkeys',
      image: 'https://via.placeholder.com/150',
      itemCount: 3,
      floorPrice: 2.5,
      totalValue: 8.2,
      volumeDay: 45.2,
      volumeWeek: 320.5,
      volumeMonth: 1240.8,
      priceChangeDay: 5.2,
      priceChangeWeek: -2.1,
      priceChangeMonth: 12.4
    },
    {
      id: 'coll_2',
      name: 'Degenerate Apes',
      image: 'https://via.placeholder.com/150',
      itemCount: 2,
      floorPrice: 4.2,
      totalValue: 10.5,
      volumeDay: 78.5,
      volumeWeek: 520.3,
      volumeMonth: 2100.5,
      priceChangeDay: -2.3,
      priceChangeWeek: 8.5,
      priceChangeMonth: 15.7
    }
  ];
  
  const items: NFTItem[] = [
    {
      mintId: 'mint_1',
      name: 'Solana Monkey #123',
      image: 'https://via.placeholder.com/500',
      collection: {
        id: 'coll_1',
        name: 'Solana Monkeys',
        image: 'https://via.placeholder.com/150'
      },
      acquiredAt: monthAgo,
      acquiredPrice: 2.3,
      currentPrice: 3.1,
      lastSalePrice: 2.8,
      lastSaleDate: weekAgo,
      rarityRank: 1243,
      floorPrice: 2.5,
      attributes: [
        { trait_type: 'Background', value: 'Blue' },
        { trait_type: 'Eyes', value: 'Laser' },
        { trait_type: 'Mouth', value: 'Grin' }
      ]
    },
    {
      mintId: 'mint_2',
      name: 'Solana Monkey #456',
      image: 'https://via.placeholder.com/500',
      collection: {
        id: 'coll_1',
        name: 'Solana Monkeys',
        image: 'https://via.placeholder.com/150'
      },
      acquiredAt: weekAgo,
      acquiredPrice: 2.5,
      currentPrice: 2.4,
      floorPrice: 2.5,
      attributes: [
        { trait_type: 'Background', value: 'Red' },
        { trait_type: 'Eyes', value: 'Sleepy' },
        { trait_type: 'Mouth', value: 'Cigar' }
      ]
    },
    {
      mintId: 'mint_3',
      name: 'Degenerate Ape #789',
      image: 'https://via.placeholder.com/500',
      collection: {
        id: 'coll_2',
        name: 'Degenerate Apes',
        image: 'https://via.placeholder.com/150'
      },
      acquiredAt: monthAgo,
      acquiredPrice: 3.8,
      currentPrice: 5.2,
      lastSalePrice: 4.5,
      lastSaleDate: dayAgo,
      rarityRank: 420,
      floorPrice: 4.2,
      attributes: [
        { trait_type: 'Fur', value: 'Golden' },
        { trait_type: 'Clothes', value: 'Suit' },
        { trait_type: 'Accessory', value: 'Diamond Chain' }
      ]
    }
  ];
  
  const recentActivity: NFTActivity[] = [
    {
      id: 'act_1',
      type: 'sale',
      price: 2.8,
      timestamp: weekAgo,
      fromAddress: 'demo_user',
      toAddress: 'wallet123',
      mint: 'mint_1',
      nftName: 'Solana Monkey #123',
      collectionId: 'coll_1',
      collectionName: 'Solana Monkeys',
      transactionSignature: 'sig123'
    },
    {
      id: 'act_2',
      type: 'list',
      price: 5.2,
      timestamp: dayAgo,
      fromAddress: 'demo_user',
      mint: 'mint_3',
      nftName: 'Degenerate Ape #789',
      collectionId: 'coll_2',
      collectionName: 'Degenerate Apes',
      transactionSignature: 'sig456'
    }
  ];
  
  const historicalData = [];
  const startValue = 14.5;
  let currentValue = startValue;
  
  // Generate 30 days of historical data
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Random daily change between -8% and +10%
    const change = (Math.random() * 0.18) - 0.08;
    currentValue = currentValue * (1 + change);
    
    historicalData.push({
      date,
      value: parseFloat(currentValue.toFixed(2))
    });
  }
  
  return {
    userId: 'demo_user',
    totalValue: 18.7,
    profitLoss: 1.2,
    profitLossPercentage: 6.4,
    collections,
    items,
    recentActivity,
    historicalValue: historicalData
  };
}

export default {
  getUserPortfolio,
  getPortfolioStats,
  getPortfolioNFT,
  getPortfolioCollection,
  exportPortfolio,
  getHistoricalValue,
  addNFTNote,
  updatePortfolioSettings,
  calculateNFTProfitLoss,
  createMockPortfolio
}; 