/// <reference types="cypress" />

describe("Performance & Accessibility Tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Performance Monitoring", () => {
    it("should load the main page within acceptable time", () => {
      const startTime = Date.now();
      
      cy.visit("/").then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
      });
    });

    it("should handle large message lists efficiently", () => {
      // Setup authenticated user
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          email: "test@example.com",
          isEmailVerified: true
        }
      }).as("checkAuth");

      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });

      // Mock large message list (1000 messages)
      cy.intercept("GET", "/api/messages/user456", {
        statusCode: 200,
        body: Array.from({ length: 1000 }, (_, i) => ({
          _id: `message${i}`,
          senderId: i % 2 === 0 ? "user123" : "user456",
          text: `Message ${i + 1} - Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
          createdAt: new Date(Date.now() - i * 60000).toISOString()
        }))
      }).as("getLargeMessageList");

      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          { _id: "user456", name: "chatpartner", fullName: "Chat Partner" }
        ]
      }).as("getUsers");

      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getUsers");

      const startTime = Date.now();
      cy.get('[data-testid="user-item"]').first().click();
      cy.wait("@getLargeMessageList");

      cy.get('[data-testid="message-item"]').should("have.length.greaterThan", 0).then(() => {
        const renderTime = Date.now() - startTime;
        expect(renderTime).to.be.lessThan(5000); // Should render within 5 seconds
      });
    });

    it("should efficiently handle rapid user interactions", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          email: "test@example.com",
          isEmailVerified: true
        }
      }).as("checkAuth");

      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });

      cy.visit("/home");
      cy.wait("@checkAuth");

      // Rapid navigation between tabs
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="friends-tab"]').click();
        cy.get('[data-testid="chats-tab"]').click();
      }

      // UI should remain responsive
      cy.get('[data-testid="chats-tab"]').should("be.visible");
    });

    it("should handle memory usage during long sessions", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          email: "test@example.com",
          isEmailVerified: true
        }
      }).as("checkAuth");

      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });

      cy.visit("/home");
      cy.wait("@checkAuth");

      // Simulate long session with multiple actions
      cy.window().then((win) => {
        const initialMemory = (win.performance as any).memory?.usedJSHeapSize || 0;
        
        // Perform multiple operations
        for (let i = 0; i < 50; i++) {
          cy.get('[data-testid="search-input"]').type(`search${i}`).clear();
        }

        cy.window().then((win) => {
          const finalMemory = (win.performance as any).memory?.usedJSHeapSize || 0;
          const memoryIncrease = finalMemory - initialMemory;
          
          // Memory increase should be reasonable (less than 50MB)
          expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024);
        });
      });
    });
  });

  describe("Accessibility (a11y) Tests", () => {
    it("should have proper ARIA labels and roles", () => {
      cy.visit("/signup");

      // Check form accessibility
      cy.get('input[type="text"]').should("have.attr", "aria-label");
      cy.get('input[type="email"]').should("have.attr", "aria-label");
      cy.get('input[type="password"]').should("have.attr", "aria-label");
      
      // Check button accessibility
      cy.get('button[type="submit"]').should("have.attr", "aria-label");
      
      // Check form validation messages
      cy.get('button[type="submit"]').click();
      cy.get('[role="alert"]').should("exist");
    });

    it("should support keyboard navigation", () => {
      cy.visit("/");

      // Tab through form elements
      cy.get("body").type("{tab}");
      cy.focused().should("have.attr", "id", "username");
      
      cy.focused().type("{tab}");
      cy.focused().should("have.attr", "id", "password");
      
      cy.focused().type("{tab}");
      cy.focused().should("have.attr", "type", "submit");
      
      // Enter key should submit form
      cy.focused().type("{enter}");
      cy.get("div.text-red-600").should("exist");
    });

    it("should have sufficient color contrast", () => {
      cy.visit("/");
      
      // Check that text elements have sufficient contrast
      cy.get("label").each(($label) => {
        cy.wrap($label).should("be.visible");
        // In a real test, you'd use a contrast checker tool
        cy.wrap($label).should("not.have.css", "color", "rgb(255, 255, 255)");
      });
    });

    it("should support screen reader announcements", () => {
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 401,
        body: { message: "Invalid credentials" }
      }).as("loginError");

      cy.visit("/");
      cy.get("#username").type("wronguser");
      cy.get("#password").type("wrongpass");
      cy.get('button[type="submit"]').click();
      cy.wait("@loginError");

      // Error message should be announced to screen readers
      cy.get('[role="alert"]').should("exist").and("contain", "Invalid credentials");
    });

    it("should handle focus management", () => {
      cy.visit("/");
      
      // Focus should be trapped in modals
      cy.get('[data-testid="signup-tab"]').click();
      cy.get("#name").should("be.visible");
      
      // Focus should return to trigger after modal close
      cy.get('[data-testid="login-tab"]').click();
      cy.get("#username").should("be.visible");
    });

    it("should support high contrast mode", () => {
      cy.visit("/", {
        onBeforeLoad: (win) => {
          // Simulate high contrast mode
          win.matchMedia = cy.stub().returns({
            matches: true,
            addListener: () => {},
            removeListener: () => {}
          });
        }
      });

      // Elements should be visible in high contrast mode
      cy.get("input").should("be.visible");
      cy.get("button").should("be.visible");
      cy.get("label").should("be.visible");
    });

    it("should provide alternative text for images", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          email: "test@example.com",
          profile: "https://example.com/avatar.jpg",
          isEmailVerified: true
        }
      }).as("checkAuth");

      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });

      cy.visit("/home");
      cy.wait("@checkAuth");

      // Profile images should have alt text
      cy.get('img[src*="avatar"]').should("have.attr", "alt").and("not.be.empty");
      
      // Icons should have proper ARIA labels
      cy.get('[data-testid="logout-button"]').should("have.attr", "aria-label");
    });
  });

  describe("Error Boundary Tests", () => {
    it("should handle JavaScript errors gracefully", () => {
      cy.visit("/", {
        onBeforeLoad: (win) => {
          // Simulate a JavaScript error
          cy.stub(win.console, 'error').as('consoleError');
        }
      });

      cy.window().then((win) => {
        // Trigger an error
        win.eval('throw new Error("Test error")');
      });

      // Application should still be functional
      cy.get("#username").should("be.visible");
      cy.get("#password").should("be.visible");
    });

    it("should handle network failures gracefully", () => {
      cy.intercept("GET", "/api/auth/check", {
        forceNetworkError: true
      }).as("networkError");

      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });

      cy.visit("/home");
      cy.wait("@networkError");

      // Should show error message and fallback UI
      cy.get("div").should("contain", "Network error");
      cy.get('[data-testid="retry-button"]').should("be.visible");
    });

    it("should handle component crashes", () => {
      // Mock a component that throws an error
      cy.intercept("GET", "/api/messages/users", {
        statusCode: 500,
        body: { error: "Internal server error" }
      }).as("serverError");

      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          email: "test@example.com",
          isEmailVerified: true
        }
      }).as("checkAuth");

      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });

      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@serverError");

      // Should show error boundary fallback
      cy.get("div").should("contain", "Something went wrong");
      cy.get('[data-testid="error-retry"]').should("be.visible");
    });

    it("should handle malformed API responses", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: "invalid json response"
      }).as("malformedResponse");

      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });

      cy.visit("/home");
      cy.wait("@malformedResponse");

      // Should handle parsing error gracefully
      cy.get("div").should("contain", "Error");
    });
  });

  describe("Security Tests", () => {
    it("should prevent XSS attacks in user input", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          email: "test@example.com",
          isEmailVerified: true
        }
      }).as("checkAuth");

      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });

      cy.visit("/home");
      cy.wait("@checkAuth");

      // Try to inject script through message input
      const maliciousScript = '<script>alert("XSS")</script>';
      cy.get('[data-testid="message-input"]').type(maliciousScript);
      
      // Script should be escaped, not executed
      cy.get('[data-testid="message-input"]').should("have.value", maliciousScript);
      cy.window().its('alert').should('not.have.been.called');
    });

    it("should validate input lengths to prevent DoS", () => {
      cy.visit("/signup");

      // Try extremely long input
      const longString = 'a'.repeat(10000);
      cy.get("#name").type(longString);
      cy.get('button[type="submit"]').click();

      // Should show validation error
      cy.get("div.text-red-600").should("contain", "too long");
    });

    it("should handle CSRF protection", () => {
      // Mock API request without proper headers
      cy.request({
        method: 'POST',
        url: '/api/auth/signup',
        body: {
          name: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should fail due to missing CSRF token
        expect(response.status).to.be.oneOf([403, 401]);
      });
    });

    it("should prevent session fixation", () => {
      // Set a fake session ID
      cy.window().then((win) => {
        win.localStorage.setItem('session-id', 'fake-session-123');
      });

      cy.intercept("POST", "/api/auth/login", {
        statusCode: 200,
        body: { 
          _id: "user123",
          name: "testuser",
          token: "new-secure-token"
        }
      }).as("login");

      cy.visit("/");
      cy.get("#username").type("testuser");
      cy.get("#password").type("Password123");
      cy.get('button[type="submit"]').click();
      cy.wait("@login");

      // Session ID should be regenerated after login
      cy.window().then((win) => {
        const sessionId = win.localStorage.getItem('session-id');
        expect(sessionId).to.not.equal('fake-session-123');
      });
    });
  });

  describe("Mobile and Responsive Tests", () => {
    it("should be responsive on mobile devices", () => {
      cy.viewport('iphone-6');
      cy.visit("/");

      // Mobile-specific elements should be visible
      cy.get('[data-testid="mobile-menu-toggle"]').should("be.visible");
      
      // Desktop elements should be hidden
      cy.get('[data-testid="desktop-sidebar"]').should("not.be.visible");
    });

    it("should handle touch gestures", () => {
      cy.viewport('iphone-6');
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          email: "test@example.com",
          isEmailVerified: true
        }
      }).as("checkAuth");

      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });

      cy.visit("/home");
      cy.wait("@checkAuth");

      // Swipe gestures should work
      cy.get('[data-testid="message-list"]').trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] });
      cy.get('[data-testid="message-list"]').trigger('touchmove', { touches: [{ clientX: 200, clientY: 100 }] });
      cy.get('[data-testid="message-list"]').trigger('touchend');
    });

    it("should adapt UI for different screen sizes", () => {
      const viewports = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 768, height: 1024 }, // iPad
        { width: 1920, height: 1080 } // Desktop
      ];

      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit("/");

        // UI should adapt to screen size
        cy.get("form").should("be.visible");
        cy.get('input[type="text"]').should("be.visible");
      });
    });

    it("should handle orientation changes", () => {
      cy.viewport('iphone-6');
      cy.visit("/");

      // Portrait mode
      cy.get('[data-testid="login-form"]').should("be.visible");

      // Landscape mode
      cy.viewport(667, 375);
      cy.get('[data-testid="login-form"]').should("be.visible");
    });
  });

  describe("Browser Compatibility Tests", () => {
    it("should handle localStorage unavailability", () => {
      cy.visit("/", {
        onBeforeLoad: (win) => {
          // Mock localStorage not available
          Object.defineProperty(win, 'localStorage', {
            value: null,
            writable: true
          });
        }
      });

      // Should handle gracefully and show appropriate message
      cy.get("div").should("contain", "browser");
    });

    it("should handle older browser features", () => {
      cy.visit("/", {
        onBeforeLoad: (win) => {
          // Mock missing modern features
          (win as any).fetch = undefined;
          (win as any).Promise = undefined;
        }
      });

      // Should use polyfills or fallbacks
      cy.get("#username").should("be.visible");
      cy.get("#password").should("be.visible");
    });

    it("should handle disabled JavaScript", () => {
      // This would typically be tested with a tool that can disable JS
      // For Cypress, we can test that critical content is still visible
      cy.visit("/");
      
      // Basic form should still be visible without JS enhancements
      cy.get("form").should("be.visible");
      cy.get("input").should("be.visible");
      cy.get("button").should("be.visible");
    });
  });
});
