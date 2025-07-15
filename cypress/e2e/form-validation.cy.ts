describe('Form Validation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Login Form Validation', () => {
    it('should show validation errors for empty login fields', () => {
      // Try to submit empty login form
      cy.get('button').contains('Login').click()
      
      // Should show validation errors for name and password
      cy.get('input[placeholder="Name"]').should('have.class', 'border-red-500')
      cy.contains('Name must be at least 2 characters').should('be.visible')
      
      cy.get('input[placeholder="Password"]').should('have.class', 'border-red-500')
      cy.contains('Password is required').should('be.visible')
    })

    it('should show validation error for invalid name', () => {
      // Enter invalid name (too short)
      cy.get('input[placeholder="Name"]').type('A')
      cy.get('button').contains('Login').click()
      
      // Should show validation error
      cy.contains('Name must be at least 2 characters').should('be.visible')
    })

    it('should clear validation errors when user starts typing', () => {
      // Trigger validation error first
      cy.get('button').contains('Login').click()
      cy.contains('Name must be at least 2 characters').should('be.visible')
      
      // Start typing in name field
      cy.get('input[placeholder="Name"]').type('John')
      
      // Error should disappear
      cy.contains('Name must be at least 2 characters').should('not.exist')
      cy.get('input[placeholder="Name"]').should('not.have.class', 'border-red-500')
    })
  })

  describe('Signup Form Validation', () => {
    beforeEach(() => {
      cy.get('button').contains('Signup').click()
    })

    it('should show validation errors for empty signup fields', () => {
      // Try to submit empty signup form
      cy.get('button').contains('Signup').click()
      
      // Should show validation errors for name and password
      cy.get('input[placeholder="Name"]').should('have.class', 'border-red-500')
      cy.contains('Name must be at least 2 characters').should('be.visible')
      
      cy.get('input[placeholder="Password"]').should('have.class', 'border-red-500')
      cy.contains('Password must be at least 8 characters').should('be.visible')
    })

    it('should show validation error for weak password', () => {
      cy.get('input[placeholder="Name"]').type('John Doe')
      cy.get('input[placeholder="Password"]').type('weak')
      cy.get('button').contains('Signup').click()
      
      // Should show password validation errors
      cy.contains('Password must be at least 8 characters').should('be.visible')
    })

    it('should show validation error for password without uppercase', () => {
      cy.get('input[placeholder="Name"]').type('John Doe')
      cy.get('input[placeholder="Password"]').type('password123')
      cy.get('button').contains('Signup').click()
      
      // Should show uppercase validation error
      cy.contains('Password must contain at least one uppercase letter').should('be.visible')
    })

    it('should show validation error for password without number', () => {
      cy.get('input[placeholder="Name"]').type('John Doe')
      cy.get('input[placeholder="Password"]').type('Password')
      cy.get('button').contains('Signup').click()
      
      // Should show number validation error
      cy.contains('Password must contain at least one number').should('be.visible')
    })

    it('should show validation error for invalid profile URL', () => {
      cy.get('input[placeholder="Name"]').type('John Doe')
      cy.get('input[placeholder="Password"]').type('Password123')
      cy.get('input[placeholder*="Profile"]').type('invalid-url')
      cy.get('button').contains('Signup').click()
      
      // Should show profile URL validation error
      cy.contains('Profile must be a valid URL if provided').should('be.visible')
    })

    it('should accept valid profile URL', () => {
      cy.get('input[placeholder="Name"]').type('John Doe')
      cy.get('input[placeholder="Password"]').type('Password123')
      cy.get('input[placeholder*="Profile"]').type('https://example.com/profile.jpg')
      
      // Should not show validation errors
      cy.get('input[placeholder="Name"]').should('not.have.class', 'border-red-500')
      cy.get('input[placeholder="Password"]').should('not.have.class', 'border-red-500')
      cy.get('input[placeholder*="Profile"]').should('not.have.class', 'border-red-500')
    })

    it('should accept valid form with strong password', () => {
      cy.get('input[placeholder="Name"]').type('John Doe')
      cy.get('input[placeholder="Password"]').type('StrongPassword123')
      
      // Should not show validation errors
      cy.get('input[placeholder="Name"]').should('not.have.class', 'border-red-500')
      cy.get('input[placeholder="Password"]').should('not.have.class', 'border-red-500')
    })

    it('should clear validation errors when user corrects input', () => {
      // Enter invalid data first
      cy.get('input[placeholder="Name"]').type('A')
      cy.get('input[placeholder="Password"]').type('weak')
      cy.get('button').contains('Signup').click()
      
      // Should show errors
      cy.contains('Name must be at least 2 characters').should('be.visible')
      cy.contains('Password must be at least 8 characters').should('be.visible')
      
      // Correct the inputs
      cy.get('input[placeholder="Name"]').clear().type('John Doe')
      cy.get('input[placeholder="Password"]').clear().type('StrongPassword123')
      
      // Errors should disappear
      cy.contains('Name must be at least 2 characters').should('not.exist')
      cy.contains('Password must be at least 8 characters').should('not.exist')
    })
  })

  describe('Name Validation', () => {
    beforeEach(() => {
      cy.get('button').contains('Signup').click()
    })

    it('should reject name with numbers', () => {
      cy.get('input[placeholder="Name"]').type('John123')
      cy.get('button').contains('Signup').click()
      
      cy.contains('Name can only contain letters and spaces').should('be.visible')
    })

    it('should reject name with special characters', () => {
      cy.get('input[placeholder="Name"]').type('John@Doe')
      cy.get('button').contains('Signup').click()
      
      cy.contains('Name can only contain letters and spaces').should('be.visible')
    })

    it('should accept name with spaces', () => {
      cy.get('input[placeholder="Name"]').type('John Doe Smith')
      cy.get('input[placeholder="Password"]').type('Password123')
      
      cy.get('input[placeholder="Name"]').should('not.have.class', 'border-red-500')
    })
  })
});
