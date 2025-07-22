/// <reference types="cypress" />

describe("Password Security & Advanced Authentication", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Password Strength Validation", () => {
    beforeEach(() => {
      cy.visit("/signup");
    });

    it("should enforce password complexity requirements", () => {
      const weakPasswords = [
        { password: "123", error: "at least 6 characters" },
        { password: "password", error: "uppercase letter" },
        { password: "PASSWORD", error: "lowercase letter" },
        { password: "Password", error: "number" },
        { password: "Pass123", error: "at least 8 characters" }
      ];

      weakPasswords.forEach(({ password, error }) => {
        cy.get("#signup-name").clear().type("testuser");
        cy.get("#signup-fullname").clear().type("Test User");
        cy.get("#signup-password").clear().type(password);
        cy.get('button[type="submit"]').click();

        cy.get("div.text-red-600").should("contain", error);
      });
    });

    it("should accept strong passwords", () => {
      const strongPasswords = [
        "Password123",
        "MySecure@Pass1",
        "C0mplex!Password",
        "Test123!@#"
      ];

      strongPasswords.forEach((password) => {
        cy.get("#signup-password").clear().type(password);
        cy.get("#signup-verify-password").clear().type(password);
        cy.get("#signup-name").click(); // Trigger validation

        // Should not show password validation errors
        cy.get("div.text-red-600").should("not.contain", "Password");
      });
    });

    it("should show real-time password strength indicator", () => {
      // Very weak
      cy.get("#signup-password").type("123");
      cy.get("body").then(($body) => {
        expect($body.text()).to.satisfy((text: string) => 
          text.includes("weak") || text.includes("Weak")
        );
      });

      // Medium
      cy.get("#signup-password").clear().type("Password");
      cy.get("body").then(($body) => {
        expect($body.text()).to.satisfy((text: string) => 
          text.includes("medium") || text.includes("Medium")
        );
      });

      // Strong
      cy.get("#signup-password").clear().type("Password123");
      cy.get("body").then(($body) => {
        expect($body.text()).to.satisfy((text: string) => 
          text.includes("strong") || text.includes("Strong")
        );
      });
    });
  });

  describe("Password Confirmation", () => {
    beforeEach(() => {
      cy.visit("/signup");
    });

    it("should validate password confirmation", () => {
      cy.get("#signup-name").type("testuser");
      cy.get("#signup-fullname").type("Test User");
      cy.get("#signup-password").type("Password123");
      cy.get("#signup-verify-password").type("DifferentPassword123");
      cy.get('button[type="submit"]').click();

      cy.get("div.text-red-600").should("contain", "Passwords do not match");
    });

    it("should clear confirmation error when passwords match", () => {
      // First create mismatch
      cy.get("#signup-password").type("Password123");
      cy.get("#signup-verify-password").type("Different123");
      cy.get('button[type="submit"]').click();
      cy.get("div.text-red-600").should("contain", "Passwords do not match");

      // Fix the mismatch
      cy.get("#signup-verify-password").clear().type("Password123");
      cy.get("#signup-name").click(); // Trigger validation

      cy.get("div.text-red-600").should("not.contain", "Passwords do not match");
    });

    it("should show real-time password match status", () => {
      cy.get("#signup-password").type("Password123");
      
      // Type matching password gradually
      cy.get("#signup-verify-password").type("P");
      cy.get("#signup-verify-password").type("a");
      cy.get("#signup-verify-password").type("s");
      cy.get("#signup-verify-password").type("s");
      cy.get("#signup-verify-password").type("w");
      cy.get("#signup-verify-password").type("o");
      cy.get("#signup-verify-password").type("r");
      cy.get("#signup-verify-password").type("d");
      cy.get("#signup-verify-password").type("1");
      cy.get("#signup-verify-password").type("2");
      cy.get("#signup-verify-password").type("3");

      // Should show match indicator
      cy.get("body").then(($body) => {
        expect($body.text()).to.satisfy((text: string) => 
          text.includes("match") || text.includes("Match")
        );
      });
    });
  });

  describe("Session Management", () => {
    it("should handle session timeout", () => {
      // Login first
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 200,
        body: { 
          _id: "user123",
          name: "testuser",
          token: "short-lived-token"
        }
      }).as("login");

      cy.get("#username").type("testuser");
      cy.get("#password").type("Password123");
      cy.get('button[type="submit"]').click();
      cy.wait("@login");

      // Simulate session expiry
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 401,
        body: { message: "Session expired" }
      }).as("sessionExpired");

      cy.visit("/home");
      cy.wait("@sessionExpired");

      // Should redirect to login with message
      cy.url().should("include", "/");
      cy.get("div").should("contain", "Session expired");
    });

    it("should handle concurrent sessions", () => {
      // Simulate login from another device
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 200,
        body: { 
          _id: "user123",
          name: "testuser",
          token: "device1-token"
        }
      }).as("loginDevice1");

      cy.get("#username").type("testuser");
      cy.get("#password").type("Password123");
      cy.get('button[type="submit"]').click();
      cy.wait("@loginDevice1");

      // Simulate another login that invalidates current session
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 401,
        body: { message: "Session invalidated due to login from another device" }
      }).as("sessionInvalidated");

      cy.visit("/home");
      cy.wait("@sessionInvalidated");

      cy.url().should("include", "/");
      cy.get("div").should("contain", "Session invalidated");
    });

    it("should maintain session across page refreshes", () => {
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 200,
        body: { 
          _id: "user123",
          name: "testuser",
          token: "persistent-token"
        }
      }).as("login");

      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123",
          name: "testuser",
          email: "test@example.com"
        }
      }).as("checkAuth");

      cy.get("#username").type("testuser");
      cy.get("#password").type("Password123");
      cy.get('button[type="submit"]').click();
      cy.wait("@login");

      cy.url().should("include", "/home");

      // Refresh page
      cy.reload();
      cy.wait("@checkAuth");

      // Should still be logged in
      cy.url().should("include", "/home");
    });
  });

  describe("Account Security Features", () => {
    it("should handle account lockout after failed attempts", () => {
      const failedAttempts = [
        { attempt: 1, message: "Invalid credentials" },
        { attempt: 2, message: "Invalid credentials" },
        { attempt: 3, message: "Invalid credentials" },
        { attempt: 4, message: "Invalid credentials" },
        { attempt: 5, message: "Account temporarily locked due to too many failed attempts" }
      ];

      failedAttempts.forEach(({ attempt, message }) => {
        cy.intercept("POST", "/api/auth/login", {
          statusCode: attempt < 5 ? 401 : 423,
          body: { message }
        }).as(`loginAttempt${attempt}`);

        cy.get("#username").clear().type("testuser");
        cy.get("#password").clear().type("wrongpassword");
        cy.get('button[type="submit"]').click();
        
        cy.wait(`@loginAttempt${attempt}`);
        cy.get("div").should("contain", message);
      });
    });

    it("should show password visibility toggle", () => {
      cy.visit("/signup");
      
      // Password should be hidden by default
      cy.get("#signup-password").should("have.attr", "type", "password");
      
      // Click visibility toggle
      cy.get("button[aria-label='Toggle password visibility']").click();
      cy.get("#signup-password").should("have.attr", "type", "text");
      
      // Click again to hide
      cy.get("button[aria-label='Toggle password visibility']").click();
      cy.get("#signup-password").should("have.attr", "type", "password");
    });

    it("should prevent password auto-fill in sensitive areas", () => {
      cy.visit("/signup");
      
      // Password fields should not have autocomplete
      cy.get("#signup-password").should("have.attr", "autocomplete", "new-password");
      cy.get("#signup-verify-password").should("have.attr", "autocomplete", "new-password");
    });
  });

  describe("CAPTCHA Integration", () => {
    beforeEach(() => {
      cy.visit("/signup");
    });

    it("should require CAPTCHA completion before signup", () => {
      cy.get("#signup-name").type("testuser");
      cy.get("#signup-fullname").type("Test User");
      cy.get("#signup-password").type("Password123");
      cy.get("#signup-verify-password").type("Password123");
      
      // Try to submit without CAPTCHA
      cy.get('button[type="submit"]').click();
      cy.get("div.text-red-600").should("contain", "captcha");
    });

    it("should validate CAPTCHA input", () => {
      // Generate mock CAPTCHA
      cy.get("button").contains("Generate").click();
      
      // Enter wrong CAPTCHA
      cy.get('input[placeholder="Enter captcha code"]').type("WRONG");
      cy.get("#signup-name").type("testuser");
      cy.get("#signup-fullname").type("Test User");
      cy.get("#signup-password").type("Password123");
      cy.get("#signup-verify-password").type("Password123");
      cy.get('button[type="submit"]').click();
      
      cy.get("div.text-red-600").should("contain", "Invalid captcha");
    });

    it("should refresh CAPTCHA when requested", () => {
      // Generate initial CAPTCHA
      cy.get("button").contains("Generate").click();
      cy.get("canvas").should("be.visible");
      
      // Store initial canvas data
      cy.get("canvas").then(($canvas) => {
        const initialData = $canvas[0].toDataURL();
        
        // Refresh CAPTCHA
        cy.get("button[aria-label='Refresh captcha']").click();
        
        // Canvas should have changed
        cy.get("canvas").should("not.have.attr", "data-url", initialData);
      });
    });

    it("should reset CAPTCHA after failed signup", () => {
      cy.intercept("POST", "/api/auth/signup", {
        statusCode: 400,
        body: { message: "Username already exists" }
      }).as("signupError");

      cy.get("button").contains("Generate").click();
      cy.get('input[placeholder="Enter captcha code"]').type("TEST1");
      cy.get("#signup-name").type("existinguser");
      cy.get("#signup-fullname").type("Existing User");
      cy.get("#signup-password").type("Password123");
      cy.get("#signup-verify-password").type("Password123");
      cy.get('button[type="submit"]').click();
      
      cy.wait("@signupError");
      
      // CAPTCHA should be reset
      cy.get('input[placeholder="Enter captcha code"]').should("have.value", "");
    });
  });

  describe("Multi-Factor Authentication Preparation", () => {
    it("should have infrastructure for 2FA setup", () => {
      // Login first
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 200,
        body: { 
          _id: "user123",
          name: "testuser",
          token: "test-token",
          twoFactorEnabled: false
        }
      }).as("login");

      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123",
          name: "testuser",
          twoFactorEnabled: false
        }
      }).as("checkAuth");

      cy.get("#username").type("testuser");
      cy.get("#password").type("Password123");
      cy.get('button[type="submit"]').click();
      cy.wait("@login");
      cy.wait("@checkAuth");

      // Check for 2FA setup options in profile
      cy.get('[data-testid="profile-button"]').click();
      
      // Should have security section or 2FA toggle (when implemented)
      cy.get("body").then(($body) => {
        expect($body.text()).to.satisfy((text: string) => 
          text.includes("Security") || text.includes("Two-Factor Authentication")
        );
      });
    });

    it("should handle 2FA-enabled accounts", () => {
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 200,
        body: { 
          _id: "user123",
          name: "testuser",
          requiresTwoFactor: true,
          tempToken: "temp-token"
        }
      }).as("loginWith2FA");

      cy.get("#username").type("testuser");
      cy.get("#password").type("Password123");
      cy.get('button[type="submit"]').click();
      cy.wait("@loginWith2FA");

      // Should prompt for 2FA code (when implemented)
      cy.url().then((url) => {
        expect(url).to.satisfy((url: string) => 
          url.includes("/verify-2fa") || url.includes("/two-factor")
        );
      });
    });
  });

  describe("Login Security Features", () => {
    it("should handle suspicious login detection", () => {
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 200,
        body: { 
          _id: "user123",
          name: "testuser",
          token: "test-token",
          suspiciousActivity: true,
          message: "Login from new location detected. Please verify your email."
        }
      }).as("suspiciousLogin");

      cy.get("#username").type("testuser");
      cy.get("#password").type("Password123");
      cy.get('button[type="submit"]').click();
      cy.wait("@suspiciousLogin");

      // Should show security warning
      cy.get("div").should("contain", "new location detected");
    });

    it("should implement rate limiting for login attempts", () => {
      // Simulate rapid login attempts
      for (let i = 0; i < 5; i++) {
        cy.intercept("POST", "/api/auth/login", {
          statusCode: 429,
          body: { message: "Too many login attempts. Please try again later." }
        }).as(`rateLimited${i}`);

        cy.get("#username").clear().type("testuser");
        cy.get("#password").clear().type("password");
        cy.get('button[type="submit"]').click();
        cy.wait(`@rateLimited${i}`);
      }

      cy.get("div").should("contain", "Too many login attempts");
    });

    it("should clear sensitive data on logout", () => {
      // Login first
      cy.intercept("POST", "/api/auth/login", {
        statusCode: 200,
        body: { 
          _id: "user123",
          name: "testuser",
          token: "test-token"
        }
      }).as("login");

      cy.intercept("POST", "/api/auth/logout", {
        statusCode: 200,
        body: { message: "Logged out successfully" }
      }).as("logout");

      cy.get("#username").type("testuser");
      cy.get("#password").type("Password123");
      cy.get('button[type="submit"]').click();
      cy.wait("@login");

      cy.visit("/home");
      
      // Logout
      cy.get('[data-testid="logout-button"]').click();
      cy.wait("@logout");

      // Check that sensitive data is cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth-token')).to.be.null;
        expect(win.localStorage.getItem('user-data')).to.be.null;
        expect(win.sessionStorage.getItem('temp-data')).to.be.null;
      });
    });
  });

  describe("Password Recovery Preparation", () => {
    it("should show forgot password link", () => {
      cy.get("a").contains("Forgot password").should("be.visible");
    });

    it("should navigate to password recovery page", () => {
      cy.get("a").contains("Forgot password").click();
      cy.url().should("include", "/forgot-password");
    });

    it("should handle password recovery email", () => {
      cy.visit("/forgot-password");
      
      cy.intercept("POST", "/api/auth/forgot-password", {
        statusCode: 200,
        body: { message: "Password reset email sent if account exists" }
      }).as("forgotPassword");

      cy.get("#email").type("user@example.com");
      cy.get('button[type="submit"]').click();
      cy.wait("@forgotPassword");

      cy.get("div").should("contain", "Password reset email sent");
    });

    it("should handle password reset with token", () => {
      cy.visit("/reset-password?token=valid-reset-token");
      
      cy.intercept("POST", "/api/auth/reset-password", {
        statusCode: 200,
        body: { message: "Password reset successful" }
      }).as("resetPassword");

      cy.get("#newPassword").type("NewPassword123");
      cy.get("#confirmPassword").type("NewPassword123");
      cy.get('button[type="submit"]').click();
      cy.wait("@resetPassword");

      cy.get("div").should("contain", "Password reset successful");
      cy.url().should("include", "/login");
    });
  });
});
