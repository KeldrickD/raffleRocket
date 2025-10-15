import React, { useMemo, useState } from 'react';
import { NFTActivity, NFTActivityType } from '@/types/activity';

interface ActivityCalendarProps {
  activities: NFTActivity[];
  months?: number; // Number of months to display, default is 6
}

interface DayData {
  date: Date;
  activities: NFTActivity[];
  count: number;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ 
  activities, 
  months = 6 
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  
  // Process activities into calendar data
  const calendarData = useMemo(() => {
    // Get date range
    const today = new Date();
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - (months - 1));
    startDate.setDate(1); // Start from the first day of the month
    
    // Create a map of dates to activities
    const dateMap = new Map<string, DayData>();
    
    // Initialize all dates in range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = formatDateKey(currentDate);
      dateMap.set(dateKey, {
        date: new Date(currentDate),
        activities: [],
        count: 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add activities to dates
    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      if (activityDate >= startDate && activityDate <= endDate) {
        const dateKey = formatDateKey(activityDate);
        const dayData = dateMap.get(dateKey);
        
        if (dayData) {
          dayData.activities.push(activity);
          dayData.count += 1;
        }
      }
    });
    
    // Convert map to array and sort by date
    return Array.from(dateMap.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [activities, months]);
  
  // Calculate max activities in a day for scaling
  const maxActivities = useMemo(() => {
    if (calendarData.length === 0) return 0;
    return Math.max(...calendarData.map(day => day.count));
  }, [calendarData]);
  
  // Group calendar data by month for rendering
  const calendarByMonth = useMemo(() => {
    const groupedData = new Map<string, DayData[]>();
    
    calendarData.forEach(day => {
      const monthKey = formatMonthKey(day.date);
      if (!groupedData.has(monthKey)) {
        groupedData.set(monthKey, []);
      }
      groupedData.get(monthKey)?.push(day);
    });
    
    // Sort months
    return Array.from(groupedData.entries())
      .sort(([keyA], [keyB]) => {
        const [yearA, monthA] = keyA.split('-').map(Number);
        const [yearB, monthB] = keyB.split('-').map(Number);
        return yearA !== yearB ? yearA - yearB : monthA - monthB;
      });
  }, [calendarData]);
  
  // Helper function to format date for map key
  function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  
  // Helper function to format month for grouping
  function formatMonthKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }
  
  // Helper function to format month for display
  function formatMonthName(monthKey: string): string {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString(undefined, { 
      month: 'long', 
      year: 'numeric' 
    });
  }
  
  // Helper function to get day of week (0-6, 0 is Sunday)
  function getDayOfWeek(date: Date): number {
    return date.getDay();
  }
  
  // Get color intensity based on activity count
  function getColorIntensity(count: number): string {
    if (count === 0) return 'bg-gray-100';
    
    const intensity = Math.min(Math.ceil((count / maxActivities) * 4), 4);
    return `bg-blue-${intensity * 100 + 100}`;
  }
  
  // Get dominant activity type color
  function getDominantActivityColor(activities: NFTActivity[]): string {
    if (activities.length === 0) return 'bg-gray-100';
    
    // Count by type
    const typeCounts: Record<NFTActivityType, number> = {
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
    
    activities.forEach(activity => {
      typeCounts[activity.type]++;
    });
    
    // Find dominant type
    let maxCount = 0;
    let dominantType: NFTActivityType = 'sale';
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type as NFTActivityType;
      }
    });
    
    // Return color based on type
    const type: NFTActivityType = dominantType;
    switch (type) {
      case 'sale': 
        return 'bg-green-400';
      case 'list': 
        return 'bg-blue-400';
      case 'delist': 
        return 'bg-red-400';
      case 'mint': 
        return 'bg-purple-400';
      case 'transfer': 
        return 'bg-yellow-400';
      case 'offer': 
        return 'bg-indigo-400';
      case 'burn': 
        return 'bg-orange-400';
      case 'raffle_create':
        return 'bg-pink-400';
      case 'raffle_join':
        return 'bg-pink-400';
      case 'raffle_complete': 
        return 'bg-pink-400';
      default: 
        return 'bg-gray-400';
    }
  }
  
  // Format date for tooltip
  function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Render activity types summary for tooltip
  function renderActivityTypeSummary(activities: NFTActivity[]): JSX.Element {
    const typeCounts: Record<string, number> = {};
    
    activities.forEach(activity => {
      typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
    });
    
    return (
      <div className="space-y-1">
        {Object.entries(typeCounts)
          .sort(([, countA], [, countB]) => countB - countA)
          .map(([type, count]) => (
            <div key={type} className="flex justify-between text-xs">
              <span className="capitalize">{type.replace(/_/g, ' ')}</span>
              <span>{count}</span>
            </div>
          ))
        }
      </div>
    );
  }
  
  return (
    <div className="activity-calendar">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Activity Calendar</h3>
        <div className="flex space-x-2 text-xs text-gray-500">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-gray-100 mr-1"></div>
            <span>0</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-blue-200 mr-1"></div>
            <span>Light</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-sm bg-blue-500 mr-1"></div>
            <span>Heavy</span>
          </div>
        </div>
      </div>
      
      {/* Activity type legend */}
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
          <span className="text-xs">Sales</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>
          <span className="text-xs">Listings</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
          <span className="text-xs">Delistings</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-400 mr-1"></div>
          <span className="text-xs">Mints</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
          <span className="text-xs">Transfers</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-indigo-400 mr-1"></div>
          <span className="text-xs">Offers</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-pink-400 mr-1"></div>
          <span className="text-xs">Raffles</span>
        </div>
      </div>
      
      {/* Days of week header */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs text-center text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="space-y-6">
        {calendarByMonth.map(([monthKey, days]) => (
          <div key={monthKey}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {formatMonthName(monthKey)}
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {/* Calculate offset for first day of month */}
              {Array.from({ length: getDayOfWeek(days[0].date) }).map((_, index) => (
                <div key={`empty-${index}`} className="w-8 h-8"></div>
              ))}
              
              {/* Render days with activity data */}
              {days.map(day => (
                <div
                  key={formatDateKey(day.date)}
                  className="relative"
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <div 
                    className={`w-8 h-8 rounded-sm ${
                      day.count > 0 ? getDominantActivityColor(day.activities) : 'bg-gray-100'
                    } ${
                      day.date.toDateString() === new Date().toDateString() ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{ 
                      opacity: day.count > 0 ? 0.3 + (day.count / maxActivities) * 0.7 : 0.3 
                    }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <span className="text-xs font-medium text-gray-900">
                        {day.date.getDate()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tooltip */}
                  {hoveredDay && hoveredDay.date.getTime() === day.date.getTime() && day.count > 0 && (
                    <div className="absolute z-10 w-64 bg-white shadow-lg rounded-lg p-3 text-sm -translate-x-1/2 left-1/2 mt-1">
                      <div className="font-medium mb-1">{formatDate(day.date)}</div>
                      <div className="text-gray-700 mb-2">
                        {day.count} {day.count === 1 ? 'activity' : 'activities'}
                      </div>
                      {renderActivityTypeSummary(day.activities)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* No data message */}
      {calendarData.every(day => day.count === 0) && (
        <div className="text-center py-8 text-gray-500">
          No activity data available for the selected time period
        </div>
      )}
    </div>
  );
}; 