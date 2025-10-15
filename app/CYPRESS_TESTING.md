# Cypress Testing Guide for RaffleRocket

This guide provides information specifically about the Cypress end-to-end testing setup for the RaffleRocket application.

## What We've Accomplished

1. **Setup and Configuration**:
   - Installed Cypress version 12.17.4
   - Created configuration files (cypress.config.js)
   - Set up TypeScript support with appropriate tsconfig.json files
   - Implemented support files for custom commands

2. **Test Structure**:
   - Created test fixtures with mock raffle data
   - Implemented DOM-based tests that don't require a running server
   - Added data-cy attributes to key components for better test stability

3. **Special Features**:
   - Implemented custom commands for wallet connection and ticket purchase
   - Created mocks for Solana wallet integration
   - Used document.write technique to test UI without a server

## Test Files

- `cypress/e2e/raffle_flow.cy.js` - Tests the main raffle browsing flow
- `cypress/e2e/basic.cy.js` - Simple test to verify Cypress is working
- `cypress/e2e/user_profile.cy.js` - Tests for user profile functionality

## Running Tests

### Local Development

1. **Open Cypress Test Runner**:
   ```bash
   npx cypress open
   ```

2. **Run Specific Tests**:
   ```bash
   npx cypress run --spec "cypress/e2e/basic.cy.js"
   ```

3. **Run All Tests**:
   ```bash
   npx cypress run
   ```

## Troubleshooting

If you encounter issues with Cypress tests:

1. **Server Connectivity**:
   - Make sure your development server is running on the port specified in cypress.config.js
   - If testing without a server, ensure you're using the document mocking technique

2. **TypeScript Issues**:
   - Check that the module settings in tsconfig.json are compatible
   - Ensure you have the right types installed (@types/cypress)

3. **DOM Element Not Found**:
   - Verify data-cy attributes are correctly added to components
   - Check the timing of assertions with respect to page loading

## Best Practices

1. **Use data-cy attributes** for all important UI elements
2. **Mock API responses** to avoid external dependencies
3. **Isolate tests** to prevent cross-test influence
4. **Use custom commands** for repeated operations like logging in

## Next Steps

1. Integrate tests into the CI/CD pipeline
2. Add visual regression testing
3. Implement component tests for individual UI components
4. Add accessibility testing

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Library](https://testing-library.com/docs/cypress-testing-library/intro/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices) 