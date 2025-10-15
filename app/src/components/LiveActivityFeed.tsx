import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { NFTActivity } from '@/types/activity';
import realTimeService from '@/services/realTimeService';
import { formatDistanceToNow } from 'date-fns';

interface LiveActivityFeedProps {
  maxItems?: number;
  autoScroll?: boolean;
  height?: string;
  showTitle?: boolean;
  compact?: boolean;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  maxItems = 10,
  autoScroll = true,
  height = '400px',
  showTitle = true,
  compact = false
}) => {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);
  
  // Set up WebSocket connection on component mount
  useEffect(() => {
    // Subscribe to activity updates
    const unsubscribeActivity = realTimeService.subscribeToActivityUpdates((activity) => {
      setActivities(prevActivities => {
        // Add new activity to the beginning of the array
        const newActivities = [activity, ...prevActivities];
        
        // Limit the number of items
        if (newActivities.length > maxItems) {
          return newActivities.slice(0, maxItems);
        }
        return newActivities;
      });
      
      setIsInitialLoad(false);
    });
    
    // Subscribe to connection status updates
    const unsubscribeConnection = realTimeService.subscribe('connection', (data) => {
      setConnectionStatus(data.status);
    });
    
    // Connect to WebSocket server using stored credentials if available
    const userId = localStorage.getItem('userId') || 'anonymous';
    const authToken = localStorage.getItem('authToken') || '';
    realTimeService.connect(userId, authToken);
    
    // Clean up subscriptions on unmount
    return () => {
      unsubscribeActivity();
      unsubscribeConnection();
    };
  }, [maxItems]);
  
  // Auto-scroll to the latest activity when new activities arrive
  useEffect(() => {
    if (autoScroll && feedRef.current && !isInitialLoad) {
      feedRef.current.scrollTop = 0;
    }
  }, [activities, autoScroll, isInitialLoad]);
  
  // Simulate some initial activities for demo purposes
  useEffect(() => {
    if (isInitialLoad) {
      const mockActivities: NFTActivity[] = [
        {
          id: '1',
          type: 'sale',
          timestamp: new Date(Date.now() - 120000), // 2 minutes ago
          mint: 'ABC123',
          nftName: 'Metaverse Explorer #42',
          nftImage: 'https://via.placeholder.com/150',
          collectionId: 'metaverse-explorers',
          collectionName: 'Metaverse Explorers',
          fromAddress: '0x123...456',
          toAddress: '0x789...012',
          price: 2.5,
          transactionSignature: 'sig123'
        },
        {
          id: '2',
          type: 'list',
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          mint: 'DEF456',
          nftName: 'Cosmic Voyager #78',
          nftImage: 'https://via.placeholder.com/150',
          collectionId: 'cosmic-voyagers',
          collectionName: 'Cosmic Voyagers',
          fromAddress: '0x345...678',
          price: 4.2,
          transactionSignature: 'sig456'
        },
        {
          id: '3',
          type: 'mint',
          timestamp: new Date(Date.now() - 600000), // 10 minutes ago
          mint: 'GHI789',
          nftName: 'Digital Dream #103',
          nftImage: 'https://via.placeholder.com/150',
          collectionId: 'digital-dreams',
          collectionName: 'Digital Dreams',
          toAddress: '0x901...234',
          transactionSignature: 'sig789'
        }
      ];
      
      setActivities(mockActivities);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);
  
  // Format activity details for display
  const formatActivityDetails = (activity: NFTActivity): string => {
    switch (activity.type) {
      case 'sale':
        return `${activity.nftName} sold for ${activity.price?.toFixed(2)} SOL`;
      case 'list':
        return `${activity.nftName} listed for ${activity.price?.toFixed(2)} SOL`;
      case 'delist':
        return `${activity.nftName} delisted`;
      case 'mint':
        return `${activity.nftName} minted`;
      case 'transfer':
        return `${activity.nftName} transferred`;
      case 'offer':
        return `Offer made on ${activity.nftName} for ${activity.price?.toFixed(2)} SOL`;
      case 'burn':
        return `${activity.nftName} burned`;
      default:
        return `Activity on ${activity.nftName}`;
    }
  };
  
  // Get status indicator color
  const getStatusIndicatorColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get activity type color
  const getActivityTypeColor = (type: string): string => {
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="live-activity-feed bg-white rounded-lg shadow overflow-hidden">
      {showTitle && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-lg font-medium">Live Activity</h3>
            <div className={`ml-2 w-2 h-2 rounded-full ${getStatusIndicatorColor()}`}></div>
          </div>
          
          <div className="text-sm text-gray-500">
            {connectionStatus === 'connected' ? 'Live' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </div>
        </div>
      )}
      
      <div 
        ref={feedRef}
        className="overflow-y-auto"
        style={{ height }}
      >
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-gray-500">Waiting for activities...</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className={`${compact ? 'p-2' : 'p-4'} hover:bg-gray-50 transition-colors duration-150`}>
                <div className="flex items-start">
                  {!compact && activity.nftImage && (
                    <div className="flex-shrink-0 mr-3">
                      <img 
                        src={activity.nftImage} 
                        alt={activity.nftName || 'NFT'} 
                        className="w-10 h-10 rounded-md object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)} mr-2`}>
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <Link 
                      href={`/nft/${activity.mint}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {formatActivityDetails(activity)}
                    </Link>
                    
                    {!compact && activity.collectionName && (
                      <div className="mt-1 text-xs text-gray-500">
                        <Link 
                          href={`/collections/${activity.collectionId}`}
                          className="hover:text-blue-600"
                        >
                          {activity.collectionName}
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {!compact && activity.price !== undefined && (
                    <div className="flex-shrink-0 ml-2 text-sm font-medium">
                      {activity.price.toFixed(2)} SOL
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="border-t border-gray-200 p-2 text-center">
        <Link 
          href="/activity" 
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          View All Activity
        </Link>
      </div>
    </div>
  );
}; 