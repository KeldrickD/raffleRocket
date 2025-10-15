'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ActivityItem } from '@/components/ActivityItem';
import { NFTActivity, NFTActivityType, ActivityFilters } from '@/types/activity';
import { getCollectionActivity } from '@/services/activityService';
import { fetchCollectionById } from '@/utils/collections';
import { NFTCollection } from '@/types/nft';

interface CollectionActivityPageProps {
  params: {
    id: string;
  };
}

export default function CollectionActivityPage({ params }: CollectionActivityPageProps) {
  const collectionId = params.id;
  
  const [collection, setCollection] = useState<NFTCollection | null>(null);
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    types: undefined,
    fromDate: undefined,
    toDate: undefined,
  });

  // Activity type options for filter
  const activityTypes: { value: NFTActivityType; label: string }[] = [
    { value: 'mint', label: 'Mints' },
    { value: 'transfer', label: 'Transfers' },
    { value: 'list', label: 'Listings' },
    { value: 'delist', label: 'Delistings' },
    { value: 'sale', label: 'Sales' },
    { value: 'offer', label: 'Offers' },
    { value: 'burn', label: 'Burns' },
    { value: 'raffle_create', label: 'Raffle Creates' },
    { value: 'raffle_join', label: 'Raffle Entries' },
    { value: 'raffle_complete', label: 'Raffle Completions' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch collection data
        const collectionData = await fetchCollectionById(collectionId);
        setCollection(collectionData);
        
        // Fetch collection activities
        const activitiesData = await getCollectionActivity(collectionId);
        
        // Apply filters if any
        let filtered = activitiesData;
        
        if (filters.types && filters.types.length > 0) {
          filtered = filtered.filter(activity => 
            filters.types?.includes(activity.type)
          );
        }
        
        if (filters.fromDate) {
          filtered = filtered.filter(activity => 
            activity.timestamp >= filters.fromDate!
          );
        }
        
        if (filters.toDate) {
          filtered = filtered.filter(activity => 
            activity.timestamp <= filters.toDate!
          );
        }
        
        setActivities(filtered);
      } catch (error) {
        console.error('Error fetching collection activity:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [collectionId, filters]);

  const handleTypeFilterChange = (type: NFTActivityType) => {
    setFilters(prev => {
      const currentTypes = prev.types || [];
      
      if (currentTypes.includes(type)) {
        // Remove the type if already selected
        return {
          ...prev,
          types: currentTypes.filter(t => t !== type)
        };
      } else {
        // Add the type if not selected
        return {
          ...prev,
          types: [...currentTypes, type]
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      types: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href={`/collections/${collectionId}`} className="text-blue-500 hover:underline flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Collection
        </Link>
      </div>
      
      {/* Collection Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {collection ? 
            `${collection.name} Activity` : 
            'Collection Activity'
          }
        </h1>
        {collection && (
          <p className="text-gray-600">{collection.description}</p>
        )}
      </div>
      
      {/* Activity Stats */}
      {activities.length > 0 && (
        <div className="mb-8 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-blue-500 font-medium">Total Activity</div>
              <div className="text-2xl font-bold">{activities.length}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-green-500 font-medium">Sales</div>
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'sale').length}
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="text-yellow-500 font-medium">Listings</div>
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'list').length}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-purple-500 font-medium">Mints</div>
              <div className="text-2xl font-bold">
                {activities.filter(a => a.type === 'mint').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Filters</h2>
          <button 
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {activityTypes.map(type => (
            <div key={type.value} className="flex items-center">
              <input
                type="checkbox"
                id={`filter-${type.value}`}
                checked={filters.types?.includes(type.value) || false}
                onChange={() => handleTypeFilterChange(type.value)}
                className="mr-2"
              />
              <label htmlFor={`filter-${type.value}`} className="text-sm">
                {type.label}
              </label>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm mb-1">From Date</label>
            <input
              type="date"
              value={filters.fromDate?.toISOString().substring(0, 10) || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                fromDate: e.target.value ? new Date(e.target.value) : undefined
              }))}
              className="px-2 py-1 border rounded w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">To Date</label>
            <input
              type="date"
              value={filters.toDate?.toISOString().substring(0, 10) || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                toDate: e.target.value ? new Date(e.target.value) : undefined
              }))}
              className="px-2 py-1 border rounded w-full"
            />
          </div>
        </div>
      </div>

      {/* Activity list */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activities.length > 0 ? (
          <div>
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-2">No activities found for this collection</p>
            {filters.types?.length || filters.fromDate || filters.toDate ? (
              <p className="text-sm text-gray-400">Try clearing some filters</p>
            ) : (
              <p className="text-sm text-gray-400">This collection doesn't have any recorded activity yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 