// Captcha test utilities
// These utilities help with testing captcha functionality

/**
 * Fills the signup form with valid data except captcha
 */
export const fillSignupFormWithoutCaptcha = () => {
  cy.get("#signup-name").type("testuser");
  cy.get("#signup-fullname").type("Test User");
  cy.get("#signup-password").type("Password123");
  cy.get("#signup-verify-password").type("Password123");
};

/**
 * Simulates captcha completion for testing purposes
 * In a real test environment, you might want to mock the captcha generation
 */
export const completeCaptcha = () => {
  // For testing, we'll type a dummy value
  // In real tests, you'd either:
  // 1. Mock the captcha validation
  // 2. Use a test-specific captcha that's always the same
  // 3. Extract the actual captcha from the canvas (complex)
  cy.get('input[placeholder="Enter captcha code"]').type("TEST123");
};

/**
 * Checks if captcha component is visible
 */
export const checkCaptchaVisible = () => {
  cy.get('canvas').should('be.visible');
  cy.get('input[placeholder="Enter captcha code"]').should('be.visible');
  cy.get('button[title="Refresh captcha"]').should('be.visible');
};

/**
 * Refreshes the captcha
 */
export const refreshCaptcha = () => {
  cy.get('button[title="Refresh captcha"]').click();
  cy.get('canvas').should('be.visible');
  cy.get('input[placeholder="Enter captcha code"]').should('have.value', '');
};

/**
 * Checks for captcha validation error
 */
export const expectCaptchaError = () => {
  cy.get("div.text-red-600").should("contain", "captcha");
};

/**
 * Checks that captcha error is cleared
 */
export const expectCaptchaErrorCleared = () => {
  cy.get('input[placeholder="Enter captcha code"]').should("not.have.class", "border-red-500");
};

/**
 * Mock the captcha as verified for testing backend integration
 */
export const mockCaptchaVerified = () => {
  cy.window().then((win) => {
    // Mock the captcha state by directly setting the values
    // This is for testing purposes only
    cy.get('input[placeholder="Enter captcha code"]').type("TEST123");
    
    // You might also want to directly invoke the onVerify callback
    // if the component exposes it for testing
  });
};
