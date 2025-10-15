import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRaffles } from '@/hooks/useRaffles';
import { 
  Box, 
  Grid, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Badge, 
  Image, 
  Skeleton, 
  Select, 
  HStack,
  VStack,
  Divider,
  Icon,
  useColorModeValue,
  InputGroup,
  Input,
  InputRightElement,
  SimpleGrid
} from '@chakra-ui/react';
import { SearchIcon, TimeIcon, RepeatIcon } from '@chakra-ui/icons';
import { FaTicketAlt, FaClock, FaTrophy, FaFire } from 'react-icons/fa';
import { RaffleCard } from './RaffleCard';
import { Raffle } from '@/types/raffle';

type SortOption = 'ending-soon' | 'newest' | 'tickets-sold' | 'price-low' | 'price-high' | 'popularity';
type FilterOption = 'all' | 'ending-soon' | 'newest' | 'active' | 'completed';

interface RaffleListProps {
  limit?: number;
  showFilters?: boolean;
  layout?: 'grid' | 'list';
  showCreateButton?: boolean;
  filter: string;
  sortBy?: string;
  searchQuery?: string;
}

export const RaffleList: React.FC<RaffleListProps> = ({ 
  limit,
  showFilters = true,
  layout = 'grid',
  showCreateButton = true,
  filter,
  sortBy = 'ending-soon',
  searchQuery = ''
}) => {
  const { raffles, loading, error, refresh } = useRaffles();
  const [sortOption, setSortOption] = useState<SortOption>('ending-soon');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [searchQueryState, setSearchQueryState] = useState('');
  
  // Filter raffles
  const filteredRaffles = raffles.filter(raffle => {
    // Filter by status
    if (filter !== 'all') {
      if (filter === 'active' && !raffle.isActive) return false;
      if (filter === 'ending-soon' && (!raffle.isActive || raffle.endTime > Date.now() + 24 * 60 * 60 * 1000)) return false;
      if (filter === 'completed' && raffle.isActive) return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        raffle.name.toLowerCase().includes(query) ||
        raffle.creator.toString().toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Sort raffles
  const sortedRaffles = [...filteredRaffles].sort((a, b) => {
    switch (sortBy) {
      case 'ending-soon':
        return a.endTime - b.endTime;
      case 'newest':
        return b.startTime - a.startTime;
      case 'price-low':
        return a.ticketPrice - b.ticketPrice;
      case 'price-high':
        return b.ticketPrice - a.ticketPrice;
      case 'popularity':
        return b.ticketsSold - a.ticketsSold;
      default:
        return a.endTime - b.endTime;
    }
  });
  
  // Limit the number of raffles to display if limit is specified
  const displayedRaffles = limit ? sortedRaffles.slice(0, limit) : sortedRaffles;
  
  // Check if there are any hot raffles (over 75% tickets sold)
  const hasHotRaffles = raffles.some(raffle => 
    (raffle.ticketsSold / raffle.ticketCap) >= 0.75
  );
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box width="full">
      {showFilters && (
        <Box mb={6} p={4} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4}>
            <InputGroup maxW={{ base: 'full', md: '300px' }}>
              <Input
                placeholder="Search raffles..."
                value={searchQueryState}
                onChange={(e) => setSearchQueryState(e.target.value)}
              />
              <InputRightElement>
                <SearchIcon color="gray.500" />
              </InputRightElement>
            </InputGroup>
            
            <HStack spacing={4}>
              <Select 
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                maxW="150px"
              >
                <option value="all">All Raffles</option>
                <option value="ending-soon">Ending Soon</option>
                <option value="newest">New Arrivals</option>
              </Select>
              
              <Select 
                value={sortBy}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                maxW="150px"
              >
                <option value="ending-soon">Ending Soon</option>
                <option value="newest">Newest</option>
                <option value="tickets-sold">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </Select>
              
              <Button
                leftIcon={<RepeatIcon />}
                variant="outline"
                onClick={refresh}
                size="sm"
              >
                Refresh
              </Button>
            </HStack>
          </Flex>
        </Box>
      )}
      
      {hasHotRaffles && (
        <Box mb={6}>
          <Heading size="md" mb={2} display="flex" alignItems="center">
            <Icon as={FaFire} color="red.500" mr={2} />
            Hot Raffles
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {raffles
              .filter(raffle => (raffle.ticketsSold / raffle.ticketCap) >= 0.75)
              .slice(0, 3)
              .map(raffle => (
                <RaffleCard key={raffle.publicKey} raffle={raffle} isHot />
              ))
            }
          </SimpleGrid>
        </Box>
      )}
      
      {loading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height="300px" borderRadius="md" />
          ))}
        </SimpleGrid>
      ) : error ? (
        <Box textAlign="center" p={10}>
          <Heading size="md" color="red.500">Error loading raffles</Heading>
          <Text mt={2}>{error.message}</Text>
          <Button 
            mt={4} 
            onClick={refresh}
            leftIcon={<RepeatIcon />}
          >
            Try Again
          </Button>
        </Box>
      ) : displayedRaffles.length === 0 ? (
        <Box textAlign="center" p={10} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
          <Heading size="md">No raffles found</Heading>
          <Text mt={2}>
            {searchQuery 
              ? "No raffles match your search criteria" 
              : "There are no active raffles at the moment"
            }
          </Text>
          {showCreateButton && (
            <Link href="/create-raffle" passHref>
              <Button as="a" colorScheme="blue" mt={4}>
                Create a Raffle
              </Button>
            </Link>
          )}
        </Box>
      ) : layout === 'grid' ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {displayedRaffles.map(raffle => (
            <RaffleCard key={raffle.publicKey} raffle={raffle} />
          ))}
        </SimpleGrid>
      ) : (
        <VStack spacing={4} align="stretch">
          {displayedRaffles.map(raffle => (
            <Box 
              key={raffle.publicKey}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
              bg={bgColor}
              transition="all 0.2s"
              _hover={{ shadow: "md", borderColor: "blue.300" }}
            >
              <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
                <Box flexShrink={0}>
                  <Image 
                    src={raffle.nftImage || "/placeholder-nft.png"} 
                    alt={raffle.nftName || "NFT"} 
                    borderRadius="md"
                    width={{ base: "full", sm: "120px" }}
                    height={{ base: "200px", sm: "120px" }}
                    objectFit="cover"
                  />
                </Box>
                
                <Box flex="1">
                  <Flex justify="space-between" align="start" wrap="wrap" gap={2}>
                    <Box>
                      <Heading size="md">{raffle.nftName}</Heading>
                      {raffle.collectionName && (
                        <Text color="gray.600" fontSize="sm">
                          {raffle.collectionName}
                        </Text>
                      )}
                    </Box>
                    
                    <HStack>
                      <Badge colorScheme="green" fontSize="sm">
                        {raffle.ticketPrice.toFixed(2)} SOL
                      </Badge>
                      
                      <Badge 
                        colorScheme={
                          (raffle.ticketsSold / raffle.ticketCap) >= 0.75 ? "red" :
                          (raffle.ticketsSold / raffle.ticketCap) >= 0.5 ? "yellow" :
                          "blue"
                        }
                        fontSize="sm"
                      >
                        {raffle.ticketsSold}/{raffle.ticketCap} Tickets
                      </Badge>
                    </HStack>
                  </Flex>
                  
                  <Divider my={2} />
                  
                  <Flex justify="space-between" align="center" mt={2}>
                    <HStack color="gray.600" fontSize="sm">
                      <Icon as={FaClock} />
                      <RaffleTimeRemaining endTime={raffle.endTime} />
                    </HStack>
                    
                    <Link href={`/raffle/${raffle.publicKey}`} passHref>
                      <Button as="a" colorScheme="blue" size="sm">
                        View Raffle
                      </Button>
                    </Link>
                  </Flex>
                </Box>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
      
      {limit && raffles.length > limit && (
        <Box textAlign="center" mt={6}>
          <Link href="/raffles" passHref>
            <Button as="a" variant="outline" colorScheme="blue">
              View All Raffles ({raffles.length})
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
};

const RaffleTimeRemaining: React.FC<{ endTime: number }> = ({ endTime }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const secondsRemaining = endTime - now;
      
      if (secondsRemaining <= 0) {
        setTimeRemaining('Ended');
        return;
      }
      
      const days = Math.floor(secondsRemaining / 86400);
      const hours = Math.floor((secondsRemaining % 86400) / 3600);
      const minutes = Math.floor((secondsRemaining % 3600) / 60);
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else {
        const seconds = secondsRemaining % 60;
        setTimeRemaining(`${minutes}m ${seconds}s remaining`);
      }
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [endTime]);
  
  return <Text>{timeRemaining}</Text>;
}; 