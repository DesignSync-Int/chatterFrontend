describe('Home Page & User List', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.clearAllSessionStorage()
  })

  describe('Login Required Access', () => {
    it('should redirect to login when accessing home without authentication', () => {
      cy.visit('/home')
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  })

  describe('Basic Login Form Tests', () => {
    it('should display login form elements', () => {
      cy.visit('/')
      cy.get('h1').should('contain', 'Chatter')
      cy.get('button').contains('Login').should('be.visible')
      cy.get('button').contains('Signup').should('be.visible')
    })

    it('should allow typing in form inputs', () => {
      cy.visit('/')
      cy.get('input[type="text"]').type('test user')
      cy.get('input[type="password"]').type('password123')
      cy.get('input[type="text"]').should('have.value', 'test user')
    })

    it('should switch between login and signup tabs', () => {
      cy.visit('/')
      cy.get('button').contains('Signup').click()
      cy.get('input[placeholder*="Name"]').should('be.visible')
      cy.get('input[placeholder*="Profile"]').should('be.visible')
    })
  })
})