/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login
     * @param name - Username for login
     * @param password - Password for login
     */
    login(name: string, password: string): Chainable<void>

    /**
     * Custom command to signup
     * @param name - Username for signup
     * @param password - Password for signup
     * @param profile - Optional profile information
     */
    signup(name: string, password: string, profile?: string): Chainable<void>

    /**
     * Custom command to logout
     */
    logout(): Chainable<void>

    /**
     * Custom command to wait for page load
     */
    waitForPageLoad(): Chainable<void>

    /**
     * Custom command to clear notifications
     */
    clearNotifications(): Chainable<void>

    /**
     * Custom command to open chat with a user
     * @param userName - Name of the user to chat with
     */
    openChatWith(userName: string): Chainable<void>
  }
}
