import React, { useMemo, useState } from 'react';
import { NFTActivity } from '@/types/activity';

interface PricePoint {
  date: Date;
  price: number;
  type: 'sale' | 'list' | 'offer';
}

interface NFTPriceHistoryProps {
  activities: NFTActivity[];
  initialTimeframe?: '7d' | '30d' | '90d' | 'all';
}

export const NFTPriceHistory: React.FC<NFTPriceHistoryProps> = ({ 
  activities,
  initialTimeframe = 'all' 
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>(initialTimeframe);
  
  // Process activities to get price history points
  const priceHistory = useMemo(() => {
    // Filter relevant activities with prices
    const priceActivities = activities.filter(
      activity => 
        (activity.type === 'sale' || activity.type === 'list' || activity.type === 'offer') && 
        activity.price !== undefined
    );
    
    // Sort by date (oldest first)
    const sorted = [...priceActivities].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    // Filter by timeframe
    let filteredByTime = sorted;
    if (timeframe !== 'all') {
      const now = new Date();
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      
      filteredByTime = sorted.filter(activity => activity.timestamp >= cutoffDate);
    }
    
    // Convert to price points
    return filteredByTime.map(activity => ({
      date: activity.timestamp,
      price: activity.price!,
      type: activity.type as 'sale' | 'list' | 'offer'
    }));
  }, [activities, timeframe]);
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (priceHistory.length === 0) {
      return { min: 0, max: 0, avg: 0, current: 0 };
    }
    
    const prices = priceHistory.map(point => point.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const current = priceHistory[priceHistory.length - 1].price;
    
    return { min, max, avg, current };
  }, [priceHistory]);
  
  // If no price data, show a message
  if (priceHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-2">Price History</h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No price history available</p>
        </div>
      </div>
    );
  }
  
  // Calculate chart dimensions and scales
  const chartWidth = 100; // percentage width
  const chartHeight = 200; // pixels height
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  
  const chartInnerWidth = chartWidth - (padding.left + padding.right);
  const chartInnerHeight = chartHeight - (padding.top + padding.bottom);
  
  // Calculate scales for x and y axes
  const xScale = (index: number) => 
    (index / (priceHistory.length - 1)) * chartInnerWidth + padding.left;
  
  const yScale = (price: number) => {
    const minPrice = stats.min * 0.9; // Add some padding
    const maxPrice = stats.max * 1.1;
    const range = maxPrice - minPrice;
    
    return chartInnerHeight - ((price - minPrice) / range * chartInnerHeight) + padding.top;
  };
  
  // Generate path for the price chart
  const pathData = priceHistory.map((point, index) => {
    const x = xScale(index);
    const y = yScale(point.price);
    return (index === 0 ? `M ${x},${y}` : `L ${x},${y}`);
  }).join(' ');

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Price History</h3>
        
        <div className="flex space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-500">Sale</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-500">List</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span className="text-xs text-gray-500">Offer</span>
          </div>
        </div>
      </div>
      
      {/* Price statistics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Current</div>
          <div className="font-bold">{stats.current.toFixed(2)} SOL</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Average</div>
          <div className="font-bold">{stats.avg.toFixed(2)} SOL</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Min</div>
          <div className="font-bold">{stats.min.toFixed(2)} SOL</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Max</div>
          <div className="font-bold">{stats.max.toFixed(2)} SOL</div>
        </div>
      </div>
      
      {/* Price chart */}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg width="100%" height={chartHeight}>
          {/* Y-axis labels */}
          <text x={padding.left - 5} y={padding.top} textAnchor="end" className="text-xs fill-gray-500">
            {stats.max.toFixed(1)}
          </text>
          <text x={padding.left - 5} y={padding.top + chartInnerHeight / 2} textAnchor="end" className="text-xs fill-gray-500">
            {((stats.max + stats.min) / 2).toFixed(1)}
          </text>
          <text x={padding.left - 5} y={padding.top + chartInnerHeight} textAnchor="end" className="text-xs fill-gray-500">
            {stats.min.toFixed(1)}
          </text>
          
          {/* X-axis labels */}
          {priceHistory.length > 1 && (
            <>
              <text x={padding.left} y={chartHeight - 5} textAnchor="middle" className="text-xs fill-gray-500">
                {formatDate(priceHistory[0].date)}
              </text>
              <text x={chartWidth - padding.right} y={chartHeight - 5} textAnchor="middle" className="text-xs fill-gray-500">
                {formatDate(priceHistory[priceHistory.length - 1].date)}
              </text>
            </>
          )}
          
          {/* Chart grid lines */}
          <line 
            x1={padding.left} 
            y1={padding.top} 
            x2={chartWidth - padding.right} 
            y2={padding.top} 
            stroke="#e5e7eb" 
            strokeDasharray="2,2"
          />
          <line 
            x1={padding.left} 
            y1={padding.top + chartInnerHeight / 2} 
            x2={chartWidth - padding.right} 
            y2={padding.top + chartInnerHeight / 2} 
            stroke="#e5e7eb" 
            strokeDasharray="2,2"
          />
          <line 
            x1={padding.left} 
            y1={padding.top + chartInnerHeight} 
            x2={chartWidth - padding.right} 
            y2={padding.top + chartInnerHeight} 
            stroke="#e5e7eb" 
            strokeDasharray="2,2"
          />
          
          {/* Price line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          
          {/* Price points */}
          {priceHistory.map((point, index) => {
            let fillColor;
            switch (point.type) {
              case 'sale': fillColor = '#3b82f6'; break; // blue
              case 'list': fillColor = '#eab308'; break; // yellow
              case 'offer': fillColor = '#6366f1'; break; // indigo
              default: fillColor = '#9ca3af'; break; // gray
            }
            
            return (
              <circle
                key={index}
                cx={xScale(index)}
                cy={yScale(point.price)}
                r="4"
                fill={fillColor}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>
      
      {/* Timeframe selector */}
      <div className="flex justify-center mt-4 space-x-2">
        <button 
          className={`px-2 py-1 text-xs rounded ${timeframe === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTimeframe('7d')}
        >
          7D
        </button>
        <button 
          className={`px-2 py-1 text-xs rounded ${timeframe === '30d' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTimeframe('30d')}
        >
          30D
        </button>
        <button 
          className={`px-2 py-1 text-xs rounded ${timeframe === '90d' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTimeframe('90d')}
        >
          90D
        </button>
        <button 
          className={`px-2 py-1 text-xs rounded ${timeframe === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setTimeframe('all')}
        >
          All
        </button>
      </div>
    </div>
  );
}; 