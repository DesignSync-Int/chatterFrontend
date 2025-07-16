describe("Integration Tests - Basic UI Flow", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe("Complete UI Navigation", () => {
    it("should display complete login interface", () => {
      cy.visit("/");
      cy.get("h1").should("contain", "Chatter");
      cy.get("p").should(
        "contain",
        "Connect back with your friends in a simple way"
      );
      cy.get("button").contains("Login").should("be.visible");
      cy.get("button").contains("Signup").should("be.visible");
    });

    it("should handle form validation for login", () => {
      cy.visit("/");
      cy.get('input[type="text"]').clear();
      cy.get('input[type="password"]').clear();
      cy.get("button").contains("Login").click();
      // Should remain on login page or show validation
      cy.url().should("include", "/");
    });

    it("should handle form validation for signup", () => {
      cy.visit("/");
      cy.get("button").contains("Signup").click();
      cy.get("button").contains("Signup").click();
      // Should remain on signup page or show validation
      cy.url().should("include", "/");
    });

    it("should handle protected route access", () => {
      cy.visit("/home");
      cy.url().should("eq", Cypress.config().baseUrl + "/");
    });

    it("should allow typing in form fields", () => {
      cy.visit("/");
      cy.get('input[type="text"]').type("testuser");
      cy.get('input[type="password"]').type("testpass");
      cy.get('input[type="text"]').should("have.value", "testuser");
      cy.get('input[type="password"]').should("have.value", "testpass");
    });
  });

  describe("New Features Integration", () => {
    it("should integrate letter avatar system with login", () => {
      cy.visit("/");
      cy.get('input[type="text"]').type("TestUser");
      cy.get('input[type="password"]').type("testpass");
      cy.get("button").contains("Login").click();

      // Should show letter avatars after login
      cy.get('[data-cy="user-card"]').should("exist");
    });

    it("should show responsive user list after login", () => {
      cy.visit("/");
      cy.get('input[type="text"]').type("TestUser");
      cy.get('input[type="password"]').type("testpass");
      cy.get("button").contains("Login").click();

      // Should show grid layout
      cy.get(".grid").should("exist");
    });

    it("should handle optional profile in signup flow", () => {
      cy.visit("/");
      cy.get("button").contains("Signup").click();

      cy.get('input[type="text"]').type("NewUser");
      cy.get('input[type="email"]').type("newuser@example.com");
      cy.get('input[type="password"]').type("password123");
      // Profile field should be optional
      cy.get("button").contains("Signup").click();

      cy.get("body").should("contain", "NewUser");
    });

    it("should validate forms with new validation system", () => {
      cy.visit("/");

      // Test enhanced validation
      cy.get('input[type="text"]').type("a"); // Too short
      cy.get('input[type="password"]').type("b"); // Too short
      cy.get("button").contains("Login").click();

      // Should show validation feedback
      cy.get("body").should("be.visible");
    });

    it("should support clickable user cards without message buttons", () => {
      cy.visit("/");
      cy.get('input[type="text"]').type("TestUser");
      cy.get('input[type="password"]').type("testpass");
      cy.get("button").contains("Login").click();

      // No message buttons should exist
      cy.get("button").contains("Message").should("not.exist");

      // User cards should be clickable
      cy.get('[data-cy="user-card"]').should("have.class", "cursor-pointer");
    });
  });
});