'use client';

import { useState } from 'react';
import { Box, Button, Container, Flex, Heading, Text, SimpleGrid, Select } from '@chakra-ui/react';
import { RaffleList } from '@/components/raffle/RaffleList';
import NextLink from 'next/link';

export default function HomePage() {
  const [filter, setFilter] = useState('active');

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }} mb={6}>
          <Box mb={{ base: 4, md: 0 }}>
            <Heading as="h1" size="xl" mb={2}>
              RaffleRocket
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Win amazing NFTs in community raffles
            </Text>
          </Box>
          <NextLink href="/create" passHref>
            <Button as="a" colorScheme="blue" size="lg">
              Create a Raffle
            </Button>
          </NextLink>
        </Flex>
      </Box>

      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading as="h2" size="lg">
            NFT Raffles
          </Heading>
          <Select 
            width="200px" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="active">Active Raffles</option>
            <option value="ending-soon">Ending Soon</option>
            <option value="completed">Completed</option>
            <option value="all">All Raffles</option>
          </Select>
        </Flex>
        
        <RaffleList filter={filter} />
      </Box>
    </Container>
  );
} 