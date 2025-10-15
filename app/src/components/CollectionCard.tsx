import React from 'react';
import Link from 'next/link';
import { NFTCollection } from '@/types/nft';

interface CollectionCardProps {
  collection: NFTCollection;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  return (
    <Link href={`/collections/${collection.id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
        <div className="h-48 overflow-hidden">
          <img
            src={collection.image || 'https://via.placeholder.com/500x500?text=No+Image'}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold mb-1 truncate">{collection.name}</h3>
            {collection.verified && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Verified</span>
            )}
          </div>
          
          <p className="text-gray-500 text-sm mb-2">{collection.symbol}</p>
          
          {collection.description && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">{collection.description}</p>
          )}
          
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-medium">{collection.mintCount?.toLocaleString() || 0}</span>
              <span className="text-gray-500 ml-1">items</span>
            </div>
            
            {collection.floorPrice !== undefined && (
              <div>
                <span className="font-medium">{collection.floorPrice}</span>
                <span className="text-gray-500 ml-1">floor</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}; 