import { NFTActivity } from '@/types/activity';
import { apiClient } from './apiClient';

export interface ActivityTrend {
  direction: 'up' | 'down' | 'stable';
  percentChange: number;
  timeframe: 'day' | 'week' | 'month';
}

export interface PricePrediction {
  estimatedPrice: number;
  confidence: number;
  timeframe: '24h' | '7d' | '30d';
  currency: string;
}

export interface CollectionInsight {
  id: string;
  name: string;
  trendingScore: number;
  volumeChange: ActivityTrend;
  priceChange: ActivityTrend;
  holderChange: ActivityTrend;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  recommendation?: string;
}

export interface NFTInsight {
  mintId: string;
  name?: string;
  rarityRank?: number;
  pricePrediction: PricePrediction;
  liquidityScore: number;
  holdTime: number;
  similarNFTs: Array<{
    mintId: string;
    similarity: number;
  }>;
  recommendation?: string;
}

export interface MarketInsight {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  trendingCollections: CollectionInsight[];
  volumeChange: ActivityTrend;
  mostActive: {
    buyers: string[];
    sellers: string[];
    collections: string[];
  };
  recommendation?: string;
}

export interface UserBehaviorInsight {
  tradingStyle: 'holder' | 'flipper' | 'collector' | 'inactive';
  averageHoldTime: number;
  profitLoss: {
    overall: number;
    recentTrades: number;
  };
  portfolioRisk: 'low' | 'medium' | 'high';
  diversificationScore: number;
  recommendation?: string;
}

/**
 * Get AI-powered insights for a specific NFT
 */
export async function getNFTInsights(mintId: string): Promise<NFTInsight> {
  try {
    const response = await apiClient.get<NFTInsight>(`/api/analytics/nft/${mintId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NFT insights:', error);
    
    // Return mock data for development
    return {
      mintId,
      name: `NFT #${mintId.substring(0, 4)}`,
      rarityRank: Math.floor(Math.random() * 10000) + 1,
      pricePrediction: {
        estimatedPrice: parseFloat((Math.random() * 10 + 1).toFixed(2)),
        confidence: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
        timeframe: '24h',
        currency: 'SOL'
      },
      liquidityScore: parseFloat((Math.random() * 10).toFixed(1)),
      holdTime: Math.floor(Math.random() * 90) + 1,
      similarNFTs: Array(3).fill(0).map(() => ({
        mintId: Array(8).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        similarity: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2))
      })),
      recommendation: Math.random() > 0.5 ? 'Consider holding as price is expected to increase' : 'Good time to list based on market conditions'
    };
  }
}

/**
 * Get AI-powered insights for a collection
 */
