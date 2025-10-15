# RaffleRocket

RaffleRocket is a decentralized raffle application built on Solana that allows users to create and participate in raffles for NFTs and other prizes.

## Features

- Create raffles with customizable settings
- Buy tickets with SOL
- Automatic winner selection
- Real-time raffle activity feed
- Detailed raffle statistics
- User dashboard with participation history
- Dark mode support
- Mobile-responsive design

## Technology Stack

- **Frontend**: Next.js, React, Chakra UI
- **Blockchain**: Solana, Anchor Framework
- **State Management**: React Hooks, Context API
- **Testing**: Cypress for end-to-end testing
- **Analytics**: Mixpanel for user tracking

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Solana CLI tools (for local development)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/rafflerocket.git
   cd rafflerocket/app
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to http://localhost:3000

## Testing

We use Cypress for end-to-end testing. For more details, see the [TESTING.md](TESTING.md) file.

To run tests:

1. Start the development server
   ```
   npm run dev
   ```

2. In a separate terminal, run Cypress
   ```
   npm run cypress:open
   ```

## Deployment

The application can be deployed to platforms like Vercel or Netlify:

```
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. 