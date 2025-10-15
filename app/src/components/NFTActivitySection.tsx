import { useState, useEffect } from 'react';
import { NFTActivity } from '@/types/activity';
import { getNFTActivity } from '@/services/activityService';
import { ActivityItem } from './ActivityItem';

interface NFTActivitySectionProps {
  mintId: string;
}

export const NFTActivitySection: React.FC<NFTActivitySectionProps> = ({ mintId }) => {
  const [activities, setActivities] = useState<NFTActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const activityData = await getNFTActivity(mintId);
        setActivities(activityData);
      } catch (error) {
        console.error('Error fetching NFT activity:', error);
      } finally {
        setLoading(false);
      }
    };

    if (mintId) {
      fetchActivity();
    }
  }, [mintId]);

  if (loading) {
    return (
      <div className="py-6">
        <h2 className="text-xl font-semibold mb-4">Activity History</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-6">
        <h2 className="text-xl font-semibold mb-4">Activity History</h2>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No activity history available for this NFT</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold mb-4">Activity History</h2>
      <div className="space-y-3">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}; 