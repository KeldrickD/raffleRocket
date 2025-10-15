import React from 'react';
import { Raffle } from '@/types/raffle';
import { 
  Box, 
  Text, 
  HStack, 
  VStack, 
  Badge, 
  Progress, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  SimpleGrid,
  Icon,
  Flex,
  Tooltip
} from '@chakra-ui/react';
import { FaClock, FaTicketAlt, FaUser, FaCalendarAlt, FaWallet, FaTrophy } from 'react-icons/fa';
import { RaffleCountdown } from './RaffleCountdown';

interface RaffleDetailsProps {
  raffle: Raffle;
}

export const RaffleDetails: React.FC<RaffleDetailsProps> = ({ raffle }) => {
  const {
    ticketPrice,
    ticketCap,
    ticketsSold,
    startTime,
    endTime,
    authority,
    winner
  } = raffle;
  
  const progress = (ticketsSold / ticketCap) * 100;
  const remainingTickets = ticketCap - ticketsSold;
  const now = Math.floor(Date.now() / 1000);
  const isEnded = now >= endTime;
  const totalValue = ticketPrice * ticketCap;
  
  // Format dates
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  // Shorten wallet addresses
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <Box>
      {/* Progress bar */}
      <Box mb={4}>
        <Flex justify="space-between" mb={1}>
          <HStack spacing={1}>
            <Icon as={FaTicketAlt} color="blue.500" />
            <Text fontSize="sm" fontWeight="medium">
              Ticket Sales
            </Text>
          </HStack>
          <Text fontSize="sm" fontWeight="bold">
            {ticketsSold} / {ticketCap} ({Math.round(progress)}%)
          </Text>
        </Flex>
        <Progress 
          value={progress} 
          size="sm" 
          colorScheme={
            progress >= 75 ? "red" :
            progress >= 50 ? "orange" :
            progress >= 25 ? "yellow" :
            "blue"
          } 
          borderRadius="full"
        />
      </Box>
      
      {/* Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={4}>
        <Stat>
          <StatLabel fontWeight="medium">Ticket Price</StatLabel>
          <StatNumber>{ticketPrice.toFixed(2)} SOL</StatNumber>
          <StatHelpText>Total Value: {totalValue.toFixed(2)} SOL</StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel fontWeight="medium">Time Remaining</StatLabel>
          <StatNumber>
            {isEnded ? 'Raffle Ended' : <RaffleCountdown endTime={endTime} />}
          </StatNumber>
          <StatHelpText>
            <Icon as={FaCalendarAlt} mr={1} />
            Ends {formatDate(endTime)}
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      
      {/* Creator & Winner */}
      <VStack align="stretch" spacing={2}>
        <HStack>
          <Icon as={FaUser} color="gray.500" />
          <Text fontWeight="medium">Creator:</Text>
          <Tooltip label={authority}>
            <Text>{shortenAddress(authority)}</Text>
          </Tooltip>
        </HStack>
        
        {winner && (
          <HStack>
            <Icon as={FaTrophy} color="yellow.500" />
            <Text fontWeight="medium">Winner:</Text>
            <Tooltip label={winner}>
              <Text>{shortenAddress(winner)}</Text>
            </Tooltip>
          </HStack>
        )}
        
        <HStack>
          <Icon as={FaCalendarAlt} color="gray.500" />
          <Text fontWeight="medium">Created:</Text>
          <Text>{formatDate(startTime)}</Text>
        </HStack>
      </VStack>
    </Box>
  );
}; 