import { Box, Stack, Text, Avatar, HStack } from '@chakra-ui/react';
import { RaffleAccount } from '@/idl/types';
import { formatDistanceToNow } from 'date-fns';

interface RaffleActivityFeedProps {
  raffle: RaffleAccount;
}

export const RaffleActivityFeed = ({ raffle }: RaffleActivityFeedProps) => {
  const activities = raffle.entries.map((entry) => ({
    type: 'ticket_purchase',
    buyer: entry.buyer,
    tickets: entry.entries,
    timestamp: entry.timestamp.toNumber(),
  }));

  if (raffle.winner) {
    activities.push({
      type: 'winner_selected',
      winner: raffle.winner,
      timestamp: raffle.endTime.toNumber(),
    });
  }

  // Sort activities by timestamp in descending order
  activities.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Activity Feed
      </Text>
      <Stack direction="column" spacing={4}>
        {activities.map((activity, index) => (
          <Box key={index} p={4} borderWidth="1px" borderColor="gray.200" borderRadius="md">
            <HStack spacing={4}>
              <Avatar size="sm" name={activity.type === 'winner_selected' ? 'Winner' : 'Buyer'} />
              <Box flex={1}>
                {activity.type === 'ticket_purchase' ? (
                  <>
                    <Text fontWeight="medium">
                      {activity.buyer.toString().slice(0, 4)}...{activity.buyer.toString().slice(-4)}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Purchased {activity.tickets} tickets
                    </Text>
                  </>
                ) : (
                  <>
                    <Text fontWeight="medium">Winner Selected!</Text>
                    <Text fontSize="sm" color="gray.500">
                      {activity.winner.toString().slice(0, 4)}...{activity.winner.toString().slice(-4)}
                    </Text>
                  </>
                )}
                <Text fontSize="xs" color="gray.400">
                  {formatDistanceToNow(activity.timestamp * 1000, { addSuffix: true })}
                </Text>
              </Box>
            </HStack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}; 