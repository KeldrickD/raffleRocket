import React from 'react';
import { getRecentActivity } from '@/services/activityService';
import { NFTActivity, NFTActivityType } from '@/types/activity';
import { ActivityCalendar } from '@/components/ActivityCalendar';
import { ActivityExport } from '@/components/ActivityExport';
import Link from 'next/link';

// Number of activities to fetch
const ACTIVITIES_LIMIT = 100;

export default async function ActivityPage() {
  // Fetch activities data
  let activities: NFTActivity[] = [];
  let errorMessage = '';
  
  try {
    activities = await getRecentActivity(ACTIVITIES_LIMIT);
  } catch (error) {
    console.error('Error fetching activities:', error);
    errorMessage = 'Failed to load recent activities. Please try again later.';
  }
  
  // Calculate activity statistics
  const stats = calculateActivityStats(activities);
  
  // Get top collections based on activity
  const topCollections = getTopCollections(activities);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activity Feed</h1>
        
        <div className="flex space-x-4">
          <Link 
            href="/analytics/activity"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2h14a1 1 0 100-2H3zm0 6a1 1 0 000 2h9a1 1 0 100-2H3zm0 6a1 1 0 100 2h5a1 1 0 100-2H3z" clipRule="evenodd" />
            </svg>
            Analytics
          </Link>
          
          <Link 
            href="/analytics/activity/comparison"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Compare
          </Link>
        </div>
      </div>
      
      {errorMessage ? (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity stats */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-blue-800">Sales</p>
                    <p className="mt-1 text-3xl font-semibold text-blue-900">{stats.sales}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-green-800">Volume</p>
                    <p className="mt-1 text-3xl font-semibold text-green-900">{stats.volume.toFixed(1)} SOL</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-purple-800">Listings</p>
                    <p className="mt-1 text-3xl font-semibold text-purple-900">{stats.listings}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-yellow-800">Mints</p>
                    <p className="mt-1 text-3xl font-semibold text-yellow-900">{stats.mints}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activity Calendar */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Calendar</h2>
                <ActivityCalendar activities={activities} />
              </div>
            </div>
            
            {/* Activity Export */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Export Activity Data</h2>
                <ActivityExport activities={activities} fileName="nft-activities" />
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Collections */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Most Active Collections</h2>
                <ul className="divide-y divide-gray-200">
                  {topCollections.length > 0 ? (
                    topCollections.map((collection, index) => (
                      <li key={index} className="py-3">
                        <Link 
                          href={`/collections/${collection.id}/activity`}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs">
                              {index + 1}
                            </span>
                            <span className="ml-3 font-medium text-gray-900 group-hover:text-blue-600">
                              {collection.name}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="mr-1">{collection.count}</span>
                            <span>activities</span>
                          </div>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="py-3 text-center text-gray-500">No collection data available</li>
                  )}
                </ul>
                
                <div className="mt-4">
                  <Link
                    href="/analytics/activity/comparison"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Compare Collections →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Activity Type Distribution */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Distribution</h2>
                {renderActivityTypeDistribution(activities)}
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
                <nav className="space-y-2">
                  <Link 
                    href="/profile/activity"
                    className="flex items-center p-2 rounded-md hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>Your Activity</span>
                  </Link>
                  <Link 
                    href="/profile/notifications"
                    className="flex items-center p-2 rounded-md hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span>Notification Settings</span>
                  </Link>
                  <Link 
                    href="/developers/webhooks"
                    className="flex items-center p-2 rounded-md hover:bg-gray-50"
                  >
                    <svg className="h-5 w-5 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span>Developer API</span>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Calculate activity statistics
function calculateActivityStats(activities: NFTActivity[]) {
  return {
    sales: activities.filter(a => a.type === 'sale').length,
    listings: activities.filter(a => a.type === 'list').length,
    mints: activities.filter(a => a.type === 'mint').length,
    volume: activities
      .filter(a => a.type === 'sale' && a.price)
      .reduce((sum, a) => sum + (a.price || 0), 0)
  };
}

// Get top collections based on activity count
function getTopCollections(activities: NFTActivity[], limit: number = 5) {
  // Create a map of collection IDs to activity counts
  const collectionMap = new Map<string, { id: string; name: string; count: number }>();
  
  activities.forEach(activity => {
    if (activity.collectionId && activity.collectionName) {
      if (!collectionMap.has(activity.collectionId)) {
        collectionMap.set(activity.collectionId, {
          id: activity.collectionId,
          name: activity.collectionName,
          count: 0
        });
      }
      
      collectionMap.get(activity.collectionId)!.count++;
    }
  });
  
  // Convert map to array and sort by count
  return Array.from(collectionMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Render activity type distribution
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