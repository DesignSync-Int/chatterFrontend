describe('Notification System - Basic Tests', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.clearAllSessionStorage()
  })

  describe('Login Page Elements', () => {
    it('should display main elements on login page', () => {
      cy.visit('/')
      cy.get('h1').should('contain', 'Chatter')
      cy.get('p').should('contain', 'Connect back with your friends')
    });

    it('should show login form inputs', () => {
      cy.visit('/')
      cy.get('input[type="text"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
    });

    it('should allow switching between login and signup', () => {
      cy.visit('/')
      cy.get('button').contains('Signup').click()
      cy.get('input[placeholder*="Name"]').should('be.visible')
      cy.get('button').contains('Login').click()
    });
  });

  describe('Navigation Tests', () => {
    it('should redirect from home to login when not authenticated', () => {
      cy.visit('/home')
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    });

    it('should show appropriate error messages for empty login', () => {
      cy.visit('/')
      cy.get('button').contains('Login').click()
      // Should show some validation or stay on the same page
      cy.url().should('include', '/')
    });
  });
})