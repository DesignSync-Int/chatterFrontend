describe('Form Validation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe("Login Form Validation", () => {
    it("should show validation errors for empty login fields", () => {
      // Try to submit empty login form
      cy.get('button[type="submit"]').click();

      // Should show validation errors for name and password
      cy.get("#username").should("have.class", "border-red-500");
      cy.get("div.text-red-600").should("contain", "Name");

      cy.get("#password").should("have.class", "border-red-500");
      cy.get("div.text-red-600").should("contain", "Password");
    });

    it("should show validation error for invalid name", () => {
      // Enter invalid name (too short)
      cy.get("#username").type("A");
      cy.get('button[type="submit"]').click();

      // Should show validation error
      cy.get("div.text-red-600").should("contain", "Name");
    });

    it("should clear validation errors when user starts typing", () => {
      // Trigger validation error first
      cy.get('button[type="submit"]').click();
      cy.get("div.text-red-600").should("contain", "Name");

      // Start typing in both fields
      cy.get("#username").type("John");
      cy.get("#password").type("Password123");
      cy.wait(200); // Wait for validation to clear

      // Error should disappear
      cy.get("div.text-red-600").should("not.exist");
      cy.get("#username").should("not.have.class", "border-red-500");
    });
  });

  describe("Signup Form Validation", () => {
    beforeEach(() => {
      cy.get("button").contains("Signup").click();
    });

    it("should show validation errors for empty signup fields", () => {
      // Try to submit empty signup form
      cy.get('button[type="submit"]').click();

      // Should show validation errors for name and password
      cy.get("#signup-name").should("have.class", "border-red-500");
      cy.get("div.text-red-600").should("contain", "Name");

      cy.get("#signup-password").should("have.class", "border-red-500");
      cy.get("div.text-red-600").should("contain", "Password");
    });

    it("should show validation error for weak password", () => {
      cy.get("#signup-name").type("John");
      cy.get("#signup-fullname").type("John Doe");
      cy.get("#signup-password").type("weak");
      cy.get('button[type="submit"]').click();

      // Should show password validation errors
      cy.get("div.text-red-600").should("contain", "Password");
    });

    it("should show validation error for password without uppercase", () => {
      cy.get("#signup-name").type("John");
      cy.get("#signup-fullname").type("John Doe");
      cy.get("#signup-password").type("password123");
      cy.get('button[type="submit"]').click();

      // Should show uppercase validation error
      cy.contains("Password must contain at least one uppercase letter").should(
        "be.visible"
      );
    });

    it("should show validation error for password without number", () => {
      cy.get("#signup-name").type("John");
      cy.get("#signup-fullname").type("John Doe");
      cy.get("#signup-password").type("Password");
      cy.get('button[type="submit"]').click();

      // Should show number validation error
      cy.contains("Password must contain at least one number").should(
        "be.visible"
      );
    });

    it("should show validation error for empty verify password", () => {
      cy.get("#signup-name").type("John");
      cy.get("#signup-fullname").type("John Doe");
      cy.get("#signup-password").type("Password123");
      cy.get('button[type="submit"]').click();

      // Should show verify password validation error
      cy.contains("Please verify your password").should("be.visible");
    });

    it("should show validation error for mismatched passwords", () => {
      cy.get("#signup-name").type("John");
      cy.get("#signup-fullname").type("John Doe");
      cy.get("#signup-password").type("Password123");
      cy.get("#signup-verify-password").type("Password456");
      cy.get('button[type="submit"]').click();

      // Should show password mismatch validation error
      cy.contains("Passwords do not match").should("be.visible");
    });

    it("should accept matching passwords", () => {
      cy.get("#signup-name").type("John");
      cy.get("#signup-fullname").type("John Doe");
      cy.get("#signup-password").type("Password123");
      cy.get("#signup-verify-password").type("Password123");

      // No validation errors should appear for matching passwords
      cy.contains("Passwords do not match").should("not.exist");
    });

    it("should show validation error for invalid profile URL", () => {
      cy.get("#signup-name").type("John");
      cy.get("#signup-fullname").type("John Doe");
      cy.get("#signup-password").type("Password123");
      cy.get("#signup-verify-password").type("Password123");
      cy.get("#signup-profile").type("invalid-url");
      cy.get('button[type="submit"]').click();

      // Should show profile URL validation error
      cy.contains("Profile must be a valid URL if provided").should(
        "be.visible"
      );
    });

    it("should accept valid profile URL", () => {
      cy.get("#signup-name").type("John");
      cy.get("#signup-fullname").type("John Doe");
      cy.get("#signup-password").type("Password123");
      cy.get("#signup-verify-password").type("Password123");
      cy.get("#signup-profile").type("https://example.com/profile.jpg");

      // Should not show validation errors
      cy.get("#signup-name").should("not.have.class", "border-red-500");
      cy.get("#signup-password").should("not.have.class", "border-red-500");
      cy.get("#signup-profile").should("not.have.class", "border-red-500");
    });

    it("should accept valid form with strong password", () => {
      cy.get("#signup-name").type("John");
      cy.get("#signup-fullname").type("John Doe");
      cy.get("#signup-password").type("StrongPassword123");
      cy.get("#signup-verify-password").type("StrongPassword123");

      // Should not show validation errors
      cy.get("#signup-name").should("not.have.class", "border-red-500");
      cy.get("#signup-password").should("not.have.class", "border-red-500");
    });

    it("should clear validation errors when user corrects input", () => {
      // Enter invalid data first
      cy.get("#signup-name").type("A");
      cy.get("#signup-password").type("weak");
      cy.get('button[type="submit"]').click();

      // Should show errors
      cy.get("div.text-red-600").should("contain", "Name");
      cy.get("div.text-red-600").should("contain", "Password");

      // Correct the inputs
      cy.get("#signup-name").clear().type("John");
      cy.get("#signup-fullname").clear().type("John Doe");
      cy.get("#signup-password").clear().type("StrongPassword123");
      cy.get("#signup-verify-password").clear().type("StrongPassword123");

      // Errors should disappear
      cy.get("div.text-red-600").should("not.exist");
    });
  });

  describe('Name Validation', () => {
    beforeEach(() => {
      cy.get('button').contains('Signup').click()
    })

    it("should reject name with numbers", () => {
      cy.get("#signup-name").type("John123");
      cy.get('button[type="submit"]').click();

      cy.contains("Name can only contain letters and spaces").should(
        "be.visible"
      );
    });

    it("should reject name with special characters", () => {
      cy.get("#signup-name").type("John@Doe");
      cy.get('button[type="submit"]').click();

      cy.contains("Name can only contain letters and spaces").should(
        "be.visible"
      );
    });

    it('should accept name with spaces', () => {
      cy.get("#signup-name").type("John Doe");
      cy.get("#signup-fullname").type("John Doe Smith");
      cy.get("#signup-password").type("Password123");
      cy.get("#signup-verify-password").type("Password123");

      cy.get("#signup-name").should("not.have.class", "border-red-500");
    })
  })
});
