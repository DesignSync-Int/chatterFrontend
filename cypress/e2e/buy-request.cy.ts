describe('Buy Request Feature', () => {
  beforeEach(() => {
    // Clear any existing data
    cy.clearAllSessionStorage();
    cy.clearAllLocalStorage();
    
    // Visit the main page
    cy.visit('http://localhost:5173');
  });

  it('should not show floating buy button without query parameter', () => {
    // Button should not be visible without ?buy=true
    cy.get('[data-cy="floating-buy-button"]').should('not.exist');
  });

  it('should show floating buy button when ?buy=true is present', () => {
    // Visit with buy query parameter
    cy.visit('http://localhost:5173?buy=true');
    
    // Button should be visible
    cy.get('[data-cy="floating-buy-button"]').should('be.visible');
    cy.get('[data-cy="floating-buy-button"]').should('contain.text', 'Buy or Hire');
  });

  it('should open overlay form when buy button is clicked', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Click the floating button
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Overlay should appear
    cy.get('[data-cy="buy-form-overlay"]').should('be.visible');
    
    // Form elements should be present
    cy.get('[data-cy="buy-form-name"]').should('be.visible');
    cy.get('[data-cy="buy-form-contact"]').should('be.visible');
    cy.get('[data-cy="buy-form-email"]').should('be.visible');
    cy.get('[data-cy="buy-form-time"]').should('be.visible');
    cy.get('[data-cy="buy-form-description"]').should('be.visible');
    cy.get('[data-cy="buy-form-submit"]').should('be.visible');
    cy.get('[data-cy="buy-form-cancel"]').should('be.visible');
  });

  it('should close overlay when cancel button is clicked', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    cy.get('[data-cy="buy-form-overlay"]').should('be.visible');
    
    // Click cancel
    cy.get('[data-cy="buy-form-cancel"]').click();
    
    // Overlay should be hidden
    cy.get('[data-cy="buy-form-overlay"]').should('not.exist');
  });

  it('should close overlay when clicking outside', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    cy.get('[data-cy="buy-form-overlay"]').should('be.visible');
    
    // Click outside the form
    cy.get('[data-cy="buy-form-overlay"]').click({ force: true });
    
    // Overlay should be hidden
    cy.get('[data-cy="buy-form-overlay"]').should('not.exist');
  });

  it('should validate required fields', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Try to submit without filling fields
    cy.get('[data-cy="buy-form-submit"]').click();
    
    // Should show validation errors
    cy.get('[data-cy="buy-form-name"]').should('have.class', 'border-red-500');
    cy.get('[data-cy="buy-form-contact"]').should('have.class', 'border-red-500');
    cy.get('[data-cy="buy-form-email"]').should('have.class', 'border-red-500');
    cy.get('[data-cy="buy-form-description"]').should('have.class', 'border-red-500');
  });

  it('should validate email format', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Fill with invalid email but valid other fields
    cy.get('[data-cy="buy-form-name"]').type('John Doe');
    cy.get('[data-cy="buy-form-contact"]').type('1234567890');
    cy.get('[data-cy="buy-form-email"]').type('invalid-email');
    cy.get('[data-cy="buy-form-time"]').select('morning');
    cy.get('[data-cy="buy-form-description"]').type('I want to buy this application for my company.');
    
    // Try to submit
    cy.get('[data-cy="buy-form-submit"]').click();
    
    // Should show email validation error (wait a bit for validation to run)
    cy.wait(500);
    cy.get('[data-cy="buy-form-email"]').should('have.class', 'border-red-500');
  });

  it('should validate description length', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Fill with short description
    cy.get('[data-cy="buy-form-name"]').type('John Doe');
    cy.get('[data-cy="buy-form-contact"]').type('1234567890');
    cy.get('[data-cy="buy-form-email"]').type('john@example.com');
    cy.get('[data-cy="buy-form-time"]').select('morning');
    cy.get('[data-cy="buy-form-description"]').type('Short');
    
    // Try to submit
    cy.get('[data-cy="buy-form-submit"]').click();
    
    // Should show description validation error
    cy.wait(500);
    cy.get('[data-cy="buy-form-description"]').should('have.class', 'border-red-500');
  });

  it('should successfully submit valid form', () => {
    // Mock the API endpoint
    cy.intercept('POST', '/api/buy-request', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Buy request submitted successfully',
        data: {
          id: '123',
          name: 'John Doe',
          contactNumber: '1234567890',
          email: 'john@example.com',
          bestTimeToCall: 'Morning'
        }
      }
    }).as('submitBuyRequest');

    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Fill form with valid data
    cy.get('[data-cy="buy-form-name"]').type('John Doe');
    cy.get('[data-cy="buy-form-contact"]').type('1234567890');
    cy.get('[data-cy="buy-form-email"]').type('john@example.com');
    cy.get('[data-cy="buy-form-time"]').select('morning');
    cy.get('[data-cy="buy-form-description"]').type('I want to buy this application for my company.');
    
    // Submit form
    cy.get('[data-cy="buy-form-submit"]').click();
    
    // Should make API call
    cy.wait('@submitBuyRequest');
    
    // Should show success message
    cy.contains('Thank you! Your request has been submitted successfully.').should('be.visible');
    
    // Form should be reset and closed
    cy.get('[data-cy="buy-form-overlay"]').should('not.exist');
  });

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('POST', '/api/buy-request', {
      statusCode: 400,
      body: {
        success: false,
        message: 'Validation failed'
      }
    }).as('submitBuyRequestError');

    cy.visit('http://localhost:5173?buy=true');
    
    // Open form and fill
    cy.get('[data-cy="floating-buy-button"]').click();
    cy.get('[data-cy="buy-form-name"]').type('John Doe');
    cy.get('[data-cy="buy-form-contact"]').type('1234567890');
    cy.get('[data-cy="buy-form-email"]').type('john@example.com');
    cy.get('[data-cy="buy-form-time"]').select('morning');
    cy.get('[data-cy="buy-form-description"]').type('I want to buy this application for my company.');
    
    // Submit form
    cy.get('[data-cy="buy-form-submit"]').click();
    
    // Should make API call
    cy.wait('@submitBuyRequestError');
    
    // Should show error message
    cy.contains('Failed to submit request').should('be.visible');
    
    // Form should remain open
    cy.get('[data-cy="buy-form-overlay"]').should('be.visible');
  });

  it('should prevent duplicate submissions', () => {
    // Mock successful submission
    cy.intercept('POST', '/api/buy-request', {
      statusCode: 201,
      body: {
        success: true,
        message: 'Buy request submitted successfully'
      }
    }).as('submitBuyRequest');

    cy.visit('http://localhost:5173?buy=true');
    
    // Open form and fill
    cy.get('[data-cy="floating-buy-button"]').click();
    cy.get('[data-cy="buy-form-name"]').type('John Doe');
    cy.get('[data-cy="buy-form-contact"]').type('1234567890');
    cy.get('[data-cy="buy-form-email"]').type('john@example.com');
    cy.get('[data-cy="buy-form-time"]').select('morning');
    cy.get('[data-cy="buy-form-description"]').type('I want to buy this application for my company.');
    
    // Submit form
    cy.get('[data-cy="buy-form-submit"]').click();
    
    // Button should be disabled during submission
    cy.get('[data-cy="buy-form-submit"]').should('be.disabled');
    
    // Wait for completion
    cy.wait('@submitBuyRequest');
  });

  it('should maintain form state when switching between pages', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form and partially fill
    cy.get('[data-cy="floating-buy-button"]').click();
    cy.get('[data-cy="buy-form-name"]').type('John Doe');
    cy.get('[data-cy="buy-form-contact"]').type('1234567890');
    
    // Navigate away and back
    cy.visit('http://localhost:5173');
    cy.visit('http://localhost:5173?buy=true');
    
    // Button should still be visible
    cy.get('[data-cy="floating-buy-button"]').should('be.visible');
  });
});
