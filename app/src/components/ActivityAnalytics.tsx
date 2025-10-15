import React, { useState, useEffect } from 'react';
import { NFTActivity, NFTActivityType } from '@/types/activity';
import { getRecentActivity } from '@/services/activityService';

interface ActivityStat {
  type: NFTActivityType;
  count: number;
  percentage: number;
}

interface CollectionStat {
  collectionId: string;
  collectionName: string | undefined;
  count: number;
}

export const ActivityAnalytics: React.FC = () => {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStat[]>([]);
  const [topCollections, setTopCollections] = useState<CollectionStat[]>([]);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        // Get a large sample of recent activities
        const recentActivities = await getRecentActivity(100);
        
        // Filter activities based on timeframe
        const now = new Date();
        const filtered = recentActivities.filter(activity => {
          const activityDate = new Date(activity.timestamp);
          
          switch (timeframe) {
            case 'day':
              return (now.getTime() - activityDate.getTime()) < (24 * 60 * 60 * 1000);
            case 'week':
              return (now.getTime() - activityDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
            case 'month':
              return (now.getTime() - activityDate.getTime()) < (30 * 24 * 60 * 60 * 1000);
            default:
              return true;
          }
        });
        
        setActivities(filtered);
        
        // Calculate activity type stats
        calculateActivityStats(filtered);
        
        // Calculate top collections
        calculateTopCollections(filtered);
      } catch (error) {
        console.error('Error fetching activity data for analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [timeframe]);

  const calculateActivityStats = (data: NFTActivity[]) => {
    const types: Record<NFTActivityType, number> = {
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
    
    // Count each activity type
    data.forEach(activity => {
      types[activity.type]++;
    });
    
    // Convert to array and calculate percentages
    const totalCount = data.length;
    const stats = Object.entries(types).map(([type, count]) => ({
      type: type as NFTActivityType,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    }));
    
    // Sort by count (descending)
    stats.sort((a, b) => b.count - a.count);
    
    setActivityStats(stats);
  };

  const calculateTopCollections = (data: NFTActivity[]) => {
    const collections: Record<string, { count: number; name?: string }> = {};
    
    // Count activities per collection
    data.forEach(activity => {
      if (activity.collectionId) {
        if (!collections[activity.collectionId]) {
          collections[activity.collectionId] = { 
            count: 0,
            name: activity.collectionName
          };
        }
        collections[activity.collectionId].count++;
      }
    });
    
    // Convert to array
    const collectionStats = Object.entries(collections).map(([id, data]) => ({
      collectionId: id,
      collectionName: data.name,
      count: data.count
    }));
    
    // Sort by count (descending) and take top 5
    collectionStats.sort((a, b) => b.count - a.count);
    setTopCollections(collectionStats.slice(0, 5));
  };

  const getActivityTypeName = (type: NFTActivityType): string => {
    switch (type) {
      case 'mint': return 'Mints';
      case 'transfer': return 'Transfers';
      case 'list': return 'Listings';
      case 'delist': return 'Delistings';
      case 'sale': return 'Sales';
      case 'offer': return 'Offers';
      case 'burn': return 'Burns';
      case 'raffle_create': return 'Raffle Creates';
      case 'raffle_join': return 'Raffle Entries';
      case 'raffle_complete': return 'Raffle Completions';
      default: return type;
    }
  };

  const getActivityTypeColor = (type: NFTActivityType): string => {
    switch (type) {
      case 'mint': return 'bg-green-200';
      case 'transfer': return 'bg-blue-200';
      case 'list': return 'bg-yellow-200';
      case 'delist': return 'bg-gray-200';
      case 'sale': return 'bg-purple-200';
      case 'offer': return 'bg-indigo-200';
      case 'burn': return 'bg-red-200';
      case 'raffle_create': return 'bg-pink-200';
      case 'raffle_join': return 'bg-pink-100';
      case 'raffle_complete': return 'bg-pink-300';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Activity Analytics</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeframe('day')}
            className={`px-3 py-1 text-sm rounded ${
              timeframe === 'day' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            24h
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 text-sm rounded ${
              timeframe === 'week' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 text-sm rounded ${
              timeframe === 'month' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            30d
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Type Distribution */}
          <div>
            <h3 className="font-medium text-gray-700 mb-4">Activity Distribution</h3>
            
            {activities.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No activity data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activityStats.filter(stat => stat.count > 0).map(stat => (
                  <div key={stat.type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{getActivityTypeName(stat.type)}</span>
                      <span className="font-medium">{stat.count} ({stat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className={`${getActivityTypeColor(stat.type)} h-2.5 rounded-full`} 
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Top Collections */}
          <div>
            <h3 className="font-medium text-gray-700 mb-4">Most Active Collections</h3>
            
            {topCollections.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No collection data available</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Collection
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activities
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topCollections.map(collection => (
                      <tr key={collection.collectionId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {collection.collectionName || `Collection ${collection.collectionId.substring(0, 8)}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {collection.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Summary Stats */}
          <div className="lg:col-span-2">
            <h3 className="font-medium text-gray-700 mb-4">Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-green-500 font-medium">Total Activity</div>
                <div className="text-2xl font-bold">{activities.length}</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-blue-500 font-medium">Sales</div>
                <div className="text-2xl font-bold">
                  {activityStats.find(s => s.type === 'sale')?.count || 0}
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <div className="text-yellow-500 font-medium">Listings</div>
                <div className="text-2xl font-bold">
                  {activityStats.find(s => s.type === 'list')?.count || 0}
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="text-purple-500 font-medium">Mints</div>
                <div className="text-2xl font-bold">
                  {activityStats.find(s => s.type === 'mint')?.count || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 