import React, { useState, useEffect } from 'react';
import { NFTActivity } from '@/types/activity';
import { getRecentActivity } from '@/services/activityService';
import Link from 'next/link';

interface ActivityNotificationsProps {
  maxNotifications?: number;
  pollingInterval?: number; // in milliseconds
}

export const ActivityNotifications: React.FC<ActivityNotificationsProps> = ({
  maxNotifications = 5,
  pollingInterval = 30000 // 30 seconds default
}) => {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [newActivities, setNewActivities] = useState<NFTActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Get initial activities
  useEffect(() => {
    const fetchInitialActivities = async () => {
      try {
        setLoading(true);
        const data = await getRecentActivity(maxNotifications);
        setActivities(data);
      } catch (err) {
        console.error('Failed to fetch initial activities:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialActivities();
  }, [maxNotifications]);

  // Set up polling for new activities
  useEffect(() => {
    const pollForNewActivities = async () => {
      try {
        // Get latest activities
        const latestActivities = await getRecentActivity(10);
        
        // Find activities that we don't already have
        const newestActivity = activities[0];
        const newActivityList = newestActivity 
          ? latestActivities.filter(
              activity => activity.timestamp > newestActivity.timestamp
            ) 
          : latestActivities;
          
        // If we have new activities, update state
        if (newActivityList.length > 0) {
          setNewActivities(prev => [...newActivityList, ...prev].slice(0, maxNotifications));
          setHasUnread(true);
        }
      } catch (err) {
        console.error('Failed to poll for new activities:', err);
      }
    };

    // Set up the polling interval
    const intervalId = setInterval(pollForNewActivities, pollingInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [activities, maxNotifications, pollingInterval]);

  // Helper function to format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    
    return date.toLocaleDateString();
  };

  // Helper function to get activity icon
  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'mint': return '🔨';
      case 'transfer': return '↗️';
      case 'list': return '🏷️';
      case 'delist': return '🚫';
      case 'sale': return '💰';
      case 'offer': return '💸';
      case 'burn': return '🔥';
      case 'raffle_create': return '🎫';
      case 'raffle_join': return '🎯';
      case 'raffle_complete': return '🎊';
      default: return '📝';
    }
  };

  // Handle viewing notifications
  const handleToggleNotifications = () => {
    setIsOpen(!isOpen);
    
    // If opening, merge new activities and mark as read
    if (!isOpen && newActivities.length > 0) {
      setActivities([...newActivities, ...activities].slice(0, maxNotifications));
      setNewActivities([]);
      setHasUnread(false);
    }
  };

  // Get activity description
  const getActivityDescription = (activity: NFTActivity): string => {
    const nftName = activity.nftName || 'NFT';
    
    switch (activity.type) {
      case 'mint':
        return `${nftName} was minted`;
      case 'transfer':
        return `${nftName} was transferred`;
      case 'list':
        return `${nftName} was listed for ${activity.price} SOL`;
      case 'delist':
        return `${nftName} was delisted`;
      case 'sale':
        return `${nftName} was sold for ${activity.price} SOL`;
      case 'offer':
        return `Offer made on ${nftName} for ${activity.price} SOL`;
      case 'burn':
        return `${nftName} was burned`;
      case 'raffle_create':
        return `${nftName} raffle was created`;
      case 'raffle_join':
        return `Someone joined raffle for ${nftName}`;
      case 'raffle_complete':
        return `Raffle for ${nftName} completed`;
      default:
        return `Activity on ${nftName}`;
    }
  };

  return (
    <div className="relative">
      {/* Notification bell button */}
      <button 
        className="relative p-2 text-gray-600 hover:text-blue-500 focus:outline-none"
        onClick={handleToggleNotifications}
        aria-label="Open notifications"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Unread badge */}
        {hasUnread && (
          <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2.5 h-2.5 flex items-center justify-center"></span>
        )}
      </button>
      
      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Activity Notifications</h3>
              <Link 
                href="/activity"
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : activities.length === 0 && newActivities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No activity notifications yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {/* New unread notifications */}
                {newActivities.map(activity => (
                  <li key={`new-${activity.id}`} className="p-4 bg-blue-50 hover:bg-blue-100">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        <span className="text-xl" role="img" aria-label={activity.type}>
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getActivityDescription(activity)}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                          {activity.transactionSignature && (
                            <a 
                              href={`https://explorer.solana.com/tx/${activity.transactionSignature}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              View Transaction
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                
                {/* Already read notifications */}
                {activities.map(activity => (
                  <li key={activity.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        <span className="text-xl" role="img" aria-label={activity.type}>
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getActivityDescription(activity)}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                          {activity.transactionSignature && (
                            <a 
                              href={`https://explorer.solana.com/tx/${activity.transactionSignature}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              View Transaction
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-3 border-t bg-gray-50">
            <Link 
              href="/activity/subscribe"
              className="block w-full text-center py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Manage Notification Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}; 