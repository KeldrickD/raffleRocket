'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Button,
  Stack,
  Divider,
} from '@chakra-ui/react';
import { RaffleList } from '@/components/raffle/RaffleList';
import { SearchIcon } from '@chakra-ui/icons';

export default function RafflesPage() {
  const [filter, setFilter] = useState('active');
  const [sortBy, setSortBy] = useState('ending-soon');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Explore Raffles
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Discover and participate in exciting NFT raffles
        </Text>
      </Box>

      <Stack spacing={8}>
        {/* Search and filter section */}
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Stack spacing={6}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text mb={2} fontWeight="medium">Search</Text>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search by name or creator" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Status</Text>
                <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="active">Active Raffles</option>
                  <option value="ending-soon">Ending Soon</option>
                  <option value="completed">Completed</option>
                  <option value="all">All Raffles</option>
                </Select>
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">Sort By</Text>
                <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="ending-soon">Ending Soon</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popularity">Most Popular</option>
                </Select>
              </Box>
            </SimpleGrid>
            
            <Divider />
            
            <Flex justify="space-between" align="center">
              <Text color="gray.600">Showing all active raffles</Text>
              <Button variant="outline" colorScheme="blue" onClick={() => {
                setFilter('active');
                setSortBy('ending-soon');
                setSearchQuery('');
              }}>
                Reset Filters
              </Button>
            </Flex>
          </Stack>
        </Box>

        {/* Raffle list */}
        <RaffleList 
          filter={filter} 
          sortBy={sortBy} 
          searchQuery={searchQuery} 
        />
      </Stack>
    </Container>
  );
} 