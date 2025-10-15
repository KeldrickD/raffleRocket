import { NextRequest, NextResponse } from 'next/server';
import { NFTCollection } from '@/types/nft';

// Mock collections data (in a real app, this would come from a database)
const mockCollections: NFTCollection[] = [
  {
    id: 'collection-1',
    name: 'Cosmic Creatures',
    symbol: 'COSMIC',
    description: 'A collection of unique cosmic creatures from different galaxies',
    image: 'https://picsum.photos/seed/cosmic/500/500',
    website: 'https://example.com/cosmic',
    mintCount: 1000,
    floorPrice: 2.5,
    verified: true,
    featured: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
  },
  {
    id: 'collection-2',
    name: 'Pixel Warriors',
    symbol: 'PXWAR',
    description: 'Retro-style pixel art warriors ready for battle',
    image: 'https://picsum.photos/seed/pixel/500/500',
    website: 'https://example.com/pixelwarriors',
    mintCount: 5000,
    floorPrice: 0.8,
    verified: true,
    featured: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  },
  {
    id: 'collection-3',
    name: 'Abstract Dreams',
    symbol: 'DREAM',
    description: 'Abstract art pieces representing dreams and fantasies',
    image: 'https://picsum.photos/seed/abstract/500/500',
    website: 'https://example.com/abstractdreams',
    mintCount: 750,
    floorPrice: 3.2,
    verified: false,
    featured: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  },
  {
    id: 'collection-4',
    name: 'Crypto Punks',
    symbol: 'PUNK',
    description: 'Punk-style crypto art with unique attributes',
    image: 'https://picsum.photos/seed/punk/500/500',
    website: 'https://example.com/cryptopunks',
    mintCount: 10000,
    floorPrice: 5.0,
    verified: true,
    featured: true,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
  },
  {
    id: 'collection-5',
    name: 'Digital Landscapes',
    symbol: 'LAND',
    description: 'Beautiful digital landscapes from imaginary worlds',
    image: 'https://picsum.photos/seed/landscape/500/500',
    website: 'https://example.com/landscapes',
    mintCount: 300,
    floorPrice: 1.5,
    verified: false,
    featured: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
];

export async function GET(request: NextRequest) {
  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const featured = searchParams.get('featured');

  // If a specific collection ID is requested, return just that collection
  if (id) {
    const collection = mockCollections.find(collection => collection.id === id);
    if (collection) {
      return NextResponse.json(collection);
    } else {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
  }

  // Filter collections based on query parameters
  let filteredCollections = [...mockCollections];

  // Filter by featured status
  if (featured === 'true') {
    filteredCollections = filteredCollections.filter(collection => collection.featured);
  } else if (featured === 'false') {
    filteredCollections = filteredCollections.filter(collection => !collection.featured);
  }

  // Sort by newest first by default
  filteredCollections.sort((a, b) => {
    const dateA = a.createdAt || new Date(0);
    const dateB = b.createdAt || new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  return NextResponse.json(filteredCollections);
} 