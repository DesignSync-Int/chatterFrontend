describe('API Integration Tests', () => {
  // Helper function for login
  const loginUser = (email: string, password: string) => {
    cy.visit('/auth');
    cy.get('[data-cy="email"]').type(email);
    cy.get('[data-cy="password"]').type(password);
    cy.get('[data-cy="login-btn"]').click();
    cy.url().should('not.include', '/auth');
  };

  // API Testing for complete integration flows
  
  describe('End-to-End User Journey', () => {
    it('should complete full user registration and authentication flow', () => {
      cy.visit('/auth');
      
      // Register new user
      cy.get('[data-cy="signup-tab"]').click();
      cy.get('[data-cy="fullName"]').type('E2E Test User');
      cy.get('[data-cy="name"]').type('e2etestuser');
      cy.get('[data-cy="email"]').type('e2e@test.com');
      cy.get('[data-cy="password"]').type('TestPassword123!');
      cy.get('[data-cy="signup-btn"]').click();
      
      // Should redirect to main app
      cy.url().should('not.include', '/auth');
      cy.get('[data-cy="user-profile"]').should('contain', 'E2E Test User');
    });

    it('should complete friend request and messaging flow', () => {
      // Login as first user
      loginUser('user1@test.com', 'password123');
      
      // Send friend request
      cy.get('[data-cy="add-friend-btn"]').click();
      cy.get('[data-cy="search-user"]').type('testuser2');
      cy.get('[data-cy="user-result"]').first().click();
      cy.get('[data-cy="send-request-btn"]').click();
      
      // Login as second user
      loginUser('user2@test.com', 'password123');
      
      // Accept friend request
      cy.get('[data-cy="pending-tab"]').click();
      cy.get('[data-cy="accept-request"]').first().click();
      
      // Send message
      cy.get('[data-cy="friends-tab"]').click();
      cy.get('[data-cy="friend-item"]').first().click();
      cy.get('[data-cy="message-input"]').type('Hello from API test!');
      cy.get('[data-cy="send-message"]').click();
      
      // Verify message appears
      cy.get('[data-cy="message-bubble"]').should('contain', 'Hello from API test!');
    });
  });

  describe('Real-time Socket Events', () => {
    it('should receive real-time friend requests', () => {
      cy.visit('/');
      loginUser('receiver@test.com', 'password123');
      
      cy.window().then((win: any) => {
        win.mockSocket = {
          emit: cy.stub(),
          on: cy.stub(),
          off: cy.stub()
        };
      });
      
      // Simulate incoming friend request
      cy.window().its('mockSocket').then((socket: any) => {
        const friendRequest = {
          _id: 'req123',
          senderId: {
            _id: 'user123',
            name: 'testsender',
            fullName: 'Test Sender'
          }
        };
        
        // Trigger friend request event
        socket.on.withArgs('newFriendRequest').callArgWith(1, friendRequest);
      });
      
      // Should show notification
      cy.get('[data-cy="notification"]').should('contain', 'New friend request');
      cy.get('[data-cy="pending-requests-count"]').should('contain', '1');
    });

    it('should receive real-time messages', () => {
      cy.visit('/');
      loginUser('user1@test.com', 'password123');
      
      // Open chat with friend
      cy.get('[data-cy="friend-item"]').first().click();
      
      cy.window().then((win: any) => {
        const newMessage = {
          _id: 'msg123',
          senderId: 'friend123',
          content: 'Real-time message test',
          createdAt: new Date().toISOString()
        };
        
        // Simulate socket message event
        win.dispatchEvent(new CustomEvent('socket-message', { detail: newMessage }));
      });
      
      // Should display new message
      cy.get('[data-cy="message-bubble"]').should('contain', 'Real-time message test');
    });
  });

  describe('Image Upload Integration', () => {
    it('should upload profile picture successfully', () => {
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Open profile modal
      cy.get('[data-cy="profile-btn"]').click();
      
      const fileName = 'profile.jpg';
      cy.fixture(fileName, 'base64').then(fileContent => {
        cy.get('[data-cy="profile-upload"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName,
          mimeType: 'image/jpeg'
        });
      });
      
      // Should show upload progress
      cy.get('[data-cy="upload-progress"]').should('be.visible');
      
      // Should update profile picture
      cy.get('[data-cy="profile-image"]').should('have.attr', 'src').and('include', 'cloudinary');
    });

    it('should send image messages', () => {
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Open chat
      cy.get('[data-cy="friend-item"]').first().click();
      
      // Upload image
      const fileName = 'test-image.jpg';
      cy.fixture(fileName, 'base64').then(fileContent => {
        cy.get('[data-cy="image-upload"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName,
          mimeType: 'image/jpeg'
        });
      });
      
      // Send image message
      cy.get('[data-cy="send-message"]').click();
      
      // Should display image in chat
      cy.get('[data-cy="message-image"]').should('be.visible');
      cy.get('[data-cy="message-image"]').should('have.attr', 'src').and('include', 'cloudinary');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '/api/auth/login', { forceNetworkError: true });
      
      cy.visit('/auth');
      cy.get('[data-cy="email"]').type('user@test.com');
      cy.get('[data-cy="password"]').type('password123');
      cy.get('[data-cy="login-btn"]').click();
      
      // Should show network error message
      cy.get('[data-cy="error-message"]').should('contain', 'Network error');
    });

    it('should handle API validation errors', () => {
      cy.intercept('POST', '/api/auth/signup', {
        statusCode: 400,
        body: { error: 'User already exists' }
      });
      
      cy.visit('/auth');
      cy.get('[data-cy="signup-tab"]').click();
      cy.get('[data-cy="fullName"]').type('Existing User');
      cy.get('[data-cy="name"]').type('existinguser');
      cy.get('[data-cy="email"]').type('existing@test.com');
      cy.get('[data-cy="password"]').type('password123');
      cy.get('[data-cy="signup-btn"]').click();
      
      // Should show validation error
      cy.get('[data-cy="error-message"]').should('contain', 'User already exists');
    });

    it('should handle server errors', () => {
      cy.intercept('GET', '/api/message/users', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      });
      
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Should show error state
      cy.get('[data-cy="error-state"]').should('be.visible');
      cy.get('[data-cy="retry-btn"]').should('be.visible');
    });
  });

  describe('Performance Integration', () => {
    it('should load initial data efficiently', () => {
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Should load within performance budget
      cy.window().its('performance').then((perf: Performance) => {
        const navigationTiming = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds
      });
      
      // Should show content quickly
      cy.get('[data-cy="sidebar"]').should('be.visible');
      cy.get('[data-cy="chat-area"]').should('be.visible');
    });

    it('should handle large friend lists efficiently', () => {
      const largeFriendList = Array.from({ length: 100 }, (_, i) => ({
        _id: `friend${i}`,
        name: `friend${i}`,
        fullName: `Friend ${i}`,
        profilePic: ''
      }));
      
      cy.intercept('GET', '/api/message/users', {
        statusCode: 200,
        body: largeFriendList
      });
      
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Should render efficiently with virtual scrolling
      cy.get('[data-cy="friend-list"]').should('be.visible');
      cy.get('[data-cy="friend-item"]').should('have.length.at.most', 20); // Virtual scrolling
    });
  });

  describe('Security Integration', () => {
    it('should enforce authentication on protected routes', () => {
      // Visit without login
      cy.visit('/');
      
      // Should redirect to auth
      cy.url().should('include', '/auth');
    });

    it('should handle expired tokens', () => {
      // Set expired token
      cy.window().then((win: any) => {
        win.localStorage.setItem('auth-token', 'expired.jwt.token');
      });
      
      cy.visit('/');
      
      // Should redirect to login
      cy.url().should('include', '/auth');
      cy.get('[data-cy="error-message"]').should('contain', 'Session expired');
    });

    it('should sanitize user input', () => {
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Try to send XSS payload
      cy.get('[data-cy="friend-item"]').first().click();
      cy.get('[data-cy="message-input"]').type('<script>alert("xss")</script>');
      cy.get('[data-cy="send-message"]').click();
      
      // Should be escaped/sanitized
      cy.get('[data-cy="message-bubble"]').should('contain', '&lt;script&gt;');
    });
  });

  describe('Mobile Integration', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-8');
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Should show mobile layout
      cy.get('[data-cy="mobile-sidebar"]').should('be.visible');
      cy.get('[data-cy="mobile-toggle"]').should('be.visible');
    });

    it('should handle touch gestures', () => {
      cy.viewport('iphone-8');
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Test swipe to open sidebar
      cy.get('[data-cy="main-content"]').trigger('touchstart', { touches: [{ clientX: 0, clientY: 100 }] });
      cy.get('[data-cy="main-content"]').trigger('touchmove', { touches: [{ clientX: 200, clientY: 100 }] });
      cy.get('[data-cy="main-content"]').trigger('touchend');
      
      // Should open sidebar
      cy.get('[data-cy="mobile-sidebar"]').should('have.class', 'open');
    });
  });

  describe('Accessibility Integration', () => {
    it('should support keyboard navigation', () => {
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Should be able to navigate with Tab
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'data-cy', 'add-friend-btn');
      
      cy.focused().type('{tab}');
      cy.focused().should('have.attr', 'data-cy', 'profile-btn');
    });

    it('should support screen readers', () => {
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Check ARIA labels
      cy.get('[data-cy="add-friend-btn"]').should('have.attr', 'aria-label');
      cy.get('[data-cy="message-input"]').should('have.attr', 'aria-label');
      cy.get('[data-cy="friend-list"]').should('have.attr', 'role', 'list');
    });

    it('should meet color contrast requirements', () => {
      cy.visit('/');
      loginUser('user@test.com', 'password123');
      
      // Check high contrast mode
      cy.get('body').invoke('addClass', 'high-contrast');
      cy.get('[data-cy="message-bubble"]').should('be.visible');
      cy.get('[data-cy="friend-item"]').should('be.visible');
    });
  });
});
