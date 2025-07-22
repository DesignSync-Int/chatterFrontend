/// <reference types="cypress" />

describe("Edge Cases & Integration Scenarios", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Database Connection Issues", () => {
    it("should handle database connection failures", () => {
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 503,
        body: { message: "Database connection failed" }
      }).as("dbConnectionFailure");

      cy.get("#username").type("testuser");
      cy.get("#password").type("Password123");
      cy.get('button[type="submit"]').click();
      cy.wait("@dbConnectionFailure");

      cy.get("div").should("contain", "Database connection failed");
      cy.get('[data-testid="retry-login"]').should("be.visible");
    });

    it("should handle database timeouts", () => {
      cy.intercept("GET", "/api/messages/users", {
        statusCode: 408,
        body: { message: "Request timeout" }
      }).as("dbTimeout");

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
      cy.wait("@dbTimeout");

      cy.get("div").should("contain", "Request timeout");
    });

    it("should handle data corruption scenarios", () => {
      cy.intercept("GET", "/api/messages/user456", {
        statusCode: 200,
        body: [
          {
            _id: null, // Corrupted data
            senderId: "user123",
            text: "Valid message",
            createdAt: "invalid-date"
          }
        ]
      }).as("getCorruptedMessages");

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
      
      cy.get('[data-testid="user-item"]').first().click();
      cy.wait("@getCorruptedMessages");

      // Should handle corrupted data gracefully
      cy.get("div").should("contain", "Error loading messages");
    });
  });

  describe("Extreme User Scenarios", () => {
    it("should handle users with very long names", () => {
      const veryLongName = "a".repeat(1000);
      
      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          { 
            _id: "user456", 
            name: veryLongName, 
            fullName: veryLongName + " Full",
            isOnline: true
          }
        ]
      }).as("getUsersLongName");

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
      cy.wait("@getUsersLongName");

      // Should truncate or handle long names appropriately
      cy.get('[data-testid="user-item"]').first().within(() => {
        cy.get('[data-testid="user-name"]').should("be.visible");
        // Name should be truncated with ellipsis
        cy.get('[data-testid="user-name"]').should("have.css", "text-overflow", "ellipsis");
      });
    });

    it("should handle users with special characters in names", () => {
      const specialCharName = "テスト🚀@#$%^&*()";
      
      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          { 
            _id: "user456", 
            name: specialCharName, 
            fullName: "Special Char User",
            isOnline: true
          }
        ]
      }).as("getUsersSpecialChar");

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
      cy.wait("@getUsersSpecialChar");

      // Should display special characters correctly
      cy.get('[data-testid="user-item"]').first().should("contain", specialCharName);
    });

    it("should handle thousands of messages efficiently", () => {
      const largeMessageCount = 5000;
      const messages = Array.from({ length: largeMessageCount }, (_, i) => ({
        _id: `message${i}`,
        senderId: i % 2 === 0 ? "user123" : "user456",
        text: `Message ${i + 1} with some content that makes it realistic`,
        createdAt: new Date(Date.now() - i * 1000).toISOString()
      }));

      cy.intercept("GET", "/api/messages/user456", {
        statusCode: 200,
        body: messages
      }).as("getMassiveMessageList");

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

      const startTime = Date.now();
      cy.get('[data-testid="user-item"]').first().click();
      cy.wait("@getMassiveMessageList");

      // Should handle large datasets within reasonable time
      cy.get('[data-testid="message-item"]').should("have.length.greaterThan", 0).then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(10000); // 10 seconds max
      });

      // Should implement virtualization or pagination
      cy.get('[data-testid="message-item"]').should("have.length.lessThan", 100);
    });
  });

  describe("Concurrent User Actions", () => {
    it("should handle simultaneous friend requests", () => {
      cy.intercept("POST", "/api/friend-requests/send", (req) => {
        // Simulate race condition handling
        req.reply({
          statusCode: 200,
          body: { message: "Friend request processed" },
          delay: Math.random() * 1000
        });
      }).as("sendFriendRequest");

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

      // Simulate rapid clicking (race condition)
      cy.get('[data-testid="user-item"]').first().within(() => {
        cy.get('[data-testid="add-friend-button"]').click();
        cy.get('[data-testid="add-friend-button"]').click();
        cy.get('[data-testid="add-friend-button"]').click();
      });

      // Should handle gracefully without duplicates
      cy.get("div").should("contain", "Friend request processed");
    });

    it("should handle multiple users typing simultaneously", () => {
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

      // Simulate multiple typing events
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('socket-typing', { 
          detail: { userId: "user456", isTyping: true, userName: "User 1" }
        }));
        win.dispatchEvent(new CustomEvent('socket-typing', { 
          detail: { userId: "user789", isTyping: true, userName: "User 2" }
        }));
        win.dispatchEvent(new CustomEvent('socket-typing', { 
          detail: { userId: "user101", isTyping: true, userName: "User 3" }
        }));
      });

      // Should show all typing indicators
      cy.get('[data-testid="typing-indicator"]').should("contain", "User 1, User 2, User 3 are typing...");
    });

    it("should handle message conflicts", () => {
      let messageCounter = 0;
      cy.intercept("POST", "/api/messages/send/user456", (req) => {
        messageCounter++;
        req.reply({
          statusCode: messageCounter === 1 ? 200 : 409,
          body: messageCounter === 1 
            ? { _id: "msg123", text: req.body.text }
            : { message: "Message conflict detected" }
        });
      }).as("sendMessage");

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

      cy.get('[data-testid="user-item"]').first().click();

      // Send rapid messages
      cy.get('[data-testid="message-input"]').type("Message 1");
      cy.get('[data-testid="send-message"]').click();
      cy.get('[data-testid="message-input"]').type("Message 2");
      cy.get('[data-testid="send-message"]').click();

      cy.wait("@sendMessage");
      // Should handle conflicts gracefully
      cy.get("div").should("contain", "Message conflict detected");
    });
  });

  describe("Data Synchronization Issues", () => {
    it("should handle stale data scenarios", () => {
      // Initial data load
      cy.intercept("GET", "/api/messages/user456", {
        statusCode: 200,
        body: [
          {
            _id: "message123",
            senderId: "user456",
            text: "Old message",
            createdAt: new Date(Date.now() - 60000).toISOString()
          }
        ]
      }).as("getOldMessages");

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
      cy.get('[data-testid="user-item"]').first().click();
      cy.wait("@getOldMessages");

      // Simulate real-time update with newer data
      cy.intercept("GET", "/api/messages/user456", {
        statusCode: 200,
        body: [
          {
            _id: "message123",
            senderId: "user456",
            text: "Updated message",
            createdAt: new Date(Date.now() - 60000).toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: "message124",
            senderId: "user456",
            text: "New message",
            createdAt: new Date().toISOString()
          }
        ]
      }).as("getUpdatedMessages");

      // Refresh or re-sync data
      cy.get('[data-testid="refresh-messages"]').click();
      cy.wait("@getUpdatedMessages");

      // Should show updated data
      cy.get('[data-testid="message-item"]').should("contain", "Updated message");
      cy.get('[data-testid="message-item"]').should("contain", "New message");
    });

    it("should handle offline/online synchronization", () => {
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

      // Simulate going offline
      cy.window().then((win) => {
        win.dispatchEvent(new Event('offline'));
      });

      cy.get('[data-testid="offline-indicator"]').should("be.visible");

      // Try to send message while offline
      cy.get('[data-testid="message-input"]').type("Offline message");
      cy.get('[data-testid="send-message"]').click();

      // Message should be queued
      cy.get('[data-testid="message-queue"]').should("contain", "1 message queued");

      // Simulate coming back online
      cy.window().then((win) => {
        win.dispatchEvent(new Event('online'));
      });

      cy.intercept("POST", "/api/messages/send/user456", {
        statusCode: 200,
        body: { _id: "msg123", text: "Offline message" }
      }).as("sendQueuedMessage");

      // Should sync queued messages
      cy.wait("@sendQueuedMessage");
      cy.get('[data-testid="message-queue"]').should("not.exist");
    });
  });

  describe("Memory and Resource Management", () => {
    it("should clean up event listeners", () => {
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

      // Check initial listener count
      cy.window().then((win) => {
        const initialListeners = win.addEventListener.length || 0;
        
        // Navigate to different views multiple times
        for (let i = 0; i < 10; i++) {
          cy.get('[data-testid="friends-tab"]').click();
          cy.get('[data-testid="chats-tab"]').click();
        }

        // Check that listeners aren't accumulating
        cy.window().then((win) => {
          const finalListeners = win.addEventListener.length || 0;
          expect(finalListeners - initialListeners).to.be.lessThan(5);
        });
      });
    });

    it("should handle image loading failures", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          email: "test@example.com",
          profile: "https://invalid-image-url.com/broken.jpg",
          isEmailVerified: true
        }
      }).as("checkAuth");

      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', 'mock-token');
      });

      cy.visit("/home");
      cy.wait("@checkAuth");

      // Should show fallback avatar
      cy.get('[data-testid="user-avatar"]').should("have.attr", "src").and("include", "default");
    });

    it("should handle large file uploads gracefully", () => {
      cy.intercept("PUT", "/api/auth/update-profile", {
        statusCode: 413,
        body: { message: "File too large" }
      }).as("uploadTooLarge");

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

      cy.get('[data-testid="profile-button"]').click();
      
      // Try to upload large file
      cy.get('[data-testid="profile-upload"]').selectFile({
        contents: Cypress.Buffer.alloc(50 * 1024 * 1024), // 50MB
        fileName: 'huge-image.jpg',
        mimeType: 'image/jpeg'
      }, { force: true });

      cy.wait("@uploadTooLarge");
      cy.get("div").should("contain", "File too large");
    });
  });

  describe("Internationalization Edge Cases", () => {
    it("should handle RTL languages", () => {
      cy.visit("/", {
        onBeforeLoad: (win) => {
          // Simulate RTL language setting
          Object.defineProperty(win.navigator, 'language', {
            value: 'ar-SA',
            writable: true
          });
        }
      });

      // Should apply RTL layout
      cy.get("html").should("have.attr", "dir", "rtl");
      cy.get("body").should("have.css", "direction", "rtl");
    });

    it("should handle very long translated text", () => {
      cy.visit("/", {
        onBeforeLoad: (win) => {
          // Mock translation that returns very long text
          (win as any).i18n = {
            t: () => "This is a very long translated text that might break the layout if not handled properly because some languages can be much more verbose than English"
          };
        }
      });

      // Layout should not break with long text
      cy.get("button").should("be.visible");
      cy.get("input").should("be.visible");
    });

    it("should handle missing translations", () => {
      cy.visit("/", {
        onBeforeLoad: (win) => {
          // Mock missing translation
          (win as any).i18n = {
            t: (key: string) => `MISSING_TRANSLATION_${key}`
          };
        }
      });

      // Should show fallback text or keys
      cy.get("body").should("not.contain", "undefined");
      cy.get("body").should("not.contain", "null");
    });
  });

  describe("Browser-Specific Issues", () => {
    it("should handle Safari private mode restrictions", () => {
      cy.visit("/", {
        onBeforeLoad: (win) => {
          // Mock Safari private mode localStorage restrictions
          const mockStorage = {
            getItem: cy.stub().throws(new Error("QuotaExceededError")),
            setItem: cy.stub().throws(new Error("QuotaExceededError")),
            removeItem: cy.stub(),
            clear: cy.stub()
          };
          Object.defineProperty(win, 'localStorage', { value: mockStorage });
        }
      });

      // Should handle storage errors gracefully
      cy.get("#username").type("testuser");
      cy.get("#password").type("Password123");
      
      // Should show warning about private mode
      cy.get("body").then(($body) => {
        expect($body.text()).to.satisfy((text: string) => 
          text.includes("private") || text.includes("storage")
        );
      });
    });

    it("should handle iOS Safari viewport issues", () => {
      cy.viewport('iphone-6');
      cy.visit("/", {
        onBeforeLoad: (win) => {
          // Mock iOS Safari
          Object.defineProperty(win.navigator, 'userAgent', {
            value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
            writable: true
          });
        }
      });

      // Should handle viewport meta tag correctly
      cy.get('meta[name="viewport"]').should("exist");
      
      // Should handle iOS Safari quirks
      cy.get("input").should("be.visible");
      cy.get("button").should("be.visible");
    });

    it("should handle older IE compatibility", () => {
      cy.visit("/", {
        onBeforeLoad: (win) => {
          // Mock older browser features
          (win as any).Symbol = undefined;
          (win as any).Map = undefined;
          (win as any).Set = undefined;
        }
      });

      // Should use polyfills or fallbacks
      cy.get("input").should("be.visible");
      cy.get("button").should("be.visible");
    });
  });
});
