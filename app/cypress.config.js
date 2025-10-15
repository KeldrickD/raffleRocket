// Using plain JavaScript configuration
module.exports = {
  e2e: {
    // Remove baseUrl to avoid checking for a running server
    supportFile: 'cypress/support/e2e.js',
    // Run tests even if server isn't running
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000
  }
} 