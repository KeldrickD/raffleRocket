import React, { useState } from 'react';
import { useNFTManager } from '../hooks/useNFTManager';
import { NFTListItem } from '../types/nft';

interface NFTGalleryProps {
  initialNFTs?: NFTListItem[];
  pageSize?: number;
}

export const NFTGallery: React.FC<NFTGalleryProps> = ({
  initialNFTs = [],
  pageSize = 12,
}) => {
  const {
    paginatedNFTs,
    paginationInfo,
    filters,
    sortOptions,
    isLoading,
    error,
    selectedNFT,
    transformStyle,
    
    // Actions
    loadNFTs,
    selectNFT,
    deselectNFT,
    setNameFilter,
    setPriceFilter,
    setSortField,
    goToPage,
    nextPage,
    prevPage,
    transformNFT,
    resetAllFilters,
  } = useNFTManager({
    initialNFTs,
    pageSize,
    autoLoad: true,
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setNameFilter(searchTerm);
  };

  const handlePriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const minPrice = formData.get('minPrice') ? Number(formData.get('minPrice')) : undefined;
    const maxPrice = formData.get('maxPrice') ? Number(formData.get('maxPrice')) : undefined;
    setPriceFilter(minPrice, maxPrice);
  };

  const handleSortChange = (field: string) => {
    setSortField(field as any);
  };

  const handleNFTClick = (nft: NFTListItem) => {
    selectNFT(nft);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading NFTs...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error.message}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">NFT Gallery</h1>

      {/* Filters and sort controls */}
      <div className="mb-8 bg-white p-4 rounded shadow">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex">
              <input
                type="text"
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-4 py-2 w-full rounded-l focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </form>

          {/* Price Filter */}
          <form onSubmit={handlePriceFilter} className="flex items-center gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              className="border px-4 py-2 w-24 rounded focus:outline-none"
            />
            <span>to</span>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              className="border px-4 py-2 w-24 rounded focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Filter
            </button>
          </form>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortOptions.field}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border px-4 py-2 rounded focus:outline-none"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="date">Date</option>
            </select>
            <span>{sortOptions.direction === 'asc' ? '↑' : '↓'}</span>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetAllFilters}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {paginatedNFTs.length > 0 ? (
          paginatedNFTs.map((nft) => (
            <div
              key={nft.mint.toString()}
              onClick={() => handleNFTClick(nft)}
              className={`bg-white rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105 ${
                selectedNFT && selectedNFT.mint.toString() === nft.mint.toString()
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={nft.metadata.image}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{nft.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{nft.symbol}</p>
                {/* Display price if available */}
                {nft.price && (
                  <p className="text-blue-600 font-bold">{nft.price} SOL</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No NFTs found matching the current filters.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {paginatedNFTs.length > 0 && (
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => goToPage(1)}
            disabled={paginationInfo.currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            ««
          </button>
          <button
            onClick={prevPage}
            disabled={!paginationInfo.hasPreviousPage}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            «
          </button>
          
          <span className="px-3 py-1">
            Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
          </span>
          
          <button
            onClick={nextPage}
            disabled={!paginationInfo.hasNextPage}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            »
          </button>
          <button
            onClick={() => goToPage(paginationInfo.totalPages)}
            disabled={paginationInfo.currentPage === paginationInfo.totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            »»
          </button>
        </div>
      )}

      {/* Selected NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedNFT.name}</h2>
                <button
                  onClick={deselectNFT}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>
              
              {/* NFT Image with Transform */}
              <div className="mb-6 text-center">
                <div 
                  className="inline-block transition-transform duration-300 ease-in-out"
                  style={transformStyle || {}}
                >
                  <img
                    src={selectedNFT.metadata.image}
                    alt={selectedNFT.name}
                    className="max-h-[40vh] mx-auto"
                  />
                </div>
              </div>
              
              {/* Transform Controls */}
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scale
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    defaultValue="1"
                    onChange={(e) => transformNFT('scale', parseFloat(e.target.value))}
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
                    defaultValue="0"
                    onChange={(e) => transformNFT('rotate', parseFloat(e.target.value))}
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
                    defaultValue="0"
                    onChange={(e) => 
                      transformNFT('translate', parseFloat(e.target.value), 0)
                    }
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* NFT Details */}
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Symbol:</div>
                  <div>{selectedNFT.symbol}</div>
                  
                  <div className="text-gray-600">Mint:</div>
                  <div className="truncate">{selectedNFT.mint.toString()}</div>
                  
                  <div className="text-gray-600">Seller Fee:</div>
                  <div>{selectedNFT.sellerFeeBasisPoints / 100}%</div>
                </div>
              </div>
              
              {/* NFT Description */}
              {selectedNFT.metadata.description && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedNFT.metadata.description}</p>
                </div>
              )}
              
              {/* NFT Attributes */}
              {selectedNFT.metadata.attributes && selectedNFT.metadata.attributes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Attributes</h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {selectedNFT.metadata.attributes.map((attr, index) => (
                      <div key={index} className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-xs text-blue-600">{attr.trait_type}</div>
                        <div className="font-medium">{attr.value.toString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 