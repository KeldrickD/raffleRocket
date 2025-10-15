'use client';

import { Box, Container, Flex, css } from '@chakra-ui/react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Flex 
      direction="column" 
      minH="100vh"
    >
      <Navbar />
      <Box 
        flex="1" 
        css={{
          bg: 'var(--bgSecondary)',
          py: '2rem',
        }}
      >
        <Container maxW="container.xl">
          {children}
        </Container>
      </Box>
      <Footer />
    </Flex>
  );
} 