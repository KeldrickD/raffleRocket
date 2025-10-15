'use client';

import React, { useState, useEffect } from 'react';
import { fetchNFTByMint, fetchNFTs } from '@/utils/nft';
import { NFTListItem } from '@/types/nft';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRarityRank, getRarityLabel, calculateTraitRarity } from '@/utils/rarity';
import { NFTActivitySection } from '@/components/NFTActivitySection';

interface NFTDetailPageProps {
  params: {
    mint: string;
  };
}

export default function NFTDetailPage({ params }: NFTDetailPageProps) {
  const router = useRouter();
  const [nft, setNft] = useState<NFTListItem | null>(null);
  const [allNfts, setAllNfts] = useState<NFTListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({});
  
  // For action modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [listPrice, setListPrice] = useState(1);
  const [raffleTicketPrice, setRaffleTicketPrice] = useState(0.1);
  const [raffleDuration, setRaffleDuration] = useState(7);
  
  // For transform controls
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  // Rarity info
  const [rarityRank, setRarityRank] = useState<number>(0);
  const [rarityLabel, setRarityLabel] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load this NFT
        const loadedNft = await fetchNFTByMint(params.mint);
        setNft(loadedNft);
        
        // Load all NFTs for rarity calculation (with a limit for performance)
        const response = await fetchNFTs({ pageSize: 100 });
        setAllNfts(response.nfts);
        
        // Calculate rarity if we have the NFT and collection
        if (loadedNft && response.nfts.length > 0) {
          const rank = getRarityRank(loadedNft, response.nfts);
          setRarityRank(rank);
          setRarityLabel(getRarityLabel(rank, response.nfts.length));
        }
      } catch (err) {
        console.error('Error loading NFT:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading NFT'));
      } finally {
        setLoading(false);
      }
    }

    if (params.mint) {
      loadData();
    }
  }, [params.mint]);

  // Apply image transformations
  useEffect(() => {
    setTransformStyle({
      transform: `scale(${scale}) rotate(${rotate}deg) translateX(${translateX}px)`,
    });
  }, [scale, rotate, translateX]);

  // Simulated action handlers
  const handleTransfer = async () => {
    if (!nft) return;
    alert(`NFT would be transferred to ${transferAddress}`);
    setShowTransferModal(false);
  };

  const handleList = async () => {
    if (!nft) return;
    alert(`NFT would be listed for ${listPrice} SOL`);
    setShowListModal(false);
  };

  const handleDelist = async () => {
    if (!nft) return;
    alert('NFT would be delisted from marketplace');
  };

  const handleRaffle = async () => {
    if (!nft) return;
    alert(`NFT raffle would be created with ticket price ${raffleTicketPrice} SOL for ${raffleDuration} days`);
    setShowRaffleModal(false);
  };

  const handleBurn = async () => {
    if (!nft) return;
    if (window.confirm('Are you sure you want to burn this NFT? This action cannot be undone.')) {
      alert('NFT would be burned');
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading NFT...</span>
        </div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error?.message || 'NFT not found'}</span>
          <Link href="/" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-blue-500 hover:underline flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Gallery
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Left column - Image and transform controls */}
          <div className="md:w-1/2 p-6">
            <div className="mb-6 text-center">
              <div 
                className="inline-block transition-transform duration-300 ease-in-out"
                style={transformStyle}
              >
                <img
                  src={nft.metadata.image}
                  alt={nft.name}
                  className="max-h-[400px] mx-auto rounded"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Transform Controls</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scale
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rotate
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="10"
                    value={rotate}
                    onChange={(e) => setRotate(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Translate X
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="10"
                    value={translateX}
                    onChange={(e) => setTranslateX(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button 
                  onClick={() => {
                    setScale(1);
                    setRotate(0);
                    setTranslateX(0);
                  }}
                  className="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Reset Transforms
                </button>
              </div>
            </div>
          </div>
          
          {/* Right column - NFT details and actions */}
          <div className="md:w-1/2 p-6 bg-gray-50">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">{nft.name}</h1>
              <p className="text-gray-500">{nft.symbol}</p>
              
              {/* Rarity badge */}
              {rarityLabel && (
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mr-2 ${
                    rarityLabel === 'Legendary' ? 'bg-yellow-200 text-yellow-800' :
                    rarityLabel === 'Epic' ? 'bg-purple-200 text-purple-800' :
                    rarityLabel === 'Rare' ? 'bg-blue-200 text-blue-800' :
                    rarityLabel === 'Uncommon' ? 'bg-green-200 text-green-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {rarityLabel}
                  </span>
                  <span className="text-sm text-gray-600">Rank #{rarityRank} of {allNfts.length}</span>
                </div>
              )}
              
              {nft.price && (
                <div className="mt-2">
                  <span className="text-2xl font-bold text-blue-600">{nft.price} SOL</span>
                  {nft.listed && <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Listed</span>}
                </div>
              )}
            </div>
            
            {/* NFT Description */}
            {nft.metadata.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{nft.metadata.description}</p>
              </div>
            )}
            
            {/* NFT Details */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Details</h2>
              <div className="bg-white p-4 rounded border">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Mint Address:</div>
                  <div className="truncate">{nft.mint.toString()}</div>
                  
                  <div className="text-gray-600">Seller Fee:</div>
                  <div>{nft.sellerFeeBasisPoints / 100}%</div>
                  
                  {nft.owner && (
                    <>
                      <div className="text-gray-600">Owner:</div>
                      <div className="truncate">{nft.owner.toString()}</div>
                    </>
                  )}
                  
                  {nft.createdAt && (
                    <>
                      <div className="text-gray-600">Created:</div>
                      <div>{nft.createdAt.toLocaleDateString()}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* NFT Attributes with Rarity */}
            {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Attributes</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {nft.metadata.attributes.map((attr, index) => {
                    // Calculate how rare this trait is among all NFTs
                    const traitRarity = calculateTraitRarity(attr, allNfts);
                    const isRare = traitRarity < 10; // Less than 10% = rare
                    
                    return (
                      <div key={index} className={`${
                        isRare ? 'bg-blue-100 border-blue-300' : 'bg-blue-50'
                      } p-3 rounded text-center border`}>
                        <div className="text-xs text-blue-600">{attr.trait_type}</div>
                        <div className="font-medium">{attr.value.toString()}</div>
                        <div className="text-xs mt-1 text-gray-600">
                          {traitRarity}% have this trait
                          {isRare && (
                            <span className="block font-medium text-blue-700 mt-1">Rare!</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* NFT Actions */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Transfer
                </button>
                
                {nft.listed ? (
                  <button
                    onClick={handleDelist}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Delist
                  </button>
                ) : (
                  <button
                    onClick={() => setShowListModal(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    List for Sale
                  </button>
                )}
                
                <button
                  onClick={() => setShowRaffleModal(true)}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                  Create Raffle
                </button>
                
                <button
                  onClick={handleBurn}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Burn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Transfer NFT</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                placeholder="Enter Solana wallet address"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={!transferAddress.trim()}
                className={`px-4 py-2 bg-blue-600 text-white rounded ${
                  !transferAddress.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* List for Sale Modal */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">List NFT for Sale</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (SOL)
              </label>
              <input
                type="number"
                value={listPrice}
                onChange={(e) => setListPrice(parseFloat(e.target.value) || 0)}
                min="0.001"
                step="0.001"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowListModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleList}
                disabled={listPrice <= 0}
                className={`px-4 py-2 bg-green-600 text-white rounded ${
                  listPrice <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
              >
                List for Sale
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Raffle Modal */}
      {showRaffleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create Raffle for NFT</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Price (SOL)
              </label>
              <input
                type="number"
                value={raffleTicketPrice}
                onChange={(e) => setRaffleTicketPrice(parseFloat(e.target.value) || 0)}
                min="0.001"
                step="0.001"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                value={raffleDuration}
                onChange={(e) => setRaffleDuration(parseInt(e.target.value) || 1)}
                min="1"
                step="1"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRaffleModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRaffle}
                disabled={raffleTicketPrice <= 0 || raffleDuration <= 0}
                className={`px-4 py-2 bg-purple-600 text-white rounded ${
                  raffleTicketPrice <= 0 || raffleDuration <= 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-purple-700'
                }`}
              >
                Create Raffle
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add NFT Activity Section */}
      <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden p-6">
        <NFTActivitySection mintId={params.mint} />
      </div>
    </div>
  );
} 