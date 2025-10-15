'use client';

import React, { useState, useEffect } from 'react';
import { NFTActivity } from '@/types/activity';
import { ActivitySearch, ActivitySearchFilters } from '@/components/ActivitySearch';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { NFTPriceHistory } from '@/components/NFTPriceHistory';
import { ActivityExport } from '@/components/ActivityExport';
import { getMyActivity } from '@/services/activityService';
import Link from 'next/link';

export default function UserActivityPage() {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'purchases' | 'mints' | 'listings'>('all');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Fetch user activities
  useEffect(() => {
    const fetchUserActivities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getMyActivity();
        setActivities(data);
      } catch (err) {
        console.error('Failed to fetch user activities:', err);
        setError('Failed to load your activity data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserActivities();
  }, []);

  // Filter activities by time period and tab
  const getFilteredActivities = () => {
    let filtered = activities;
    
    // Filter by tab/activity type
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'sales':
          filtered = filtered.filter(a => a.type === 'sale' && a.fromAddress);
          break;
        case 'purchases':
          filtered = filtered.filter(a => a.type === 'sale' && a.toAddress);
          break;
        case 'mints':
          filtered = filtered.filter(a => a.type === 'mint');
          break;
        case 'listings':
          filtered = filtered.filter(a => a.type === 'list' || a.type === 'delist');
          break;
      }
    }
    
    // Filter by timeframe
    if (timeframe !== 'all') {
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

      filtered = filtered.filter(activity => activity.timestamp >= cutoffDate);
    }

    return filtered;
  };

  const filteredActivities = getFilteredActivities();

  // Handle search/filter
  const handleSearch = async (filters: ActivitySearchFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get user activities first
      const data = await getMyActivity();
      
      // Apply additional filtering
      let filtered = data;
      
      if (filters.types.length > 0) {
        filtered = filtered.filter(activity => filters.types.includes(activity.type));
      }
      
      if (filters.dateFrom) {
        filtered = filtered.filter(activity => activity.timestamp >= filters.dateFrom!);
      }
      
      if (filters.dateTo) {
        filtered = filtered.filter(activity => activity.timestamp <= filters.dateTo!);
      }
      
      if (filters.priceMin !== null || filters.priceMax !== null) {
        filtered = filtered.filter(activity => {
          if (activity.price === undefined) return false;
          
          if (filters.priceMin !== null && activity.price < filters.priceMin) {
            return false;
          }
          
          if (filters.priceMax !== null && activity.price > filters.priceMax) {
            return false;
          }
          
          return true;
        });
      }
      
      if (filters.collectionId) {
        filtered = filtered.filter(activity => activity.collectionId === filters.collectionId);
      }
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filtered = filtered.filter(activity => 
          (activity.nftName && activity.nftName.toLowerCase().includes(keyword)) ||
          (activity.collectionName && activity.collectionName.toLowerCase().includes(keyword)) ||
          activity.type.toLowerCase().includes(keyword)
        );
      }
      
      setActivities(filtered);
    } catch (err) {
      console.error('Failed to search activities:', err);
      setError('Failed to search activities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate user stats
  const calculateUserStats = () => {
    const sales = activities.filter(a => a.type === 'sale' && a.fromAddress);
    const purchases = activities.filter(a => a.type === 'sale' && a.toAddress);
    const mints = activities.filter(a => a.type === 'mint');
    
    const totalSold = sales
      .reduce((sum, a) => sum + (a.price || 0), 0);
      
    const totalSpent = purchases
      .reduce((sum, a) => sum + (a.price || 0), 0);
    
    const profit = totalSold - totalSpent;
    
    const collections = new Set(
      activities
        .filter(a => a.collectionId)
        .map(a => a.collectionId)
    ).size;
    
    return {
      totalSold,
      totalSpent,
      profit,
      salesCount: sales.length,
      purchasesCount: purchases.length,
      mintsCount: mints.length,
      collectionsInteracted: collections
    };
  };

  const stats = calculateUserStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link href="/profile" className="text-blue-500 hover:text-blue-700 mr-2">
            <span className="inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
          <h1 className="text-3xl font-bold">My Activity</h1>
        </div>
        
        <p className="text-gray-600">
          Track and analyze your NFT activities across the marketplace
        </p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sold</h3>
          <p className="text-3xl font-bold">{stats.totalSold.toFixed(2)} SOL</p>
          <p className="text-sm text-gray-500 mt-1">{stats.salesCount} sales</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Spent</h3>
          <p className="text-3xl font-bold">{stats.totalSpent.toFixed(2)} SOL</p>
          <p className="text-sm text-gray-500 mt-1">{stats.purchasesCount} purchases</p>
        </div>
        
        <div className={`bg-white shadow rounded-lg p-4 ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Profit/Loss</h3>
          <p className="text-3xl font-bold">{stats.profit.toFixed(2)} SOL</p>
          <p className="text-sm text-gray-500 mt-1">{stats.profit >= 0 ? 'Profit' : 'Loss'}</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Collections</h3>
          <p className="text-3xl font-bold">{stats.collectionsInteracted}</p>
          <p className="text-sm text-gray-500 mt-1">Interacted with</p>
        </div>
      </div>
      
      {/* Activity type tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-1 overflow-x-auto">
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('all')}
          >
            All Activities
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'sales' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('sales')}
          >
            Sales
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'purchases' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('purchases')}
          >
            Purchases
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'mints' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('mints')}
          >
            Mints
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'listings' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('listings')}
          >
            Listings
          </button>
        </div>
      </div>
      
      {/* Time period filter */}
      <div className="flex mb-6 space-x-2 pb-4">
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
      
      {/* Search component */}
      <div className="mb-6">
        <ActivitySearch onSearch={handleSearch} />
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
      
      {/* Main content area */}
      <div className="mb-8">
        {!isLoading && filteredActivities.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-500">No activities found</p>
            <p className="text-gray-400 mt-2">Try changing your filters or time period</p>
          </div>
        ) : (
          <div>
            <ActivityTimeline activities={filteredActivities} />
          </div>
        )}
      </div>
      
      {/* Price history chart */}
      {!isLoading && filteredActivities.length > 0 && filteredActivities.some(a => a.price !== undefined) && (
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4">Price History</h3>
          <NFTPriceHistory 
            activities={filteredActivities} 
            initialTimeframe={timeframe}
          />
        </div>
      )}
      
      {/* Export component */}
      {filteredActivities.length > 0 && (
        <div className="mt-8">
          <ActivityExport 
            activities={filteredActivities} 
            filename={`my-nft-activities-${activeTab}-${timeframe}`}
          />
        </div>
      )}
    </div>
  );
} 