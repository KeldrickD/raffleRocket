import React from 'react';
import { NFTActivity, NFTActivityType } from '@/types/activity';

interface ActivityTimelineProps {
  activities: NFTActivity[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  // Sort activities by timestamp (newest first)
  const sortedActivities = [...activities].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Group activities by date for the timeline
  const groupedActivities: Record<string, NFTActivity[]> = {};
  
  sortedActivities.forEach(activity => {
    const date = new Date(activity.timestamp);
    const dateKey = date.toLocaleDateString();
    
    if (!groupedActivities[dateKey]) {
      groupedActivities[dateKey] = [];
    }
    
    groupedActivities[dateKey].push(activity);
  });

  // Get activity icon based on type
  const getActivityIcon = (type: NFTActivityType): string => {
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

  // Get color based on activity type
  const getActivityColor = (type: NFTActivityType): string => {
    switch (type) {
      case 'mint': return 'border-green-500 bg-green-50';
      case 'transfer': return 'border-blue-500 bg-blue-50';
      case 'list': return 'border-yellow-500 bg-yellow-50';
      case 'delist': return 'border-gray-500 bg-gray-50';
      case 'sale': return 'border-purple-500 bg-purple-50';
      case 'offer': return 'border-indigo-500 bg-indigo-50';
      case 'burn': return 'border-red-500 bg-red-50';
      case 'raffle_create': return 'border-pink-500 bg-pink-50';
      case 'raffle_join': return 'border-pink-300 bg-pink-50';
      case 'raffle_complete': return 'border-pink-600 bg-pink-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  // Format time string
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Only show this component if we have activities
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No activity history to display</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      {Object.entries(groupedActivities).map(([dateKey, dateActivities]) => (
        <div key={dateKey} className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 sticky top-0 bg-white py-2 z-10">
            {dateKey}
          </h3>
          
          <div className="relative">
            {/* Timeline track */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" aria-hidden="true"></div>
            
            <ul className="space-y-4">
              {dateActivities.map((activity) => (
                <li key={activity.id} className="relative pl-10">
                  {/* Timeline node */}
                  <div className={`absolute left-0 flex items-center justify-center w-8 h-8 rounded-full border-2 ${getActivityColor(activity.type)}`}>
                    <span>{getActivityIcon(activity.type)}</span>
                  </div>
                  
                  {/* Activity content */}
                  <div className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-medium">{activity.type.replace('_', ' ').toUpperCase()}</h4>
                      <span className="text-xs text-gray-500">{formatTime(activity.timestamp)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {activity.nftImage && (
                        <img 
                          src={activity.nftImage} 
                          alt={activity.nftName || 'NFT'} 
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <span className="text-sm font-medium">{activity.nftName || 'NFT'}</span>
                    </div>
                    
                    {/* Price, if available */}
                    {activity.price !== undefined && (
                      <div className="mt-1 text-sm">
                        <span className="text-gray-500">Price:</span> <span className="font-medium">{activity.price} SOL</span>
                      </div>
                    )}
                    
                    {/* Addresses, if available */}
                    <div className="mt-1 text-xs grid grid-cols-1 gap-1">
                      {activity.fromAddress && (
                        <div>
                          <span className="text-gray-500">From:</span> <code className="ml-1">{activity.fromAddress.substring(0, 6)}...{activity.fromAddress.substring(activity.fromAddress.length - 4)}</code>
                        </div>
                      )}
                      
                      {activity.toAddress && (
                        <div>
                          <span className="text-gray-500">To:</span> <code className="ml-1">{activity.toAddress.substring(0, 6)}...{activity.toAddress.substring(activity.toAddress.length - 4)}</code>
                        </div>
                      )}
                    </div>
                    
                    {/* Transaction link */}
                    {activity.transactionSignature && (
                      <div className="mt-2 text-xs">
                        <a 
                          href={`https://explorer.solana.com/tx/${activity.transactionSignature}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center"
                        >
                          View transaction
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}; 