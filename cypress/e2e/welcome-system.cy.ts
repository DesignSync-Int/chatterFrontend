describe("Welcome System E2E Tests", () => {
  beforeEach(() => {
    cy.visit("/");
    // Clear any existing data
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe("New User Welcome Flow", () => {
    it("should complete full welcome journey for new user registration", () => {
      const timestamp = Date.now();
      const testUser = {
        name: `welcomeuser${timestamp}`,
        fullName: `Welcome Test User ${timestamp}`,
        email: `welcometest${timestamp}@example.com`,
        password: "password123",
      };

      // Complete registration
      cy.get('[data-cy="signup-link"]').click();
      cy.url().should("include", "/signup");

      // Fill registration form
      cy.get('[data-cy="name-input"]').type(testUser.name);
      cy.get('[data-cy="full-name-input"]').type(testUser.fullName);
      cy.get('[data-cy="email-input"]').type(testUser.email);
      cy.get('[data-cy="password-input"]').type(testUser.password);
      cy.get('[data-cy="confirm-password-input"]').type(testUser.password);

      // Complete CAPTCHA (mock or skip based on test environment)
      cy.get('[data-cy="captcha-checkbox"]').check();

      // Submit registration
      cy.get('[data-cy="signup-button"]').click();

      // Wait for registration success
      cy.contains("Account created successfully", { timeout: 10000 });

      // Should navigate to home/chat page
      cy.url().should("include", "/home");

      // Verify user is logged in
      cy.get('[data-cy="user-profile"]').should("contain", testUser.name);
    });

    it("should show first login welcome message and trigger email", () => {
      const timestamp = Date.now();
      const testUser = {
        name: `firstlogin${timestamp}`,
        fullName: `First Login User ${timestamp}`,
        email: `firstlogin${timestamp}@example.com`,
        password: "password123",
      };

      // Register user first
      cy.registerUser(testUser);

      // Logout
      cy.get('[data-cy="logout-button"]').click();
      cy.url().should("include", "/login");

      // Login for the first time
      cy.get('[data-cy="name-input"]').type(testUser.name);
      cy.get('[data-cy="password-input"]').type(testUser.password);
      cy.get('[data-cy="login-button"]').click();

      // Should show first login welcome toast
      cy.contains(
        "Welcome to Chatter! 🎉 Check your email for the complete guide",
        { timeout: 5000 }
      );

      // Should navigate to home
      cy.url().should("include", "/home");
    });

    it("should show returning user welcome message on subsequent logins", () => {
      const timestamp = Date.now();
      const testUser = {
        name: `returning${timestamp}`,
        fullName: `Returning User ${timestamp}`,
        email: `returning${timestamp}@example.com`,
        password: "password123",
      };

      // Register and login once
      cy.registerUser(testUser);
      cy.loginUser(testUser);

      // Logout
      cy.get('[data-cy="logout-button"]').click();

      // Login again (second time)
      cy.get('[data-cy="name-input"]').type(testUser.name);
      cy.get('[data-cy="password-input"]').type(testUser.password);
      cy.get('[data-cy="login-button"]').click();

      // Should show returning user message
      cy.contains("Welcome back! 👋", { timeout: 5000 });

      // Should navigate to home
      cy.url().should("include", "/home");
    });
  });

  describe("ChatterBot Welcome Message", () => {
    it("should receive ChatterBot welcome message after first login", () => {
      const timestamp = Date.now();
      const testUser = {
        name: `chatbottest${timestamp}`,
        fullName: `ChatBot Test User ${timestamp}`,
        email: `chatbottest${timestamp}@example.com`,
        password: "password123",
      };

      // Register and login
      cy.registerUser(testUser);
      cy.loginUser(testUser);

      // Wait for page to load
      cy.url().should("include", "/home");

      // Wait for ChatterBot welcome message (with delay)
      cy.wait(3000);

      // Check for ChatterBot in friends/users list
      cy.get('[data-cy="users-list"]').should("contain", "ChatterBot");

      // Open chat with ChatterBot
      cy.get('[data-cy="user-item"]').contains("ChatterBot").click();

      // Verify welcome message content
      cy.get('[data-cy="chat-messages"]').within(() => {
        cy.contains(`Welcome to Chatter, ${testUser.fullName}!`, {
          timeout: 10000,
        });
        cy.contains("I'm ChatterBot, your AI assistant");
        cy.contains("Google Gemini");
        cy.contains("Real-time messaging with Socket.IO");
        cy.contains("Smart notifications");
        cy.contains("Created by Sachin Kumar");
        cy.contains("What would you like to know first?");
      });
    });

    it("should provide helpful ChatterBot welcome content", () => {
      const timestamp = Date.now();
      const testUser = {
        name: `helptest${timestamp}`,
        fullName: `Help Test User ${timestamp}`,
        email: `helptest${timestamp}@example.com`,
        password: "password123",
      };

      // Register and login
      cy.registerUser(testUser);
      cy.loginUser(testUser);

      // Open ChatterBot chat
      cy.get('[data-cy="user-item"]').contains("ChatterBot").click();

      // Wait for welcome message
      cy.wait(3000);

      // Verify comprehensive welcome content
      cy.get('[data-cy="chat-messages"]').within(() => {
        // Technology stack mentions
        cy.contains("React & TypeScript");
        cy.contains("AI-powered conversations");
        cy.contains("CAPTCHA protection");

        // Help sections
        cy.contains("How to use Chatter features");
        cy.contains("Technical details");
        cy.contains("Finding friends");
        cy.contains("Customizing your profile");

        // Call to action
        cy.contains('Type "help" anytime');
      });
    });

    it("should respond to help request with detailed information", () => {
      const timestamp = Date.now();
      const testUser = {
        name: `helpresponse${timestamp}`,
        fullName: `Help Response User ${timestamp}`,
        email: `helpresponse${timestamp}@example.com`,
        password: "password123",
      };

      // Register and login
      cy.registerUser(testUser);
      cy.loginUser(testUser);

      // Open ChatterBot chat
      cy.get('[data-cy="user-item"]').contains("ChatterBot").click();

      // Send help message
      cy.get('[data-cy="message-input"]').type("help");
      cy.get('[data-cy="send-button"]').click();

      // Wait for AI response
      cy.wait(5000);

      // Verify help response
      cy.get('[data-cy="chat-messages"]').within(() => {
        cy.contains("help", { timeout: 10000 }).should("exist");
      });
    });
  });

  describe("Guest User Welcome Experience", () => {
    it("should provide guest login with ChatterBot access", () => {
      // Click guest login
      cy.get('[data-cy="guest-login-button"]').click();

      // Should show guest success message
      cy.contains("Logged in as guest successfully", { timeout: 5000 });

      // Should navigate to home
      cy.url().should("include", "/home");

      // Should show guest user profile
      cy.get('[data-cy="user-profile"]').should("contain", "Guest_");

      // Should have ChatterBot as friend
      cy.get('[data-cy="users-list"]').should("contain", "ChatterBot");
    });

    it("should allow guest to chat with ChatterBot immediately", () => {
      // Guest login
      cy.get('[data-cy="guest-login-button"]').click();
      cy.url().should("include", "/home");

      // Open ChatterBot chat
      cy.get('[data-cy="user-item"]').contains("ChatterBot").click();

      // Send a message
      cy.get('[data-cy="message-input"]').type("Hello ChatterBot!");
      cy.get('[data-cy="send-button"]').click();

      // Wait for response
      cy.wait(5000);

      // Should receive AI response
      cy.get('[data-cy="chat-messages"]').within(() => {
        cy.contains("Hello ChatterBot!");
        // Should have AI response (content may vary)
        cy.get('[data-cy="message-item"]').should("have.length.greaterThan", 1);
      });
    });
  });

  describe("Help Page Integration", () => {
    it("should provide comprehensive help documentation", () => {
      // Navigate to help page
      cy.visit("/help");

      // Verify main content
      cy.contains("Chatter Help Center");
      cy.contains("Everything you need to know about using Chatter");

      // Check all sections are available
      const sections = [
        "Getting Started",
        "Platform Features",
        "Technology",
        "Troubleshooting",
        "Contact & Support",
      ];

      sections.forEach((section) => {
        cy.contains(section).should("be.visible");
      });
    });

    it("should navigate between help sections correctly", () => {
      cy.visit("/help");

      // Click Platform Features
      cy.contains("Platform Features").click();
      cy.contains("Amazing Features 🌟");
      cy.contains("AI-Powered ChatterBot");

      // Click Technology
      cy.contains("Technology").click();
      cy.contains("Built with Modern Tech 🛠️");
      cy.contains("React 19");
      cy.contains("Google Gemini AI");

      // Click Contact & Support
      cy.contains("Contact & Support").click();
      cy.contains("Get in Touch 📞");
      cy.contains("Sachin Kumar");
      cy.contains("full-stack developer");
    });

    it("should provide professional developer information", () => {
      cy.visit("/help");

      // Navigate to contact section
      cy.contains("Contact & Support").click();

      // Verify professional presentation
      cy.contains("About the Developer");
      cy.contains("Sachin Kumar");
      cy.contains("passionate full-stack developer");
      cy.contains("innovative web applications");
      cy.contains("modern development practices");
      cy.contains("AI integration");
      cy.contains("user-centric design");

      // Check professional tags
      cy.contains("Full-Stack Developer");
      cy.contains("AI Enthusiast");
      cy.contains("React Expert");

      // Verify contact information
      cy.contains("sachin@chatter.dev");
      cy.get('a[href="mailto:sachin@chatter.dev"]').should("exist");
    });

    it("should link back to main application", () => {
      cy.visit("/help");

      // Test back to app link
      cy.contains("← Back to Chatter").click();
      cy.url().should("not.include", "/help");

      // Test chat links
      cy.visit("/help");
      cy.contains("Chat with ChatterBot")
        .should("have.attr", "href")
        .and("include", "/chat");
    });
  });

  describe("Email System Integration (Mocked)", () => {
    it("should indicate welcome email functionality on first login", () => {
      // Note: This test assumes email service is mocked in test environment
      const timestamp = Date.now();
      const testUser = {
        name: `emailtest${timestamp}`,
        fullName: `Email Test User ${timestamp}`,
        email: `emailtest${timestamp}@example.com`,
        password: "password123",
      };

      // Register and login
      cy.registerUser(testUser);
      cy.loginUser(testUser);

      // Should show message indicating email was sent
      cy.contains("Check your email for the complete guide");

      // In real environment, would verify email was sent to test email service
      // For test environment, we verify the UI behavior
    });
  });

  describe("Smart Notification Integration", () => {
    it("should not show notifications when ChatterBot chat is active", () => {
      const timestamp = Date.now();
      const testUser = {
        name: `notificationtest${timestamp}`,
        fullName: `Notification Test User ${timestamp}`,
        email: `notificationtest${timestamp}@example.com`,
        password: "password123",
      };

      // Register and login
      cy.registerUser(testUser);
      cy.loginUser(testUser);

      // Open ChatterBot chat
      cy.get('[data-cy="user-item"]').contains("ChatterBot").click();

      // Send a message to trigger response
      cy.get('[data-cy="message-input"]').type("Hello!");
      cy.get('[data-cy="send-button"]').click();

      // Wait for AI response
      cy.wait(3000);

      // Verify that no toast notification appears for ChatterBot response
      // (since chat is active)
      cy.get(".toast-notification").should("not.exist");
    });
  });

  describe("Cross-browser Compatibility", () => {
    it("should work consistently across different screen sizes", () => {
      // Test mobile view
      cy.viewport(375, 667);
      cy.visit("/help");
      cy.contains("Chatter Help Center").should("be.visible");

      // Test tablet view
      cy.viewport(768, 1024);
      cy.contains("Platform Features").click();
      cy.contains("AI-Powered ChatterBot").should("be.visible");

      // Test desktop view
      cy.viewport(1920, 1080);
      cy.contains("Technology").click();
      cy.contains("React 19").should("be.visible");
    });
  });

  describe("Performance and Loading", () => {
    it("should load help page quickly", () => {
      const startTime = Date.now();

      cy.visit("/help");
      cy.contains("Chatter Help Center");

      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
      });
    });

    it("should handle ChatterBot responses within reasonable time", () => {
      const timestamp = Date.now();
      const testUser = {
        name: `perftest${timestamp}`,
        fullName: `Performance Test User ${timestamp}`,
        email: `perftest${timestamp}@example.com`,
        password: "password123",
      };

      cy.registerUser(testUser);
      cy.loginUser(testUser);

      // Open ChatterBot chat
      cy.get('[data-cy="user-item"]').contains("ChatterBot").click();

      const messageTime = Date.now();

      // Send message
      cy.get('[data-cy="message-input"]').type("Quick test message");
      cy.get('[data-cy="send-button"]').click();

      // Wait for response with timeout
      cy.get('[data-cy="chat-messages"]').within(() => {
        cy.get('[data-cy="message-item"]').should("have.length.greaterThan", 1);
      });

      cy.then(() => {
        const responseTime = Date.now() - messageTime;
        expect(responseTime).to.be.lessThan(10000); // AI should respond within 10 seconds
      });
    });
  });
});
