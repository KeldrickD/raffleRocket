'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNFTActivity } from '@/services/activityService';
import { NFTActivity, NFTActivityType } from '@/types/activity';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { NFTPriceHistory } from '@/components/NFTPriceHistory';
import { ActivityExport } from '@/components/ActivityExport';

interface NFTActivityPageParams {
  params: {
    mint: string;
  };
}

export default function NFTActivityPage({ params }: NFTActivityPageParams) {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'price' | 'ownership'>('all');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [nftDetails, setNftDetails] = useState<{
    name: string;
    image: string | null;
    collectionName: string | null;
    collectionId: string | null;
  }>({
    name: 'NFT',
    image: null,
    collectionName: null,
    collectionId: null
  });

  // Fetch NFT activities
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getNFTActivity(params.mint);
        setActivities(data);
        
        // Set NFT details from first activity
        if (data.length > 0) {
          setNftDetails({
            name: data[0].nftName || 'NFT',
            image: data[0].nftImage || null,
            collectionName: data[0].collectionName || null,
            collectionId: data[0].collectionId || null
          });
        }
      } catch (err) {
        console.error('Failed to fetch NFT activities:', err);
        setError('Could not load activities for this NFT. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [params.mint]);

  // Filter activities based on active tab and timeframe
  const getFilteredActivities = (): NFTActivity[] => {
    let filtered = [...activities];
    
    // Filter by tab
    if (activeTab === 'price') {
      filtered = filtered.filter(a => ['sale', 'list', 'delist', 'offer'].includes(a.type));
    } else if (activeTab === 'ownership') {
      filtered = filtered.filter(a => ['transfer', 'mint', 'burn', 'sale'].includes(a.type));
    }
    
    // Filter by timeframe
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (timeframe) {
        case '7d':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(a => new Date(a.timestamp) >= startDate);
    }
    
    return filtered;
  };

  // Calculate activity stats
  const getActivityStats = () => {
    const salesActivities = activities.filter(a => a.type === 'sale');
    const latestSale = salesActivities.length > 0 
      ? salesActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      : null;
      
    return {
      totalActivities: activities.length,
      salesCount: salesActivities.length,
      latestPrice: latestSale?.price || null,
      owners: new Set(activities
        .filter(a => (a.type === 'transfer' || a.type === 'sale' || a.type === 'mint') && a.toAddress)
        .map(a => a.toAddress)
      ).size
    };
  };

  const stats = getActivityStats();
  const filteredActivities = getFilteredActivities();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link href={`/nft/${params.mint}`} className="text-blue-500 hover:text-blue-700 mr-2">
            <span className="inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
          <h1 className="text-3xl font-bold">Activity History</h1>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex items-center">
            {nftDetails.image && (
              <img 
                src={nftDetails.image} 
                alt={nftDetails.name} 
                className="w-12 h-12 rounded-lg object-cover mr-4"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{nftDetails.name}</h2>
              {nftDetails.collectionName && nftDetails.collectionId && (
                <Link 
                  href={`/collections/${nftDetails.collectionId}`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {nftDetails.collectionName}
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0 md:ml-auto">
            <div className="bg-blue-50 p-2 rounded-lg">
              <p className="text-sm text-blue-800">Activities</p>
              <p className="text-xl font-bold text-blue-900">{stats.totalActivities}</p>
            </div>
            
            <div className="bg-green-50 p-2 rounded-lg">
              <p className="text-sm text-green-800">Sales</p>
              <p className="text-xl font-bold text-green-900">{stats.salesCount}</p>
            </div>
            
            <div className="bg-purple-50 p-2 rounded-lg">
              <p className="text-sm text-purple-800">Latest Price</p>
              <p className="text-xl font-bold text-purple-900">
                {stats.latestPrice !== null ? `${stats.latestPrice.toFixed(2)} SOL` : 'N/A'}
              </p>
            </div>
            
            <div className="bg-yellow-50 p-2 rounded-lg">
              <p className="text-sm text-yellow-800">Owners</p>
              <p className="text-xl font-bold text-yellow-900">{stats.owners}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs and filters */}
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex space-x-4">
                  <button
                    className={`px-4 py-2 rounded-md ${
                      activeTab === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveTab('all')}
                  >
                    All Activity
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      activeTab === 'price'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveTab('price')}
                  >
                    Price Activity
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      activeTab === 'ownership'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setActiveTab('ownership')}
                  >
                    Ownership
                  </button>
                </div>
                
                <div>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as any)}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Price Chart */}
            {activeTab === 'price' && (
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Price History</h3>
                <div className="h-64">
                  <NFTPriceHistory activities={activities} initialTimeframe={timeframe} />
                </div>
              </div>
            )}
            
            {/* Activity Timeline */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Activity Timeline
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredActivities.length} activities)
                </span>
              </h3>
              
              {filteredActivities.length > 0 ? (
                <ActivityTimeline activities={filteredActivities} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No activities found with the current filters
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Data</h3>
              <ActivityExport activities={activities} fileName={`nft-${params.mint}-activities`} />
            </div>
            
            {/* Activity Type Distribution */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Types</h3>
              {renderActivityTypeDistribution(activities)}
            </div>
            
            {/* Related Links */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Related Links</h3>
              <div className="space-y-2">
                <Link 
                  href={`/nft/${params.mint}`}
                  className="flex items-center p-2 rounded-md hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                  </svg>
                  <span>NFT Details</span>
                </Link>
                
                {nftDetails.collectionId && (
                  <Link 
                    href={`/collections/${nftDetails.collectionId}`}
                    className="flex items-center p-2 rounded-md hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    <span>Collection</span>
                  </Link>
                )}
                
                {nftDetails.collectionId && (
                  <Link 
                    href={`/collections/${nftDetails.collectionId}/activity`}
                    className="flex items-center p-2 rounded-md hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                    <span>Collection Activity</span>
                  </Link>
                )}
                
                <a 
                  href={`https://solscan.io/token/${params.mint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded-md hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  <span>View on Solscan</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to render activity type distribution
function renderActivityTypeDistribution(activities: NFTActivity[]) {
  const activityTypes: Record<NFTActivityType, number> = {
    'sale': 0,
    'list': 0,
    'delist': 0,
    'mint': 0,
    'transfer': 0,
    'offer': 0,
    'burn': 0,
    'raffle_create': 0,
    'raffle_join': 0,
    'raffle_complete': 0
  };
  
  // Count activities by type
  activities.forEach(activity => {
    activityTypes[activity.type]++;
  });
  
  // Get total count
  const totalCount = activities.length;
  
  // Sort by count
  const sortedTypes = Object.entries(activityTypes)
    .filter(([, count]) => count > 0)
    .sort(([, countA], [, countB]) => countB - countA);
  
  return (
    <div className="space-y-3">
      {sortedTypes.map(([type, count]) => {
        const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
        const typeColor = getActivityTypeColor(type as NFTActivityType);
        
        return (
          <div key={type}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {formatActivityType(type as NFTActivityType)}
              </span>
              <span className="text-sm text-gray-500">
                {count} ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${typeColor}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
      
      {sortedTypes.length === 0 && (
        <p className="text-center text-gray-500">No activity data available</p>
      )}
    </div>
  );
}

// Helper function to get color class for activity type
function getActivityTypeColor(type: NFTActivityType): string {
  switch (type) {
    case 'sale':
      return 'bg-green-500';
    case 'list':
      return 'bg-blue-500';
    case 'delist':
      return 'bg-red-500';
    case 'mint':
      return 'bg-purple-500';
    case 'transfer':
      return 'bg-yellow-500';
    case 'offer':
      return 'bg-indigo-500';
    case 'burn':
      return 'bg-orange-500';
    case 'raffle_create':
      return 'bg-pink-500';
    case 'raffle_join':
      return 'bg-teal-500';
    case 'raffle_complete':
      return 'bg-cyan-500';
    default:
      return 'bg-gray-500';
  }
}

// Helper function to format activity type for display
function formatActivityType(type: NFTActivityType): string {
  switch (type) {
    case 'sale':
      return 'Sales';
    case 'list':
      return 'Listings';
    case 'delist':
      return 'Delistings';
    case 'mint':
      return 'Mints';
    case 'transfer':
      return 'Transfers';
    case 'offer':
      return 'Offers';
    case 'burn':
      return 'Burns';
    case 'raffle_create':
      return 'Raffle Creation';
    case 'raffle_join':
      return 'Raffle Entries';
    case 'raffle_complete':
      return 'Raffle Completions';
    default:
      return type;
  }
} 