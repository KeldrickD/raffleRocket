describe('Basic Test', () => {
  it('verifies Cypress is working', () => {
    // Create a simple DOM structure
    cy.document().then(doc => {
      doc.write(`
        <html>
          <head><title>Basic Test</title></head>
          <body>
            <h1>Hello Cypress</h1>
            <button id="test-button">Click Me</button>
          </body>
        </html>
      `);
    });

    // Perform simple assertions
    cy.get('h1').should('contain', 'Hello Cypress');
    cy.get('#test-button').should('exist');
  });
}); 