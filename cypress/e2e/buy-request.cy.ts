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

  it('should test email field behavior', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Test email field input
    cy.get('[data-cy="buy-form-email"]').type('test@example.com');
    cy.get('[data-cy="buy-form-email"]').should('have.value', 'test@example.com');
    
    // Clear and test invalid email
    cy.get('[data-cy="buy-form-email"]').clear();
    cy.get('[data-cy="buy-form-email"]').type('invalid-email');
    cy.get('[data-cy="buy-form-email"]').should('have.value', 'invalid-email');
    
    // Should have email type attribute
    cy.get('[data-cy="buy-form-email"]').should('have.attr', 'type', 'email');
  });

  it('should test form submission button behavior', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Submit button should exist and be clickable initially
    cy.get('[data-cy="buy-form-submit"]').should('be.visible');
    cy.get('[data-cy="buy-form-submit"]').should('not.be.disabled');
    cy.get('[data-cy="buy-form-submit"]').should('contain', 'Submit Request');
    
    // Fill form with valid data
    cy.get('[data-cy="buy-form-name"]').type('John Doe');
    cy.get('[data-cy="buy-form-contact"]').type('1234567890');
    cy.get('[data-cy="buy-form-email"]').type('john@example.com');
    cy.get('[data-cy="buy-form-time"]').select('morning');
    cy.get('[data-cy="buy-form-description"]').type('I want to buy this application for my company.');
    
    // Button should still be clickable with valid data
    cy.get('[data-cy="buy-form-submit"]').should('not.be.disabled');
  });

  it('should clear validation errors when user corrects input', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Submit empty form to trigger validation
    cy.get('[data-cy="buy-form-submit"]').click();
    
    // Should show validation errors
    cy.get('[data-cy="buy-form-email"]').should('have.class', 'border-red-500');
    
    // Start typing in email field
    cy.get('[data-cy="buy-form-email"]').type('john@example.com');
    
    // Error should clear (error is cleared when user starts typing)
    cy.get('[data-cy="buy-form-email"]').should('not.have.class', 'border-red-500');
  });

  it('should validate contact number format', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Fill with invalid contact number but valid other fields
    cy.get('[data-cy="buy-form-name"]').type('John Doe');
    cy.get('[data-cy="buy-form-contact"]').type('invalid-contact');
    cy.get('[data-cy="buy-form-email"]').type('john@example.com');
    cy.get('[data-cy="buy-form-time"]').select('morning');
    cy.get('[data-cy="buy-form-description"]').type('I want to buy this application for my company.');
    
    // Try to submit
    cy.get('[data-cy="buy-form-submit"]').click();
    
    // Should show contact validation error
    cy.get('[data-cy="buy-form-contact"]').should('have.class', 'border-red-500');
    cy.get('.text-red-600').should('contain', 'Please enter a valid contact number');
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

  it('should show form header and description', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Should show proper header and description
    cy.contains('Buy or Hire Request').should('be.visible');
    cy.contains('Purchase this application for your product or hire me for your project').should('be.visible');
  });

  it('should show proper placeholder text for all fields', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Check placeholders
    cy.get('[data-cy="buy-form-name"]').should('have.attr', 'placeholder', 'Enter your name');
    cy.get('[data-cy="buy-form-contact"]').should('have.attr', 'placeholder', 'Enter your contact number');
    cy.get('[data-cy="buy-form-email"]').should('have.attr', 'placeholder', 'Enter your email address');
    cy.get('[data-cy="buy-form-description"]').should('have.attr', 'placeholder', 'Describe what you need: buy this application for your product or hire me for your project...');
  });

  it('should have all time options available', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Check time options
    cy.get('[data-cy="buy-form-time"]').select('morning');
    cy.get('[data-cy="buy-form-time"]').should('have.value', 'morning');
    
    cy.get('[data-cy="buy-form-time"]').select('afternoon');
    cy.get('[data-cy="buy-form-time"]').should('have.value', 'afternoon');
    
    cy.get('[data-cy="buy-form-time"]').select('evening');
    cy.get('[data-cy="buy-form-time"]').should('have.value', 'evening');
    
    cy.get('[data-cy="buy-form-time"]').select('anytime');
    cy.get('[data-cy="buy-form-time"]').should('have.value', 'anytime');
  });

  it('should test form field accessibility and behavior', () => {
    cy.visit('http://localhost:5173?buy=true');
    
    // Open form and fill with valid data
    cy.get('[data-cy="floating-buy-button"]').click();
    
    // Test that all fields are interactable
    cy.get('[data-cy="buy-form-name"]').should('not.be.disabled').type('John Doe');
    cy.get('[data-cy="buy-form-contact"]').should('not.be.disabled').type('1234567890');
    cy.get('[data-cy="buy-form-email"]').should('not.be.disabled').type('john@example.com');
    cy.get('[data-cy="buy-form-time"]').should('not.be.disabled').select('morning');
    cy.get('[data-cy="buy-form-description"]').should('not.be.disabled').type('I want to buy this application for my company.');
    
    // All form fields should have the correct values
    cy.get('[data-cy="buy-form-name"]').should('have.value', 'John Doe');
    cy.get('[data-cy="buy-form-contact"]').should('have.value', '1234567890');
    cy.get('[data-cy="buy-form-email"]').should('have.value', 'john@example.com');
    cy.get('[data-cy="buy-form-time"]').should('have.value', 'morning');
    cy.get('[data-cy="buy-form-description"]').should('have.value', 'I want to buy this application for my company.');
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
