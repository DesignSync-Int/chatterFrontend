describe("Notifications System", () => {
  const mockUser = {
    _id: "user123",
    email: "testuser@example.com",
    username: "testuser",
    fullName: "Test User"
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();

    cy.window().then((win) => {
      win.localStorage.setItem("token", "mock-jwt-token");
    });

    cy.intercept("GET", "/api/auth/check", {
      statusCode: 200,
      body: mockUser
    }).as("authCheck");

    // Mock initial empty states
    cy.intercept("GET", "/api/friend-requests/received", {
      statusCode: 200,
      body: []
    }).as("getReceivedRequests");

    cy.intercept("GET", "/api/messages/unread", {
      statusCode: 200,
      body: []
    }).as("getUnreadMessages");
  });

  describe("Notification Bell and Badge", () => {
    it("should display notification bell", () => {
      cy.visit("/home");
      cy.wait("@authCheck");

      cy.get("[data-cy=notification-bell]").should("be.visible");
      cy.get("[data-cy=notification-badge]").should("not.exist");
    });

    it("should show badge when there are notifications", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: [{
          _id: "request1",
          sender: {
            username: "friend1",
            fullName: "Friend One"
          },
          status: "pending"
        }]
      }).as("getRequestsWithData");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getRequestsWithData");

      cy.get("[data-cy=notification-badge]").should("be.visible");
      cy.get("[data-cy=notification-badge]").should("contain", "1");
    });

    it("should show correct badge count with multiple notifications", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: [
          { _id: "req1", sender: { username: "user1" }, status: "pending" },
          { _id: "req2", sender: { username: "user2" }, status: "pending" }
        ]
      }).as("getMultipleRequests");

      cy.intercept("GET", "/api/messages/unread", {
        statusCode: 200,
        body: [
          { _id: "msg1", sender: { username: "user3" }, content: "Hello" }
        ]
      }).as("getUnreadMessagesWithData");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getMultipleRequests");
      cy.wait("@getUnreadMessagesWithData");

      cy.get("[data-cy=notification-badge]").should("contain", "3");
    });

    it("should open notifications panel when bell is clicked", () => {
      cy.visit("/home");
      cy.wait("@authCheck");

      cy.get("[data-cy=notification-bell]").click();
      cy.get("[data-cy=notifications-panel]").should("be.visible");
    });

    it("should close notifications panel when clicking outside", () => {
      cy.visit("/home");
      cy.wait("@authCheck");

      cy.get("[data-cy=notification-bell]").click();
      cy.get("[data-cy=notifications-panel]").should("be.visible");

      cy.get("body").click(0, 0);
      cy.get("[data-cy=notifications-panel]").should("not.be.visible");
    });
  });

  describe("Friend Request Notifications", () => {
    it("should display friend request notifications", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: [{
          _id: "request1",
          sender: {
            _id: "sender1",
            username: "friend1",
            fullName: "Friend One",
            profilePic: "http://example.com/avatar1.jpg"
          },
          createdAt: new Date().toISOString(),
          status: "pending"
        }]
      }).as("getFriendRequests");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getFriendRequests");

      cy.get("[data-cy=notification-bell]").click();
      cy.get("[data-cy=friend-request-notification]").should("have.length", 1);
      cy.get("[data-cy=friend-request-notification]").should("contain", "Friend One");
      cy.get("[data-cy=friend-request-notification]").should("contain", "sent you a friend request");
    });

    it("should allow accepting friend request from notification", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: [{
          _id: "request1",
          sender: { username: "friend1", fullName: "Friend One" },
          status: "pending"
        }]
      }).as("getFriendRequests");

      cy.intercept("POST", "/api/friend-requests/accept", {
        statusCode: 200,
        body: { message: "Friend request accepted" }
      }).as("acceptRequest");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getFriendRequests");

      cy.get("[data-cy=notification-bell]").click();
      cy.get("[data-cy=accept-friend-request]").first().click();
      cy.wait("@acceptRequest");

      cy.get("[data-cy=success-message]").should("contain", "accepted");
    });

    it("should allow rejecting friend request from notification", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: [{
          _id: "request1",
          sender: { username: "friend1", fullName: "Friend One" },
          status: "pending"
        }]
      }).as("getFriendRequests");

      cy.intercept("POST", "/api/friend-requests/reject", {
        statusCode: 200,
        body: { message: "Friend request rejected" }
      }).as("rejectRequest");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getFriendRequests");

      cy.get("[data-cy=notification-bell]").click();
      cy.get("[data-cy=reject-friend-request]").first().click();
      cy.wait("@rejectRequest");

      cy.get("[data-cy=success-message]").should("contain", "rejected");
    });
  });

  describe("Message Notifications", () => {
    it("should display unread message notifications", () => {
      cy.intercept("GET", "/api/messages/unread", {
        statusCode: 200,
        body: [{
          _id: "msg1",
          sender: {
            _id: "sender1",
            username: "friend1",
            fullName: "Friend One"
          },
          content: "Hey, how are you?",
          createdAt: new Date().toISOString()
        }]
      }).as("getUnreadMessages");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getUnreadMessages");

      cy.get("[data-cy=notification-bell]").click();
      cy.get("[data-cy=message-notification]").should("have.length", 1);
      cy.get("[data-cy=message-notification]").should("contain", "Friend One");
      cy.get("[data-cy=message-notification]").should("contain", "Hey, how are you?");
    });

    it("should open chat when message notification is clicked", () => {
      cy.intercept("GET", "/api/messages/unread", {
        statusCode: 200,
        body: [{
          _id: "msg1",
          sender: {
            _id: "sender1",
            username: "friend1",
            fullName: "Friend One"
          },
          content: "Hello!",
          createdAt: new Date().toISOString()
        }]
      }).as("getUnreadMessages");

      // Mock chat opening
      cy.intercept("GET", "/api/messages/sender1", {
        statusCode: 200,
        body: []
      }).as("getChatMessages");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getUnreadMessages");

      cy.get("[data-cy=notification-bell]").click();
      cy.get("[data-cy=message-notification]").first().click();
      
      cy.get("[data-cy=chat-window]").should("be.visible");
      cy.get("[data-cy=chat-header]").should("contain", "Friend One");
    });
  });

  describe("Real-time Updates", () => {
    it("should update badge count when new friend request arrives", () => {
      cy.visit("/home");
      cy.wait("@authCheck");

      // Initially no badge
      cy.get("[data-cy=notification-badge]").should("not.exist");

      // Simulate real-time friend request
      cy.window().then((win) => {
        const mockSocket = {
          emit: cy.stub(),
          on: cy.stub()
        };
        win.mockSocket = mockSocket;
        
        // Simulate receiving a friend request event
        if (win.handleFriendRequestReceived) {
          win.handleFriendRequestReceived({
            _id: "newreq1",
            sender: {
              username: "newuser",
              fullName: "New User"
            }
          });
        }
      });

      cy.get("[data-cy=notification-badge]", { timeout: 5000 }).should("be.visible");
      cy.get("[data-cy=notification-badge]").should("contain", "1");
    });

    it("should update badge count when new message arrives", () => {
      cy.visit("/home");
      cy.wait("@authCheck");

      cy.get("[data-cy=notification-badge]").should("not.exist");

      // Simulate receiving a new message
      cy.window().then((win) => {
        if (win.handleNewMessage) {
          win.handleNewMessage({
            _id: "newmsg1",
            sender: {
              _id: "user123",
              username: "sender",
              fullName: "Message Sender"
            },
            content: "New message for you!",
            recipient: mockUser._id
          });
        }
      });

      cy.get("[data-cy=notification-badge]", { timeout: 5000 }).should("be.visible");
      cy.get("[data-cy=notification-badge]").should("contain", "1");
    });

    it("should decrease badge count when notification is resolved", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: [{
          _id: "request1",
          sender: { username: "friend1", fullName: "Friend One" },
          status: "pending"
        }]
      }).as("getFriendRequests");

      cy.intercept("POST", "/api/friend-requests/accept", {
        statusCode: 200,
        body: { message: "Friend request accepted" }
      }).as("acceptRequest");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getFriendRequests");

      cy.get("[data-cy=notification-badge]").should("contain", "1");

      cy.get("[data-cy=notification-bell]").click();
      cy.get("[data-cy=accept-friend-request]").first().click();
      cy.wait("@acceptRequest");

      cy.get("[data-cy=notification-badge]").should("not.exist");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      cy.visit("/home");
      cy.wait("@authCheck");

      cy.get("[data-cy=notification-bell]")
        .should("have.attr", "aria-label")
        .and("contain", "notifications");

      cy.get("[data-cy=notification-bell]").click();
      
      cy.get("[data-cy=notifications-panel]")
        .should("have.attr", "role", "dialog");
    });

    it("should support keyboard navigation", () => {
      cy.visit("/home");
      cy.wait("@authCheck");

      cy.get("[data-cy=notification-bell]").focus();
      cy.get("[data-cy=notification-bell]").type("{enter}");
      cy.get("[data-cy=notifications-panel]").should("be.visible");

      cy.get("[data-cy=notifications-panel]").type("{esc}");
      cy.get("[data-cy=notifications-panel]").should("not.be.visible");
    });

    it("should announce notifications to screen readers", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: [{
          _id: "request1",
          sender: { username: "friend1", fullName: "Friend One" },
          status: "pending"
        }]
      }).as("getFriendRequests");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getFriendRequests");

      cy.get("[data-cy=notification-badge]")
        .should("have.attr", "aria-label")
        .and("contain", "1 notification");
    });
  });
});
