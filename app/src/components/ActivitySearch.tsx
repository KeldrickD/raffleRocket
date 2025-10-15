import React, { useState } from 'react';
import { NFTActivityType } from '@/types/activity';

interface ActivitySearchProps {
  onSearch: (filters: ActivitySearchFilters) => void;
  defaultFilters?: Partial<ActivitySearchFilters>;
}

export interface ActivitySearchFilters {
  keyword: string;
  types: NFTActivityType[];
  priceMin: number | null;
  priceMax: number | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  walletAddress: string;
  collectionId: string;
}

export const ActivitySearch: React.FC<ActivitySearchProps> = ({ 
  onSearch,
  defaultFilters = {}
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<ActivitySearchFilters>({
    keyword: defaultFilters.keyword || '',
    types: defaultFilters.types || [],
    priceMin: defaultFilters.priceMin || null,
    priceMax: defaultFilters.priceMax || null,
    dateFrom: defaultFilters.dateFrom || null,
    dateTo: defaultFilters.dateTo || null,
    walletAddress: defaultFilters.walletAddress || '',
    collectionId: defaultFilters.collectionId || ''
  });

  const handleInputChange = (field: keyof ActivitySearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeToggle = (type: NFTActivityType) => {
    setFilters(prev => {
      if (prev.types.includes(type)) {
        return {
          ...prev,
          types: prev.types.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          types: [...prev.types, type]
        };
      }
    });
  };

  const handleClear = () => {
    setFilters({
      keyword: '',
      types: [],
      priceMin: null,
      priceMax: null,
      dateFrom: null,
      dateTo: null,
      walletAddress: '',
      collectionId: ''
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  // Format date string for date inputs
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <form onSubmit={handleSearch}>
          <div className="flex items-center mb-4">
            <input 
              type="text"
              placeholder="Search activities by keyword, NFT name..."
              className="flex-grow rounded-l-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.keyword}
              onChange={(e) => handleInputChange('keyword', e.target.value)}
            />
            <button 
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none"
            >
              Search
            </button>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <button
              type="button"
              className="text-blue-500 text-sm flex items-center focus:outline-none"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide' : 'Show'} advanced filters
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {filters.types.length > 0 || 
             filters.priceMin !== null || 
             filters.priceMax !== null || 
             filters.dateFrom !== null || 
             filters.dateTo !== null || 
             filters.walletAddress !== '' || 
             filters.collectionId !== '' ? (
              <button
                type="button"
                className="text-red-500 text-sm"
                onClick={handleClear}
              >
                Clear all filters
              </button>
            ) : null}
          </div>
          
          {expanded && (
            <div className="mt-4 space-y-4">
              {/* Activity Types */}
              <div>
                <h4 className="text-sm font-medium mb-2">Activity Types</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'mint', 'sale', 'list', 'unlist', 'transfer', 'offer', 
                    'offerCancel', 'burn'
                  ].map((type) => (
                    <div 
                      key={type}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium text-center cursor-pointer 
                        ${filters.types.includes(type as NFTActivityType)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                        }
                      `}
                      onClick={() => handleTypeToggle(type as NFTActivityType)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium mb-2">Price Range (SOL)</h4>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-1/2 rounded border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={filters.priceMin !== null ? filters.priceMin : ''}
                    onChange={(e) => handleInputChange('priceMin', e.target.value ? parseFloat(e.target.value) : null)}
                    min="0"
                    step="0.001"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-1/2 rounded border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={filters.priceMax !== null ? filters.priceMax : ''}
                    onChange={(e) => handleInputChange('priceMax', e.target.value ? parseFloat(e.target.value) : null)}
                    min="0"
                    step="0.001"
                  />
                </div>
              </div>
              
              {/* Date Range */}
              <div>
                <h4 className="text-sm font-medium mb-2">Date Range</h4>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    className="w-1/2 rounded border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formatDateForInput(filters.dateFrom)}
                    onChange={(e) => handleInputChange('dateFrom', e.target.value ? new Date(e.target.value) : null)}
                  />
                  <input
                    type="date"
                    className="w-1/2 rounded border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formatDateForInput(filters.dateTo)}
                    onChange={(e) => handleInputChange('dateTo', e.target.value ? new Date(e.target.value) : null)}
                  />
                </div>
              </div>
              
              {/* Wallet Address */}
              <div>
                <h4 className="text-sm font-medium mb-2">Wallet Address</h4>
                <input
                  type="text"
                  placeholder="Enter wallet address"
                  className="w-full rounded border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filters.walletAddress}
                  onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                />
              </div>
              
              {/* Collection ID */}
              <div>
                <h4 className="text-sm font-medium mb-2">Collection ID</h4>
                <input
                  type="text"
                  placeholder="Enter collection ID"
                  className="w-full rounded border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filters.collectionId}
                  onChange={(e) => handleInputChange('collectionId', e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* Active filters display */}
      {(filters.types.length > 0 || 
        filters.priceMin !== null || 
        filters.priceMax !== null || 
        filters.dateFrom !== null || 
        filters.dateTo !== null || 
        filters.walletAddress !== '' || 
        filters.collectionId !== '') && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-2">Active filters:</div>
          <div className="flex flex-wrap gap-2">
            {filters.types.map(type => (
              <div 
                key={type} 
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
              >
                Type: {type}
                <button 
                  onClick={() => handleTypeToggle(type)}
                  className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            
            {(filters.priceMin !== null || filters.priceMax !== null) && (
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                Price: {filters.priceMin !== null ? filters.priceMin : '0'} - {filters.priceMax !== null ? filters.priceMax : '∞'}
                <button 
                  onClick={() => {
                    handleInputChange('priceMin', null);
                    handleInputChange('priceMax', null);
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            
            {(filters.dateFrom !== null || filters.dateTo !== null) && (
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                Date: {filters.dateFrom ? filters.dateFrom.toLocaleDateString() : 'Any'} - {filters.dateTo ? filters.dateTo.toLocaleDateString() : 'Any'}
                <button 
                  onClick={() => {
                    handleInputChange('dateFrom', null);
                    handleInputChange('dateTo', null);
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            
            {filters.walletAddress && (
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                Wallet: {filters.walletAddress.slice(0, 6)}...{filters.walletAddress.slice(-4)}
                <button 
                  onClick={() => handleInputChange('walletAddress', '')}
                  className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            
            {filters.collectionId && (
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                Collection: {filters.collectionId.slice(0, 6)}...{filters.collectionId.slice(-4)}
                <button 
                  onClick={() => handleInputChange('collectionId', '')}
                  className="ml-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 