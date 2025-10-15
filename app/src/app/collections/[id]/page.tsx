'use client';

import React, { useState, useEffect } from 'react';
import { fetchCollectionById } from '@/utils/collections';
import { fetchNFTs } from '@/utils/nft';
import { NFTCollection, NFTListItem } from '@/types/nft';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { calculateRarityScores } from '@/utils/rarity';

interface CollectionDetailPageProps {
  params: {
    id: string;
  };
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const router = useRouter();
  const [collection, setCollection] = useState<NFTCollection | null>(null);
  const [nfts, setNfts] = useState<NFTListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNfts, setFilteredNfts] = useState<NFTListItem[]>([]);
  const [sortField, setSortField] = useState<'name' | 'price' | 'rarity'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load collection details
        const loadedCollection = await fetchCollectionById(params.id);
        setCollection(loadedCollection);
        
        // Load all NFTs
        const response = await fetchNFTs({ pageSize: 100 });
        
        // In a real app, we would filter NFTs by collection ID
        // For now, let's simulate by assigning the collection ID to some of them
        const collectionNfts = response.nfts.slice(0, 12).map(nft => ({
          ...nft,
          collectionId: params.id,
        }));
        
        // Calculate rarity scores for all NFTs in this collection
        const nftsWithRarity = calculateRarityScores(collectionNfts);
        setNfts(nftsWithRarity);
        setFilteredNfts(nftsWithRarity);
      } catch (err) {
        console.error('Error loading collection:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading collection'));
      } finally {
        setLoading(false);
      }
    }
    
    if (params.id) {
      loadData();
    }
  }, [params.id]);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...nfts];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(nft => 
        nft.name.toLowerCase().includes(term) || 
        nft.symbol.toLowerCase().includes(term)
      );
    }
    
    // Sort NFTs
    result.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle undefined values
      if (aValue === undefined) aValue = sortField === 'price' ? 0 : '';
      if (bValue === undefined) bValue = sortField === 'price' ? 0 : '';
      
      // Compare values
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredNfts(result);
  }, [nfts, searchTerm, sortField, sortDirection]);
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading collection...</span>
        </div>
      </div>
    );
  }
  
  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error?.message || 'Collection not found'}</span>
          <Link href="/collections" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/collections" className="text-blue-500 hover:underline flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Collections
        </Link>
      </div>
      
      {/* Collection Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 p-6">
            <img
              src={collection.image || 'https://via.placeholder.com/500x500?text=No+Image'}
              alt={collection.name}
              className="w-full rounded-lg shadow-md"
            />
          </div>
          
          <div className="md:w-2/3 p-6">
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold mr-2">{collection.name}</h1>
              {collection.verified && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Verified</span>
              )}
            </div>
            
            <p className="text-gray-500 text-sm mb-4">{collection.symbol}</p>
            
            {collection.description && (
              <p className="text-gray-700 mb-6">{collection.description}</p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-2xl font-bold">{collection.mintCount?.toLocaleString()}</div>
                <div className="text-gray-500 text-sm">items</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-2xl font-bold">{collection.floorPrice} SOL</div>
                <div className="text-gray-500 text-sm">floor price</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-2xl font-bold">{collection.createdAt?.toLocaleDateString()}</div>
                <div className="text-gray-500 text-sm">created</div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              {collection.website && (
                <a 
                  href={collection.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Visit Website
                </a>
              )}
              
              {/* Link to Collection Activity */}
              <Link 
                href={`/collections/${params.id}/activity`}
                className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                View Activity
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* NFT Gallery */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Collection Items</h2>
        
        {/* Filters and search */}
        <div className="mb-6 bg-white p-4 rounded shadow">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <span className="mr-2">Sort by:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="rarity">Rarity</option>
              </select>
              
              <button
                onClick={toggleSortDirection}
                className="ml-2 p-2 border rounded"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
        
        {/* NFT Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredNfts.length > 0 ? (
            filteredNfts.map(nft => (
              <Link 
                key={nft.mint.toString()} 
                href={`/nfts/${nft.mint.toString()}`}
                className="block"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={nft.metadata.image}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 truncate">{nft.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{nft.symbol}</p>
                    
                    <div className="flex justify-between">
                      {nft.price && (
                        <p className="text-blue-600 font-bold">{nft.price} SOL</p>
                      )}
                      
                      {nft.rarity && (
                        <p className="text-purple-600 text-sm">
                          Rarity: <span className="font-bold">{nft.rarity}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No NFTs found matching your search
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 