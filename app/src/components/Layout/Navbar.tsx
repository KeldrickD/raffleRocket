'use client';

import { Box, Button, Container, Flex, Heading, Link, Spacer, css } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import NextLink from 'next/link';
import { ColorModeToggle } from '../ColorModeToggle';

export function Navbar() {
  const { connected, connect, disconnect } = useWallet();

  return (
    <Box 
      as="nav"
      css={{
        bg: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <Container maxW="container.xl" py={4}>
        <Flex align="center">
          <Link as={NextLink} href="/">
            <Heading size="md">RaffleRocket</Heading>
          </Link>
          <Spacer />
          <Flex gap={4} align="center">
            <Link as={NextLink} href="/raffles">
              <Button variant="ghost">Raffles</Button>
            </Link>
            <Link as={NextLink} href="/create">
              <Button variant="ghost">Create Raffle</Button>
            </Link>
            
            {/* Add the color mode toggle with compact view */}
            <ColorModeToggle isCompact size="sm" />
            
            {connected ? (
              <Button onClick={disconnect} colorScheme="red" variant="outline">
                Disconnect
              </Button>
            ) : (
              <Button onClick={connect} variant="variant.custom">
                Connect Wallet
              </Button>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
} 