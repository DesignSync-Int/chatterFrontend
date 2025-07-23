/// <reference types="cypress" />

describe("Email Verification System", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Basic Test", () => {
    it("should load the homepage", () => {
      cy.visit("/");
      cy.get("body").should("be.visible");
    });

    it("should have login form elements", () => {
      cy.visit("/");
      cy.get("#username").should("be.visible");
      cy.get("#password").should("be.visible");
      cy.get('button[type="submit"]').should("be.visible");
    });
  });

  describe("Email Verification Page", () => {
    it("should handle email verification page route", () => {
      cy.visit("/verify-email?token=test-token");
      // Page should load without errors
      cy.get("body").should("be.visible");
    });

    it("should handle successful email verification", () => {
      cy.intercept("POST", "/api/auth/verify-email", {
        statusCode: 200,
        body: { message: "Email verified successfully!" }
      }).as("verifyEmail");

      cy.visit("/verify-email?token=valid-token");
      
      // Should show loading state first
      cy.get("body").should("contain", "Verifying your email");
      
      cy.wait("@verifyEmail").then((interception) => {
        expect(interception.request.body).to.deep.equal({
          token: "valid-token"
        });
      });

      // After API call, should show success state (adjust expectations based on actual implementation)
      cy.get("body").should("not.contain", "Verifying your email");
    });

    it("should handle verification failure", () => {
      cy.intercept("POST", "/api/auth/verify-email", {
        statusCode: 400,
        body: { message: "Invalid verification token" }
      }).as("verifyEmailError");

      cy.visit("/verify-email?token=invalid-token");
      
      cy.wait("@verifyEmailError");

      // Should show error state (if implemented in UI)
      cy.get("body").then(($body) => {
        expect($body.text()).to.satisfy((text: string) => 
          text.includes("Invalid") || text.includes("Error") || text.includes("Failed")
        );
      });
    });
  });
});
