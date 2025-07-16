describe('Profile Field Optional Feature', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should show profile field as optional in signup form', () => {
    // Switch to signup form
    cy.get('button').contains('Signup').click()
    
    // Check that profile field exists and has optional placeholder
    cy.get('input[placeholder*="Profile"]').should('be.visible')
    cy.get('input[placeholder*="Optional"]').should('be.visible')
  })

  it('should allow signup without profile field', () => {
    // Switch to signup form
    cy.get('button').contains('Signup').click()
    
    // Fill only name and password, leave profile empty
    cy.get('input[placeholder*="Name"]').type('TestUser')
    cy.get('input[placeholder*="Password"]').type('TestPassword123')
    
    // Profile field should remain empty
    cy.get('input[placeholder*="Profile"]').should('have.value', '')
    
    // Form should be submittable (button should be enabled)
    cy.get('button').contains('Signup').should('not.be.disabled')
  })

  it('should show updated placeholder text for profile field', () => {
    // Switch to signup form
    cy.get('button').contains('Signup').click()
    
    // Check that the placeholder text indicates it's optional and mentions random avatar
    cy.get('input[placeholder*="Profile"]')
      .should('have.attr', 'placeholder')
      .and('match', /optional|random avatar/i)
  })

  it('should still work with profile field filled', () => {
    // Switch to signup form
    cy.get('button').contains('Signup').click()
    
    // Fill all fields including profile
    cy.get('input[placeholder*="Name"]').type('TestUser')
    cy.get('input[placeholder*="Password"]').type('TestPassword123')
    cy.get('input[placeholder*="Profile"]').type('https://example.com/profile.jpg')
    
    // Form should be submittable
    cy.get('button').contains('Signup').should('not.be.disabled')
    
    // Profile field should have the entered value
    cy.get('input[placeholder*="Profile"]').should('have.value', 'https://example.com/profile.jpg')
  })
});
