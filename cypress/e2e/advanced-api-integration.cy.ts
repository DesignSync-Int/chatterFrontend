/// <reference types="cypress" />

describe("Advanced API Integration Tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Friend Request API Coverage", () => {
    beforeEach(() => {
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

      cy.visit("/home");
      cy.wait("@checkAuth");
    });

    it("should handle friend request rate limiting", () => {
      cy.intercept("POST", "/api/friend-requests/send", {
        statusCode: 429,
        body: { message: "Too many friend requests sent. Please wait before sending more." }
      }).as("rateLimitedFriendRequest");

      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          { _id: "user456", name: "potentialfriend", fullName: "Potential Friend" }
        ]
      }).as("getUsers");

      cy.wait("@getUsers");

      // Try to send friend request
      cy.get('[data-testid="user-item"]').first().within(() => {
        cy.get('[data-testid="add-friend-button"]').click();
      });

      cy.wait("@rateLimitedFriendRequest");
      cy.get("div").should("contain", "Too many friend requests");
    });

    it("should handle concurrent friend request attempts", () => {
      let requestCount = 0;
      cy.intercept("POST", "/api/friend-requests/send", (req) => {
        requestCount++;
        if (requestCount === 1) {
          req.reply({
            statusCode: 200,
            body: { message: "Friend request sent successfully" }
          });
        } else {
          req.reply({
            statusCode: 409,
            body: { message: "Friend request already exists" }
          });
        }
      }).as("concurrentFriendRequest");

      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          { _id: "user456", name: "potentialfriend", fullName: "Potential Friend" }
        ]
      }).as("getUsers");

      cy.wait("@getUsers");

      // Simulate rapid clicking
      cy.get('[data-testid="user-item"]').first().within(() => {
        cy.get('[data-testid="add-friend-button"]').click();
        cy.get('[data-testid="add-friend-button"]').click();
      });

      cy.wait("@concurrentFriendRequest");
      // Should show success or conflict message
      cy.get("div").should("contain", "Friend request sent successfully");
    });

    it("should handle friend request to non-existent user", () => {
      cy.intercept("POST", "/api/friend-requests/send", {
        statusCode: 404,
        body: { message: "User not found" }
      }).as("friendRequestNotFound");

      // Mock sending request to non-existent user
      cy.request({
        method: "POST",
        url: "/api/friend-requests/send",
        body: { recipientId: "nonexistent123" },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("should handle friend request status changes", () => {
      const statuses = ["pending", "accepted", "declined"];
      
      statuses.forEach((status) => {
        cy.intercept("GET", "/api/friend-requests/received", {
          statusCode: 200,
          body: [
            {
              _id: "request123",
              sender: { _id: "user456", name: "sender", fullName: "Request Sender" },
              status: status,
              createdAt: new Date().toISOString()
            }
          ]
        }).as(`getFriendRequests${status}`);

        cy.visit("/home");
        cy.wait(`@getFriendRequests${status}`);

        if (status === "pending") {
          cy.get('[data-testid="accept-friend-request"]').should("be.visible");
          cy.get('[data-testid="decline-friend-request"]').should("be.visible");
        } else {
          cy.get('[data-testid="accept-friend-request"]').should("not.exist");
          cy.get('[data-testid="decline-friend-request"]').should("not.exist");
        }
      });
    });
  });

  describe("Message API Edge Cases", () => {
    beforeEach(() => {
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
    });

    it("should handle message sending to blocked user", () => {
      cy.intercept("POST", "/api/messages/send/user456", {
        statusCode: 403,
        body: { message: "Cannot send message to this user" }
      }).as("sendMessageBlocked");

      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          { _id: "user456", name: "blockeduser", fullName: "Blocked User" }
        ]
      }).as("getUsers");

      cy.wait("@getUsers");

      // Try to send message to blocked user
      cy.get('[data-testid="user-item"]').first().click();
      cy.get('[data-testid="message-input"]').type("Hello blocked user");
      cy.get('[data-testid="send-message"]').click();

      cy.wait("@sendMessageBlocked");
      cy.get("div").should("contain", "Cannot send message to this user");
    });

    it("should handle message deletion", () => {
      cy.intercept("DELETE", "/api/messages/message123", {
        statusCode: 200,
        body: { message: "Message deleted successfully" }
      }).as("deleteMessage");

      cy.intercept("GET", "/api/messages/user456", {
        statusCode: 200,
        body: [
          {
            _id: "message123",
            senderId: "user123",
            text: "Message to delete",
            createdAt: new Date().toISOString()
          }
        ]
      }).as("getMessages");

      // Navigate to conversation
      cy.get('[data-testid="user-item"]').first().click();
      cy.wait("@getMessages");

      // Delete message
      cy.get('[data-testid="message-item"]').first().within(() => {
        cy.get('[data-testid="message-options"]').click();
        cy.get('[data-testid="delete-message"]').click();
      });

      cy.wait("@deleteMessage");
      cy.get("div").should("contain", "Message deleted successfully");
    });

    it("should handle message editing", () => {
      cy.intercept("PUT", "/api/messages/message123", {
        statusCode: 200,
        body: { 
          _id: "message123",
          text: "Edited message content",
          edited: true,
          editedAt: new Date().toISOString()
        }
      }).as("editMessage");

      cy.intercept("GET", "/api/messages/user456", {
        statusCode: 200,
        body: [
          {
            _id: "message123",
            senderId: "user123",
            text: "Original message",
            createdAt: new Date().toISOString()
          }
        ]
      }).as("getMessages");

      cy.get('[data-testid="user-item"]').first().click();
      cy.wait("@getMessages");

      // Edit message
      cy.get('[data-testid="message-item"]').first().within(() => {
        cy.get('[data-testid="message-options"]').click();
        cy.get('[data-testid="edit-message"]').click();
      });

      cy.get('[data-testid="edit-message-input"]').clear().type("Edited message content");
      cy.get('[data-testid="save-edit"]').click();

      cy.wait("@editMessage");
      cy.get('[data-testid="message-item"]').should("contain", "Edited message content");
      cy.get('[data-testid="edited-indicator"]').should("be.visible");
    });

    it("should handle message pagination", () => {
      // Mock paginated messages
      cy.intercept("GET", "/api/messages/user456?page=1&limit=20", {
        statusCode: 200,
        body: {
          messages: Array.from({ length: 20 }, (_, i) => ({
            _id: `message${i}`,
            senderId: i % 2 === 0 ? "user123" : "user456",
            text: `Message ${i + 1}`,
            createdAt: new Date(Date.now() - i * 60000).toISOString()
          })),
          hasMore: true,
          currentPage: 1,
          totalPages: 3
        }
      }).as("getMessagesPage1");

      cy.intercept("GET", "/api/messages/user456?page=2&limit=20", {
        statusCode: 200,
        body: {
          messages: Array.from({ length: 20 }, (_, i) => ({
            _id: `message${i + 20}`,
            senderId: (i + 20) % 2 === 0 ? "user123" : "user456",
            text: `Message ${i + 21}`,
            createdAt: new Date(Date.now() - (i + 20) * 60000).toISOString()
          })),
          hasMore: true,
          currentPage: 2,
          totalPages: 3
        }
      }).as("getMessagesPage2");

      cy.get('[data-testid="user-item"]').first().click();
      cy.wait("@getMessagesPage1");

      // Should show 20 messages
      cy.get('[data-testid="message-item"]').should("have.length", 20);

      // Scroll to top to load more messages
      cy.get('[data-testid="messages-container"]').scrollTo("top");
      cy.wait("@getMessagesPage2");

      // Should show 40 messages total
      cy.get('[data-testid="message-item"]').should("have.length", 40);
    });
  });

  describe("Real-time Socket.IO Tests", () => {
    beforeEach(() => {
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
    });

    it("should handle real-time message reception", () => {
      // Mock socket connection
      cy.window().then((win) => {
        // Simulate receiving a message via socket
        const mockMessage = {
          _id: "newmessage123",
          senderId: "user456",
          text: "Real-time message",
          createdAt: new Date().toISOString()
        };

        // Trigger socket event simulation
        win.dispatchEvent(new CustomEvent('socket-message', { 
          detail: mockMessage 
        }));
      });

      // Should show the new message
      cy.get('[data-testid="message-item"]').should("contain", "Real-time message");
    });

    it("should handle user online/offline status", () => {
      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: [
          { _id: "user456", name: "friend1", fullName: "Friend One", isOnline: true },
          { _id: "user789", name: "friend2", fullName: "Friend Two", isOnline: false }
        ]
      }).as("getUsers");

      cy.wait("@getUsers");

      // Should show online indicator
      cy.get('[data-testid="user-item"]').first().within(() => {
        cy.get('[data-testid="online-indicator"]').should("have.class", "bg-green-500");
      });

      // Should show offline indicator
      cy.get('[data-testid="user-item"]').last().within(() => {
        cy.get('[data-testid="online-indicator"]').should("have.class", "bg-gray-400");
      });
    });

    it("should handle typing indicators", () => {
      cy.window().then((win) => {
        // Simulate typing event
        win.dispatchEvent(new CustomEvent('socket-typing', { 
          detail: { userId: "user456", isTyping: true }
        }));
      });

      // Should show typing indicator
      cy.get('[data-testid="typing-indicator"]').should("contain", "is typing...");

      cy.window().then((win) => {
        // Simulate stop typing event
        win.dispatchEvent(new CustomEvent('socket-typing', { 
          detail: { userId: "user456", isTyping: false }
        }));
      });

      // Should hide typing indicator
      cy.get('[data-testid="typing-indicator"]').should("not.exist");
    });

    it("should handle connection loss and reconnection", () => {
      // Simulate connection loss
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('socket-disconnect'));
      });

      // Should show connection warning
      cy.get('[data-testid="connection-status"]').should("contain", "Connection lost");

      // Simulate reconnection
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('socket-connect'));
      });

      // Should hide connection warning
      cy.get('[data-testid="connection-status"]').should("not.exist");
    });
  });

  describe("File Upload and Media Tests", () => {
    beforeEach(() => {
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
    });

    it("should handle profile picture upload", () => {
      cy.intercept("PUT", "/api/auth/update-profile", {
        statusCode: 200,
        body: {
          _id: "user123",
          name: "testuser",
          profile: "https://cloudinary.com/uploaded-image.jpg"
        }
      }).as("uploadProfile");

      cy.get('[data-testid="profile-button"]').click();
      
      // Mock file upload
      const fileName = 'profile.jpg';
      cy.get('[data-testid="profile-upload"]').selectFile({
        contents: Cypress.Buffer.from('file contents'),
        fileName: fileName,
        mimeType: 'image/jpeg'
      }, { force: true });

      cy.wait("@uploadProfile");
      cy.get("div").should("contain", "Profile updated successfully");
    });

    it("should handle file size validation", () => {
      cy.get('[data-testid="profile-button"]').click();
      
      // Try to upload large file
      const largeFileName = 'large-profile.jpg';
      cy.get('[data-testid="profile-upload"]').selectFile({
        contents: Cypress.Buffer.alloc(10 * 1024 * 1024), // 10MB
        fileName: largeFileName,
        mimeType: 'image/jpeg'
      }, { force: true });

      cy.get("div").should("contain", "File size too large");
    });

    it("should handle unsupported file types", () => {
      cy.get('[data-testid="profile-button"]').click();
      
      // Try to upload unsupported file
      const unsupportedFileName = 'document.pdf';
      cy.get('[data-testid="profile-upload"]').selectFile({
        contents: Cypress.Buffer.from('PDF content'),
        fileName: unsupportedFileName,
        mimeType: 'application/pdf'
      }, { force: true });

      cy.get("div").should("contain", "Unsupported file type");
    });

    it("should handle image message sending", () => {
      cy.intercept("POST", "/api/messages/send/user456", {
        statusCode: 200,
        body: {
          _id: "imagemessage123",
          senderId: "user123",
          imageUrl: "https://cloudinary.com/uploaded-message-image.jpg",
          createdAt: new Date().toISOString()
        }
      }).as("sendImageMessage");

      cy.get('[data-testid="user-item"]').first().click();
      
      // Upload image message
      cy.get('[data-testid="image-upload"]').selectFile({
        contents: Cypress.Buffer.from('image contents'),
        fileName: 'message-image.jpg',
        mimeType: 'image/jpeg'
      }, { force: true });

      cy.wait("@sendImageMessage");
      cy.get('[data-testid="message-image"]').should("be.visible");
    });
  });

  describe("Search and Filter Functionality", () => {
    beforeEach(() => {
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
    });

    it("should handle user search functionality", () => {
      cy.intercept("GET", "/api/users/search?q=john", {
        statusCode: 200,
        body: [
          { _id: "user456", name: "john", fullName: "John Doe" },
          { _id: "user789", name: "johnny", fullName: "Johnny Smith" }
        ]
      }).as("searchUsers");

      cy.get('[data-testid="search-input"]').type("john");
      cy.wait("@searchUsers");

      cy.get('[data-testid="search-results"]').within(() => {
        cy.get('[data-testid="search-result-item"]').should("have.length", 2);
        cy.get('[data-testid="search-result-item"]').first().should("contain", "John Doe");
        cy.get('[data-testid="search-result-item"]').last().should("contain", "Johnny Smith");
      });
    });

    it("should handle message search within conversation", () => {
      cy.intercept("GET", "/api/messages/user456/search?q=hello", {
        statusCode: 200,
        body: [
          {
            _id: "message123",
            senderId: "user123",
            text: "Hello there!",
            createdAt: new Date().toISOString(),
            highlighted: true
          }
        ]
      }).as("searchMessages");

      cy.get('[data-testid="user-item"]').first().click();
      cy.get('[data-testid="message-search"]').type("hello");
      cy.wait("@searchMessages");

      cy.get('[data-testid="search-highlight"]').should("be.visible");
    });

    it("should handle advanced filtering options", () => {
      cy.intercept("GET", "/api/messages/users?filter=online", {
        statusCode: 200,
        body: [
          { _id: "user456", name: "onlineuser", fullName: "Online User", isOnline: true }
        ]
      }).as("getOnlineUsers");

      cy.get('[data-testid="filter-dropdown"]').click();
      cy.get('[data-testid="filter-online"]').click();
      cy.wait("@getOnlineUsers");

      cy.get('[data-testid="user-item"]').should("have.length", 1);
      cy.get('[data-testid="online-indicator"]').should("have.class", "bg-green-500");
    });
  });

  describe("Notification System Tests", () => {
    beforeEach(() => {
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
    });

    it("should handle browser notification permissions", () => {
      cy.window().then((win) => {
        // Mock Notification API
        cy.stub(win, 'Notification').callsFake(() => ({
          permission: 'granted'
        }));
      });

      cy.get('[data-testid="enable-notifications"]').click();
      cy.get("div").should("contain", "Notifications enabled");
    });

    it("should show notification badges", () => {
      cy.intercept("GET", "/api/notifications/unread", {
        statusCode: 200,
        body: { count: 5 }
      }).as("getUnreadCount");

      cy.wait("@getUnreadCount");
      cy.get('[data-testid="notification-badge"]').should("contain", "5");
    });

    it("should handle notification click actions", () => {
      cy.intercept("GET", "/api/notifications", {
        statusCode: 200,
        body: [
          {
            _id: "notif123",
            type: "friend_request",
            message: "New friend request from John Doe",
            read: false,
            actionUrl: "/friends"
          }
        ]
      }).as("getNotifications");

      cy.get('[data-testid="notifications-button"]').click();
      cy.wait("@getNotifications");

      cy.get('[data-testid="notification-item"]').first().click();
      cy.url().should("include", "/friends");
    });

    it("should mark notifications as read", () => {
      cy.intercept("PUT", "/api/notifications/notif123/read", {
        statusCode: 200,
        body: { message: "Notification marked as read" }
      }).as("markAsRead");

      cy.intercept("GET", "/api/notifications", {
        statusCode: 200,
        body: [
          {
            _id: "notif123",
            type: "message",
            message: "New message from Jane",
            read: false
          }
        ]
      }).as("getNotifications");

      cy.get('[data-testid="notifications-button"]').click();
      cy.wait("@getNotifications");

      cy.get('[data-testid="mark-read-button"]').first().click();
      cy.wait("@markAsRead");

      cy.get('[data-testid="notification-item"]').first().should("have.class", "read");
    });
  });
});
