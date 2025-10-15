import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useWallet } from '@solana/wallet-adapter-react';
import Head from 'next/head';
import { ActivityItem } from '@/components/ActivityItem';
import { ActivityAnalytics } from '@/components/ActivityAnalytics';
import { NFTActivity, NFTActivityType, ActivityFilters } from '@/types/activity';
import { getMyActivity, getRecentActivity } from '@/services/activityService';
import Link from 'next/link';

const ActivityPage: NextPage = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [showAnalytics, setShowAnalytics] = useState(false);
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
    const fetchActivities = async () => {
      setLoading(true);
      try {
        let result: NFTActivity[];
        
        if (activeTab === 'my' && publicKey) {
          result = await getMyActivity();
        } else {
          result = await getRecentActivity(50);
        }
        
        // Apply filters if any
        let filtered = result;
        
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
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [activeTab, publicKey, filters]);

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
    <>
      <Head>
        <title>Activity Feed | RaffleRocket</title>
        <meta name="description" content="Track all NFT activity on RaffleRocket" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Activity Feed</h1>
          
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-md transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="mb-8">
            <ActivityAnalytics />
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'my'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('my')}
          >
            My Activity
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Activity
          </button>
        </div>

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
              <p className="text-gray-500 mb-2">No activities found</p>
              {activeTab === 'my' && !publicKey && (
                <p className="text-sm text-gray-400">
                  Please connect your wallet to see your activities
                </p>
              )}
              {activeTab === 'my' && publicKey && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-3">
                    You haven't performed any activities yet.
                  </p>
                  <Link href="/nfts" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Browse NFTs
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityPage; 