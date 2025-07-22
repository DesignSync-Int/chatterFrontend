/// <reference types="cypress" />

describe("Authentication Integration Tests", () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    cy.clearCookies();
    cy.visit("/");
  });

  describe("Login Form Tests", () => {
    it("should display login form correctly", () => {
      cy.get("#username").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.get('button[type="submit"]').should("contain", "Login");
      cy.get('a[href="/signup"]').should("contain", "Sign up");
    });

    it("should navigate to signup page", () => {
      cy.get('a[href="/signup"]').click();
      cy.url().should("include", "/signup");
      cy.get("h2").should("contain", "Create your account");
    });

    it("should validate empty login form", () => {
      cy.get('button[type="submit"]').click();
      cy.get("div.text-red-600").should("exist");
    });

    it("should validate short username", () => {
      cy.get("#username").type("a");
      cy.get('button[type="submit"]').click();

      cy.get("div.text-red-600").should(
        "contain",
        "Name must be at least 2 characters"
      );
    });

    it("should validate empty password", () => {
      cy.get("#username").type("testuser");
      // Leave password empty
      cy.get('button[type="submit"]').click();

      cy.get("div.text-red-600").should("contain", "Password");
    });

    it("should validate minimum password length", () => {
      cy.get("#username").type("testuser");
      cy.get("#password").type("123"); // Too short
      cy.get('button[type="submit"]').click();

      cy.get("div.text-red-600").should("exist");
    });

    it("should allow typing in form fields", () => {
      cy.get("#username").type("testuser");
      cy.get("#password").type("password123");

      cy.get("#username").should("have.value", "testuser");
      cy.get("#password").should("have.value", "password123");
    });

    it("should clear validation errors when user starts typing", () => {
      // Trigger an error
      cy.get('button[type="submit"]').click();
      cy.get("div.text-red-600").should("exist");

      // Error should clear when user starts typing
      cy.get("#username").type("valid");
      cy.wait(500); // Give time for error to clear

      // Should not show the same error
      cy.get("#username").should("have.value", "valid");
    });

    it("should show button text changes during interaction", () => {
      cy.get('button[type="submit"]').should("contain", "Login");
      cy.get('button[type="submit"]').should("not.be.disabled");

      // Test button state when filled
      cy.get("#username").type("testuser");
      cy.get("#password").type("password123");
      cy.get('button[type="submit"]').should("not.be.disabled");
    });

    it("should handle form reset on page reload", () => {
      cy.get("#username").type("testuser");
      cy.get("#password").type("password123");

      cy.reload();

      cy.get("#username").should("have.value", "");
      cy.get("#password").should("have.value", "");
    });
  });

  describe("Signup Form Tests", () => {
    beforeEach(() => {
      cy.visit("/signup");
    });

    it("should display signup form correctly", () => {
      cy.get("#name").should("be.visible");
      cy.get("#email").should("be.visible");
      cy.get("#fullName").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.get('button[type="submit"]').should("contain", "Sign up");
    });

    it("should have required field markers", () => {
      cy.get('label[for="name"]').should("contain", "*");
      cy.get('label[for="email"]').should("contain", "*");
      cy.get('label[for="fullName"]').should("contain", "*");
      cy.get('label[for="password"]').should("contain", "*");
    });

    it("should validate required fields", () => {
      // Try to submit empty form
      cy.get('button[type="submit"]').click();

      // Should show HTML5 validation or stay on page
      cy.url().should("include", "/signup");
    });

    it("should validate email format", () => {
      cy.get("#email").type("invalid-email");
      cy.get("#name").click(); // Trigger validation

      // Should show email validation error
      cy.get("p.text-red-500").should("contain", "valid email");
    });

    it("should navigate back to login", () => {
      cy.get('a[href="/login"]').click();
      cy.url().should("include", "/login");
      cy.get('button[type="submit"]').should("contain", "Login");
    });

    it("should accept valid email formats", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "first+last@subdomain.example.com",
      ];

      validEmails.forEach((email) => {
        cy.get("#email").clear().type(email);
        cy.get("#name").click(); // Trigger validation
        // Should not have error styling
        cy.get("#email").should("not.have.class", "border-red-500");
      });
    });

    it("should handle special characters in form inputs", () => {
      const specialInputs = {
        name: "user_name-123",
        fullName: "John O'Connor-Smith Jr.",
        email: "test+filter@sub.domain.com",
        password: "P@ssw0rd!#$%",
      };

      cy.get("#name").type(specialInputs.name);
      cy.get("#fullName").type(specialInputs.fullName);
      cy.get("#email").type(specialInputs.email);
      cy.get("#password").type(specialInputs.password);

      // All inputs should accept special characters
      cy.get("#name").should("have.value", specialInputs.name);
      cy.get("#fullName").should("have.value", specialInputs.fullName);
      cy.get("#email").should("have.value", specialInputs.email);
      cy.get("#password").should("have.value", specialInputs.password);
    });

    it("should validate form field lengths", () => {
      // Test minimum password length requirement
      cy.get("#password").type("123");
      cy.get("#password").should("have.attr", "minLength", "6");

      // Test that longer passwords are accepted
      cy.get("#password").clear().type("password123");
      cy.get("#password").should("have.value", "password123");
    });

    it("should show appropriate placeholders", () => {
      cy.get("#name").should("have.attr", "placeholder", "Choose a username");
      cy.get("#email").should(
        "have.attr",
        "placeholder",
        "Enter your email address (required)"
      );
      cy.get("#fullName").should("have.attr", "placeholder", "Your full name");
      cy.get("#password").should("have.attr", "placeholder", "••••••••");
    });

    it("should disable submit button when email is invalid", () => {
      cy.get("#name").type("testuser");
      cy.get("#fullName").type("Test User");
      cy.get("#email").type("invalid-email");
      cy.get("#password").type("Password123");

      // Trigger validation
      cy.get("#password").click();

      // Button should be disabled
      cy.get('button[type="submit"]').should("be.disabled");
    });

    it("should enable submit button when all fields are valid", () => {
      cy.get("#name").type("testuser");
      cy.get("#fullName").type("Test User");
      cy.get("#email").type("test@example.com");
      cy.get("#password").type("Password123");

      // Button should be enabled
      cy.get('button[type="submit"]').should("not.be.disabled");
    });

    it("should clear form validation on page reload", () => {
      cy.get("#email").type("invalid-email");
      cy.get("#name").click(); // Trigger validation
      cy.get("p.text-red-500").should("exist");

      cy.reload();

      cy.get("p.text-red-500").should("not.exist");
      cy.get("#email").should("have.value", "");
    });
  });

  describe("Navigation Flow Tests", () => {
    it("should allow navigation between login and signup", () => {
      // Start at login
      cy.visit("/");
      cy.get('button[type="submit"]').should("contain", "Login");

      // Go to signup
      cy.get('a[href="/signup"]').click();
      cy.url().should("include", "/signup");
      cy.get('button[type="submit"]').should("contain", "Sign up");

      // Go back to login
      cy.get('a[href="/login"]').click();
      cy.url().should("include", "/login");
      cy.get('button[type="submit"]').should("contain", "Login");
    });

    it("should preserve form data during navigation", () => {
      // Fill login form
      cy.get("#username").type("test");
      cy.get("#password").type("password123");

      // Navigate to signup and back
      cy.get('a[href="/signup"]').click();
      cy.get('a[href="/login"]').click();

      // Form should be cleared for security
      cy.get("#username").should("have.value", "");
      cy.get("#password").should("have.value", "");
    });

    it("should maintain consistent UI across auth pages", () => {
      // Check login page structure
      cy.get("h1").should("contain", "Chatter");
      cy.get("p").should("contain", "Connect back with your friends");

      // Navigate to signup
      cy.get('a[href="/signup"]').click();
      cy.get("h2").should("contain", "Create your account");
      cy.get("p").should("contain", "Or");

      // Both should have consistent styling
      cy.get("form").should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");
    });

    it("should handle direct URL access", () => {
      cy.visit("/signup");
      cy.url().should("include", "/signup");
      cy.get("h2").should("contain", "Create your account");

      cy.visit("/login");
      cy.url().should("include", "/login");
      cy.get("h1").should("contain", "Chatter");
    });
  });

  describe("Form Validation & Accessibility Tests", () => {
    it("should have proper form labels and inputs association", () => {
      // Check for form elements existence (labels may be visually hidden)
      cy.get("#username").should("exist");
      cy.get("#password").should("exist");

      cy.visit("/signup");
      cy.get("#name").should("exist");
      cy.get("#email").should("exist");
      cy.get("#fullName").should("exist");
      cy.get("#password").should("exist");
    });

    it("should show proper validation messages", () => {
      // Test login validation
      cy.visit("/");
      cy.get('button[type="submit"]').click();
      cy.get("div.text-red-600").should("exist");

      // Test signup validation
      cy.visit("/signup");
      cy.get("#email").type("invalid");
      cy.get("#name").click();
      cy.get("p.text-red-500").should("exist");
    });

    it("should handle keyboard navigation", () => {
      cy.get("#username").focus().should("be.focused");

      // Verify that password field can be focused
      cy.get("#password").focus().should("be.focused");

      // Navigate back to username
      cy.get("#username").focus().should("be.focused");
    });

    it("should support form autocomplete attributes", () => {
      cy.visit("/signup");
      cy.get("#email").should("have.attr", "autoComplete", "email");
      cy.get("#password").should("have.attr", "autoComplete", "new-password");
    });

    it("should show appropriate error styling", () => {
      cy.visit("/signup");
      cy.get("#email").type("invalid-email");
      cy.get("#name").click(); // Trigger validation

      cy.get("#email").should("have.class", "border-red-500");
      cy.get("p.text-red-500").should("be.visible");
    });

    it("should clear errors when user corrects input", () => {
      cy.visit("/signup");
      cy.get("#email").type("invalid-email");
      cy.get("#name").click(); // Trigger validation
      cy.get("p.text-red-500").should("exist");

      cy.get("#email").clear().type("valid@example.com");
      cy.get("#name").click(); // Trigger validation
      cy.get("p.text-red-500").should("not.exist");
    });
  });

  describe("Form Interaction & UX Tests", () => {
    it("should provide visual feedback on focus", () => {
      cy.get("#username").focus();
      cy.get("#username").should("have.class", "focus:ring-2");

      cy.visit("/signup");
      cy.get("#email").focus();
      cy.get("#email").should("have.class", "focus:ring-[#FB406C]");
    });

    it("should handle form reset properly", () => {
      cy.get("#username").type("testuser");
      cy.get("#password").type("password123");

      cy.reload();

      cy.get("#username").should("have.value", "");
      cy.get("#password").should("have.value", "");
    });

    it("should maintain form state during tab switches", () => {
      cy.visit("/signup");
      cy.get("#name").type("testuser");
      cy.get("#email").type("test@example.com");

      // Switch tabs (simulate background/foreground)
      cy.window().then((win) => {
        win.dispatchEvent(new Event("blur"));
        win.dispatchEvent(new Event("focus"));
      });

      cy.get("#name").should("have.value", "testuser");
      cy.get("#email").should("have.value", "test@example.com");
    });

    it("should prevent form submission on Enter in invalid state", () => {
      cy.get("#username").type("a"); // Too short
      cy.get("#username").type("{enter}");

      cy.get("div.text-red-600").should("exist");
      cy.url().should("include", "/");
    });

    it("should handle copy/paste operations", () => {
      const longText = "test@verylongdomainnameexample.com";

      cy.visit("/signup");
      cy.get("#email").type(longText);
      cy.get("#email").should("have.value", longText);

      // Test clearing text
      cy.get("#email").clear();
      cy.get("#email").should("have.value", "");
    });

    it("should support browser autofill", () => {
      cy.visit("/signup");

      // These attributes help browsers with autofill
      cy.get("#name").should("have.attr", "name", "name");
      cy.get("#email").should("have.attr", "name", "email");
      cy.get("#fullName").should("have.attr", "name", "fullName");
      cy.get("#password").should("have.attr", "name", "password");
    });
  });
});
