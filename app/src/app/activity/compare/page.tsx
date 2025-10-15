'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCollectionActivity } from '@/services/activityService';
import { NFTActivity, NFTActivityType } from '@/types/activity';

interface CollectionComparison {
  id: string;
  name: string;
  activities: NFTActivity[];
  stats: {
    totalActivities: number;
    sales: number;
    listings: number;
    totalVolume: number;
    avgPrice: number;
    maxPrice: number;
    minPrice: number;
  };
  chartData: {
    labels: string[];
    salesData: number[];
    listingsData: number[];
    avgPriceData: number[];
  };
}

export default function CollectionComparisonPage() {
  const [collections, setCollections] = useState<CollectionComparison[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionId, setCollectionId] = useState('');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [metric, setMetric] = useState<'volume' | 'price' | 'count'>('volume');
  
  // Demo collection IDs for quick selection
  const demoCollections = [
    { id: 'famous-foxes', name: 'Famous Foxes' },
    { id: 'solana-monkes', name: 'Solana Monkes' },
    { id: 'okay-bears', name: 'Okay Bears' },
    { id: 'degenerate-ape', name: 'Degenerate Ape Academy' }
  ];

  // Add a collection to the comparison
  const addCollection = async () => {
    if (!collectionId.trim()) return;
    
    // Check if collection is already added
    if (collections.some(c => c.id === collectionId)) {
      setError('This collection is already in the comparison');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const activities = await getCollectionActivity(collectionId);
      
      // Filter by timeframe
      const filteredActivities = filterActivitiesByTimeframe(activities, timeframe);
      
      // Get collection name from activities (in real app, would fetch from collection service)
      const collectionName = filteredActivities.length > 0 && filteredActivities[0].collectionName 
        ? filteredActivities[0].collectionName 
        : `Collection ${collectionId}`;
      
      // Calculate stats
      const stats = calculateCollectionStats(filteredActivities);
      
      // Generate chart data
      const chartData = generateChartData(filteredActivities, timeframe);
      
      // Add to collections
      setCollections(prev => [...prev, {
        id: collectionId,
        name: collectionName,
        activities: filteredActivities,
        stats,
        chartData
      }]);
      
      // Reset input
      setCollectionId('');
    } catch (err) {
      console.error('Failed to fetch collection activities:', err);
      setError('Error fetching collection data. Please check the collection ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a collection from comparison
  const removeCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  // Update data when timeframe changes
  useEffect(() => {
    // Skip if no collections yet
    if (collections.length === 0) return;
    
    // Recalculate for each collection
    const updatedCollections = collections.map(collection => {
      const filteredActivities = filterActivitiesByTimeframe(collection.activities, timeframe);
      return {
        ...collection,
        stats: calculateCollectionStats(filteredActivities),
        chartData: generateChartData(filteredActivities, timeframe)
      };
    });
    
    setCollections(updatedCollections);
  }, [timeframe]);

  // Filter activities by timeframe
  const filterActivitiesByTimeframe = (activities: NFTActivity[], timeframe: string): NFTActivity[] => {
    if (timeframe === 'all') return activities;
    
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
    
    return activities.filter(a => new Date(a.timestamp) >= startDate);
  };

  // Calculate collection statistics
  const calculateCollectionStats = (activities: NFTActivity[]) => {
    const sales = activities.filter(a => a.type === 'sale');
    const listings = activities.filter(a => a.type === 'list');
    
    const salesPrices = sales
      .filter(a => a.price !== undefined && a.price > 0)
      .map(a => a.price as number);
    
    const totalVolume = salesPrices.reduce((sum, price) => sum + price, 0);
    const avgPrice = salesPrices.length > 0 ? totalVolume / salesPrices.length : 0;
    const maxPrice = salesPrices.length > 0 ? Math.max(...salesPrices) : 0;
    const minPrice = salesPrices.length > 0 ? Math.min(...salesPrices) : 0;
    
    return {
      totalActivities: activities.length,
      sales: sales.length,
      listings: listings.length,
      totalVolume,
      avgPrice,
      maxPrice,
      minPrice
    };
  };

  // Generate chart data
  const generateChartData = (activities: NFTActivity[], timeframe: string) => {
    // Define time intervals based on timeframe
    const intervals = getTimeIntervals(timeframe);
    
    // Initialize data arrays
    const labels: string[] = [];
    const salesData: number[] = [];
    const listingsData: number[] = [];
    const avgPriceData: number[] = [];
    
    // For each interval, calculate stats
    intervals.forEach(interval => {
      // Add label
      labels.push(formatDateLabel(interval.start, timeframe));
      
      // Filter activities within this interval
      const intervalActivities = activities.filter(
        a => new Date(a.timestamp) >= interval.start && new Date(a.timestamp) < interval.end
      );
      
      // Count sales and listings
      const intervalSales = intervalActivities.filter(a => a.type === 'sale');
      const intervalListings = intervalActivities.filter(a => a.type === 'list');
      
      // Calculate average price for sales in this interval
      const intervalSalesPrices = intervalSales
        .filter(a => a.price !== undefined && a.price > 0)
        .map(a => a.price as number);
      
      const intervalAvgPrice = intervalSalesPrices.length > 0
        ? intervalSalesPrices.reduce((sum, price) => sum + price, 0) / intervalSalesPrices.length
        : 0;
      
      // Add data points
      salesData.push(intervalSales.length);
      listingsData.push(intervalListings.length);
      avgPriceData.push(intervalAvgPrice);
    });
    
    return { labels, salesData, listingsData, avgPriceData };
  };

  // Get time intervals based on timeframe
  const getTimeIntervals = (timeframe: string) => {
    const now = new Date();
    const intervals = [];
    
    let intervalCount: number;
    let intervalUnit: 'day' | 'week' | 'month';
    
    switch (timeframe) {
      case '7d':
        intervalCount = 7;
        intervalUnit = 'day';
        break;
      case '30d':
        intervalCount = 30;
        intervalUnit = 'day';
        break;
      case '90d':
        intervalCount = 12;
        intervalUnit = 'week';
        break;
      default: // 'all'
        intervalCount = 12;
        intervalUnit = 'month';
    }
    
    // Generate intervals
    for (let i = intervalCount - 1; i >= 0; i--) {
      const start = new Date(now);
      const end = new Date(now);
      
      if (intervalUnit === 'day') {
        start.setDate(start.getDate() - i - 1);
        end.setDate(end.getDate() - i);
      } else if (intervalUnit === 'week') {
        start.setDate(start.getDate() - (i + 1) * 7);
        end.setDate(end.getDate() - i * 7);
      } else {
        start.setMonth(start.getMonth() - i - 1);
        end.setMonth(end.getMonth() - i);
      }
      
      // Set time to midnight for consistent intervals
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      intervals.push({ start, end });
    }
    
    return intervals;
  };

  // Format date label for chart
  const formatDateLabel = (date: Date, timeframe: string): string => {
    switch (timeframe) {
      case '7d':
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      case '30d':
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      case '90d':
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      default: // 'all'
        return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }
  };

  // Format price for display
  const formatPrice = (price: number): string => {
    return price.toFixed(2) + ' SOL';
  };

  // Get preferred color for a collection based on its index
  const getCollectionColor = (index: number): string => {
    const colors = [
      'rgb(59, 130, 246)', // blue-500
      'rgb(16, 185, 129)', // green-500
      'rgb(239, 68, 68)',  // red-500
      'rgb(168, 85, 247)', // purple-500
      'rgb(245, 158, 11)', // amber-500
      'rgb(99, 102, 241)'  // indigo-500
    ];
    return colors[index % colors.length];
  };

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
          <h1 className="text-3xl font-bold">Collection Comparison</h1>
        </div>
        
        <p className="text-gray-600">
          Compare activity metrics between different NFT collections
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Add Collection Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Add Collection</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              placeholder="Enter collection ID"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <button
            onClick={addCollection}
            disabled={isLoading || !collectionId.trim()}
            className={`px-4 py-2 rounded-md ${
              isLoading || !collectionId.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoading ? 'Adding...' : 'Add Collection'}
          </button>
        </div>
        
        {/* Demo collections for quick add */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Try these collections:</p>
          <div className="flex flex-wrap gap-2">
            {demoCollections.map(collection => (
              <button
                key={collection.id}
                onClick={() => setCollectionId(collection.id)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                {collection.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Comparison Controls */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="p-2 border border-gray-300 rounded bg-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comparison Metric
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setMetric('volume')}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  metric === 'volume'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sales Volume
              </button>
              <button
                onClick={() => setMetric('price')}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  metric === 'price'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Average Price
              </button>
              <button
                onClick={() => setMetric('count')}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  metric === 'count'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Activity Count
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Collections Comparison */}
      {collections.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-lg text-center">
          <p className="text-gray-500 mb-4">No collections added to comparison</p>
          <p className="text-sm text-gray-400">Add collections using the form above to start comparing</p>
        </div>
      ) : (
        <>
          {/* Collections table */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sales
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listings
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collections.map((collection, index) => (
                  <tr key={collection.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getCollectionColor(index) }}></div>
                        <div className="text-sm font-medium text-gray-900">{collection.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{collection.stats.sales}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(collection.stats.totalVolume)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatPrice(collection.stats.avgPrice)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{collection.stats.listings}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => removeCollection(collection.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Chart visualization */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-6">
              {metric === 'volume' && 'Sales Volume Comparison'}
              {metric === 'price' && 'Average Price Comparison'}
              {metric === 'count' && 'Activity Count Comparison'}
            </h2>
            
            <div className="h-80 relative">
              {/* Chart rendering would go here with a library like Chart.js */}
              {/* For this example, we'll use a simplified visual representation */}
              <div className="flex h-full items-end">
                {collections.map((collection, colIndex) => {
                  // Get appropriate data based on selected metric
                  let data: number[];
                  if (metric === 'volume') {
                    // Calculate volume data by multiplying sales count by avg price
                    data = collection.chartData.salesData.map((count, i) => 
                      count * (collection.chartData.avgPriceData[i] || 0)
                    );
                  } else if (metric === 'price') {
                    data = collection.chartData.avgPriceData;
                  } else { // count
                    data = collection.chartData.salesData.map((sales, i) => 
                      sales + collection.chartData.listingsData[i]
                    );
                  }
                  
                  // Find max value for scaling
                  const maxValue = Math.max(...collections.flatMap(c => {
                    if (metric === 'volume') {
                      return c.chartData.salesData.map((count, i) => 
                        count * (c.chartData.avgPriceData[i] || 0)
                      );
                    } else if (metric === 'price') {
                      return c.chartData.avgPriceData;
                    } else {
                      return c.chartData.salesData.map((sales, i) => 
                        sales + c.chartData.listingsData[i]
                      );
                    }
                  }));
                  
                  // Return bar chart group
                  return (
                    <div 
                      key={collection.id} 
                      className="flex-1 flex items-end justify-around"
                    >
                      {data.map((value, i) => {
                        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                        return (
                          <div 
                            key={i} 
                            className="w-4 md:w-6 relative group cursor-pointer"
                            title={`${collection.name}: ${value.toFixed(2)}`}
                          >
                            <div
                              className="rounded-t w-full transition-all duration-300"
                              style={{ 
                                height: `${height}%`, 
                                backgroundColor: getCollectionColor(colIndex),
                                minHeight: value > 0 ? '4px' : '0'
                              }}
                            ></div>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                <div>{collection.name}</div>
                                <div>
                                  {metric === 'volume' && `${formatPrice(value)}`}
                                  {metric === 'price' && `${formatPrice(value)}`}
                                  {metric === 'count' && `${value.toFixed(0)} activities`}
                                </div>
                                <div>{collection.chartData.labels[i]}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              
              {/* X-axis labels */}
              {collections.length > 0 && (
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  {collections[0].chartData.labels.map((label, i) => (
                    <div key={i} className="text-center" style={{ 
                      width: `${100 / collections[0].chartData.labels.length}%` 
                    }}>
                      {i % 2 === 0 ? label : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Collection details accordions */}
          <div className="space-y-4">
            {collections.map((collection, index) => (
              <details key={collection.id} className="bg-white shadow rounded-lg overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getCollectionColor(index) }}></div>
                  <span className="font-medium">{collection.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {collection.stats.totalActivities} activities, {formatPrice(collection.stats.totalVolume)} volume
                  </span>
                </summary>
                
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Sales</h4>
                      <p className="text-2xl font-bold">{collection.stats.sales}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Total Volume</h4>
                      <p className="text-2xl font-bold">{formatPrice(collection.stats.totalVolume)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Avg Price</h4>
                      <p className="text-2xl font-bold">{formatPrice(collection.stats.avgPrice)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Price Range</h4>
                      <p className="text-lg">
                        {formatPrice(collection.stats.minPrice)} - {formatPrice(collection.stats.maxPrice)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link 
                      href={`/collections/${collection.id}/activity`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View collection activity →
                    </Link>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 