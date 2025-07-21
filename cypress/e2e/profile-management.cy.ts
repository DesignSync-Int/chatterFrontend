/// <reference types="cypress" />

describe("Profile Management", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.window().then((win) => {
      win.localStorage.setItem('auth-token', 'mock-token');
    });
    
    cy.intercept("GET", "/api/auth/check", {
      statusCode: 200,
      body: { 
        _id: "user123", 
        name: "testuser", 
        fullName: "Test User",
        email: "test@example.com",
        gender: "male",
        dateOfBirth: "1990-01-01",
        profile: "https://example.com/profile.jpg"
      }
    }).as("checkAuth");
    
    cy.visit("/home");
    cy.wait("@checkAuth");
  });

  describe("Profile Modal", () => {
    beforeEach(() => {
      cy.get('[data-testid="profile-button"]').click();
      cy.get('[data-testid="profile-modal"]').should("be.visible");
    });

    it("should open profile modal", () => {
      cy.get('[data-testid="profile-modal-title"]').should("contain", "Edit Profile");
      cy.get('[data-testid="profile-modal"]').within(() => {
        cy.get('[data-testid="fullname-input"]').should("have.value", "Test User");
        cy.get('[data-testid="email-input"]').should("have.value", "test@example.com");
        cy.get('[data-testid="gender-select"]').should("have.value", "male");
        cy.get('[data-testid="dateofbirth-input"]').should("have.value", "1990-01-01");
      });
    });

    it("should update profile information", () => {
      cy.intercept("PUT", "/api/auth/update-info", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          fullName: "Updated User",
          email: "updated@example.com",
          gender: "female",
          dateOfBirth: "1995-05-15"
        }
      }).as("updateProfile");

      cy.get('[data-testid="fullname-input"]').clear().type("Updated User");
      cy.get('[data-testid="email-input"]').clear().type("updated@example.com");
      cy.get('[data-testid="gender-select"]').select("female");
      cy.get('[data-testid="dateofbirth-input"]').clear().type("1995-05-15");
      
      cy.get('[data-testid="save-profile"]').click();

      cy.wait("@updateProfile").then((interception) => {
        expect(interception.request.body).to.include({
          fullName: "Updated User",
          email: "updated@example.com",
          gender: "female",
          dateOfBirth: "1995-05-15"
        });
      });

      cy.get('[data-testid="profile-modal"]').should("not.exist");
    });

    it("should validate email format", () => {
      cy.get('[data-testid="email-input"]').clear().type("invalid-email");
      cy.get('[data-testid="save-profile"]').click();
      
      cy.get('[data-testid="email-error"]').should("contain", "Please enter a valid email");
    });

    it("should validate required fields", () => {
      cy.get('[data-testid="fullname-input"]').clear();
      cy.get('[data-testid="save-profile"]').click();
      
      cy.get('[data-testid="fullname-error"]').should("contain", "Full name is required");
    });

    it("should handle profile update error", () => {
      cy.intercept("PUT", "/api/auth/update-info", {
        statusCode: 400,
        body: { message: "Email already exists" }
      }).as("updateProfileError");

      cy.get('[data-testid="email-input"]').clear().type("existing@example.com");
      cy.get('[data-testid="save-profile"]').click();

      cy.wait("@updateProfileError");
      cy.get('[data-testid="error-message"]').should("contain", "Email already exists");
    });

    it("should cancel profile changes", () => {
      cy.get('[data-testid="fullname-input"]').clear().type("Changed Name");
      cy.get('[data-testid="cancel-profile"]').click();
      
      cy.get('[data-testid="profile-modal"]').should("not.exist");
      
      // Re-open modal to verify changes were not saved
      cy.get('[data-testid="profile-button"]').click();
      cy.get('[data-testid="fullname-input"]').should("have.value", "Test User");
    });

    it("should show loading state while saving", () => {
      cy.intercept("PUT", "/api/auth/update-info", {
        statusCode: 200,
        body: { message: "Profile updated successfully" },
        delay: 1000
      }).as("updateProfileDelay");

      cy.get('[data-testid="fullname-input"]').clear().type("Updated User");
      cy.get('[data-testid="save-profile"]').click();
      
      cy.get('[data-testid="save-profile"]').should("be.disabled");
      cy.get('[data-testid="save-profile"]').should("contain", "Saving...");
      
      cy.wait("@updateProfileDelay");
      
      cy.get('[data-testid="profile-modal"]').should("not.exist");
    });
  });

  describe("Profile Picture Upload", () => {
    beforeEach(() => {
      cy.get('[data-testid="profile-button"]').click();
      cy.get('[data-testid="profile-modal"]').should("be.visible");
    });

    it("should upload profile picture", () => {
      cy.intercept("PUT", "/api/auth/update-profile", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          profile: "https://example.com/new-profile.jpg"
        }
      }).as("updateProfilePicture");

      cy.get('[data-testid="profile-picture-input"]').then($input => {
        const file = new File(['fake-image-content'], 'profile.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        ($input[0] as HTMLInputElement).files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });

      cy.wait("@updateProfilePicture");
      cy.get('[data-testid="profile-picture"]').should("have.attr", "src").and("include", "new-profile.jpg");
    });

    it("should validate image file type", () => {
      cy.get('[data-testid="profile-picture-input"]').then($input => {
        const file = new File(['text-content'], 'document.txt', { type: 'text/plain' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        ($input[0] as HTMLInputElement).files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });

      cy.get('[data-testid="file-error"]').should("contain", "Please select a valid image file");
    });

    it("should validate image file size", () => {
      cy.get('[data-testid="profile-picture-input"]').then($input => {
        const oversizedFile = new File(['a'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(oversizedFile);
        ($input[0] as HTMLInputElement).files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });

      cy.get('[data-testid="file-error"]').should("contain", "File size must be less than 5MB");
    });
  });

  describe("Profile Display", () => {
    it("should display user profile in header", () => {
      cy.get('[data-testid="user-profile"]').should("be.visible");
      cy.get('[data-testid="user-name"]').should("contain", "Test User");
      cy.get('[data-testid="user-avatar"]').should("be.visible");
    });

    it("should show profile picture when available", () => {
      cy.get('[data-testid="user-avatar"]').should("have.attr", "src").and("include", "profile.jpg");
    });

    it("should show default avatar when no profile picture", () => {
      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          fullName: "Test User",
          profile: ""
        }
      }).as("checkAuthNoProfile");

      cy.reload();
      cy.wait("@checkAuthNoProfile");
      
      cy.get('[data-testid="user-avatar-default"]').should("be.visible");
      cy.get('[data-testid="user-avatar-default"]').should("contain", "T"); // First letter of name
    });
  });

  describe("Profile Validation", () => {
    beforeEach(() => {
      cy.get('[data-testid="profile-button"]').click();
      cy.get('[data-testid="profile-modal"]').should("be.visible");
    });

    it("should validate date of birth format", () => {
      cy.get('[data-testid="dateofbirth-input"]').clear().type("invalid-date");
      cy.get('[data-testid="save-profile"]').click();
      
      cy.get('[data-testid="dateofbirth-error"]').should("contain", "Please enter a valid date");
    });

    it("should validate minimum age", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      cy.get('[data-testid="dateofbirth-input"]').clear().type(futureDateString);
      cy.get('[data-testid="save-profile"]').click();
      
      cy.get('[data-testid="dateofbirth-error"]').should("contain", "Date of birth cannot be in the future");
    });

    it("should validate full name length", () => {
      cy.get('[data-testid="fullname-input"]').clear().type("A");
      cy.get('[data-testid="save-profile"]').click();
      
      cy.get('[data-testid="fullname-error"]').should("contain", "Full name must be at least 2 characters");
    });

    it("should validate full name for inappropriate content", () => {
      cy.intercept("PUT", "/api/auth/update-info", {
        statusCode: 400,
        body: { message: "Full name contains inappropriate language" }
      }).as("updateProfileInappropriate");

      cy.get('[data-testid="fullname-input"]').clear().type("BadWord User");
      cy.get('[data-testid="save-profile"]').click();

      cy.wait("@updateProfileInappropriate");
      cy.get('[data-testid="error-message"]').should("contain", "Full name contains inappropriate language");
    });
  });

  describe("Profile Accessibility", () => {
    beforeEach(() => {
      cy.get('[data-testid="profile-button"]').click();
      cy.get('[data-testid="profile-modal"]').should("be.visible");
    });

    it("should be keyboard navigable", () => {
      cy.get('[data-testid="fullname-input"]').focus().should("be.focused");
      cy.get('[data-testid="fullname-input"]').type("{tab}");
      cy.get('[data-testid="email-input"]').should("be.focused");
    });

    it("should have proper ARIA labels", () => {
      cy.get('[data-testid="fullname-input"]').should("have.attr", "aria-label");
      cy.get('[data-testid="email-input"]').should("have.attr", "aria-label");
      cy.get('[data-testid="gender-select"]').should("have.attr", "aria-label");
      cy.get('[data-testid="dateofbirth-input"]').should("have.attr", "aria-label");
    });

    it("should have proper form labels", () => {
      cy.get('label[for="fullname"]').should("contain", "Full Name");
      cy.get('label[for="email"]').should("contain", "Email Address");
      cy.get('label[for="gender"]').should("contain", "Gender");
      cy.get('label[for="dateOfBirth"]').should("contain", "Date of Birth");
    });

    it("should close modal with Escape key", () => {
      cy.get('[data-testid="profile-modal"]').type("{esc}");
      cy.get('[data-testid="profile-modal"]').should("not.exist");
    });
  });

  describe("Profile Data Persistence", () => {
    it("should persist changes after page reload", () => {
      cy.intercept("PUT", "/api/auth/update-info", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          fullName: "Persistent User",
          email: "persistent@example.com"
        }
      }).as("updateProfile");

      cy.intercept("GET", "/api/auth/check", {
        statusCode: 200,
        body: { 
          _id: "user123", 
          name: "testuser", 
          fullName: "Persistent User",
          email: "persistent@example.com"
        }
      }).as("checkAuthUpdated");

      cy.get('[data-testid="profile-button"]').click();
      cy.get('[data-testid="fullname-input"]').clear().type("Persistent User");
      cy.get('[data-testid="email-input"]').clear().type("persistent@example.com");
      cy.get('[data-testid="save-profile"]').click();

      cy.wait("@updateProfile");
      
      cy.reload();
      cy.wait("@checkAuthUpdated");
      
      cy.get('[data-testid="user-name"]').should("contain", "Persistent User");
    });

    it("should revert changes on error", () => {
      cy.intercept("PUT", "/api/auth/update-info", {
        statusCode: 500,
        body: { message: "Server error" }
      }).as("updateProfileError");

      cy.get('[data-testid="profile-button"]').click();
      cy.get('[data-testid="fullname-input"]').clear().type("Error User");
      cy.get('[data-testid="save-profile"]').click();

      cy.wait("@updateProfileError");
      
      // Close modal and reopen to verify original data is preserved
      cy.get('[data-testid="cancel-profile"]').click();
      cy.get('[data-testid="profile-button"]').click();
      cy.get('[data-testid="fullname-input"]').should("have.value", "Test User");
    });
  });
});
