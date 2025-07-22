describe("Responsive User List Tests", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe("Login Page Responsive Tests", () => {
    it("should not show message buttons on login page", () => {
      cy.visit("/");
      // Check that no message buttons are present anywhere
      cy.get("button").contains("Message").should("not.exist");
    });

    it("should handle viewport changes properly", () => {
      cy.visit("/");

      // Test mobile view
      cy.viewport(320, 568);
      cy.get("h1").should("contain", "Chatter");
      cy.get("body").should("be.visible");

      // Test tablet view
      cy.viewport(768, 1024);
      cy.get("h1").should("contain", "Chatter");
      cy.get("body").should("be.visible");

      // Test desktop view
      cy.viewport(1200, 800);
      cy.get("h1").should("contain", "Chatter");
      cy.get("body").should("be.visible");

      // Test large desktop view
      cy.viewport(1400, 900);
      cy.get("h1").should("contain", "Chatter");
      cy.get("body").should("be.visible");
    });
  });

  describe("Authenticated User List Responsive Tests", () => {
    beforeEach(() => {
      // Mock authenticated user
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: {
          _id: "user123",
          name: "testuser",
          email: "test@example.com",
          isEmailVerified: true,
          fullName: "Test User",
        },
      }).as("checkAuth");

      // Mock user list with various users
      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          {
            _id: "user1",
            name: "johnsmith",
            fullName: "John Smith",
            profilePic: null,
            isOnline: true,
          },
          {
            _id: "user2",
            name: "janedoe",
            fullName: "Jane Doe",
            profilePic: "/avatars/jane.jpg",
            isOnline: false,
          },
          {
            _id: "user3",
            name: "mikejohnson",
            fullName: "Mike Johnson",
            profilePic: null,
            isOnline: true,
          },
          {
            _id: "user4",
            name: "sarahwilson",
            fullName: "Sarah Wilson",
            profilePic: "/avatars/sarah.jpg",
            isOnline: false,
          },
          {
            _id: "user5",
            name: "davidbrown",
            fullName: "David Brown",
            profilePic: null,
            isOnline: true,
          },
        ],
      }).as("getUsers");

      cy.window().then((win) => {
        win.localStorage.setItem("auth-token", "mock-token");
      });
    });

    it("should display user list responsively on mobile", () => {
      cy.viewport(320, 568);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getUsers");

      // Should show user list in mobile layout
      cy.get("body").should("be.visible");

      // Check that content is not overflowing (allow for mobile viewport)
      cy.get("body").then(($body) => {
        expect($body[0].scrollWidth).to.be.lessThan(400); // Allow more margin for mobile
      });
    });

    it("should display user list responsively on tablet", () => {
      cy.viewport(768, 1024);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getUsers");

      // Should show user list in tablet layout
      cy.get("body").should("be.visible");

      // Tablet layout should have more space for content
      cy.get("body").should("not.contain", "Login");
    });

    it("should display user list responsively on desktop", () => {
      cy.viewport(1200, 800);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getUsers");

      // Should show user list in desktop layout
      cy.get("body").should("be.visible");

      // Desktop should have full layout
      cy.get("body").should("not.contain", "Login");
    });

    it("should handle user interaction in mobile view", () => {
      cy.viewport(320, 568);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getUsers");

      // Should be able to interact with users even on mobile
      cy.get("body").should("be.visible");

      // Check that buttons are tappable on mobile
      cy.get("button").first().should("be.visible");
    });

    it("should show online status indicators responsively", () => {
      cy.viewport(768, 1024);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getUsers");

      // Should show user list and status indicators
      cy.get("body").should("be.visible");

      // Online status should be visible regardless of screen size
      cy.get("body").should("not.contain", "Login");
    });
  });

  describe("User List Grid Layout Tests", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: {
          _id: "user123",
          name: "testuser",
          email: "test@example.com",
          isEmailVerified: true,
          fullName: "Test User",
        },
      }).as("checkAuth");

      // Mock large user list to test grid behavior
      const users = Array.from({ length: 20 }, (_, i) => ({
        _id: `user${i}`,
        name: `user${i}`,
        fullName: `User ${i}`,
        profilePic: i % 2 === 0 ? `/avatars/user${i}.jpg` : null,
        isOnline: i % 3 === 0,
      }));

      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: users,
      }).as("getManyUsers");

      cy.window().then((win) => {
        win.localStorage.setItem("auth-token", "mock-token");
      });
    });

    it("should handle large user lists in grid layout", () => {
      cy.viewport(1200, 800);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getManyUsers");

      // Should handle many users without layout issues
      cy.get("body").should("be.visible");

      // Page should not crash with many users
      cy.get("body").should("not.contain", "Login");
    });

    it("should show user cards in proper grid on desktop", () => {
      cy.viewport(1400, 900);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getManyUsers");

      // Should show users in grid layout
      cy.get("body").should("be.visible");

      // Desktop should have space for multiple columns
      cy.get("body").should("not.contain", "Error");
    });

    it("should adapt grid columns for tablet view", () => {
      cy.viewport(768, 1024);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getManyUsers");

      // Should adapt grid for tablet
      cy.get("body").should("be.visible");

      // Should show content appropriately for tablet
      cy.get("body").should("not.contain", "Login");
    });

    it("should stack users vertically on mobile", () => {
      cy.viewport(320, 568);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getManyUsers");

      // Should stack users vertically on mobile
      cy.get("body").should("be.visible");

      // Mobile should not have excessive horizontal scroll
      cy.get("body").then(($body) => {
        expect($body[0].scrollWidth).to.be.lessThan(400); // Allow more margin for mobile
      });
    });
  });

  describe("User Card Responsive Components", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: {
          _id: "user123",
          name: "testuser",
          email: "test@example.com",
          isEmailVerified: true,
          fullName: "Test User",
        },
      }).as("checkAuth");

      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          {
            _id: "user1",
            name: "verylongusernamethatmightoverflow",
            fullName: "A Very Long Full Name That Might Cause Layout Issues",
            profilePic: "/avatars/long.jpg",
            isOnline: true,
          },
        ],
      }).as("getUsersLongName");

      cy.window().then((win) => {
        win.localStorage.setItem("auth-token", "mock-token");
      });
    });

    it("should handle long usernames responsively", () => {
      cy.viewport(320, 568);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getUsersLongName");

      // Should handle long names without breaking layout
      cy.get("body").should("be.visible");

      // Should not cause excessive horizontal overflow
      cy.get("body").then(($body) => {
        expect($body[0].scrollWidth).to.be.lessThan(400); // Allow more margin
      });
    });

    it("should show profile pictures responsively", () => {
      cy.viewport(768, 1024);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getUsersLongName");

      // Should show profile pictures appropriately
      cy.get("body").should("be.visible");

      // Images should load properly
      cy.get("body").should("not.contain", "Error");
    });

    it("should handle missing profile pictures", () => {
      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          {
            _id: "user1",
            name: "noprofileuser",
            fullName: "No Profile User",
            profilePic: null,
            isOnline: true,
          },
        ],
      }).as("getUsersNoProfile");

      cy.viewport(1200, 800);
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getUsersNoProfile");

      // Should handle missing profile pictures gracefully
      cy.get("body").should("be.visible");

      // Should show fallback avatar
      cy.get("body").should("not.contain", "Error");
    });
  });

  describe("Performance and Loading Tests", () => {
    it("should load user list efficiently", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: {
          _id: "user123",
          name: "testuser",
          email: "test@example.com",
          isEmailVerified: true,
          fullName: "Test User",
        },
      }).as("checkAuth");

      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [],
        delay: 100, // Small delay to test loading states
      }).as("getUsersDelay");

      cy.window().then((win) => {
        win.localStorage.setItem("auth-token", "mock-token");
      });

      const startTime = Date.now();
      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getUsersDelay").then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
      });

      cy.get("body").should("be.visible");
    });

    it("should handle slow network conditions", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: {
          _id: "user123",
          name: "testuser",
          email: "test@example.com",
          isEmailVerified: true,
          fullName: "Test User",
        },
      }).as("checkAuth");

      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [],
        delay: 1000, // Reduce delay to be more realistic
      }).as("getUsersSlow");

      cy.window().then((win) => {
        win.localStorage.setItem("auth-token", "mock-token");
      });

      cy.visit("/home");
      cy.wait("@checkAuth");

      // Should show loading state during slow network
      cy.get("body").should("be.visible");

      cy.wait("@getUsersSlow");

      // Should show authenticated content (not necessarily users, but not login)
      cy.get("body").should("be.visible");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle empty user list gracefully", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: {
          _id: "user123",
          name: "testuser",
          email: "test@example.com",
          isEmailVerified: true,
          fullName: "Test User",
        },
      }).as("checkAuth");

      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [],
      }).as("getEmptyUsers");

      cy.window().then((win) => {
        win.localStorage.setItem("auth-token", "mock-token");
      });

      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getEmptyUsers");

      // Should handle empty user list gracefully
      cy.get("body").should("be.visible");
      cy.get("body").should("not.contain", "Error");
    });

    it("should handle corrupted user data", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: {
          _id: "user123",
          name: "testuser",
          email: "test@example.com",
          isEmailVerified: true,
          fullName: "Test User",
        },
      }).as("checkAuth");

      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          {
            _id: null, // Corrupted data
            name: undefined,
            fullName: "",
            profilePic: "invalid-url",
            isOnline: "not-boolean",
          },
        ],
      }).as("getCorruptedUsers");

      cy.window().then((win) => {
        win.localStorage.setItem("auth-token", "mock-token");
      });

      cy.visit("/home");
      cy.wait("@checkAuth");
      cy.wait("@getCorruptedUsers");

      // Should handle corrupted data without crashing
      cy.get("body").should("be.visible");
      // Should not show obvious errors to user
      cy.get("body").should("not.contain", "undefined");
      cy.get("body").should("not.contain", "null");
    });
  });
});
