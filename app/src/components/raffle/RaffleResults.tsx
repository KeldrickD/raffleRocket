import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { RaffleAccount } from '@/idl/types';
import { formatDistanceToNow } from 'date-fns';

interface RaffleResultsProps {
  raffle: RaffleAccount;
}

export const RaffleResults = ({ raffle }: RaffleResultsProps) => {
  if (!raffle.winner) {
    return (
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">
          Raffle Status
        </Text>
        <HStack>
          <Badge colorScheme="yellow">In Progress</Badge>
          <Text>
            Ends {formatDistanceToNow(raffle.endTime.toNumber() * 1000, { addSuffix: true })}
          </Text>
        </HStack>
        <Text>
          {raffle.ticketsSold} / {raffle.ticketCap} tickets sold
        </Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="xl" fontWeight="bold">
        Winner
      </Text>
      <HStack>
        <Badge colorScheme="green">Completed</Badge>
        <Text>
          Ended {formatDistanceToNow(raffle.endTime.toNumber() * 1000, { addSuffix: true })}
        </Text>
      </HStack>
      <Box>
        <Text fontWeight="medium">Winner Address:</Text>
        <Text fontFamily="mono" fontSize="sm">
          {raffle.winner.toString()}
        </Text>
      </Box>
      <Box>
        <Text fontWeight="medium">Total Tickets Sold:</Text>
        <Text>{raffle.ticketsSold}</Text>
      </Box>
    </VStack>
  );
}; 