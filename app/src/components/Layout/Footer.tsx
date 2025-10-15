'use client';

import { Box, Container, Flex, Link, Text, css } from '@chakra-ui/react';
import NextLink from 'next/link';

export function Footer() {
  return (
    <Box 
      as="footer" 
      css={{
        bg: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        py: '1.5rem',
      }}
    >
      <Container maxW="container.xl">
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align="center" 
          gap={4}
        >
          <Text>© 2024 RaffleRocket. All rights reserved.</Text>
          <Flex gap={6}>
            <Link as={NextLink} href="/terms">
              <Text>Terms</Text>
            </Link>
            <Link as={NextLink} href="/privacy">
              <Text>Privacy</Text>
            </Link>
            <Link as={NextLink} href="/faq">
              <Text>FAQ</Text>
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
} 