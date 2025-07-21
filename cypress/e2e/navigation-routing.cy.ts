/// <reference types="cypress" />

describe("Navigation and Routing", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Unauthenticated Routes", () => {
    it("should display login page by default", () => {
      cy.url().should("eq", Cypress.config().baseUrl + "/");
      cy.get("h1").should("contain", "Chatter");
      cy.get('[data-testid="login-form"]').should("be.visible");
    });

    it("should redirect to login when accessing protected routes", () => {
      cy.visit("/home");
      cy.url().should("eq", Cypress.config().baseUrl + "/");
    });

    it("should redirect to login when accessing any protected route", () => {
      const protectedRoutes = ["/home", "/profile", "/chat"];
      
      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should("eq", Cypress.config().baseUrl + "/");
      });
    });

    it("should handle 404 for non-existent routes", () => {
      cy.visit("/non-existent-page", { failOnStatusCode: false });
      cy.get('[data-testid="404-page"]').should("be.visible");
      cy.get("h1").should("contain", "Page Not Found");
    });
  });

  describe("Authentication Navigation", () => {
    it("should navigate to signup tab", () => {
      cy.get('[data-testid="signup-tab"]').click();
      cy.get('[data-testid="signup-form"]').should("be.visible");
      cy.get("h2").should("contain", "Create your account");
    });

    it("should navigate back to login tab", () => {
      cy.get('[data-testid="signup-tab"]').click();
      cy.get('[data-testid="login-tab"]').click();
      cy.get('[data-testid="login-form"]').should("be.visible");
      cy.get("h1").should("contain", "Chatter");
    });

    it("should clear form data when switching tabs", () => {
      // Fill login form
      cy.get('[data-testid="username-input"]').type("testuser");
      cy.get('[data-testid="password-input"]').type("password123");

      // Switch to signup
      cy.get('[data-testid="signup-tab"]').click();
      
      // Switch back to login
      cy.get('[data-testid="login-tab"]').click();
      
      // Form should be cleared
      cy.get('[data-testid="username-input"]').should("have.value", "");
      cy.get('[data-testid="password-input"]').should("have.value", "");
    });
  });

  describe("Authenticated Navigation", () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });
      
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { _id: "user123", name: "testuser", fullName: "Test User" }
      }).as("checkAuth");
      
      cy.visit("/home");
      cy.wait("@checkAuth");
    });

    it("should navigate to home after login", () => {
      cy.url().should("include", "/home");
      cy.get('[data-testid="home-page"]').should("be.visible");
    });

    it("should navigate between home tabs", () => {
      // Users tab
      cy.get('[data-testid="users-tab"]').click();
      cy.get('[data-testid="users-content"]').should("be.visible");
      
      // Received requests tab
      cy.get('[data-testid="received-tab"]').click();
      cy.get('[data-testid="received-content"]').should("be.visible");
      
      // Sent requests tab
      cy.get('[data-testid="sent-tab"]').click();
      cy.get('[data-testid="sent-content"]').should("be.visible");
      
      // Friends tab
      cy.get('[data-testid="friends-tab"]').click();
      cy.get('[data-testid="friends-content"]').should("be.visible");
    });

    it("should maintain tab state during session", () => {
      cy.get('[data-testid="friends-tab"]').click();
      cy.reload();
      cy.wait("@checkAuth");
      
      // Should remember last active tab
      cy.get('[data-testid="friends-tab"]').should("have.class", "active");
      cy.get('[data-testid="friends-content"]').should("be.visible");
    });

    it("should handle browser back/forward navigation", () => {
      cy.get('[data-testid="friends-tab"]').click();
      cy.url().should("include", "tab=friends");
      
      cy.go("back");
      cy.get('[data-testid="users-tab"]').should("have.class", "active");
      
      cy.go("forward");
      cy.get('[data-testid="friends-tab"]').should("have.class", "active");
    });
  });

  describe("Logout Navigation", () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });
      
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { _id: "user123", name: "testuser", fullName: "Test User" }
      }).as("checkAuth");
      
      cy.intercept("POST", "/api/auth/logout", {
        statusCode: 200,
        body: { message: "Logged out successfully" }
      }).as("logout");
      
      cy.visit("/home");
      cy.wait("@checkAuth");
    });

    it("should logout and redirect to login page", () => {
      cy.get('[data-testid="logout-button"]').click();
      cy.wait("@logout");
      
      cy.url().should("eq", Cypress.config().baseUrl + "/");
      cy.get('[data-testid="login-form"]').should("be.visible");
    });

    it("should clear authentication state on logout", () => {
      cy.get('[data-testid="logout-button"]').click();
      cy.wait("@logout");
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth-token')).to.be.null;
      });
    });

    it("should prevent access to protected routes after logout", () => {
      cy.get('[data-testid="logout-button"]').click();
      cy.wait("@logout");
      
      cy.visit("/home");
      cy.url().should("eq", Cypress.config().baseUrl + "/");
    });
  });

  describe("URL State Management", () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });
      
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { _id: "user123", name: "testuser", fullName: "Test User" }
      }).as("checkAuth");
    });

    it("should update URL when switching tabs", () => {
      cy.visit("/home");
      cy.wait("@checkAuth");
      
      cy.get('[data-testid="friends-tab"]').click();
      cy.url().should("include", "tab=friends");
      
      cy.get('[data-testid="received-tab"]').click();
      cy.url().should("include", "tab=received");
    });

    it("should restore tab state from URL", () => {
      cy.visit("/home?tab=friends");
      cy.wait("@checkAuth");
      
      cy.get('[data-testid="friends-tab"]').should("have.class", "active");
      cy.get('[data-testid="friends-content"]').should("be.visible");
    });

    it("should handle invalid tab parameters", () => {
      cy.visit("/home?tab=invalid");
      cy.wait("@checkAuth");
      
      // Should default to users tab
      cy.get('[data-testid="users-tab"]').should("have.class", "active");
      cy.get('[data-testid="users-content"]').should("be.visible");
    });
  });

  describe("Navigation Accessibility", () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });
      
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { _id: "user123", name: "testuser", fullName: "Test User" }
      }).as("checkAuth");
      
      cy.visit("/home");
      cy.wait("@checkAuth");
    });

    it("should be keyboard navigable", () => {
      // Tab through navigation elements
      cy.get('[data-testid="users-tab"]').focus().should("be.focused");
      cy.get('[data-testid="users-tab"]').type("{rightarrow}");
      cy.get('[data-testid="received-tab"]').should("be.focused");
    });

    it("should have proper ARIA labels", () => {
      cy.get('[data-testid="users-tab"]').should("have.attr", "aria-label");
      cy.get('[data-testid="received-tab"]').should("have.attr", "aria-label");
      cy.get('[data-testid="sent-tab"]').should("have.attr", "aria-label");
      cy.get('[data-testid="friends-tab"]').should("have.attr", "aria-label");
    });

    it("should have proper ARIA selected states", () => {
      cy.get('[data-testid="users-tab"]').should("have.attr", "aria-selected", "true");
      cy.get('[data-testid="received-tab"]').should("have.attr", "aria-selected", "false");
      
      cy.get('[data-testid="received-tab"]').click();
      cy.get('[data-testid="users-tab"]').should("have.attr", "aria-selected", "false");
      cy.get('[data-testid="received-tab"]').should("have.attr", "aria-selected", "true");
    });

    it("should have proper role attributes", () => {
      cy.get('[data-testid="tab-navigation"]').should("have.attr", "role", "tablist");
      cy.get('[data-testid="users-tab"]').should("have.attr", "role", "tab");
      cy.get('[data-testid="users-content"]').should("have.attr", "role", "tabpanel");
    });
  });

  describe("Navigation Error Handling", () => {
    it("should handle network errors gracefully", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 500,
        body: { message: "Server error" }
      }).as("checkAuthError");
      
      cy.visit("/home");
      cy.wait("@checkAuthError");
      
      // Should redirect to login on auth error
      cy.url().should("eq", Cypress.config().baseUrl + "/");
      cy.get('[data-testid="error-message"]').should("contain", "Authentication failed");
    });

    it("should handle expired tokens", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 401,
        body: { message: "Token expired" }
      }).as("checkAuthExpired");
      
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'expired-token');
      });
      
      cy.visit("/home");
      cy.wait("@checkAuthExpired");
      
      cy.url().should("eq", Cypress.config().baseUrl + "/");
      cy.get('[data-testid="error-message"]').should("contain", "Session expired");
    });
  });

  describe("Mobile Navigation", () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
      
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });
      
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { _id: "user123", name: "testuser", fullName: "Test User" }
      }).as("checkAuth");
      
      cy.visit("/home");
      cy.wait("@checkAuth");
    });

    it("should show mobile-friendly navigation", () => {
      cy.get('[data-testid="mobile-nav"]').should("be.visible");
      cy.get('[data-testid="desktop-nav"]').should("not.be.visible");
    });

    it("should toggle mobile menu", () => {
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-menu"]').should("be.visible");
      
      cy.get('[data-testid="mobile-menu-close"]').click();
      cy.get('[data-testid="mobile-menu"]').should("not.be.visible");
    });

    it("should navigate on mobile", () => {
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-friends-tab"]').click();
      
      cy.get('[data-testid="friends-content"]').should("be.visible");
      cy.get('[data-testid="mobile-menu"]').should("not.be.visible");
    });
  });

  describe("Navigation Performance", () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });
      
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { _id: "user123", name: "testuser", fullName: "Test User" }
      }).as("checkAuth");
      
      cy.visit("/home");
      cy.wait("@checkAuth");
    });

    it("should navigate between tabs quickly", () => {
      const startTime = Date.now();
      
      cy.get('[data-testid="friends-tab"]').click();
      cy.get('[data-testid="friends-content"]').should("be.visible");
      
      cy.get('[data-testid="received-tab"]').click();
      cy.get('[data-testid="received-content"]').should("be.visible");
      
      cy.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        expect(duration).to.be.lessThan(1000); // Should take less than 1 second
      });
    });

    it("should not reload page when navigating", () => {
      let pageLoadCount = 0;
      
      cy.window().then((win) => {
        win.addEventListener('beforeunload', () => {
          pageLoadCount++;
        });
      });
      
      cy.get('[data-testid="friends-tab"]').click();
      cy.get('[data-testid="received-tab"]').click();
      cy.get('[data-testid="sent-tab"]').click();
      
      cy.then(() => {
        expect(pageLoadCount).to.equal(0);
      });
    });
  });
});
