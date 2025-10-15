import React, { useState, useEffect } from 'react';
import { getCollectionActivity } from '@/services/activityService';
import { NFTActivity } from '@/types/activity';
import { Spinner } from '@/components/common/Spinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

// Define interface for collection activity data
interface CollectionActivityData {
  activities: NFTActivity[];
  collectionName?: string;
}

export default function CollectionComparisonPage() {
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [collectionInput, setCollectionInput] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [collectionData, setCollectionData] = useState<Record<string, { 
    activities: NFTActivity[],
    name: string,
    loading: boolean,
    error: string | null
  }>>({});
  const [comparisonMetric, setComparisonMetric] = useState<'sales' | 'volume' | 'avgPrice' | 'listings' | 'uniqueOwners'>('volume');

  // Add a collection to compare
  const addCollection = () => {
    if (!collectionInput || collectionIds.includes(collectionInput)) return;
    
    const newCollectionIds = [...collectionIds, collectionInput];
    setCollectionIds(newCollectionIds);
    
    // Initialize collection data
    setCollectionData(prev => ({
      ...prev,
      [collectionInput]: {
        activities: [],
        name: `Collection ${collectionInput.substring(0, 6)}`,
        loading: true,
        error: null
      }
    }));
    
    // Fetch collection data
    fetchCollectionData(collectionInput);
    
    // Clear input
    setCollectionInput('');
  };

  // Remove a collection from comparison
  const removeCollection = (id: string) => {
    setCollectionIds(collectionIds.filter(cid => cid !== id));
    
    // Remove collection data
    setCollectionData(prev => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
  };

  // Fetch collection activity data
  const fetchCollectionData = async (collectionId: string) => {
    try {
      const activities = await getCollectionActivity(collectionId);
      
      // Extract collection name from the first activity if available
      const collectionName = activities.length > 0 ? activities[0].collectionName : undefined;
      
      setCollectionData(prev => ({
        ...prev,
        [collectionId]: {
          ...prev[collectionId],
          activities,
          name: collectionName || `Collection ${collectionId.substring(0, 6)}`,
          loading: false,
          error: null
        }
      }));
    } catch (error) {
      console.error(`Error fetching collection ${collectionId}:`, error);
      setCollectionData(prev => ({
        ...prev,
        [collectionId]: {
          ...prev[collectionId],
          loading: false,
          error: 'Failed to load collection data'
        }
      }));
    }
  };

  // Update data when timeframe changes
  useEffect(() => {
    // Refetch data for all collections when timeframe changes
    collectionIds.forEach(id => {
      fetchCollectionData(id);
    });
  }, [timeframe]);

  // Get filtered activities based on timeframe
  const getFilteredActivities = (activities: NFTActivity[]): NFTActivity[] => {
    if (!activities) return [];
    if (timeframe === 'all') return activities;
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '24h':
        startDate = new Date(now.setHours(now.getHours() - 24));
        break;
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0);
    }
    
    return activities.filter(activity => new Date(activity.timestamp) >= startDate);
  };

  // Calculate metrics for a collection
  const calculateMetrics = (collectionId: string) => {
    const collInfo = collectionData[collectionId];
    if (!collInfo || collInfo.loading || collInfo.error) return null;
    
    const filteredActivities = getFilteredActivities(collInfo.activities);
    const salesActivities = filteredActivities.filter(a => a.type === 'sale');
    const listingActivities = filteredActivities.filter(a => a.type === 'list');
    
    // Calculate unique owners (based on toAddress of transfer and sale activities)
    const uniqueOwners = new Set<string>();
    filteredActivities
      .filter(a => (a.type === 'transfer' || a.type === 'sale') && a.toAddress)
      .forEach(a => a.toAddress && uniqueOwners.add(a.toAddress));
    
    // Calculate total volume
    const totalVolume = salesActivities.reduce((sum, activity) => sum + (activity.price || 0), 0);
    
    // Calculate average price
    const avgPrice = salesActivities.length > 0 
      ? totalVolume / salesActivities.length 
      : 0;
    
    return {
      sales: salesActivities.length,
      volume: totalVolume,
      avgPrice,
      listings: listingActivities.length,
      uniqueOwners: uniqueOwners.size
    };
  };

  // Get display name for metric
  const getMetricName = (metric: string) => {
    switch (metric) {
      case 'sales': return 'Sales Count';
      case 'volume': return 'Sales Volume (SOL)';
      case 'avgPrice': return 'Average Sale Price (SOL)';
      case 'listings': return 'Listings Count';
      case 'uniqueOwners': return 'Unique Owners';
      default: return metric;
    }
  };

  // Format metric value for display
  const formatMetricValue = (metric: string, value: number) => {
    if (metric === 'volume' || metric === 'avgPrice') {
      return value.toFixed(2) + ' SOL';
    }
    return value.toString();
  };

  // Determine the highest metric value
  const getHighestMetricValue = () => {
    let highest = 0;
    
    collectionIds.forEach(id => {
      const metrics = calculateMetrics(id);
      if (metrics && metrics[comparisonMetric] > highest) {
        highest = metrics[comparisonMetric];
      }
    });
    
    return highest;
  };

  // Calculate percentage of highest for visualization
  const calculatePercentage = (value: number) => {
    const highest = getHighestMetricValue();
    return highest > 0 ? (value / highest) * 100 : 0;
  };

  // Sort collections by current comparison metric
  const sortedCollections = [...collectionIds].sort((a, b) => {
    const metricsA = calculateMetrics(a);
    const metricsB = calculateMetrics(b);
    
    if (!metricsA) return 1;
    if (!metricsB) return -1;
    
    return metricsB[comparisonMetric] - metricsA[comparisonMetric];
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Collection Comparison</h1>
      
      {/* Collection input */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-medium mb-4">Add Collections to Compare</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={collectionInput}
            onChange={(e) => setCollectionInput(e.target.value)}
            placeholder="Enter collection ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addCollection}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
        
        {collectionIds.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Add at least one collection ID to start comparing
          </p>
        )}
      </div>
      
      {collectionIds.length > 0 && (
        <>
          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <label htmlFor="metric" className="block text-sm font-medium text-gray-700 mb-1">
                  Compare by
                </label>
                <select
                  id="metric"
                  value={comparisonMetric}
                  onChange={(e) => setComparisonMetric(e.target.value as any)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="volume">Sales Volume</option>
                  <option value="sales">Number of Sales</option>
                  <option value="avgPrice">Average Sale Price</option>
                  <option value="listings">Number of Listings</option>
                  <option value="uniqueOwners">Unique Owners</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">
                  Timeframe
                </label>
                <select
                  id="timeframe"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-medium mb-4">
              Comparison of {getMetricName(comparisonMetric)}
            </h2>
            
            <div className="space-y-6">
              {sortedCollections.map((collectionId) => {
                const collInfo = collectionData[collectionId];
                
                if (collInfo.loading) {
                  return (
                    <div key={collectionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <span>{collInfo.name}</span>
                      </div>
                      <Spinner size="sm" />
                    </div>
                  );
                }
                
                if (collInfo.error) {
                  return (
                    <div key={collectionId} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span>{collInfo.name}</span>
                        <button 
                          onClick={() => removeCollection(collectionId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <ErrorMessage message={collInfo.error} />
                    </div>
                  );
                }
                
                const metrics = calculateMetrics(collectionId);
                if (!metrics) return null;
                
                const percentage = calculatePercentage(metrics[comparisonMetric]);
                
                return (
                  <div key={collectionId} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{collInfo.name}</span>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold">
                          {formatMetricValue(comparisonMetric, metrics[comparisonMetric])}
                        </span>
                        <button 
                          onClick={() => removeCollection(collectionId)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Sales: {metrics.sales}</div>
                      <div>Volume: {metrics.volume.toFixed(2)} SOL</div>
                      <div>Avg Price: {metrics.avgPrice.toFixed(2)} SOL</div>
                      <div>Listings: {metrics.listings}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Additional metrics comparison */}
          {collectionIds.length >= 2 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-4">Detailed Metrics Comparison</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (SOL)</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price (SOL)</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Listings</th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Owners</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedCollections.map((collectionId) => {
                      const collInfo = collectionData[collectionId];
                      if (collInfo.loading || collInfo.error) return null;
                      
                      const metrics = calculateMetrics(collectionId);
                      if (!metrics) return null;
                      
                      return (
                        <tr key={collectionId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {collInfo.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {metrics.sales}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {metrics.volume.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {metrics.avgPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {metrics.listings}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {metrics.uniqueOwners}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 