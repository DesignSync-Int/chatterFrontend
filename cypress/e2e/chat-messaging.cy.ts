/// <reference types="cypress" />

describe("Chat and Messaging System", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.window().then((win) => {
      win.localStorage.setItem('auth-token', 'mock-token');
    });
    
    cy.intercept("GET", "/api/auth/check", {
      statusCode: 200,
      body: { _id: "user123", name: "testuser", fullName: "Test User" }
    }).as("checkAuth");
    
    cy.intercept("GET", "/api/friend-requests/friends", {
      statusCode: 200,
      body: [
        { _id: "friend123", name: "friend1", profile: "" }
      ]
    }).as("getFriends");
    
    cy.visit("/home");
    cy.wait("@checkAuth");
  });

  describe("Chat Window Management", () => {
    it("should open chat window when clicking on friend", () => {
      cy.intercept("GET", "/api/messages/friend123", {
        statusCode: 200,
        body: []
      }).as("getMessages");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getMessages");
      cy.get('[data-testid="chat-window"]').should("be.visible");
      cy.get('[data-testid="chat-header"]').should("contain", "friend1");
    });

    it("should close chat window", () => {
      cy.intercept("GET", "/api/messages/friend123", {
        statusCode: 200,
        body: []
      }).as("getMessages");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getMessages");
      cy.get('[data-testid="close-chat"]').click();
      cy.get('[data-testid="chat-window"]').should("not.exist");
    });

    it("should minimize and restore chat window", () => {
      cy.intercept("GET", "/api/messages/friend123", {
        statusCode: 200,
        body: []
      }).as("getMessages");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getMessages");
      
      // Minimize
      cy.get('[data-testid="minimize-chat"]').click();
      cy.get('[data-testid="chat-body"]').should("not.be.visible");
      
      // Restore
      cy.get('[data-testid="chat-header"]').click();
      cy.get('[data-testid="chat-body"]').should("be.visible");
    });

    it("should handle multiple chat windows", () => {
      const mockFriends = [
        { _id: "friend123", name: "friend1", profile: "" },
        { _id: "friend456", name: "friend2", profile: "" }
      ];

      cy.intercept("GET", "/api/friend-requests/friends", {
        statusCode: 200,
        body: mockFriends
      }).as("getFriendsMultiple");

      cy.intercept("GET", "/api/messages/friend123", {
        statusCode: 200,
        body: []
      }).as("getMessages1");

      cy.intercept("GET", "/api/messages/friend456", {
        statusCode: 200,
        body: []
      }).as("getMessages2");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriendsMultiple");
      
      // Open first chat
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });
      cy.wait("@getMessages1");

      // Open second chat
      cy.get('[data-testid="friend-item"]').last().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });
      cy.wait("@getMessages2");

      // Should have two chat windows
      cy.get('[data-testid="chat-window"]').should("have.length", 2);
    });
  });

  describe("Message Display", () => {
    beforeEach(() => {
      const mockMessages = [
        {
          _id: "msg1",
          senderId: "friend123",
          recipientId: "user123",
          content: "Hello there!",
          createdAt: new Date(Date.now() - 60000).toISOString()
        },
        {
          _id: "msg2", 
          senderId: "user123",
          recipientId: "friend123",
          content: "Hi! How are you?",
          createdAt: new Date().toISOString()
        }
      ];

      cy.intercept("GET", "/api/messages/friend123", {
        statusCode: 200,
        body: mockMessages
      }).as("getMessagesWithData");
    });

    it("should display existing messages", () => {
      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getMessagesWithData");
      
      cy.get('[data-testid="message-item"]').should("have.length", 2);
      
      // Check received message
      cy.get('[data-testid="message-item"]').first().within(() => {
        cy.get('[data-testid="message-content"]').should("contain", "Hello there!");
        cy.get('[data-testid="message-sender"]').should("contain", "friend1");
      });

      // Check sent message
      cy.get('[data-testid="message-item"]').last().within(() => {
        cy.get('[data-testid="message-content"]').should("contain", "Hi! How are you?");
        cy.get('[data-testid="message-sender"]').should("contain", "You");
      });
    });

    it("should show message timestamps", () => {
      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getMessagesWithData");
      
      cy.get('[data-testid="message-item"]').each(($message) => {
        cy.wrap($message).find('[data-testid="message-timestamp"]').should("exist");
      });
    });

    it("should auto-scroll to latest message", () => {
      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getMessagesWithData");
      
      // Check that the latest message is visible
      cy.get('[data-testid="message-item"]').last().should("be.visible");
    });
  });

  describe("Send Messages", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/messages/friend123", {
        statusCode: 200,
        body: []
      }).as("getMessages");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getMessages");
    });

    it("should send text message", () => {
      cy.intercept("POST", "/api/messages/send/friend123", {
        statusCode: 201,
        body: {
          _id: "newMsg",
          senderId: "user123",
          recipientId: "friend123",
          content: "Hello friend!",
          createdAt: new Date().toISOString()
        }
      }).as("sendMessage");

      cy.get('[data-testid="message-input"]').type("Hello friend!");
      cy.get('[data-testid="send-button"]').click();

      cy.wait("@sendMessage").then((interception) => {
        expect(interception.request.body).to.include({
          content: "Hello friend!"
        });
      });

      // Message input should be cleared
      cy.get('[data-testid="message-input"]').should("have.value", "");
    });

    it("should send message with Enter key", () => {
      cy.intercept("POST", "/api/messages/send/friend123", {
        statusCode: 201,
        body: {
          _id: "newMsg",
          senderId: "user123",
          recipientId: "friend123",
          content: "Hello with enter!",
          createdAt: new Date().toISOString()
        }
      }).as("sendMessage");

      cy.get('[data-testid="message-input"]').type("Hello with enter!{enter}");

      cy.wait("@sendMessage");
    });

    it("should not send empty message", () => {
      cy.get('[data-testid="send-button"]').click();
      
      // Should not make API call for empty message
      cy.get("@sendMessage.all").should("have.length", 0);
    });

    it("should handle send message error", () => {
      cy.intercept("POST", "/api/messages/send/friend123", {
        statusCode: 403,
        body: { error: "You can only send messages to friends" }
      }).as("sendMessageError");

      cy.get('[data-testid="message-input"]').type("Hello friend!");
      cy.get('[data-testid="send-button"]').click();

      cy.wait("@sendMessageError");
      cy.get('[data-testid="error-message"]').should("contain", "You can only send messages to friends");
    });

    it("should show loading state while sending", () => {
      cy.intercept("POST", "/api/messages/send/friend123", {
        statusCode: 201,
        body: {
          _id: "newMsg",
          senderId: "user123",
          recipientId: "friend123",
          content: "Hello friend!",
          createdAt: new Date().toISOString()
        },
        delay: 1000
      }).as("sendMessageDelay");

      cy.get('[data-testid="message-input"]').type("Hello friend!");
      cy.get('[data-testid="send-button"]').click();
      
      cy.get('[data-testid="send-button"]').should("be.disabled");
      cy.get('[data-testid="sending-indicator"]').should("be.visible");
      
      cy.wait("@sendMessageDelay");
      
      cy.get('[data-testid="send-button"]').should("not.be.disabled");
      cy.get('[data-testid="sending-indicator"]').should("not.exist");
    });
  });

  describe("Real-time Updates", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/messages/friend123", {
        statusCode: 200,
        body: []
      }).as("getMessages");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getMessages");
    });

    it("should receive new messages via socket", () => {
      // Simulate receiving a new message via socket
      cy.window().then((win) => {
        const mockMessage = {
          _id: "socketMsg",
          senderId: "friend123",
          recipientId: "user123",
          content: "New message via socket!",
          createdAt: new Date().toISOString()
        };

        // Trigger socket event
        win.dispatchEvent(new CustomEvent('newMessage', { 
          detail: mockMessage 
        }));
      });

      cy.get('[data-testid="message-item"]').should("have.length", 1);
      cy.get('[data-testid="message-content"]').should("contain", "New message via socket!");
    });

    it("should show typing indicator", () => {
      // Simulate typing indicator via socket
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('userTyping', { 
          detail: { userId: "friend123", isTyping: true }
        }));
      });

      cy.get('[data-testid="typing-indicator"]').should("be.visible");
      cy.get('[data-testid="typing-indicator"]').should("contain", "friend1 is typing...");
    });

    it("should hide typing indicator", () => {
      // Show typing first
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('userTyping', { 
          detail: { userId: "friend123", isTyping: true }
        }));
      });

      cy.get('[data-testid="typing-indicator"]').should("be.visible");

      // Hide typing
      cy.window().then((win) => {
        win.dispatchEvent(new CustomEvent('userTyping', { 
          detail: { userId: "friend123", isTyping: false }
        }));
      });

      cy.get('[data-testid="typing-indicator"]').should("not.exist");
    });
  });

  describe("Message Validation", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/messages/friend123", {
        statusCode: 200,
        body: []
      }).as("getMessages");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getMessages");
    });

    it("should handle message censorship", () => {
      cy.intercept("POST", "/api/messages/send/friend123", {
        statusCode: 400,
        body: { error: "Message blocked due to inappropriate content" }
      }).as("sendBlockedMessage");

      cy.get('[data-testid="message-input"]').type("inappropriate content");
      cy.get('[data-testid="send-button"]').click();

      cy.wait("@sendBlockedMessage");
      cy.get('[data-testid="error-message"]').should("contain", "Message blocked due to inappropriate content");
    });

    it("should limit message length", () => {
      const longMessage = "a".repeat(1001); // Assuming 1000 char limit
      
      cy.get('[data-testid="message-input"]').type(longMessage);
      cy.get('[data-testid="character-count"]').should("contain", "1000/1000");
      cy.get('[data-testid="send-button"]').should("be.disabled");
    });
  });

  describe("Chat Accessibility", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/messages/friend123", {
        statusCode: 200,
        body: []
      }).as("getMessages");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getMessages");
    });

    it("should be keyboard navigable", () => {
      cy.get('[data-testid="message-input"]').focus();
      cy.get('[data-testid="message-input"]').should("be.focused");
      
      cy.get('[data-testid="message-input"]').type("{tab}");
      cy.get('[data-testid="send-button"]').should("be.focused");
    });

    it("should have proper ARIA labels", () => {
      cy.get('[data-testid="message-input"]').should("have.attr", "aria-label");
      cy.get('[data-testid="send-button"]').should("have.attr", "aria-label");
      cy.get('[data-testid="close-chat"]').should("have.attr", "aria-label");
    });
  });

  describe("Empty States", () => {
    it("should show empty chat state", () => {
      cy.intercept("GET", "/api/messages/friend123", {
        statusCode: 200,
        body: []
      }).as("getEmptyMessages");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriends");
      
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="chat-button"]').click();
      });

      cy.wait("@getEmptyMessages");
      
      cy.get('[data-testid="empty-chat"]').should("be.visible");
      cy.get('[data-testid="empty-chat"]').should("contain", "No messages yet");
    });
  });
});
