describe('User Profile Tests', () => {
  beforeEach(() => {
    // Mock wallet connection
    cy.window().then(win => {
      win.solana = {
        connect: cy.stub().resolves({ publicKey: '8dHEaZ2GacwcJxUeVfYcFjyCFK6neTXLzpvMRfgh3Ddp' }),
        on: cy.stub(),
        connected: true,
        publicKey: { toString: () => '8dHEaZ2GacwcJxUeVfYcFjyCFKLneTXLzpvMRfgh3Ddp' }
      }
    })
    
    // Visit the homepage first
    cy.visit('/')
    
    // Connect wallet
    cy.connectWallet()
  })

  it('should navigate to user profile page', () => {
    // Go to profile page
    cy.contains(/profile/i).click({ force: true })
    
    // Verify we're on the profile page
    cy.url().should('include', '/profile')
    cy.contains(/your profile/i).should('be.visible')
  })

  it('should display user wallet information', () => {
    // Go to profile page
    cy.contains(/profile/i).click({ force: true })
    
    // Verify wallet address is displayed
    cy.contains('8dHE...3Ddp').should('be.visible')
    
    // Check for wallet balance display
    cy.contains(/balance/i).should('be.visible')
  })

  it('should show user raffle participation history', () => {
    // Mock API responses for user raffles
    cy.intercept('GET', '**/api/user/raffles*', { fixture: 'user_raffles.json' }).as('getUserRaffles')
    
    // Go to profile page
    cy.contains(/profile/i).click({ force: true })
    
    // Wait for the raffles to load
    cy.wait('@getUserRaffles')
    
    // Check for raffle history sections
    cy.contains(/your created raffles/i).should('be.visible')
    cy.contains(/your participated raffles/i).should('be.visible')
    
    // Verify at least one raffle is displayed
    cy.get('[data-cy="user-raffle-entry"]').should('exist')
  })

  it('should allow changing user preferences', () => {
    // Go to profile page
    cy.contains(/profile/i).click({ force: true })
    
    // Look for the preferences section
    cy.contains(/preferences/i).should('be.visible')
    
    // Toggle dark mode
    cy.get('[data-cy="theme-toggle"]').click()
    
    // Check that the setting was saved (this might need to be adjusted based on the actual implementation)
    cy.get('html').should('have.attr', 'data-theme', 'dark')
  })
}) 