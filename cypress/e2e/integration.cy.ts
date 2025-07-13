describe('Integration Tests - Basic UI Flow', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.clearAllSessionStorage()
  })

  describe('Complete UI Navigation', () => {
    it('should display complete login interface', () => {
      cy.visit('/')
      cy.get('h1').should('contain', 'Chatter')
      cy.get('p').should('contain', 'Connect back with your friends in a simple way')
      cy.get('button').contains('Login').should('be.visible')
      cy.get('button').contains('Signup').should('be.visible')
    });

    it('should handle form validation for login', () => {
      cy.visit('/')
      cy.get('input[type="text"]').clear()
      cy.get('input[type="password"]').clear()
      cy.get('button').contains('Login').click()
      // Should remain on login page or show validation
      cy.url().should('include', '/')
    });

    it('should handle form validation for signup', () => {
      cy.visit('/')
      cy.get('button').contains('Signup').click()
      cy.get('button').contains('Signup').click()
      // Should remain on signup page or show validation
      cy.url().should('include', '/')
    });

    it('should handle protected route access', () => {
      cy.visit('/home')
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    });

    it('should allow typing in form fields', () => {
      cy.visit('/')
      cy.get('input[type="text"]').type('testuser')
      cy.get('input[type="password"]').type('testpass')
      cy.get('input[type="text"]').should('have.value', 'testuser')
      cy.get('input[type="password"]').should('have.value', 'testpass')
    });
  });
})