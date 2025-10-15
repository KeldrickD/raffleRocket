'use client';

import React, { useState, useEffect } from 'react';
import { NFTActivity, NFTActivityType } from '@/types/activity';
import { ActivitySearch, ActivitySearchFilters } from '@/components/ActivitySearch';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { NFTPriceHistory } from '@/components/NFTPriceHistory';
import { ActivityExport } from '@/components/ActivityExport';
import { getActivity } from '@/services/activityService';
import Link from 'next/link';

interface ActivityTypePageProps {
  params: {
    type: string;
  };
}

const activityTypeLabels: Record<string, string> = {
  'sales': 'Sales',
  'mints': 'Mints',
  'listings': 'Listings',
  'transfers': 'Transfers',
  'offers': 'Offers',
  'burns': 'Burns',
  'raffles': 'Raffles'
};

const activityTypeMappings: Record<string, NFTActivityType[]> = {
  'sales': ['sale'],
  'mints': ['mint'],
  'listings': ['list', 'delist'],
  'transfers': ['transfer'],
  'offers': ['offer'],
  'burns': ['burn'],
  'raffles': ['raffle_create', 'raffle_join', 'raffle_complete']
};

export default function ActivityTypePage({ params }: ActivityTypePageProps) {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivitySearchFilters>({
    keyword: '',
    types: activityTypeMappings[params.type] || [],
    priceMin: null,
    priceMax: null,
    dateFrom: null,
    dateTo: null,
    walletAddress: '',
    collectionId: ''
  });
  
  // Get readable activity type
  const activityTypeLabel = activityTypeLabels[params.type] || 'Activities';
  
  // Fetch activities based on type
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If we don't have a valid type mapping, show error
        if (!activityTypeMappings[params.type]) {
          setError('Invalid activity type');
          setIsLoading(false);
          return;
        }
        
        const data = await getActivity({
          types: activityTypeMappings[params.type]
        });
        
        setActivities(data);
      } catch (err) {
        console.error(`Failed to fetch ${params.type} activities:`, err);
        setError(`Failed to load ${params.type} data. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [params.type]);
  
  // Handle search/filter
  const handleSearch = async (newFilters: ActivitySearchFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Always keep the activity type filter
      const updatedFilters = {
        ...newFilters,
        types: activityTypeMappings[params.type] || []
      };
      
      setFilters(updatedFilters);
      
      const searchParams: any = {
        types: updatedFilters.types
      };
      
      if (updatedFilters.dateFrom) {
        searchParams.fromDate = updatedFilters.dateFrom;
      }
      
      if (updatedFilters.dateTo) {
        searchParams.toDate = updatedFilters.dateTo;
      }
      
      if (updatedFilters.walletAddress) {
        searchParams.walletAddress = updatedFilters.walletAddress;
      }
      
      if (updatedFilters.collectionId) {
        searchParams.collectionIds = [updatedFilters.collectionId];
      }
      
      const data = await getActivity(searchParams);
      
      // Apply additional filtering for price range and keyword
      let filtered = data;
      
      if (updatedFilters.priceMin !== null || updatedFilters.priceMax !== null) {
        filtered = filtered.filter(activity => {
          if (activity.price === undefined) return false;
          
          if (updatedFilters.priceMin !== null && activity.price < updatedFilters.priceMin) {
            return false;
          }
          
          if (updatedFilters.priceMax !== null && activity.price > updatedFilters.priceMax) {
            return false;
          }
          
          return true;
        });
      }
      
      if (updatedFilters.keyword) {
        const keyword = updatedFilters.keyword.toLowerCase();
        filtered = filtered.filter(activity => 
          (activity.nftName && activity.nftName.toLowerCase().includes(keyword)) ||
          (activity.collectionName && activity.collectionName.toLowerCase().includes(keyword))
        );
      }
      
      setActivities(filtered);
    } catch (err) {
      console.error('Failed to search activities:', err);
      setError('Failed to search activities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/activity" className="text-blue-500 hover:text-blue-700 mr-2">
            <span className="inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
          <h1 className="text-3xl font-bold">{activityTypeLabel}</h1>
        </div>
        
        <p className="text-gray-600">
          View and analyze {activityTypeLabel.toLowerCase()} across the marketplace
        </p>
      </div>
      
      {/* Activity type navigation */}
      <div className="flex mb-6 overflow-x-auto space-x-2 pb-2">
        {Object.entries(activityTypeLabels).map(([type, label]) => (
          <Link 
            key={type}
            href={`/activity/${type}`}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              params.type === type 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      
      {/* Search component */}
      <div className="mb-6">
        <ActivitySearch 
          onSearch={handleSearch} 
          defaultFilters={{
            ...filters,
            types: [] // Don't show types in search since we're on a type-specific page
          }}
        />
      </div>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Main content area */}
      {!isLoading && activities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500">No {activityTypeLabel.toLowerCase()} found</p>
          <p className="text-gray-400 mt-2">Try changing your filters or search criteria</p>
        </div>
      ) : (
        <div className="mb-8">
          <ActivityTimeline activities={activities} />
        </div>
      )}
      
      {/* Price history for relevant activity types */}
      {!isLoading && activities.length > 0 && ['sales', 'listings', 'offers'].includes(params.type) && (
        <div className="mt-8 mb-8">
          <NFTPriceHistory activities={activities} />
        </div>
      )}
      
      {/* Export component */}
      {activities.length > 0 && (
        <div className="mt-8">
          <ActivityExport 
            activities={activities} 
            filename={`nft-${params.type}`}
          />
        </div>
      )}
      
      {/* Stats summary */}
      {activities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total {activityTypeLabel}</h3>
            <p className="text-3xl font-bold">{activities.length}</p>
          </div>
          
          {['sales', 'listings', 'offers'].includes(params.type) && (
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {params.type === 'sales' ? 'Trading Volume' : 
                 params.type === 'listings' ? 'Listed Value' : 'Offered Value'}
              </h3>
              <p className="text-3xl font-bold">
                {activities
                  .filter(a => a.price !== undefined)
                  .reduce((sum, a) => sum + (a.price || 0), 0)
                  .toFixed(2)} SOL
              </p>
            </div>
          )}
          
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {params.type === 'sales' || params.type === 'listings' || params.type === 'offers'
                ? 'Average Price'
                : 'Most Recent Activity'}
            </h3>
            <p className="text-3xl font-bold">
              {params.type === 'sales' || params.type === 'listings' || params.type === 'offers'
                ? activities.filter(a => a.price !== undefined).length > 0
                  ? (activities
                      .filter(a => a.price !== undefined)
                      .reduce((sum, a) => sum + (a.price || 0), 0) / 
                      activities.filter(a => a.price !== undefined).length
                    ).toFixed(2) + ' SOL'
                  : '0 SOL'
                : activities.length > 0
                  ? new Date(Math.max(...activities.map(a => a.timestamp.getTime())))
                      .toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                  : 'None'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 