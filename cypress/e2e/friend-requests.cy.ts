/// <reference types="cypress" />

describe("Friend Request System", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.window().then((win) => {
      win.localStorage.setItem('auth-token', 'mock-token');
    });
    
    cy.intercept("GET", "/api/auth/check", {
      statusCode: 200,
      body: { _id: "user123", name: "testuser", fullName: "Test User" }
    }).as("checkAuth");
    
    cy.intercept("GET", "/api/friend-requests/received", {
      statusCode: 200,
      body: []
    }).as("getReceivedRequests");
    
    cy.intercept("GET", "/api/friend-requests/sent", {
      statusCode: 200,
      body: []
    }).as("getSentRequests");
    
    cy.intercept("GET", "/api/friend-requests/friends", {
      statusCode: 200,
      body: []
    }).as("getFriends");
    
    cy.visit("/home");
    cy.wait("@checkAuth");
  });

  describe("Add Friend Modal", () => {
    beforeEach(() => {
      cy.intercept("GET", "/api/messages/users", {
        statusCode: 200,
        body: {
          users: [
            { _id: "user456", name: "frienduser", fullName: "Friend User" }
          ],
          totalUsers: 1
        }
      }).as("getUsers");
    });

    it("should open add friend modal from user list", () => {
      cy.get('[data-testid="users-tab"]').click();
      cy.wait("@getUsers");
      
      cy.get('[data-testid="user-card"]').first().within(() => {
        cy.get('[data-testid="add-friend-button"]').click();
      });
      
      cy.get('[data-testid="add-friend-modal"]').should("be.visible");
      cy.get("h2").should("contain", "Add Friend");
    });

    it("should send friend request with message", () => {
      cy.intercept("POST", "/api/friend-requests/send", {
        statusCode: 201,
        body: { message: "Friend request sent successfully" }
      }).as("sendFriendRequest");

      cy.get('[data-testid="users-tab"]').click();
      cy.wait("@getUsers");
      
      cy.get('[data-testid="user-card"]').first().within(() => {
        cy.get('[data-testid="add-friend-button"]').click();
      });
      
      cy.get('[data-testid="friend-request-message"]').type("Hi! Let's be friends!");
      cy.get('[data-testid="send-friend-request"]').click();
      
      cy.wait("@sendFriendRequest").then((interception) => {
        expect(interception.request.body).to.include({
          receiverId: "user456",
          message: "Hi! Let's be friends!"
        });
      });
      
      cy.get('[data-testid="success-message"]').should("contain", "Friend request sent");
    });

    it("should send friend request without message", () => {
      cy.intercept("POST", "/api/friend-requests/send", {
        statusCode: 201,
        body: { message: "Friend request sent successfully" }
      }).as("sendFriendRequest");

      cy.get('[data-testid="users-tab"]').click();
      cy.wait("@getUsers");
      
      cy.get('[data-testid="user-card"]').first().within(() => {
        cy.get('[data-testid="add-friend-button"]').click();
      });
      
      cy.get('[data-testid="send-friend-request"]').click();
      
      cy.wait("@sendFriendRequest").then((interception) => {
        expect(interception.request.body).to.include({
          receiverId: "user456"
        });
      });
    });

    it("should handle friend request error", () => {
      cy.intercept("POST", "/api/friend-requests/send", {
        statusCode: 400,
        body: { message: "Friend request already exists" }
      }).as("sendFriendRequestError");

      cy.get('[data-testid="users-tab"]').click();
      cy.wait("@getUsers");
      
      cy.get('[data-testid="user-card"]').first().within(() => {
        cy.get('[data-testid="add-friend-button"]').click();
      });
      
      cy.get('[data-testid="send-friend-request"]').click();
      
      cy.wait("@sendFriendRequestError");
      cy.get('[data-testid="error-message"]').should("contain", "Friend request already exists");
    });

    it("should close modal on cancel", () => {
      cy.get('[data-testid="users-tab"]').click();
      cy.wait("@getUsers");
      
      cy.get('[data-testid="user-card"]').first().within(() => {
        cy.get('[data-testid="add-friend-button"]').click();
      });
      
      cy.get('[data-testid="cancel-friend-request"]').click();
      cy.get('[data-testid="add-friend-modal"]').should("not.exist");
    });
  });

  describe("Friend Request Tabs", () => {
    beforeEach(() => {
      cy.get('[data-testid="received-tab"]').click();
    });

    it("should display received friend requests", () => {
      const mockRequests = [
        {
          _id: "req123",
          sender: { _id: "user456", name: "sender1", profile: "" },
          message: "Let's be friends!",
          createdAt: new Date().toISOString(),
          status: "pending"
        }
      ];

      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: mockRequests
      }).as("getReceivedRequestsWithData");

      cy.reload();
      cy.wait("@getReceivedRequestsWithData");

      cy.get('[data-testid="friend-request-item"]').should("have.length", 1);
      cy.get('[data-testid="friend-request-item"]').first().within(() => {
        cy.get('[data-testid="sender-name"]').should("contain", "sender1");
        cy.get('[data-testid="request-message"]').should("contain", "Let's be friends!");
        cy.get('[data-testid="accept-button"]').should("be.visible");
        cy.get('[data-testid="decline-button"]').should("be.visible");
      });
    });

    it("should accept friend request", () => {
      const mockRequests = [
        {
          _id: "req123",
          sender: { _id: "user456", name: "sender1", profile: "" },
          message: "Let's be friends!",
          createdAt: new Date().toISOString(),
          status: "pending"
        }
      ];

      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: mockRequests
      }).as("getReceivedRequestsWithData");

      cy.intercept("PUT", "/api/friend-requests/accept/req123", {
        statusCode: 200,
        body: { message: "Friend request accepted" }
      }).as("acceptFriendRequest");

      cy.reload();
      cy.wait("@getReceivedRequestsWithData");

      cy.get('[data-testid="friend-request-item"]').first().within(() => {
        cy.get('[data-testid="accept-button"]').click();
      });

      cy.wait("@acceptFriendRequest");
      // Should show success message or update UI
    });

    it("should decline friend request", () => {
      const mockRequests = [
        {
          _id: "req123",
          sender: { _id: "user456", name: "sender1", profile: "" },
          message: "Let's be friends!",
          createdAt: new Date().toISOString(),
          status: "pending"
        }
      ];

      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: mockRequests
      }).as("getReceivedRequestsWithData");

      cy.intercept("PUT", "/api/friend-requests/decline/req123", {
        statusCode: 200,
        body: { message: "Friend request declined" }
      }).as("declineFriendRequest");

      cy.reload();
      cy.wait("@getReceivedRequestsWithData");

      cy.get('[data-testid="friend-request-item"]').first().within(() => {
        cy.get('[data-testid="decline-button"]').click();
      });

      cy.wait("@declineFriendRequest");
    });

    it("should display sent friend requests", () => {
      const mockSentRequests = [
        {
          _id: "req456",
          receiver: { _id: "user789", name: "receiver1", profile: "" },
          message: "Hi there!",
          createdAt: new Date().toISOString(),
          status: "pending"
        }
      ];

      cy.intercept("GET", "/api/friend-requests/sent", {
        statusCode: 200,
        body: mockSentRequests
      }).as("getSentRequestsWithData");

      cy.get('[data-testid="sent-tab"]').click();
      cy.wait("@getSentRequestsWithData");

      cy.get('[data-testid="sent-request-item"]').should("have.length", 1);
      cy.get('[data-testid="sent-request-item"]').first().within(() => {
        cy.get('[data-testid="receiver-name"]').should("contain", "receiver1");
        cy.get('[data-testid="request-status"]').should("contain", "Pending");
      });
    });

    it("should display friends list", () => {
      const mockFriends = [
        {
          _id: "friend123",
          name: "friend1",
          profile: ""
        }
      ];

      cy.intercept("GET", "/api/friend-requests/friends", {
        statusCode: 200,
        body: mockFriends
      }).as("getFriendsWithData");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriendsWithData");

      cy.get('[data-testid="friend-item"]').should("have.length", 1);
      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="friend-name"]').should("contain", "friend1");
        cy.get('[data-testid="chat-button"]').should("be.visible");
        cy.get('[data-testid="remove-friend-button"]').should("be.visible");
      });
    });

    it("should remove friend with confirmation", () => {
      const mockFriends = [
        {
          _id: "friend123",
          name: "friend1",
          profile: ""
        }
      ];

      cy.intercept("GET", "/api/friend-requests/friends", {
        statusCode: 200,
        body: mockFriends
      }).as("getFriendsWithData");

      cy.intercept("DELETE", "/api/friend-requests/remove/friend123", {
        statusCode: 200,
        body: { message: "Friend removed successfully" }
      }).as("removeFriend");

      cy.get('[data-testid="friends-tab"]').click();
      cy.wait("@getFriendsWithData");

      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });

      cy.get('[data-testid="friend-item"]').first().within(() => {
        cy.get('[data-testid="remove-friend-button"]').click();
      });

      cy.wait("@removeFriend");
    });
  });

  describe("Empty States", () => {
    it("should show empty state for no received requests", () => {
      cy.get('[data-testid="received-tab"]').click();
      cy.get('[data-testid="empty-received-requests"]').should("be.visible");
      cy.get('[data-testid="empty-received-requests"]').should("contain", "No pending friend requests");
    });

    it("should show empty state for no sent requests", () => {
      cy.get('[data-testid="sent-tab"]').click();
      cy.get('[data-testid="empty-sent-requests"]').should("be.visible");
      cy.get('[data-testid="empty-sent-requests"]').should("contain", "No sent friend requests");
    });

    it("should show empty state for no friends", () => {
      cy.get('[data-testid="friends-tab"]').click();
      cy.get('[data-testid="empty-friends"]').should("be.visible");
      cy.get('[data-testid="empty-friends"]').should("contain", "No friends yet");
    });
  });

  describe("Loading States", () => {
    it("should show loading spinner while fetching requests", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: [],
        delay: 2000
      }).as("getReceivedRequestsDelay");

      cy.get('[data-testid="received-tab"]').click();
      cy.get('[data-testid="loading-spinner"]').should("be.visible");
      cy.wait("@getReceivedRequestsDelay");
      cy.get('[data-testid="loading-spinner"]').should("not.exist");
    });
  });
});
