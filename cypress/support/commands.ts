/// <reference types="cypress" />

// Custom commands for Chatter app testing

Cypress.Commands.add('login', (name: string, password: string) => {
  cy.visit('/')
  cy.get('input[type="text"]').type(name)
  cy.get('input[type="password"]').type(password)
  cy.get('button').contains('Login').click()
  cy.url().should('include', '/home')
  cy.waitForPageLoad()
})

Cypress.Commands.add('signup', (name: string, password: string, profile: string = 'Test profile') => {
  cy.visit('/')
  cy.get('button').contains('Signup').click()
  cy.get('input[placeholder*="Name"]').type(name)
  cy.get('input[placeholder*="Password"]').type(password)
  cy.get('input[placeholder*="Profile"]').type(profile)
  cy.get('button').contains('Signup').click()
  cy.url().should('include', '/home')
  cy.waitForPageLoad()
})

Cypress.Commands.add('logout', () => {
  cy.get('button').contains('Logout').click()
  cy.url().should('eq', Cypress.config().baseUrl + '/')
})

Cypress.Commands.add('waitForPageLoad', () => {
  // Wait for the page to be fully loaded
  cy.get('body').should('be.visible')
  // Wait for any loading indicators to disappear
  cy.get('[data-testid="loading"]').should('not.exist')
  cy.wait(1000) // Additional wait for any async operations
})

Cypress.Commands.add('clearNotifications', () => {
  // Click on notification bell
  cy.get('[data-testid="notification-bell"]').click()
  // Check if clear all button exists and click it
  cy.get('body').then(($body) => {
    if ($body.find('button:contains("Clear all")').length > 0) {
      cy.get('button').contains('Clear all').click()
    }
  })
  // Close notification panel
  cy.get('[data-testid="notification-close"]').click()
})

Cypress.Commands.add('openChatWith', (userName: string) => {
  // Find user in the list and click message button
  cy.contains(userName).parent().find('button').contains('Message').click()
  // Verify chat window opened
  cy.get('[data-testid="chat-window"]').should('be.visible')
  cy.get('[data-testid="chat-window"]').should('contain', userName)
})
