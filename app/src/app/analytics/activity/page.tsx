'use client';

import React, { useState, useEffect } from 'react';
import { NFTActivity, NFTActivityType } from '@/types/activity';
import { getActivity } from '@/services/activityService';
import Link from 'next/link';

export default function ActivityAnalyticsPage() {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Fetch activities for analytics
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // For analytics, we'll get a larger dataset
        const data = await getActivity(undefined, 1000);
        setActivities(data);
      } catch (err) {
        console.error('Failed to fetch activity data for analytics:', err);
        setError('Failed to load activity data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Filter activities by time period
  const getFilteredActivities = () => {
    if (timeframe === 'all') {
      return activities;
    }

    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeframe) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }

    return activities.filter(activity => activity.timestamp >= cutoffDate);
  };

  const filteredActivities = getFilteredActivities();

  // Calculate activity type distribution
  const calculateActivityTypeDistribution = () => {
    const distribution: Record<NFTActivityType, number> = {
      'mint': 0,
      'transfer': 0,
      'list': 0,
      'delist': 0,
      'sale': 0,
      'offer': 0,
      'burn': 0,
      'raffle_create': 0,
      'raffle_join': 0,
      'raffle_complete': 0
    };
    
    filteredActivities.forEach(activity => {
      distribution[activity.type]++;
    });
    
    return distribution;
  };

  // Calculate daily activity counts
  const calculateDailyActivityCounts = () => {
    const dailyCounts: Record<string, number> = {};
    
    // Create a map of dates with zero counts
    const now = new Date();
    let days = 0;
    
    switch (timeframe) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 30; // Default to 30 days
    }
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyCounts[dateString] = 0;
    }
    
    // Fill in the counts from actual data
    filteredActivities.forEach(activity => {
      const dateString = activity.timestamp.toISOString().split('T')[0];
      if (dailyCounts[dateString] !== undefined) {
        dailyCounts[dateString]++;
      }
    });
    
    // Convert to array sorted by date
    return Object.entries(dailyCounts)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, count]) => ({ date, count }));
  };

  // Calculate trading volume by day
  const calculateDailyTradingVolume = () => {
    const dailyVolume: Record<string, number> = {};
    
    // Create a map of dates with zero volume
    const now = new Date();
    let days = 0;
    
    switch (timeframe) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 30; // Default to 30 days
    }
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyVolume[dateString] = 0;
    }
    
    // Fill in the volume from actual sale data
    filteredActivities.forEach(activity => {
      if (activity.type === 'sale' && activity.price !== undefined) {
        const dateString = activity.timestamp.toISOString().split('T')[0];
        if (dailyVolume[dateString] !== undefined) {
          dailyVolume[dateString] += activity.price;
        }
      }
    });
    
    // Convert to array sorted by date
    return Object.entries(dailyVolume)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, volume]) => ({ date, volume }));
  };

  // Calculate top collections by volume
  const calculateTopCollectionsByVolume = (limit: number = 5) => {
    const collectionVolume: Record<string, { volume: number, count: number, name: string }> = {};
    
    // Calculate volume for each collection
    filteredActivities.forEach(activity => {
      if (activity.type === 'sale' && activity.price !== undefined && activity.collectionId) {
        if (!collectionVolume[activity.collectionId]) {
          collectionVolume[activity.collectionId] = {
            volume: 0,
            count: 0,
            name: activity.collectionName || activity.collectionId
          };
        }
        
        collectionVolume[activity.collectionId].volume += activity.price;
        collectionVolume[activity.collectionId].count++;
      }
    });
    
    // Convert to array and sort by volume
    return Object.entries(collectionVolume)
      .map(([id, data]) => ({
        id,
        name: data.name,
        volume: data.volume,
        count: data.count
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  };

  // Prepare data for visualizations
  const activityTypeDistribution = calculateActivityTypeDistribution();
  const dailyActivityCounts = calculateDailyActivityCounts();
  const dailyTradingVolume = calculateDailyTradingVolume();
  const topCollections = calculateTopCollectionsByVolume();

  // Calculate summary statistics
  const calculateSummaryStats = () => {
    const salesActivities = filteredActivities.filter(a => a.type === 'sale' && a.price !== undefined);
    const mintActivities = filteredActivities.filter(a => a.type === 'mint');
    const listActivities = filteredActivities.filter(a => a.type === 'list');
    
    const totalVolume = salesActivities.reduce((sum, a) => sum + (a.price || 0), 0);
    const avgSalePrice = salesActivities.length > 0 
      ? totalVolume / salesActivities.length 
      : 0;
    
    const uniqueCollections = new Set(
      filteredActivities
        .filter(a => a.collectionId)
        .map(a => a.collectionId)
    ).size;
    
    const uniqueNFTs = new Set(
      filteredActivities
        .filter(a => a.mint)
        .map(a => a.mint)
    ).size;
    
    return {
      totalVolume,
      avgSalePrice,
      salesCount: salesActivities.length,
      mintsCount: mintActivities.length,
      listingsCount: listActivities.length,
      uniqueCollections,
      uniqueNFTs
    };
  };

  const summaryStats = calculateSummaryStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">NFT Activity Analytics</h1>
        <p className="text-gray-600">
          Insights and trends from NFT activities across the marketplace
        </p>
      </div>
      
      {/* Time period filter */}
      <div className="flex mb-6 space-x-2 border-b pb-4">
        <button
          className={`px-4 py-2 rounded-lg ${timeframe === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTimeframe('7d')}
        >
          7 Days
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${timeframe === '30d' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTimeframe('30d')}
        >
          30 Days
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${timeframe === '90d' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTimeframe('90d')}
        >
          90 Days
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${timeframe === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTimeframe('all')}
        >
          All Time
        </button>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Summary statistics */}
      {!isLoading && filteredActivities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Trading Volume</h3>
            <p className="text-3xl font-bold">{summaryStats.totalVolume.toFixed(2)} SOL</p>
            <p className="text-sm text-gray-500 mt-1">{summaryStats.salesCount} sales</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Sale Price</h3>
            <p className="text-3xl font-bold">{summaryStats.avgSalePrice.toFixed(2)} SOL</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">New Mints</h3>
            <p className="text-3xl font-bold">{summaryStats.mintsCount}</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Activities</h3>
            <p className="text-3xl font-bold">{filteredActivities.length}</p>
            <p className="text-sm text-gray-500 mt-1">{summaryStats.uniqueNFTs} unique NFTs</p>
          </div>
        </div>
      )}
      
      {/* Charts and visualizations */}
      {!isLoading && filteredActivities.length > 0 && (
        <div className="space-y-8">
          {/* Activity distribution chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Activity Type Distribution</h2>
            <div className="h-64 flex items-end space-x-2">
              {Object.entries(activityTypeDistribution).map(([type, count]) => (
                count > 0 && (
                  <div key={type} className="flex flex-col items-center flex-1">
                    <div className="w-full flex justify-center">
                      <div
                        className="bg-blue-500 rounded-t"
                        style={{ 
                          height: `${Math.max(10, (count / Math.max(...Object.values(activityTypeDistribution))) * 200)}px`,
                          width: '70%'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs mt-2 font-medium transform -rotate-45 origin-top-left h-20 flex items-start">
                      {type}
                    </div>
                    <div className="text-sm font-bold mt-1">{count}</div>
                  </div>
                )
              ))}
            </div>
          </div>
          
          {/* Daily activity chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Daily Activity Trend</h2>
            <div className="h-64 flex items-end space-x-1">
              {dailyActivityCounts.map(({ date, count }, index) => (
                <div key={date} className="flex flex-col items-center flex-1">
                  <div className="w-full flex justify-center">
                    <div
                      className={`${index % 2 === 0 ? 'bg-blue-500' : 'bg-blue-400'} rounded-t`}
                      style={{ 
                        height: `${Math.max(10, (count / Math.max(...dailyActivityCounts.map(d => d.count))) * 200)}px`,
                        width: '90%'
                      }}
                    ></div>
                  </div>
                  {index % 5 === 0 && (
                    <div className="text-xs mt-2 rotate-90 transform origin-top-left h-10">
                      {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Daily trading volume chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Daily Trading Volume</h2>
            <div className="h-64 flex items-end space-x-1">
              {dailyTradingVolume.map(({ date, volume }, index) => (
                <div key={date} className="flex flex-col items-center flex-1">
                  <div className="w-full flex justify-center">
                    <div
                      className={`${index % 2 === 0 ? 'bg-green-500' : 'bg-green-400'} rounded-t`}
                      style={{ 
                        height: `${Math.max(10, (volume / Math.max(...dailyTradingVolume.map(d => d.volume), 0.1)) * 200)}px`,
                        width: '90%'
                      }}
                    ></div>
                  </div>
                  {index % 5 === 0 && (
                    <div className="text-xs mt-2 rotate-90 transform origin-top-left h-10">
                      {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Top collections table */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Top Collections by Volume</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collection
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topCollections.map((collection) => (
                    <tr key={collection.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/collections/${collection.id}`} className="text-blue-500 hover:underline">
                          {collection.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {collection.volume.toFixed(2)} SOL
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {collection.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(collection.volume / collection.count).toFixed(2)} SOL
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* No data message */}
      {!isLoading && filteredActivities.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500">No activity data available</p>
          <p className="text-gray-400 mt-2">Try selecting a different time period or check back later</p>
        </div>
      )}
    </div>
  );
} 