import { PublicKey } from '@solana/web3.js';
import { BatchOperationType } from './nft';

export type NFTActivityType = 
  'mint' | 'transfer' | 'list' | 'delist' | 'sale' | 'offer' | 'burn' | 
  'raffle_create' | 'raffle_join' | 'raffle_complete';

export interface NFTActivity {
  id: string;
  type: NFTActivityType;
  timestamp: Date;
  mint: string;
  nftName?: string;
  nftImage?: string;
  collectionId?: string;
  collectionName?: string;
  fromAddress?: string;
  toAddress?: string;
  price?: number;
  transactionSignature?: string;
  metadata?: Record<string, any>;
}

export interface ActivityFilters {
  types?: NFTActivityType[];
  mintIds?: string[];
  collectionIds?: string[];
  fromDate?: Date;
  toDate?: Date;
  walletAddress?: string;
}

/**
 * Generate a human-readable description for an activity
 */
export function getActivityDescription(activity: NFTActivity): string {
  const nftName = activity.nftName || 'NFT';
  
  switch (activity.type) {
    case 'mint':
      return `${activity.nftName || 'New NFT'} was minted${activity.toAddress ? ' to your wallet' : ''}`;
      
    case 'transfer':
      if (activity.fromAddress && activity.toAddress) {
        return `${nftName} was transferred${activity.metadata?.isGift ? ' as a gift' : ''}`;
      }
      return `${nftName} was transferred to a new wallet`;
      
    case 'list':
      return `${nftName} was listed for sale${activity.price ? ` for ${activity.price} SOL` : ''}`;
      
    case 'delist':
      return `${nftName} was removed from sale`;
      
    case 'sale':
      return `${nftName} was sold${activity.price ? ` for ${activity.price} SOL` : ''}`;
      
    case 'offer':
      return `Offer made on ${nftName}${activity.price ? ` for ${activity.price} SOL` : ''}`;
      
    case 'burn':
      return `${nftName} was burned`;

    case 'raffle_create':
      return `${nftName} raffle was created${activity.metadata?.tickets ? ` with ${activity.metadata.tickets} tickets` : ''}`;
      
    case 'raffle_join':
      return `Entered raffle for ${nftName}${activity.metadata?.tickets ? ` with ${activity.metadata.tickets} tickets` : ''}`;
      
    case 'raffle_complete':
      const winner = activity.metadata?.winnerAddress ? 
        activity.metadata.winnerAddress.substring(0, 6) + '...' + 
        activity.metadata.winnerAddress.substring(activity.metadata.winnerAddress.length - 4) : 
        'a lucky winner';
      return `Raffle for ${nftName} completed${activity.metadata?.winnerAddress ? ` and won by ${winner}` : ''}`;
      
    default:
      return `Activity related to ${nftName}`;
  }
}

// Helper function to shorten address for display
function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
} 