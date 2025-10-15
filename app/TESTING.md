# Testing RaffleRocket

This document provides information about the testing strategy for the RaffleRocket application.

## End-to-End Testing with Cypress

We've set up Cypress for end-to-end testing to ensure the application works correctly from a user's perspective.

### Setup and Configuration

The Cypress testing environment has been set up with:

1. Configuration in `cypress.config.js` - A simple configuration that doesn't check for a running server
2. Custom commands in `cypress/support/commands.js` - Includes commands for wallet connection and ticket purchases
3. Global configuration in `cypress/support/e2e.js` - Imports commands and sets up the testing environment
4. Test fixtures in `cypress/fixtures/raffles.json` - Sample data for testing raffle components

### Test Strategy

We've created tests that simulate the main user flows:

1. **Raffle browsing**: Tests for displaying active raffles on the homepage
2. **Raffle details**: Tests for viewing individual raffle details
3. **Wallet connection**: Tests for connecting a wallet to the application
4. **Ticket purchase**: Tests for buying raffle tickets

### Test Implementation Progress

#### Completed

- Basic test setup and configuration
- Created test fixtures and mock data
- Implemented DOM-based tests for UI components
- Added data-cy attributes to key components for better test selectors

#### In Progress

- Environment configuration for running tests without a server dependency
- Resolving npm and path issues in the test environment
- Creating dependable mock implementations for testing wallet interactions

#### Challenges & Solutions

1. **Running tests without a server**:
   - Added document mocking to create DOM elements directly
   - Implemented intercept patterns to stub API responses
   - Removed baseUrl requirement in Cypress config

2. **TypeScript configuration issues**:
   - Created proper tsconfig.json files both at the root and in the Cypress directory
   - Updated module settings to use commonjs for compatibility
   - Added type definitions for Cypress and Node

3. **Environment setup**:
   - Working through npm path issues in the current environment
   - Added documentation on running tests properly

### Data Attributes

To make testing more reliable, we've added `data-cy` attributes to key components:

- `data-cy="raffle-card"` - Raffle cards on the homepage
- `data-cy="raffle-action-button"` - Button to navigate to a raffle
- `data-cy="ticket-price"` - Display of ticket price
- `data-cy="buy-ticket-section"` - Section for buying tickets
- `data-cy="ticket-quantity"` - Input for ticket quantity
- `data-cy="total-cost"` - Display of the total purchase cost
- `data-cy="confirm-purchase"` - Button to confirm ticket purchase

### Running Tests

To run the tests, you need to:

1. Start the development server: `npm run dev`
2. In a separate terminal, run one of:
   - `npm run cypress:open` - Open Cypress in GUI mode
   - `npm run cypress:run` - Run Cypress in headless mode
   - `npm run test:e2e` - Run all end-to-end tests

For running specific test files:
```bash
npx cypress run --spec "cypress/e2e/raffle_flow.cy.js"
```

### Future Improvements

- Add component tests for individual UI components
- Set up CI/CD integration for automated testing
- Improve mocking strategies for the Solana wallet and blockchain interactions
- Add visual regression testing
- Implement accessibility testing
- Create more comprehensive test coverage for edge cases and error scenarios

## Known Issues

- The tests assume the application is running on http://localhost:3000
- Some wallet connection features may not be fully testable in an automated environment
- Blockchain transactions are mocked and don't represent actual on-chain behavior

## Future Improvements

- Add component tests for individual UI components
- Add API mocking for more precise control over test data
- Implement visual regression testing
- Add accessibility testing
- Create more comprehensive test coverage 