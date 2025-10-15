import { createSystem, defaultBaseConfig, defaultConfig, defineConfig, mergeConfigs } from '@chakra-ui/react';

// Define custom theme overrides
const customTheme = defineConfig({
  theme: {
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
      primary: {
        50: '#f0e7ff',
        100: '#d1bfff',
        200: '#b397ff',
        300: '#946fff',
        400: '#7547ff',
        500: '#6B46C1',
        600: '#5434a7',
        700: '#3d248d',
        800: '#271574',
        900: '#13095b',
      },
    },
    recipes: {
      Button: {
        variants: {
          variant: {
            custom: {
              borderRadius: 'full',
              bg: 'primary.500',
              color: 'white',
              _dark: {
                bg: 'primary.400',
              },
              _hover: {
                bg: 'primary.600',
                _dark: {
                  bg: 'primary.300',
                },
              },
            },
          },
        },
      },
    },
  },
});

// Merge with default config
const config = mergeConfigs(defaultConfig, customTheme);

// Create system
const system = createSystem(config);

export default system; 