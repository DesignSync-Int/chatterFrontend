/// <reference types="cypress" />

describe("Authentication Integration Tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Login Page", () => {
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

    it("should validate login form", () => {
      cy.get('button[type="submit"]').click();
      cy.get("div.text-red-600").should("exist");
    });
  });

  describe("Signup Page", () => {
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

    it("should validate email field", () => {
      cy.get("#name").type("testuser");
      cy.get("#fullName").type("Test User");
      cy.get("#email").type("invalid-email");
      cy.get("#password").type("Password123");
      
      // Trigger validation by clicking away from email field
      cy.get("#password").click();
      
      // Should show email validation error and disable button
      cy.get("p.text-red-500").should("contain", "valid email");
      cy.get('button[type="submit"]').should("be.disabled");
    });

    it("should require all fields", () => {
      // Check that required fields are marked as such
      cy.get("#email").should("have.attr", "required");
      cy.get('label[for="email"]').should("contain", "*");
      cy.get('label[for="name"]').should("contain", "*");
      cy.get('label[for="fullName"]').should("contain", "*");
      cy.get('label[for="password"]').should("contain", "*");
      
      // Try to submit with missing email (should trigger validation)
      cy.get("#name").type("testuser");
      cy.get("#fullName").type("Test User");
      cy.get("#password").type("Password123");
      // Leave email empty
      
      cy.get('button[type="submit"]').click();
      
      // Should prevent submission due to HTML5 validation
      cy.url().should("include", "/signup"); // Should still be on signup page
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
        "first+last@subdomain.example.com"
      ];

      validEmails.forEach(email => {
        cy.get("#email").clear().type(email);
        cy.get("#email").should("have.value", email);
        // Email field should not have error styling
        cy.get("#email").should("not.have.class", "border-red-500");
      });
    });
  });

  describe("Navigation Flow", () => {
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
  });

  describe("Form Validation", () => {
    it("should validate email format on signup", () => {
      cy.visit("/signup");
      
      const testCases = [
        { email: "invalid-email", shouldPass: false },
        { email: "@example.com", shouldPass: false },
        { email: "test@", shouldPass: false },
        { email: "test@example.com", shouldPass: true }
      ];

      testCases.forEach(({ email, shouldPass }) => {
        cy.get("#email").clear().type(email);
        cy.get("#name").click(); // Trigger validation
        
        if (shouldPass) {
          cy.get("#email").should("not.have.class", "border-red-500");
        } else {
          // Either has error class or shows error message
          cy.get("body").then($body => {
            const hasErrorClass = $body.find("#email.border-red-500").length > 0;
            const hasErrorMessage = $body.find("div").text().includes("valid email");
            expect(hasErrorClass || hasErrorMessage).to.be.true;
          });
        }
      });
    });
  });
});
