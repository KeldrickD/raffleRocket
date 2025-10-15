import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NFTActivity } from '@/types/activity';
import { getRecentActivity } from '@/services/activityService';

interface ActivityFeedWidgetProps {
  limit?: number;
  collectionId?: string;
  showHeader?: boolean;
  maxHeight?: string;
  onActivityClick?: (activity: NFTActivity) => void;
  refreshInterval?: number; // in milliseconds
}

export const ActivityFeedWidget: React.FC<ActivityFeedWidgetProps> = ({
  limit = 10,
  collectionId,
  showHeader = true,
  maxHeight = '500px',
  onActivityClick,
  refreshInterval = 0 // 0 means no auto-refresh
}) => {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      const data = await getRecentActivity(limit, collectionId);
      setActivities(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch recent activity:', err);
      setError('Could not load activity feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchActivities();

    // Set up auto-refresh if interval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchActivities, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [limit, collectionId, refreshInterval]);

  // Helper to format time
  const formatTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + 'y ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'mo ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'd ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'h ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm ago';
    
    return Math.floor(seconds) + 's ago';
  };

  // Helper to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return '💰';
      case 'list':
        return '🏷️';
      case 'delist':
        return '❌';
      case 'mint':
        return '✨';
      case 'transfer':
        return '🔄';
      case 'offer':
        return '💸';
      case 'burn':
        return '🔥';
      case 'raffle_create':
        return '🎟️';
      case 'raffle_join':
        return '🎯';
      case 'raffle_complete':
        return '🎪';
      default:
        return '📝';
    }
  };

  // Helper to get activity color
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'list':
        return 'bg-blue-100 text-blue-800';
      case 'delist':
        return 'bg-red-100 text-red-800';
      case 'mint':
        return 'bg-purple-100 text-purple-800';
      case 'transfer':
        return 'bg-yellow-100 text-yellow-800';
      case 'offer':
        return 'bg-indigo-100 text-indigo-800';
      case 'burn':
        return 'bg-orange-100 text-orange-800';
      case 'raffle_create':
      case 'raffle_join':
      case 'raffle_complete':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to format activity message
  const formatActivityMessage = (activity: NFTActivity) => {
    const nftName = activity.nftName || 'NFT';
    const collectionName = activity.collectionName || 'Collection';
    
    switch (activity.type) {
      case 'sale':
        return `${nftName} sold for ${activity.price?.toFixed(2)} SOL`;
      case 'list':
        return `${nftName} listed for ${activity.price?.toFixed(2)} SOL`;
      case 'delist':
        return `${nftName} delisted`;
      case 'mint':
        return `${nftName} minted in ${collectionName}`;
      case 'transfer':
        return `${nftName} transferred`;
      case 'offer':
        return `Offer made on ${nftName} for ${activity.price?.toFixed(2)} SOL`;
      case 'burn':
        return `${nftName} burned`;
      case 'raffle_create':
        return `Raffle created for ${nftName}`;
      case 'raffle_join':
        return `User joined raffle for ${nftName}`;
      case 'raffle_complete':
        return `Raffle completed for ${nftName}`;
      default:
        return `Activity on ${nftName}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Live Activity Feed</h3>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : activities.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No recent activity</div>
      ) : (
        <div 
          className="overflow-y-auto"
          style={{ maxHeight }}
        >
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li 
                key={activity.id} 
                className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                onClick={() => onActivityClick && onActivityClick(activity)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    {activity.nftImage ? (
                      <img 
                        src={activity.nftImage} 
                        alt={activity.nftName || 'NFT'} 
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2 ${getActivityColor(activity.type)}`}>
                          {activity.type.replace(/_/g, ' ')}
                        </span>
                        {formatActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      {activity.collectionName && (
                        <Link href={`/collections/${activity.collectionId}`} className="hover:underline truncate max-w-xs">
                          {activity.collectionName}
                        </Link>
                      )}
                      {activity.transactionSignature && (
                        <a
                          href={`https://solscan.io/tx/${activity.transactionSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-500 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Tx
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {activities.length >= limit && (
            <div className="px-4 py-3 bg-gray-50 text-center">
              <Link href="/activity" className="text-sm text-blue-500 hover:underline">
                View all activity
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 