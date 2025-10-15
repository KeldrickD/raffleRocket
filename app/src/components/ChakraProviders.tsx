'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Define theme customizations
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80c9ff',
      300: '#4db3ff',
      400: '#1a9cff',
      500: '#0086e6',
      600: '#006bb4',
      700: '#005182',
      800: '#003651',
      900: '#001b21',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
});

interface ChakraProvidersProps {
  children: React.ReactNode;
}

export function ChakraProviders({ children }: ChakraProvidersProps) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
} 