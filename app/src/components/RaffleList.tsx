import { FC } from 'react';
import { useRaffles } from '@/hooks/useRaffles';
import { RaffleCard } from './RaffleCard';
import { formatDistanceToNow } from 'date-fns';

export const RaffleList: FC = () => {
  const raffles = useRaffles();

  if (!raffles) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (raffles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No active raffles</h3>
        <p className="mt-2 text-sm text-gray-500">
          Be the first to create a raffle and start selling tickets!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {raffles.map((raffle) => (
        <RaffleCard
          key={raffle.pubkey.toString()}
          raffle={raffle}
          timeLeft={formatDistanceToNow(new Date(raffle.account.endTime.toNumber() * 1000), {
            addSuffix: true,
          })}
        />
      ))}
    </div>
  );
}; 