export async function getCollectionInsights(collectionId: string): Promise<CollectionInsight> {
  try {
    const response = await apiClient.get<CollectionInsight>(`/api/analytics/collection/${collectionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching collection insights:', error);
    
    // Return mock data for development
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    return {
      id: collectionId,
      name: `Collection ${collectionId.substring(0, 4)}`,
      trendingScore: parseFloat((Math.random() * 10).toFixed(1)),
      volumeChange: {
        direction: trend,
        percentChange: parseFloat((Math.random() * 50).toFixed(1)),
        timeframe: 'day'
      },
      priceChange: {
        direction: trend,
        percentChange: parseFloat((Math.random() * 30).toFixed(1)),
        timeframe: 'day'
      },
      holderChange: {
        direction: Math.random() > 0.7 ? 'up' : 'stable',
        percentChange: parseFloat((Math.random() * 10).toFixed(1)),
        timeframe: 'day'
      },
      sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral',
      recommendation: 'Volume is trending upward, indicating increased interest'
    };
  }
}

/**
 * Get overall market insights
 */
export async function getMarketInsights(): Promise<MarketInsight> {
  try {
    const response = await apiClient.get<MarketInsight>('/api/analytics/market');
    return response.data;
  } catch (error) {
    console.error('Error fetching market insights:', error);
    
    // Return mock data for development
    return {
      overallSentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral',
      trendingCollections: Array(3).fill(0).map((_, i) => ({
        id: `coll_${i}`,
        name: `Trending Collection ${i + 1}`,
        trendingScore: parseFloat((Math.random() * 10 + 5).toFixed(1)),
        volumeChange: {
          direction: 'up',
          percentChange: parseFloat((Math.random() * 100 + 20).toFixed(1)),
          timeframe: 'day'
        },
        priceChange: {
          direction: 'up',
          percentChange: parseFloat((Math.random() * 50 + 10).toFixed(1)),
          timeframe: 'day'
        },
        holderChange: {
          direction: 'up',
          percentChange: parseFloat((Math.random() * 20).toFixed(1)),
          timeframe: 'day'
        },
        sentiment: 'bullish'
      })),
      volumeChange: {
        direction: Math.random() > 0.5 ? 'up' : 'down',
        percentChange: parseFloat((Math.random() * 20).toFixed(1)),
        timeframe: 'day'
      },
      mostActive: {
        buyers: Array(3).fill(0).map((_, i) => `Wallet${i+1}`),
        sellers: Array(3).fill(0).map((_, i) => `Wallet${i+4}`),
        collections: Array(3).fill(0).map((_, i) => `Collection${i+1}`)
      },
      recommendation: 'Market sentiment is improving, consider strategic acquisitions'
    };
  }
}

/**
 * Get insights about a user's trading behavior
 */
export async function getUserInsights(userId?: string): Promise<UserBehaviorInsight> {
  try {
    const response = await apiClient.get<UserBehaviorInsight>(`/api/analytics/user/${userId || 'me'}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user insights:', error);
    
    // Return mock data for development
    return {
      tradingStyle: Math.random() > 0.7 ? 'holder' : Math.random() > 0.5 ? 'flipper' : 'collector',
      averageHoldTime: Math.floor(Math.random() * 60 + 10),
      profitLoss: {
        overall: parseFloat((Math.random() * 100 - 20).toFixed(2)),
        recentTrades: parseFloat((Math.random() * 10 - 2).toFixed(2))
      },
      portfolioRisk: Math.random() > 0.7 ? 'low' : Math.random() > 0.4 ? 'medium' : 'high',
      diversificationScore: parseFloat((Math.random() * 10).toFixed(1)),
      recommendation: 'Consider diversifying your portfolio across more collections'
    };
  }
}

/**
 * Get price prediction for an NFT
 */
export async function getPricePrediction(mintId: string, timeframe: '24h' | '7d' | '30d' = '24h'): Promise<PricePrediction> {
  try {
    const response = await apiClient.get<PricePrediction>(`/api/analytics/nft/${mintId}/prediction?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching price prediction:', error);
    
    // Return mock data for development
    return {
      estimatedPrice: parseFloat((Math.random() * 10 + 1).toFixed(2)),
      confidence: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
      timeframe,
      currency: 'SOL'
    };
  }
}

/**
 * Get pattern analysis from historical activity data
 */
export async function analyzeActivityPatterns(activities: NFTActivity[]): Promise<{
  patterns: string[];
  insights: string[];
}> {
  try {
    const response = await apiClient.post<{
      patterns: string[];
      insights: string[];
    }>('/api/analytics/activity/patterns', { activities });
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing activity patterns:', error);
    
    // Return mock data for development
    return {
      patterns: [
        'Price increases often follow multiple consecutive sales',
        'Higher social engagement correlates with increased sales volume',
        'Weekend activity shows 30% higher transaction volume'
      ],
      insights: [
        'Consider timing purchases for mid-week when competition is lower',
        'NFTs with higher social engagement tend to retain value better',
        'Recent pattern suggests increasing interest in this collection'
      ]
    };
  }
}

/**
 * Format trend as a readable string with emoji
 */
export function formatTrend(trend: ActivityTrend): string {
  const emoji = trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➖';
  const sign = trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : '';
  
  return `${emoji} ${sign}${trend.percentChange}% over the last ${trend.timeframe}`;
}

/**
 * Format sentiment as a readable string with emoji
 */
export function formatSentiment(sentiment: 'bullish' | 'bearish' | 'neutral'): string {
  const emoji = sentiment === 'bullish' ? '🐂' : sentiment === 'bearish' ? '🐻' : '⚖️';
  return `${emoji} ${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}`;
}

export default {
  getNFTInsights,
  getCollectionInsights,
  getMarketInsights,
  getUserInsights,
  getPricePrediction,
  analyzeActivityPatterns,
  formatTrend,
  formatSentiment
}; 