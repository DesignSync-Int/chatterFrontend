import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: '64oox9',
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents() {
      // implement node event listeners here
    },
    env: {
      // Backend API URL for testing
      apiUrl: 'https://chatterbackend-08lw.onrender.com',
      // Test user credentials
      testUser1: {
        name: 'Test User 1',
        password: 'testpass123'
      },
      testUser2: {
        name: 'Test User 2',
        password: 'testpass123'
      }
    }
  },
})
