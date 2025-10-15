import React from 'react';
import Link from 'next/link';
import { Raffle } from '@/types/raffle';
import { 
  Box, 
  Heading, 
  Text, 
  Image, 
  Badge, 
  Progress, 
  HStack, 
  VStack,
  Button,
  Icon,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue
} from '@chakra-ui/react';
import { FaClock, FaTicketAlt, FaFire } from 'react-icons/fa';
import { RaffleCountdown } from './RaffleCountdown';

interface RaffleCardProps {
  raffle: Raffle;
  isHot?: boolean;
}

export const RaffleCard: React.FC<RaffleCardProps> = ({ raffle, isHot = false }) => {
  const {
    publicKey,
    nftName,
    nftImage,
    collectionName,
    ticketPrice,
    ticketCap,
    ticketsSold,
    endTime
  } = raffle;
  
  const progress = (ticketsSold / ticketCap) * 100;
  const percentSold = Math.round(progress);
  
  // Card styling
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hotBorderColor = useColorModeValue('red.300', 'red.500');
  
  // Get status badge info
  const getStatusBadge = () => {
    const now = Math.floor(Date.now() / 1000);
    
    if (now >= endTime) {
      return { label: 'Ended', color: 'gray' };
    }
    
    if (ticketsSold >= ticketCap) {
      return { label: 'Sold Out', color: 'red' };
    }
    
    const timeRemaining = endTime - now;
    
    if (timeRemaining < 3600) { // Less than 1 hour
      return { label: 'Ending Soon', color: 'red' };
    }
    
    if (timeRemaining < 86400) { // Less than 24 hours
      return { label: 'Last Day', color: 'orange' };
    }
    
    if (progress >= 75) {
      return { label: 'Hot', color: 'red' };
    }
    
    if (now - raffle.startTime < 86400) { // Created in the last 24 hours
      return { label: 'New', color: 'green' };
    }
    
    return { label: 'Active', color: 'blue' };
  };
  
  const statusBadge = getStatusBadge();
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={isHot ? hotBorderColor : borderColor}
      transition="all 0.3s"
      _hover={{ 
        transform: "translateY(-5px)", 
        shadow: "md",
        borderColor: isHot ? "red.400" : "blue.300"
      }}
      position="relative"
      data-cy="raffle-card"
    >
      {/* Hot indicator */}
      {isHot && (
        <Box 
          position="absolute" 
          top={2} 
          right={2} 
          bg="red.500" 
          color="white" 
          borderRadius="full" 
          p={1}
          zIndex={1}
        >
          <Icon as={FaFire} boxSize={4} />
        </Box>
      )}
      
      {/* NFT Image */}
      <Box position="relative">
        <Image
          src={nftImage || "/placeholder-nft.png"}
          alt={nftName || "NFT"}
          height="200px"
          width="100%"
          objectFit="cover"
        />
        <Badge
          position="absolute"
          top={2}
          left={2}
          colorScheme={statusBadge.color}
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="full"
        >
          {statusBadge.label}
        </Badge>
      </Box>
      
      <Box p={4}>
        {/* NFT Name and Collection */}
        <VStack align="start" spacing={1} mb={3}>
          <Heading size="md" noOfLines={1}>{nftName}</Heading>
          {collectionName && (
            <Text fontSize="sm" color="gray.500" noOfLines={1}>
              {collectionName}
            </Text>
          )}
        </VStack>
        
        {/* Progress and stats */}
        <Box mb={3}>
          <Flex justify="space-between" mb={1}>
            <HStack spacing={1}>
              <Icon as={FaTicketAlt} color="blue.500" boxSize={3} />
              <Text fontSize="sm" fontWeight="medium">
                {ticketsSold} / {ticketCap} tickets sold
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="bold">
              {percentSold}%
            </Text>
          </Flex>
          <Progress 
            value={progress} 
            size="sm" 
            colorScheme={
              percentSold >= 75 ? "red" :
              percentSold >= 50 ? "orange" :
              percentSold >= 25 ? "yellow" :
              "blue"
            } 
            borderRadius="full"
          />
        </Box>
        
        {/* Time and price */}
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={1}>
            <Icon as={FaClock} color="gray.500" boxSize={3} />
            <RaffleCountdown endTime={endTime} />
          </HStack>
          <Badge colorScheme="green" fontSize="md" px={2} py={1} data-cy="ticket-price">
            {ticketPrice.toFixed(2)} SOL
          </Badge>
        </Flex>
        
        {/* Action button */}
        <Link href={`/raffle/${publicKey}`} passHref>
          <Button 
            as="a" 
            colorScheme="blue" 
            size="md" 
            width="full"
            isDisabled={Math.floor(Date.now() / 1000) >= endTime}
            data-cy="raffle-action-button"
          >
            {Math.floor(Date.now() / 1000) >= endTime ? 'View Results' : 'Buy Tickets'}
          </Button>
        </Link>
      </Box>
    </Box>
  );
}; 