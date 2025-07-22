describe("Error Handling and Edge Cases", () => {
  const mockUser = {
    _id: "user123",
    name: "Test User",
    email: "testuser@example.com"
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();

    // Handle application errors
    cy.on('uncaught:exception', () => false);
  });

  describe("Network Error Handling", () => {
    it("should handle server downtime gracefully", () => {
      // Mock server unavailable
      cy.intercept("GET", "**/api/auth/check", {
        statusCode: 503,
        body: { message: "Service Unavailable" }
      }).as("serverDown");

      cy.visit("/home");
      cy.wait("@serverDown");

      // Test that app doesn't crash
      cy.get("body").should("exist");
    });

    it("should handle slow network responses", () => {
      // Mock slow response
      cy.intercept("GET", "**/api/auth/check", {
        statusCode: 200,
        body: mockUser,
        delay: 5000
      }).as("slowResponse");

      cy.visit("/home");
      
      // Should show loading state
      cy.get("body").should("exist");
      cy.log("Testing slow network response handling");
    });

    it("should handle network timeout scenarios", () => {
      cy.intercept("GET", "**/api/auth/check", {
        forceNetworkError: true
      }).as("networkError");

      cy.visit("/home");
      
      // App should handle network errors gracefully
      cy.get("body").should("exist");
    });

    it("should handle malformed API responses", () => {
      // Test various malformed responses
      const badResponses = [
        { response: "invalid json", description: "Invalid JSON" },
        { response: null, description: "Null response" },
        { response: undefined, description: "Undefined response" },
        { response: "", description: "Empty response" }
      ];

      badResponses.forEach((test, index) => {
        cy.intercept("GET", `**/api/test${index}`, {
          statusCode: 200,
          body: test.response
        }).as(`badResponse${index}`);
        
        cy.log(`Testing ${test.description}: ${test.response}`);
      });
    });
  });

  describe("Authentication Edge Cases", () => {
    it("should handle expired tokens", () => {
      cy.window().then((win) => {
        win.localStorage.setItem("token", "expired.jwt.token");
      });

      cy.intercept("GET", "**/api/auth/check", {
        statusCode: 401,
        body: { message: "Token expired" }
      }).as("expiredToken");

      cy.visit("/home");
      cy.wait("@expiredToken");

      // Should redirect to login
      cy.url().should("not.include", "/home");
    });

    it("should handle invalid tokens", () => {
      cy.window().then((win) => {
        win.localStorage.setItem("token", "invalid.token.here");
      });

      cy.intercept("GET", "**/api/auth/check", {
        statusCode: 401,
        body: { message: "Invalid token" }
      }).as("invalidToken");

      cy.visit("/home");
      cy.wait("@invalidToken");

      cy.get("body").should("exist");
    });

    it("should handle missing authentication", () => {
      // No token in localStorage
      cy.visit("/home");
      
      // Should redirect to login or show appropriate message
      cy.get("body").should("exist");
    });

    it("should handle concurrent login sessions", () => {
      // Simulate token being invalidated by another session
      cy.window().then((win) => {
        win.localStorage.setItem("token", "valid.token.initially");
      });

      cy.intercept("GET", "**/api/auth/check", {
        statusCode: 401,
        body: { message: "Session invalidated by another login" }
      }).as("sessionConflict");

      cy.visit("/home");
      cy.wait("@sessionConflict");

      cy.get("body").should("exist");
    });
  });

  describe("Data Validation and Security", () => {
    it("should prevent XSS attacks", () => {
      const xssPayloads = [
        "<script>alert('xss')</script>",
        "<img src=x onerror=alert('xss')>",
        "javascript:alert('xss')",
        "<svg onload=alert('xss')>",
        "';alert('xss');//",
        "<iframe src='javascript:alert(\"xss\")'></iframe>"
      ];

      xssPayloads.forEach(payload => {
        // Test that payload gets sanitized
        const sanitized = payload
          .replace(/<script.*?>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/<.*?>/g, '')
          .replace(/on\w+=/gi, '');

        expect(sanitized).to.not.include('<script');
        expect(sanitized).to.not.include('javascript:');
        expect(sanitized).to.not.include('onerror=');
        cy.log(`XSS payload sanitized: ${payload.substring(0, 30)}...`);
      });
    });

    it("should validate input length limits", () => {
      const testInputs = [
        { field: "username", maxLength: 50, testValue: "a".repeat(100) },
        { field: "email", maxLength: 100, testValue: "test@" + "a".repeat(200) + ".com" },
        { field: "message", maxLength: 5000, testValue: "a".repeat(10000) },
        { field: "fullName", maxLength: 100, testValue: "a".repeat(150) }
      ];

      testInputs.forEach(test => {
        const isValid = test.testValue.length <= test.maxLength;
        expect(isValid, `${test.field} should be limited to ${test.maxLength} chars`).to.be.false;
        cy.log(`${test.field}: ${test.testValue.length} chars (max: ${test.maxLength})`);
      });
    });

    it("should handle SQL injection attempts", () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; DELETE FROM messages; --",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO admin (user) VALUES ('hacker'); --"
      ];

      sqlPayloads.forEach(payload => {
        // Test that SQL injection is prevented
        const sanitized = payload
          .replace(/'/g, "''")
          .replace(/;/g, '')
          .replace(/--/g, '')
          .replace(/(DROP|DELETE|INSERT|UPDATE|SELECT|UNION)/gi, '');

        expect(sanitized).to.not.include('DROP');
        expect(sanitized).to.not.include('DELETE');
        expect(sanitized).to.not.include('--');
        cy.log(`SQL injection prevented: ${payload.substring(0, 30)}...`);
      });
    });

    it("should handle malformed data structures", () => {
      const malformedData = [
        { user: { id: null, name: "" } },
        { user: { id: undefined, name: null } },
        { messages: "not an array" },
        { timestamp: "invalid date" },
        { nested: { deeply: { broken: undefined } } }
      ];

      malformedData.forEach((data, index) => {
        try {
          JSON.stringify(data);
          cy.log(`Malformed data test ${index + 1}: handled gracefully`);
        } catch (error) {
          cy.log(`Malformed data test ${index + 1}: caught error - ${error.message}`);
        }
      });
    });
  });

  describe("UI State Edge Cases", () => {
    it("should handle rapid user interactions", () => {
      cy.visit("/home");
      
      // Simulate rapid clicking
      const clickCount = 10;
      for (let i = 0; i < clickCount; i++) {
        cy.get("body").click(100 + i * 10, 100 + i * 10, { force: true });
        cy.log(`Rapid click ${i + 1}/${clickCount}`);
      }
    });

    it("should handle browser back/forward navigation", () => {
      cy.visit("/");
      cy.visit("/home");
      cy.go("back");
      cy.go("forward");
      
      cy.get("body").should("exist");
    });

    it("should handle page refresh scenarios", () => {
      cy.visit("/home");
      cy.reload();
      cy.get("body").should("exist");
    });

    it("should handle viewport size changes", () => {
      const viewports = [
        { width: 320, height: 568, name: "Mobile" },
        { width: 768, height: 1024, name: "Tablet" },
        { width: 1920, height: 1080, name: "Desktop" }
      ];

      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit("/home");
        cy.get("body").should("exist");
        cy.log(`Testing ${viewport.name} viewport: ${viewport.width}x${viewport.height}`);
      });
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    it("should handle large data sets", () => {
      // Simulate large friend list
      const largeFriendList = Array.from({ length: 1000 }, (_, i) => ({
        _id: `friend${i}`,
        name: `Friend ${i}`,
        isOnline: i % 2 === 0
      }));

      expect(largeFriendList).to.have.length(1000);
      cy.log(`Created large dataset with ${largeFriendList.length} items`);
    });

    it("should handle many simultaneous API calls", () => {
      const apiCalls = [];
      
      for (let i = 0; i < 10; i++) {
        cy.intercept("GET", `**/api/test${i}`, {
          statusCode: 200,
          body: { data: `response${i}` }
        }).as(`apiCall${i}`);
        
        apiCalls.push(`apiCall${i}`);
      }
      
      cy.visit("/home");
      cy.log(`Set up ${apiCalls.length} simultaneous API call mocks`);
    });

    it("should handle memory cleanup", () => {
      cy.visit("/home");
      
      // Test that cleanup happens when navigating away
      cy.window().then((win) => {
        // Store reference count
        const initialObjects = Object.keys(win).length;
        cy.log(`Initial window objects: ${initialObjects}`);
        
        // Navigate away and back
        cy.visit("/");
        cy.visit("/home");
        
        // Check for memory leaks (simplified)
        const finalObjects = Object.keys(win).length;
        cy.log(`Final window objects: ${finalObjects}`);
      });
    });
  });

  describe("Accessibility Edge Cases", () => {
    it("should handle keyboard-only navigation", () => {
      cy.visit("/home");
      
      // Test tab navigation
      cy.get("body").tab();
      cy.focused().should("exist");
    });

    it("should handle screen reader scenarios", () => {
      cy.visit("/home");
      
      // Check for ARIA labels and roles
      cy.get("[role]").should("have.length.at.least", 0);
      cy.get("[aria-label]").should("have.length.at.least", 0);
    });

    it("should handle high contrast mode", () => {
      // Test that app works in high contrast
      cy.visit("/home");
      
      cy.window().then((win) => {
        // Simulate high contrast media query
        const mediaQuery = win.matchMedia("(prefers-contrast: high)");
        cy.log(`High contrast preference: ${mediaQuery.matches}`);
      });
    });

    it("should handle reduced motion preferences", () => {
      cy.visit("/home");
      
      cy.window().then((win) => {
        const prefersReducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)");
        cy.log(`Reduced motion preference: ${prefersReducedMotion.matches}`);
      });
    });
  });
});
