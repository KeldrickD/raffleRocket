'use client';

import React, { useState, useEffect } from 'react';
import { NFTActivity, NFTActivityType } from '@/types/activity';
import { ActivitySearch, ActivitySearchFilters } from '@/components/ActivitySearch';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { NFTPriceHistory } from '@/components/NFTPriceHistory';
import { ActivityExport } from '@/components/ActivityExport';
import { getCollectionActivity } from '@/services/activityService';
import Link from 'next/link';

interface CollectionActivityPageProps {
  params: {
    id: string;
  };
}

export default function CollectionActivityPage({ params }: CollectionActivityPageProps) {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'listings' | 'mints' | 'transfers'>('all');
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  // Fetch collection activities
  useEffect(() => {
    const fetchCollectionActivities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getCollectionActivity(params.id);
        setActivities(data);
        
        // Set collection name if available
        if (data.length > 0 && data[0].collectionName) {
          setCollectionName(data[0].collectionName);
        }
      } catch (err) {
        console.error('Failed to fetch collection activities:', err);
        setError('Failed to load collection activity data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionActivities();
  }, [params.id]);

  // Filter activities by type and timeframe
  const getFilteredActivities = () => {
    let filtered = activities;
    
    // Filter by activity type
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'sales':
          filtered = filtered.filter(a => a.type === 'sale');
          break;
        case 'listings':
          filtered = filtered.filter(a => a.type === 'list' || a.type === 'delist');
          break;
        case 'mints':
          filtered = filtered.filter(a => a.type === 'mint');
          break;
        case 'transfers':
          filtered = filtered.filter(a => a.type === 'transfer');
          break;
      }
    }
    
    // Filter by timeframe
    if (timeframe !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (timeframe) {
        case '24h':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(activity => activity.timestamp >= cutoffDate);
    }

    return filtered;
  };

  const filteredActivities = getFilteredActivities();

  // Handle search
  const handleSearch = async (filters: ActivitySearchFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get collection activities first
      const data = await getCollectionActivity(params.id);
      
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
      
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filtered = filtered.filter(activity => 
          (activity.nftName && activity.nftName.toLowerCase().includes(keyword)) ||
          activity.type.toLowerCase().includes(keyword) ||
          activity.mint.toLowerCase().includes(keyword)
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

  // Calculate collection stats
  const calculateCollectionStats = () => {
    const sales = activities.filter(a => a.type === 'sale' && a.price !== undefined);
    const listings = activities.filter(a => a.type === 'list' && a.price !== undefined);
    const mints = activities.filter(a => a.type === 'mint');
    
    // Trading volume
    const totalVolume = sales.reduce((sum, a) => sum + (a.price || 0), 0);
    
    // Average sale price
    const avgSalePrice = sales.length > 0 
      ? totalVolume / sales.length 
      : 0;
    
    // Floor price (lowest active listing)
    const activeListings = listings.filter(a => {
      // Check if this listing has been delisted or sold
      const hasDelisted = activities.some(
        b => b.type === 'delist' && b.mint === a.mint && b.timestamp > a.timestamp
      );
      const hasSold = activities.some(
        b => b.type === 'sale' && b.mint === a.mint && b.timestamp > a.timestamp
      );
      return !hasDelisted && !hasSold;
    });
    const floorPrice = activeListings.length > 0
      ? Math.min(...activeListings.map(a => a.price || Infinity))
      : null;
    
    // Number of unique NFTs in the collection with activity
    const uniqueNFTs = new Set(activities.map(a => a.mint)).size;
    
    return {
      totalVolume,
      avgSalePrice,
      floorPrice,
      salesCount: sales.length,
      listingsCount: listings.length,
      mintsCount: mints.length,
      uniqueNFTs
    };
  };

  const stats = calculateCollectionStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link href={`/collections/${params.id}`} className="text-blue-500 hover:text-blue-700 mr-2">
            <span className="inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
          <h1 className="text-3xl font-bold">
            {collectionName || params.id} Activity
          </h1>
        </div>
        
        <p className="text-gray-600">
          Track and analyze market activity for this collection
        </p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Volume</h3>
          <p className="text-3xl font-bold">{stats.totalVolume.toFixed(2)} SOL</p>
          <p className="text-sm text-gray-500 mt-1">{stats.salesCount} sales</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Average Price</h3>
          <p className="text-3xl font-bold">{stats.avgSalePrice.toFixed(2)} SOL</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Floor Price</h3>
          <p className="text-3xl font-bold">
            {stats.floorPrice !== null ? `${stats.floorPrice.toFixed(2)} SOL` : 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">{stats.listingsCount} listings</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Unique NFTs</h3>
          <p className="text-3xl font-bold">{stats.uniqueNFTs}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.mintsCount} mints</p>
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
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'listings' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('listings')}
          >
            Listings
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'mints' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('mints')}
          >
            Mints
          </button>
          <button
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'transfers' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('transfers')}
          >
            Transfers
          </button>
        </div>
      </div>
      
      {/* Time period filter */}
      <div className="flex mb-6 space-x-2 pb-4">
        <button
          className={`px-4 py-2 rounded-lg ${timeframe === '24h' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTimeframe('24h')}
        >
          24 Hours
        </button>
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
            initialTimeframe={timeframe === '24h' ? '7d' : timeframe}
          />
        </div>
      )}
      
      {/* Export component */}
      {filteredActivities.length > 0 && (
        <div className="mt-8">
          <ActivityExport 
            activities={filteredActivities} 
            filename={`collection-${params.id}-activities-${activeTab}-${timeframe}`}
          />
        </div>
      )}
    </div>
  );
} 