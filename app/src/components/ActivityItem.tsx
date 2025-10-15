import React from 'react';
import Link from 'next/link';
import { NFTActivity } from '@/types/activity';
import { getActivityDescription } from '@/types/activity';

interface ActivityItemProps {
  activity: NFTActivity;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  // Helper to format dates
  const formatDate = (date: Date): string => {
    // If less than 24 hours ago, show relative time
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show the actual date
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Get icon based on activity type
  const getActivityIcon = (): string => {
    switch (activity.type) {
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

  // Get background color class based on activity type
  const getBgColorClass = (): string => {
    switch (activity.type) {
      case 'mint': return 'bg-green-50';
      case 'transfer': return 'bg-blue-50';
      case 'list': return 'bg-yellow-50';
      case 'delist': return 'bg-gray-50';
      case 'sale': return 'bg-purple-50';
      case 'offer': return 'bg-indigo-50';
      case 'burn': return 'bg-red-50';
      case 'raffle_create': 
      case 'raffle_join':
      case 'raffle_complete':
        return 'bg-pink-50';
      default: return 'bg-gray-50';
    }
  };

  // Get a human-readable type name
  const getTypeName = (): string => {
    switch (activity.type) {
      case 'mint': return 'Mint';
      case 'transfer': return 'Transfer';
      case 'list': return 'List';
      case 'delist': return 'Delist';
      case 'sale': return 'Sale';
      case 'offer': return 'Offer';
      case 'burn': return 'Burn';
      case 'raffle_create': return 'Raffle Created';
      case 'raffle_join': return 'Raffle Entry';
      case 'raffle_complete': return 'Raffle Completed';
      default: return activity.type;
    }
  };

  return (
    <div className={`${getBgColorClass()} border rounded-lg overflow-hidden mb-3`}>
      <div className="p-4">
        <div className="flex items-start">
          {/* NFT Thumbnail */}
          {activity.nftImage && (
            <Link href={`/nfts/${activity.mint}`} className="shrink-0 mr-4">
              <img 
                src={activity.nftImage} 
                alt={activity.nftName || 'NFT'} 
                className="w-12 h-12 rounded object-cover"
              />
            </Link>
          )}
          
          <div className="flex-grow">
            {/* Activity header */}
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-medium bg-white bg-opacity-70 rounded px-2 py-1">
                {getActivityIcon()} {getTypeName()}
              </span>
              <time 
                className="text-xs text-gray-500"
                title={activity.timestamp.toLocaleString()}
              >
                {formatDate(activity.timestamp)}
              </time>
            </div>
            
            {/* Activity description */}
            <p className="text-gray-700 mb-2">
              {getActivityDescription(activity)}
            </p>
            
            {/* Additional details */}
            {(activity.price || activity.fromAddress || activity.toAddress) && (
              <div className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2">
                {activity.price !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">{activity.price} SOL</span>
                  </div>
                )}
                {activity.fromAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">From:</span>
                    <code className="font-medium truncate max-w-[120px]">
                      {activity.fromAddress.substring(0, 6)}...{activity.fromAddress.substring(activity.fromAddress.length - 4)}
                    </code>
                  </div>
                )}
                {activity.toAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">To:</span>
                    <code className="font-medium truncate max-w-[120px]">
                      {activity.toAddress.substring(0, 6)}...{activity.toAddress.substring(activity.toAddress.length - 4)}
                    </code>
                  </div>
                )}
              </div>
            )}
            
            {/* Transaction link */}
            {activity.transactionSignature && (
              <div className="mt-2 text-xs">
                <a 
                  href={`https://explorer.solana.com/tx/${activity.transactionSignature}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View transaction →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 