import React, { useState } from 'react';
import { NFTListItem } from '../types/nft';

interface NFTBatchActionBarProps {
  selectedNFTs: NFTListItem[];
  onTransfer: (nfts: NFTListItem[], toAddress: string) => void;
  onList: (nfts: NFTListItem[], price: number) => void;
  onDelist: (nfts: NFTListItem[]) => void;
  onRaffle: (nfts: NFTListItem[], ticketPrice: number, duration: number) => void;
  onBurn: (nfts: NFTListItem[]) => void;
  onClearSelection: () => void;
  isProcessing: boolean;
  progress: number;
  currentOperation: string | null;
}

export const NFTBatchActionBar: React.FC<NFTBatchActionBarProps> = ({
  selectedNFTs,
  onTransfer,
  onList,
  onDelist,
  onRaffle,
  onBurn,
  onClearSelection,
  isProcessing,
  progress,
  currentOperation,
}) => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  
  const [transferAddress, setTransferAddress] = useState('');
  const [listPrice, setListPrice] = useState(1);
  const [raffleTicketPrice, setRaffleTicketPrice] = useState(0.1);
  const [raffleDuration, setRaffleDuration] = useState(7);
  
  const count = selectedNFTs.length;
  
  if (count === 0) return null;
  
  const handleTransfer = () => {
    onTransfer(selectedNFTs, transferAddress);
    setShowTransferModal(false);
    setTransferAddress('');
  };
  
  const handleList = () => {
    onList(selectedNFTs, listPrice);
    setShowListModal(false);
    setListPrice(1);
  };
  
  const handleRaffle = () => {
    onRaffle(selectedNFTs, raffleTicketPrice, raffleDuration);
    setShowRaffleModal(false);
    setRaffleTicketPrice(0.1);
    setRaffleDuration(7);
  };
  
  const handleDelist = () => {
    onDelist(selectedNFTs);
  };
  
  const handleBurn = () => {
    if (window.confirm(`Are you sure you want to burn ${count} NFT${count !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      onBurn(selectedNFTs);
    }
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{count} NFT{count !== 1 ? 's' : ''} selected</span>
            <button 
              onClick={onClearSelection}
              className="text-sm text-gray-500 hover:text-gray-700"
              disabled={isProcessing}
            >
              Clear
            </button>
          </div>
          
          {isProcessing ? (
            <div className="flex-1 max-w-md mx-4">
              <div className="flex items-center gap-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {currentOperation?.charAt(0).toUpperCase()}{currentOperation?.slice(1)} in progress...
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTransferModal(true)}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                disabled={isProcessing}
              >
                Transfer
              </button>
              <button
                onClick={() => setShowListModal(true)}
                className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                disabled={isProcessing}
              >
                List for Sale
              </button>
              <button
                onClick={handleDelist}
                className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                disabled={isProcessing}
              >
                Delist
              </button>
              <button
                onClick={() => setShowRaffleModal(true)}
                className="px-3 py-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
                disabled={isProcessing}
              >
                Create Raffle
              </button>
              <button
                onClick={handleBurn}
                className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                disabled={isProcessing}
              >
                Burn
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Transfer {count} NFT{count !== 1 ? 's' : ''}</h3>
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
            <h3 className="text-lg font-medium mb-4">List {count} NFT{count !== 1 ? 's' : ''} for Sale</h3>
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
            <h3 className="text-lg font-medium mb-4">Create Raffle for {count} NFT{count !== 1 ? 's' : ''}</h3>
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
    </div>
  );
}; 