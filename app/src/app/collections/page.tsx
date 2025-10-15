'use client';

import React, { useState, useEffect } from 'react';
import { fetchCollections } from '@/utils/collections';
import { NFTCollection } from '@/types/nft';
import { CollectionCard } from '@/components/CollectionCard';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true);
        
        // Fetch all collections
        const allCollections = await fetchCollections();
        setCollections(allCollections);
        
        // Fetch featured collections
        const featured = await fetchCollections(true);
        setFeaturedCollections(featured);
      } catch (err) {
        console.error('Error loading collections:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading collections'));
      } finally {
        setLoading(false);
      }
    }
    
    loadCollections();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading collections...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error.message}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">NFT Collections</h1>
      
      {/* Featured Collections */}
      {featuredCollections.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <span className="mr-2">✨</span> Featured Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredCollections.map(collection => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      )}
      
      {/* All Collections */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">All Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collections.map(collection => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
          
          {collections.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No collections found
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 