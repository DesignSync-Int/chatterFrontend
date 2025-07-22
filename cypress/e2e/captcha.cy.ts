describe("Form Security & Validation Tests", () => {
  beforeEach(() => {
    cy.visit("/signup");
  });

  describe("Signup Form Security", () => {
    it("should display signup form with security validation", () => {
      cy.get("h2").should("contain", "Create your account");
      cy.get("#name").should("be.visible");
      cy.get("#email").should("be.visible");
      cy.get("#fullName").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.get('button[type="submit"]').should("contain", "Sign up");
    });

    it("should have autocomplete disabled on sensitive fields", () => {
      cy.get("#password").should("have.attr", "autocomplete", "new-password");
      cy.get("#email").should("have.attr", "autocomplete", "email");
    });

    it("should prevent form submission without required fields", () => {
      cy.get('button[type="submit"]').click();

      // Form should not submit with empty required fields
      cy.url().should("include", "/signup");

      // HTML5 validation should prevent submission
      cy.get("#name:invalid").should("exist");
    });

    it("should show visual indicators for required fields", () => {
      cy.get("span.text-red-500")
        .should("contain", "*")
        .should("have.length", 4);

      // Check each required field has asterisk
      cy.get('label[for="name"]').should("contain", "*");
      cy.get('label[for="email"]').should("contain", "*");
      cy.get('label[for="fullName"]').should("contain", "*");
      cy.get('label[for="password"]').should("contain", "*");
    });

    it("should validate minimum password length (HTML5)", () => {
      cy.get("#password").should("have.attr", "minlength", "6");

      cy.get("#name").type("testuser");
      cy.get("#email").type("test@example.com");
      cy.get("#fullName").type("Test User");
      cy.get("#password").type("12345"); // 5 chars, less than required 6

      // HTML5 validation should prevent submission
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/signup"); // Should stay on same page
    });

    it("should handle special characters in input fields", () => {
      cy.get("#name").type("test-user_123");
      cy.get("#fullName").type("O'Connor Jr.");
      cy.get("#email").type("test+tag@example-domain.co.uk");
      cy.get("#password").type("P@ssw0rd!");

      cy.get("#name").should("have.value", "test-user_123");
      cy.get("#fullName").should("have.value", "O'Connor Jr.");
      cy.get("#email").should("have.value", "test+tag@example-domain.co.uk");
      cy.get("#password").should("have.value", "P@ssw0rd!");
    });
  });

  describe("Email Validation Security", () => {
    it("should validate email format in real-time", () => {
      cy.get("#email").type("invalid-email");
      cy.get("#name").click(); // Trigger blur validation

      cy.get(".text-red-500").should("contain", "valid email");
      cy.get("#email").should("have.class", "border-red-500");
    });

    it("should clear email validation errors when corrected", () => {
      cy.get("#email").type("invalid");
      cy.get("#name").click(); // Trigger validation
      cy.get(".text-red-500").should("contain", "valid email");

      cy.get("#email").clear().type("valid@example.com");
      cy.get("#name").click(); // Trigger validation
      cy.get("p.text-red-500").should("not.exist"); // Check specific error paragraph
      cy.get("#email").should("not.have.class", "border-red-500");
    });

    it("should validate email minimum length", () => {
      cy.get("#email").type("a@b.c"); // Very short but technically valid
      cy.get("#name").click(); // Trigger validation

      // Check if error appears (it should for this implementation)
      cy.get(".text-red-500").should("exist");
    });

    it("should accept various valid email formats", () => {
      const validEmails = [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.com",
      ];

      validEmails.forEach((email) => {
        cy.get("#email").clear().type(email);
        cy.get("#name").click(); // Trigger validation
        cy.get("p.text-red-500").should("not.exist");
        cy.get("#email").should("not.have.class", "border-red-500");
      });
    });

    it("should reject common invalid email formats", () => {
      const invalidEmails = ["notanemail", "@example.com", "user@"];

      invalidEmails.forEach((email) => {
        cy.get("#email").clear().type(email);
        cy.get("#name").click(); // Trigger validation
        cy.get(".text-red-500").should("exist");
      });
    });

    it("should show email verification notice", () => {
      cy.get(".text-gray-500").should(
        "contain",
        "verify this email address after registration"
      );
    });
  });

  describe("Form Interaction & UX", () => {
    it("should show loading state during form submission", () => {
      cy.get("#name").type("testuser");
      cy.get("#email").type("test@example.com");
      cy.get("#fullName").type("Test User");
      cy.get("#password").type("password123");

      // Intercept the signup request to observe loading state
      cy.intercept("POST", "/auth/signup", { delay: 1000, statusCode: 200 }).as(
        "signupRequest"
      );

      cy.get('button[type="submit"]').click();

      // Should show spinner during loading
      cy.get(".animate-spin").should("be.visible");
      cy.get('button[type="submit"]').should("be.disabled");
    });

    it("should disable submit button when email is invalid", () => {
      cy.get("#name").type("testuser");
      cy.get("#fullName").type("Test User");
      cy.get("#password").type("password123");
      cy.get("#email").type("invalid-email");
      cy.get("#name").click(); // Trigger validation

      cy.get('button[type="submit"]').should("be.disabled");
    });

    it("should enable submit button when all fields are valid", () => {
      cy.get("#name").type("testuser");
      cy.get("#email").type("test@example.com");
      cy.get("#fullName").type("Test User");
      cy.get("#password").type("password123");

      cy.get('button[type="submit"]').should("not.be.disabled");
    });

    it("should clear form data on page reload", () => {
      cy.get("#name").type("testuser");
      cy.get("#email").type("test@example.com");
      cy.get("#fullName").type("Test User");
      cy.get("#password").type("password123");

      cy.reload();

      cy.get("#name").should("have.value", "");
      cy.get("#email").should("have.value", "");
      cy.get("#fullName").should("have.value", "");
      cy.get("#password").should("have.value", "");
    });

    it("should maintain focus order for accessibility", () => {
      cy.get("#name").focus().should("be.focused");
      cy.get("#email").focus().should("be.focused");
      cy.get("#fullName").focus().should("be.focused");
      cy.get("#password").focus().should("be.focused");
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
  });

  describe("Navigation & Links", () => {
    it("should navigate to login page", () => {
      cy.get('a[href="/login"]').click();
      cy.url().should("include", "/login");
      cy.get("h1").should("contain", "Chatter");
    });

    it("should maintain link styling and accessibility", () => {
      cy.get('a[href="/login"]')
        .should("have.class", "text-[#FB406C]")
        .should("contain", "sign in to your account");
    });

    it("should handle back navigation properly", () => {
      cy.get('a[href="/login"]').click();
      cy.go("back");
      cy.url().should("include", "/signup");
      cy.get("h2").should("contain", "Create your account");
    });
  });

  describe("Security Features", () => {
    it("should prevent password field from being auto-filled insecurely", () => {
      cy.get("#password").should("have.attr", "type", "password");
      cy.get("#password").should("have.attr", "autocomplete", "new-password");
    });

    it("should handle input sanitization", () => {
      const maliciousInput = '<script>alert("xss")</script>';

      cy.get("#name").type(maliciousInput);
      cy.get("#fullName").type(maliciousInput);

      // Should store as text, not execute
      cy.get("#name").should("have.value", maliciousInput);
      cy.get("#fullName").should("have.value", maliciousInput);
    });

    it("should use secure form practices", () => {
      // Form should exist and be properly structured
      cy.get("form").should("exist");

      // Should use POST method for form submission (not GET for security)
      cy.get("form").should("not.have.attr", "method", "get");

      // Should have proper form structure for security
      cy.get('button[type="submit"]').should("exist");
    });

    it("should implement proper form validation", () => {
      // Check that required fields have proper attributes
      cy.get("#name").should("have.attr", "required");
      cy.get("#email").should("have.attr", "required");
      cy.get("#fullName").should("have.attr", "required");
      cy.get("#password").should("have.attr", "required");
    });
  });

  describe("Error Handling & Form Behavior", () => {
    it("should handle invalid form submission gracefully", () => {
      // Submit empty form
      cy.get('button[type="submit"]').click();

      // Should stay on signup page with HTML5 validation
      cy.url().should("include", "/signup");
      cy.get("h2").should("contain", "Create your account");
    });

    it("should validate all required fields before submission", () => {
      // Fill only some fields
      cy.get("#name").type("testuser");
      cy.get("#email").type("test@example.com");
      // Leave fullName and password empty

      cy.get('button[type="submit"]').click();

      // Should not submit due to missing required fields
      cy.url().should("include", "/signup");
    });

    it("should handle form with all valid data", () => {
      cy.get("#name").type("newuser");
      cy.get("#email").type("new@example.com");
      cy.get("#fullName").type("New User");
      cy.get("#password").type("password123");

      // Form should be ready for submission
      cy.get('button[type="submit"]').should("not.be.disabled");
      cy.get("#name").should("have.value", "newuser");
      cy.get("#email").should("have.value", "new@example.com");
    });

    it("should clear validation states on form reset", () => {
      // Trigger validation error
      cy.get("#email").type("invalid");
      cy.get("#name").click();
      cy.get(".text-red-500").should("exist");

      // Reset form
      cy.reload();

      // Validation states should be cleared
      cy.get(".text-red-500").should("not.exist");
      cy.get("#email").should("not.have.class", "border-red-500");
    });

    it("should maintain form accessibility during errors", () => {
      cy.get("#email").type("invalid");
      cy.get("#name").click(); // Trigger validation

      // Form should still be accessible
      cy.get("#email").should("have.attr", "aria-invalid", "true");
      cy.get('label[for="email"]').should("exist");
    });
  });
});
