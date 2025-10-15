import { NextRequest, NextResponse } from 'next/server';
import { NFTListItem, NFTMetadata } from '@/types/nft';
import { PublicKey } from '@solana/web3.js';

// In-memory storage for NFTs (this would be a database in a real app)
let mockNFTs: NFTListItem[] = Array.from({ length: 50 }).map((_, i) => {
  const id = i + 1;
  return {
    mint: new PublicKey(Array(32).fill(0).map((_, i) => (id + i) % 256).join('')),
    name: `NFT #${id}`,
    symbol: 'MNFT',
    uri: `https://arweave.net/mock-uri-${id}`,
    sellerFeeBasisPoints: 500,
    metadata: {
      name: `NFT #${id}`,
      symbol: 'MNFT',
      description: `This is mock NFT #${id} for testing purposes`,
      image: `https://picsum.photos/seed/${id}/500/500`,
      attributes: [
        {
          trait_type: 'Background',
          value: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'][Math.floor(Math.random() * 5)],
        },
        {
          trait_type: 'Eyes',
          value: ['Small', 'Big', 'Oval', 'Round', 'Sleepy'][Math.floor(Math.random() * 5)],
        },
        {
          trait_type: 'Mouth',
          value: ['Smile', 'Frown', 'Grin', 'Neutral', 'Open'][Math.floor(Math.random() * 5)],
        },
        {
          trait_type: 'Level',
          value: Math.floor(Math.random() * 5) + 1,
        },
      ],
    },
    price: Math.random() * 10 + 0.1,
    listed: Math.random() > 0.5,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  };
});

// Helper function to generate a random wallet address for the mint
const generateRandomWallet = (): string => {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');
};

// GET handler for fetching NFTs
export async function GET(request: NextRequest) {
  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sortField = searchParams.get('sortField') || 'name';
  const sortDirection = searchParams.get('sortDirection') || 'asc';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '12');
  const mint = searchParams.get('mint');

  // If a specific mint is requested, return just that NFT
  if (mint) {
    const nft = mockNFTs.find(nft => nft.mint.toString() === mint);
    if (nft) {
      return NextResponse.json(nft);
    } else {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 });
    }
  }

  // Filter NFTs based on query parameters
  let filteredNFTs = [...mockNFTs];

  // Filter by name
  if (name) {
    filteredNFTs = filteredNFTs.filter(nft => 
      nft.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Filter by price range
  if (minPrice) {
    const min = parseFloat(minPrice);
    filteredNFTs = filteredNFTs.filter(nft => !nft.price || nft.price >= min);
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice);
    filteredNFTs = filteredNFTs.filter(nft => !nft.price || nft.price <= max);
  }

  // Sort NFTs
  if (sortField) {
    filteredNFTs.sort((a, b) => {
      // @ts-ignore - we know these fields exist
      const aValue = a[sortField];
      // @ts-ignore - we know these fields exist
      const bValue = b[sortField];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Calculate pagination
  const totalItems = filteredNFTs.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedNFTs = filteredNFTs.slice(startIndex, endIndex);

  // Return paginated results with pagination info
  return NextResponse.json({
    nfts: paginatedNFTs,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
}

// POST handler for creating new NFTs
export async function POST(request: NextRequest) {
  try {
    const requestData: { metadata: NFTMetadata } = await request.json();
    
    if (!requestData.metadata || !requestData.metadata.name || !requestData.metadata.symbol || !requestData.metadata.image) {
      return NextResponse.json(
        { error: 'Missing required fields: name, symbol, or image' },
        { status: 400 }
      );
    }
    
    const metadata = requestData.metadata;
    
    // Create a new NFT with the provided metadata
    const newNFT: NFTListItem = {
      mint: new PublicKey(generateRandomWallet()),
      name: metadata.name,
      symbol: metadata.symbol,
      uri: 'https://arweave.net/' + Math.random().toString(36).substring(2, 15),
      sellerFeeBasisPoints: metadata.seller_fee_basis_points || 500, // Default 5%
      metadata: {
        ...metadata,
        // Ensure the metadata has all required fields
        name: metadata.name,
        symbol: metadata.symbol,
        image: metadata.image,
      },
      createdAt: new Date(),
    };
    
    // Add the new NFT to our collection
    mockNFTs.unshift(newNFT);
    
    return NextResponse.json(newNFT, { status: 201 });
  } catch (error) {
    console.error('Error creating NFT:', error);
    return NextResponse.json(
      { error: 'Failed to create NFT' },
      { status: 500 }
    );
  }
} 