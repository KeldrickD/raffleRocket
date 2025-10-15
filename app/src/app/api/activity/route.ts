import { NextRequest, NextResponse } from 'next/server';
import { NFTActivity, ActivityType } from '@/types/activity';

// Generate a random date within the last month
function randomDate(): Date {
  const now = new Date();
  const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(pastMonth.getTime() + Math.random() * (now.getTime() - pastMonth.getTime()));
}

// Generate a mock transaction signature
function mockTxSignature(): string {
  return Array.from({ length: 64 }, () => 
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('');
}

// Generate random wallet address
function randomWalletAddress(): string {
  return Array.from({ length: 44 }, () => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
      Math.floor(Math.random() * 62)
    ]
  ).join('');
}

// Generate mock activity data
function generateMockActivities(count: number = 50): NFTActivity[] {
  const activityTypes: ActivityType[] = [
    'mint', 'transfer', 'list', 'delist', 'sale', 
    'offer', 'burn', 'raffle_create', 'raffle_join', 'raffle_complete'
  ];
  
  const collectionIds = [
    'collection-1', 'collection-2', 'collection-3', 
    'collection-4', 'collection-5'
  ];
  
  const mintAddresses = Array.from({ length: 10 }, () => randomWalletAddress());
  const walletAddresses = Array.from({ length: 5 }, () => randomWalletAddress());
  
  return Array.from({ length: count }, (_, i) => {
    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const mintAddress = mintAddresses[Math.floor(Math.random() * mintAddresses.length)];
    const collectionId = collectionIds[Math.floor(Math.random() * collectionIds.length)];
    const nftNumber = Math.floor(Math.random() * 1000) + 1;
    
    const activity: NFTActivity = {
      id: `activity-${i + 1}`,
      type: activityType,
      mint: mintAddress,
      nftName: `NFT #${nftNumber}`,
      nftImage: `https://picsum.photos/seed/${nftNumber}/200/200`,
      timestamp: randomDate(),
      transactionSignature: mockTxSignature(),
      collectionId
    };
    
    // Add type-specific properties
    if (['transfer', 'sale'].includes(activityType)) {
      activity.fromAddress = walletAddresses[Math.floor(Math.random() * walletAddresses.length)];
      activity.toAddress = walletAddresses[Math.floor(Math.random() * walletAddresses.length)];
      
      // Make sure from and to are different
      while (activity.fromAddress === activity.toAddress) {
        activity.toAddress = walletAddresses[Math.floor(Math.random() * walletAddresses.length)];
      }
    }
    
    if (['list', 'sale', 'offer'].includes(activityType)) {
      activity.price = parseFloat((Math.random() * 10 + 0.1).toFixed(2));
    }
    
    return activity;
  });
}

// Mock activities data
const mockActivities: NFTActivity[] = generateMockActivities();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parse query parameters
  const mint = searchParams.get('mint');
  const typeParam = searchParams.get('type');
  const collectionId = searchParams.get('collectionId');
  const fromAddress = searchParams.get('fromAddress');
  const toAddress = searchParams.get('toAddress');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  // Filter activities based on query parameters
  let filteredActivities = [...mockActivities];
  
  if (mint) {
    filteredActivities = filteredActivities.filter(a => a.mint === mint);
  }
  
  if (typeParam) {
    const types = typeParam.split(',') as ActivityType[];
    filteredActivities = filteredActivities.filter(a => types.includes(a.type));
  }
  
  if (collectionId) {
    filteredActivities = filteredActivities.filter(a => a.collectionId === collectionId);
  }
  
  if (fromAddress) {
    filteredActivities = filteredActivities.filter(a => a.fromAddress === fromAddress);
  }
  
  if (toAddress) {
    filteredActivities = filteredActivities.filter(a => a.toAddress === toAddress);
  }
  
  if (startDate) {
    const start = new Date(startDate);
    filteredActivities = filteredActivities.filter(a => a.timestamp >= start);
  }
  
  if (endDate) {
    const end = new Date(endDate);
    filteredActivities = filteredActivities.filter(a => a.timestamp <= end);
  }
  
  // Sort by timestamp (newest first)
  filteredActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  return NextResponse.json(filteredActivities);
} 