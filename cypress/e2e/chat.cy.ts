describe('Chat Functionality - Basic Tests', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.clearAllSessionStorage()
  })

  describe('Home Page Access', () => {
    it('should redirect to login when accessing home without authentication', () => {
      cy.visit('/home')
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    });

    it('should display login form when redirected', () => {
      cy.visit('/home')
      cy.get('h1').should('contain', 'Chatter')
      cy.get('button').contains('Login').should('be.visible')
    });
  });

  describe('Authentication Form Tests', () => {
    it('should show login and signup tabs', () => {
      cy.visit('/')
      cy.get('button').contains('Login').should('be.visible')
      cy.get('button').contains('Signup').should('be.visible')
    });

    it('should switch between login and signup forms', () => {
      cy.visit('/')
      cy.get('button').contains('Signup').click()
      cy.get('input[placeholder*="Name"]').should('be.visible')
      cy.get('button').contains('Login').click()
      cy.get('input[type="password"]').should('be.visible')
    });
  });
})