'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getActivity } from '@/services/activityService';
import { NFTActivity, NFTActivityType } from '@/types/activity';
import { ActivityCalendar } from '@/components/ActivityCalendar';

export default function ActivityCalendarPage() {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<3 | 6 | 12>(6);
  const [activityTypes, setActivityTypes] = useState<NFTActivityType[]>([
    'sale', 'list', 'delist', 'mint', 'transfer', 'offer', 'burn',
    'raffle_create', 'raffle_join', 'raffle_complete'
  ]);

  // Fetch all activity data
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getActivity();
        setActivities(data);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError('Could not load activity data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Filter activities by selected types
  const filteredActivities = activities.filter(activity => 
    activityTypes.includes(activity.type)
  );

  // Toggle activity type filter
  const toggleActivityType = (type: NFTActivityType) => {
    setActivityTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Handle selecting all or none
  const selectAllTypes = () => {
    setActivityTypes([
      'sale', 'list', 'delist', 'mint', 'transfer', 'offer', 'burn',
      'raffle_create', 'raffle_join', 'raffle_complete'
    ]);
  };

  const selectNoTypes = () => {
    setActivityTypes([]);
  };

  // Get stats for the selected time range
  const getStats = () => {
    if (filteredActivities.length === 0) {
      return { total: 0, perDay: 0 };
    }
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(now.getMonth() - timeRange);
    
    // Filter activities by date
    const activitiesInRange = filteredActivities.filter(a => 
      new Date(a.timestamp) >= startDate
    );
    
    // Calculate average per day
    const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const perDay = activitiesInRange.length / totalDays;
    
    return {
      total: activitiesInRange.length,
      perDay: perDay
    };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link href="/activity" className="text-blue-500 hover:text-blue-700 mr-2">
            <span className="inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
          <h1 className="text-3xl font-bold">Activity Calendar</h1>
        </div>
        
        <p className="text-gray-600">
          Visualize NFT activity patterns over time
        </p>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg p-6">
              {/* Controls and date range */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-semibold">Activity Over Time</h2>
                  <p className="text-sm text-gray-500">
                    {filteredActivities.length} activities, avg {stats.perDay.toFixed(1)} per day
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTimeRange(3)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      timeRange === 3
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    3 Months
                  </button>
                  <button
                    onClick={() => setTimeRange(6)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      timeRange === 6
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    6 Months
                  </button>
                  <button
                    onClick={() => setTimeRange(12)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      timeRange === 12
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    12 Months
                  </button>
                </div>
              </div>
              
              {/* Calendar component */}
              <ActivityCalendar activities={filteredActivities} months={timeRange} />
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Activity Types</h3>
              
              <div className="flex mb-3">
                <button
                  onClick={selectAllTypes}
                  className="text-sm text-blue-600 hover:text-blue-800 mr-4"
                >
                  Select All
                </button>
                <button
                  onClick={selectNoTypes}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-2">
                {[
                  { type: 'sale', label: 'Sales', color: 'bg-green-100 text-green-800' },
                  { type: 'list', label: 'Listings', color: 'bg-blue-100 text-blue-800' },
                  { type: 'delist', label: 'Delistings', color: 'bg-red-100 text-red-800' },
                  { type: 'mint', label: 'Mints', color: 'bg-purple-100 text-purple-800' },
                  { type: 'transfer', label: 'Transfers', color: 'bg-yellow-100 text-yellow-800' },
                  { type: 'offer', label: 'Offers', color: 'bg-indigo-100 text-indigo-800' },
                  { type: 'burn', label: 'Burns', color: 'bg-orange-100 text-orange-800' },
                  { type: 'raffle_create', label: 'Raffle Creation', color: 'bg-pink-100 text-pink-800' },
                  { type: 'raffle_join', label: 'Raffle Entries', color: 'bg-pink-100 text-pink-800' },
                  { type: 'raffle_complete', label: 'Raffle Completion', color: 'bg-pink-100 text-pink-800' }
                ].map(item => (
                  <div key={item.type} className="flex items-center">
                    <input
                      id={`filter-${item.type}`}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={activityTypes.includes(item.type as NFTActivityType)}
                      onChange={() => toggleActivityType(item.type as NFTActivityType)}
                    />
                    <label htmlFor={`filter-${item.type}`} className="ml-2 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.color} mr-1`}>
                        {item.label}
                      </span>
                      <span className="text-gray-500 text-xs">
                        ({activities.filter(a => a.type === item.type).length})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Activity Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Activity Stats</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Activities</h4>
                  <p className="text-2xl font-bold">{filteredActivities.length}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Most Active Day</h4>
                  {getMostActiveDay(filteredActivities)}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Activity Breakdown</h4>
                  {renderActivityBreakdown(activities)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get the most active day
function getMostActiveDay(activities: NFTActivity[]): JSX.Element {
  if (activities.length === 0) {
    return <p className="text-gray-500">No data available</p>;
  }
  
  // Group activities by date
  const activityByDate = activities.reduce((acc, activity) => {
    const dateStr = new Date(activity.timestamp).toDateString();
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Find the date with the most activities
  let maxDate = '';
  let maxCount = 0;
  
  Object.entries(activityByDate).forEach(([date, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxDate = date;
    }
  });
  
  if (!maxDate) {
    return <p className="text-gray-500">No data available</p>;
  }
  
  return (
    <div>
      <p className="text-xl font-semibold">{new Date(maxDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      <p className="text-sm text-gray-500">{maxCount} activities</p>
    </div>
  );
}

// Helper function to render activity breakdown
function renderActivityBreakdown(activities: NFTActivity[]): JSX.Element {
  if (activities.length === 0) {
    return <p className="text-gray-500">No data available</p>;
  }
  
  // Count activities by type
  const typeCount: Record<string, number> = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort by count
  const sortedTypes = Object.entries(typeCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5); // Top 5
  
  return (
    <div className="space-y-2">
      {sortedTypes.map(([type, count]) => {
        const percentage = Math.round((count / activities.length) * 100);
        return (
          <div key={type} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="capitalize text-sm">{type.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">{percentage}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
} 