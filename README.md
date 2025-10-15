# RaffleRocket 🚀

A fully-decentralized NFT raffle platform on the Solana blockchain that allows users to buy tickets with SOL for a chance to win NFT prizes.

## Features

- Create and participate in NFT raffles
- Buy tickets with SOL
- Rocket Fuel Bonus System for extra entries
- Replay Jackpot pool
- Multiple raffle support
- Beautiful Next.js frontend with wallet integration
- Admin dashboard and analytics
- Social sharing and referral rewards

## Prerequisites

Before you begin, ensure you have the following installed:
- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://book.anchor-lang.com/getting_started/installation.html)
- [Node.js](https://nodejs.org/) (v18 or later)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)

## Project Structure

```
rafflerocket/
├── programs/
│   └── rafflerocket/     # Solana program (Rust/Anchor)
├── app/                  # Next.js frontend
├── tests/               # Program tests
└── scripts/             # Deployment and utility scripts
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rafflerocket.git
cd rafflerocket
```

2. Install dependencies:
```bash
# Install program dependencies
cd programs/rafflerocket
cargo build

# Install frontend dependencies
cd ../../app
yarn install
```

3. Build the program:
```bash
anchor build
```

4. Deploy the program:
```bash
anchor deploy
```

5. Start the frontend:
```bash
cd app
yarn dev
```

## Development

- Program development: `cd programs/rafflerocket`
- Frontend development: `cd app`
- Run tests: `anchor test`

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 