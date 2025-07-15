describe('Form Validation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe("Login Form Validation", () => {
    it("should show validation errors for empty login fields", () => {
      // Try to submit empty login form
      cy.get('button[type="submit"]').contains("Sign In").click();

      // Should show validation errors for name and password
      cy.get('input[name="name"]').should("have.class", "border-red-300");
      cy.contains("Name must be at least 2 characters").should("be.visible");

      cy.get('input[name="password"]').should("have.class", "border-red-300");
      cy.contains("Password is required").should("be.visible");
    });

    it("should show validation error for invalid name", () => {
      // Enter invalid name (too short)
      cy.get('input[name="name"]').type("A");
      cy.get('button[type="submit"]').contains("Sign In").click();

      // Should show validation error
      cy.contains("Name must be at least 2 characters").should("be.visible");
    });

    it("should clear validation errors when user starts typing", () => {
      // Trigger validation error first
      cy.get('button[type="submit"]').contains("Sign In").click();
      cy.contains("Name must be at least 2 characters").should("be.visible");

      // Start typing in name field
      cy.get('input[name="name"]').type("John");

      // Error should disappear
      cy.contains("Name must be at least 2 characters").should("not.exist");
      cy.get('input[name="name"]').should("not.have.class", "border-red-300");
    });
  });

  describe("Signup Form Validation", () => {
    beforeEach(() => {
      // Click the toggle button to switch to signup mode
      cy.get("button").contains("Sign up").click();
    });

    it("should show validation errors for empty signup fields", () => {
      // Try to submit empty signup form
      cy.get('button[type="submit"]').contains("Create Account").click();

      // Should show validation errors for name and password
      cy.get('input[name="name"]').should("have.class", "border-red-300");
      cy.contains("Name must be at least 2 characters").should("be.visible");

      cy.get('input[name="password"]').should("have.class", "border-red-300");
      cy.contains("Password must be at least 8 characters").should(
        "be.visible"
      );
    });

    it("should show validation error for weak password", () => {
      cy.get('input[name="name"]').type("John Doe");
      cy.get('input[name="password"]').type("weak");
      cy.get('button[type="submit"]').contains("Create Account").click();

      // Should show password validation errors
      cy.contains("Password must be at least 8 characters").should(
        "be.visible"
      );
    });

    it("should show validation error for password without uppercase", () => {
      cy.get('input[name="name"]').type("John Doe");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').contains("Create Account").click();

      // Should show uppercase validation error
      cy.contains("Password must contain at least one uppercase letter").should(
        "be.visible"
      );
    });

    it("should show validation error for password without number", () => {
      cy.get('input[name="name"]').type("John Doe");
      cy.get('input[name="password"]').type("Password");
      cy.get('button[type="submit"]').contains("Create Account").click();

      // Should show number validation error
      cy.contains("Password must contain at least one number").should(
        "be.visible"
      );
    });

    it("should show validation error for invalid profile URL", () => {
      cy.get('input[name="name"]').type("John Doe");
      cy.get('input[name="password"]').type("Password123");
      cy.get('input[placeholder*="blank for random"]').type("invalid-url");
      cy.get('button[type="submit"]').contains("Create Account").click();

      // Should show profile URL validation error
      cy.contains("Profile must be a valid URL if provided").should(
        "be.visible"
      );
    });

    it("should accept valid profile URL", () => {
      cy.get('input[name="name"]').type("John Doe");
      cy.get('input[name="password"]').type("Password123");
      cy.get('input[placeholder*="blank for random"]').type(
        "https://example.com/profile.jpg"
      );

      // Should not show validation errors
      cy.get('input[name="name"]').should("not.have.class", "border-red-300");
      cy.get('input[name="password"]').should(
        "not.have.class",
        "border-red-300"
      );
      cy.get('input[placeholder*="blank for random"]').should(
        "not.have.class",
        "border-red-300"
      );
    });

    it("should accept valid form with strong password", () => {
      cy.get('input[name="name"]').type("John Doe");
      cy.get('input[name="password"]').type("StrongPassword123");

      // Should not show validation errors
      cy.get('input[name="name"]').should("not.have.class", "border-red-300");
      cy.get('input[name="password"]').should(
        "not.have.class",
        "border-red-300"
      );
    });

    it("should clear validation errors when user corrects input", () => {
      // Enter invalid data first
      cy.get('input[name="name"]').type("A");
      cy.get('input[name="password"]').type("weak");
      cy.get('button[type="submit"]').contains("Create Account").click();

      // Should show errors
      cy.contains("Name must be at least 2 characters").should("be.visible");
      cy.contains("Password must be at least 8 characters").should(
        "be.visible"
      );

      // Correct the inputs
      cy.get('input[name="name"]').clear().type("John Doe");
      cy.get('input[name="password"]').clear().type("StrongPassword123");

      // Errors should disappear
      cy.contains("Name must be at least 2 characters").should("not.exist");
      cy.contains("Password must be at least 8 characters").should("not.exist");
    });
  });

  describe("Name Validation", () => {
    beforeEach(() => {
      // Click the toggle button to switch to signup mode
      cy.get("button").contains("Sign up").click();
    });

    it("should reject name with numbers", () => {
      cy.get('input[name="name"]').type("John123");
      cy.get('button[type="submit"]').contains("Create Account").click();

      cy.contains("Name can only contain letters and spaces").should(
        "be.visible"
      );
    });

    it("should reject name with special characters", () => {
      cy.get('input[name="name"]').type("John@Doe");
      cy.get('button[type="submit"]').contains("Create Account").click();

      cy.contains("Name can only contain letters and spaces").should(
        "be.visible"
      );
    });

    it("should accept name with spaces", () => {
      cy.get('input[name="name"]').type("John Doe Smith");
      cy.get('input[name="password"]').type("Password123");

      cy.get('input[name="name"]').should("not.have.class", "border-red-300");
    });
  });
});
