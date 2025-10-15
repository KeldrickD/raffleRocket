import { Box, Text, VStack, Progress, useColorModeValue } from '@chakra-ui/react';
import { RaffleAccount } from '@/idl/types';

interface JackpotDisplayProps {
  raffle: RaffleAccount;
  jackpotAmount: number;
}

export const JackpotDisplay = ({ raffle, jackpotAmount }: JackpotDisplayProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const progressColor = useColorModeValue('green.500', 'green.300');

  const ticketPrice = raffle.ticketPrice.toNumber() / 1e9; // Convert lamports to SOL
  const maxJackpot = ticketPrice * raffle.ticketCap;
  const progress = (jackpotAmount / maxJackpot) * 100;

  return (
    <Box
      p={6}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold">
          Jackpot
        </Text>
        <Text fontSize="3xl" fontWeight="bold" color="green.500">
          {jackpotAmount.toFixed(2)} SOL
        </Text>
        <Box>
          <Text fontSize="sm" color="gray.500" mb={2}>
            Progress to max jackpot
          </Text>
          <Progress value={progress} colorScheme="green" size="sm" />
        </Box>
        <Text fontSize="sm" color="gray.500">
          Max jackpot: {maxJackpot.toFixed(2)} SOL
        </Text>
      </VStack>
    </Box>
  );
}; 