// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to signup a user
       * @example cy.signup('User Name', 'user@example.com', 'password')
       */
      signup(name: string, email: string, password: string): Chainable<void>
      
      /**
       * Custom command to logout current user
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to wait for page to be fully loaded
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>
      
      /**
       * Custom command to clear all notifications
       * @example cy.clearNotifications()
       */
      clearNotifications(): Chainable<void>
      
      /**
       * Custom command to open chat with a user
       * @example cy.openChatWith('User Name')
       */
      openChatWith(userName: string): Chainable<void>
    }
  }
}
