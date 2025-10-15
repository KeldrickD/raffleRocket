// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Import Testing Library commands
import '@testing-library/cypress/add-commands'

Cypress.Commands.add('connectWallet', () => {
  // Mock connecting a wallet since we can't actually connect a real wallet in tests
  cy.window().then((win) => {
    // If there's a connect wallet button in the UI, click it
    cy.get('button').contains(/connect.wallet/i, { timeout: 10000 }).click()
    
    // In a real app, we'd need to handle the wallet connection flow
    // This is a simplified version
    cy.get('button').contains(/phantom/i).click({ force: true })
  })
})

Cypress.Commands.add('buyTickets', (numberOfTickets) => {
  // Navigate to a raffle
  cy.get('a[href*="raffle"]').first().click()
  
  // Enter ticket quantity
  cy.get('input[type="number"]').clear().type(numberOfTickets)
  
  // Click buy tickets
  cy.get('button').contains(/buy ticket/i).click()
  
  // Confirm transaction (mock)
  cy.get('button').contains(/confirm/i).click({ force: true })
}) 