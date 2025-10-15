'use client';

import React, { useState } from 'react';
import { NFTCreationForm } from '../../components/NFTCreationForm';
import { useNFTCreation } from '../../hooks/useNFTCreation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NFTMetadata } from '../../types/nft';

export default function CreateNFTPage() {
  const router = useRouter();
  const [creationSuccess, setCreationSuccess] = useState(false);
  
  const { 
    createNFT, 
    isCreating, 
    creationError, 
    lastCreatedNFT 
  } = useNFTCreation({
    onSuccess: () => {
      setCreationSuccess(true);
      // In a production app, you might want to redirect to the NFT detail page
    },
  });
  
  // Wrapper function to adapt the createNFT function to match the expected type
  const handleSubmit = async (metadata: NFTMetadata): Promise<void> => {
    await createNFT(metadata);
  };
  
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Create New NFT</h1>
          <Link
            href="/"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Back to Gallery
          </Link>
        </div>
        
        {creationSuccess && lastCreatedNFT ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Your NFT "{lastCreatedNFT.name}" has been created successfully.</span>
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setCreationSuccess(false)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Create Another
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                View in Gallery
              </button>
            </div>
          </div>
        ) : null}
        
        {creationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {creationError.message}</span>
          </div>
        )}
        
        <NFTCreationForm
          onSubmit={handleSubmit}
          isSubmitting={isCreating}
        />
      </div>
    </main>
  );
} 