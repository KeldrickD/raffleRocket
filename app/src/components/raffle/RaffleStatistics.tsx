'use client';

import { Box, SimpleGrid, Text, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';
import { RaffleAccount } from '@/idl/types';

interface RaffleStatisticsProps {
  raffle: RaffleAccount;
}

export function RaffleStatistics({ raffle }: RaffleStatisticsProps) {
  const ticketPrice = raffle.ticketPrice / 1e9;
  const totalRevenue = ticketPrice * raffle.ticketsSold;
  const timeRemaining = formatDistanceToNow(new Date(raffle.endTime * 1000), { addSuffix: true });

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Raffle Statistics
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Stat>
          <StatLabel>Ticket Price</StatLabel>
          <StatNumber>{ticketPrice} SOL</StatNumber>
          <StatHelpText>Price per ticket</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Tickets Sold</StatLabel>
          <StatNumber>{raffle.ticketsSold}/{raffle.ticketCap}</StatNumber>
          <StatHelpText>Current sales progress</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Total Revenue</StatLabel>
          <StatNumber>{totalRevenue} SOL</StatNumber>
          <StatHelpText>Total revenue from ticket sales</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Time Remaining</StatLabel>
          <StatNumber>{timeRemaining}</StatNumber>
          <StatHelpText>Until raffle ends</StatHelpText>
        </Stat>
      </SimpleGrid>
    </Box>
  );
} 