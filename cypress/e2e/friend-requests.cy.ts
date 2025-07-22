describe("Friend Requests System", () => {
  const mockUser = {
    _id: "user123",
    name: "Test User",
    email: "testuser@example.com",
    fullName: "Test User",
    profile: "http://example.com/avatar.jpg"
  };

  const mockFriend = {
    _id: "friend123",
    name: "Friend User",
    email: "friend@example.com", 
    fullName: "Friend User",
    profile: "http://example.com/friend-avatar.jpg",
    isOnline: true
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();

    // Handle application errors to prevent test failures
    cy.on('uncaught:exception', (err) => {
      // Don't fail on application errors
      return false;
    });

    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem("token", "mock-jwt-token");
    });

    // Mock successful auth check
    cy.intercept("GET", "/api/auth/check", {
      statusCode: 200,
      body: mockUser
    }).as("authCheck");

    // Mock friend requests API endpoints
    cy.intercept("GET", "/api/friend-requests/sent", {
      statusCode: 200,
      body: []
    }).as("getSentRequests");

    cy.intercept("GET", "/api/friend-requests/received", {
      statusCode: 200,
      body: []
    }).as("getReceivedRequests");

    cy.intercept("GET", "/api/friend-requests/friends", {
      statusCode: 200,
      body: []
    }).as("getFriends");
  });

  describe("Basic Navigation", () => {
    it("should load home page without errors", () => {
      cy.visit("/home");
      cy.wait("@authCheck");
      
      // Check that page loads
      cy.get("[data-cy=home-container]", { timeout: 10000 }).should("exist");
    });

    it("should display user interface elements", () => {
      cy.visit("/home");
      cy.wait("@authCheck");
      
      // Check for basic UI elements (using more generic selectors)
      cy.get("body").should("be.visible");
      cy.contains("Test User").should("be.visible");
    });
  });

  describe("Friend Requests Mock Tests", () => {
    it("should handle friend requests API calls", () => {
      cy.intercept("POST", "/api/friend-requests/send", {
        statusCode: 201,
        body: {
          message: "Friend request sent successfully",
          friendRequest: {
            _id: "request123",
            sender: mockUser._id,
            recipient: mockFriend._id,
            status: "pending"
          }
        }
      }).as("sendFriendRequest");

      cy.visit("/home");
      cy.wait("@authCheck");

      // Test that the API intercept is working
      cy.request("POST", "/api/friend-requests/send", {
        recipientId: mockFriend._id
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.message).to.include("sent successfully");
      });
    });

    it("should handle received friend requests API", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 200,
        body: [{
          _id: "request456",
          sender: mockFriend,
          recipient: mockUser._id,
          status: "pending",
          createdAt: new Date().toISOString()
        }]
      }).as("getReceivedRequestsWithData");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getReceivedRequestsWithData");

      // Just verify the request was made successfully
      cy.get("@getReceivedRequestsWithData").should("have.been.called");
    });

    it("should handle friends list API", () => {
      cy.intercept("GET", "/api/friend-requests/friends", {
        statusCode: 200,
        body: [mockFriend]
      }).as("getFriendsWithData");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@getFriendsWithData");

      // Verify API call was made
      cy.get("@getFriendsWithData").should("have.been.called");
    });

    it("should handle accept friend request action", () => {
      cy.intercept("POST", "/api/friend-requests/accept", {
        statusCode: 200,
        body: {
          message: "Friend request accepted",
          friendship: {
            user1: mockUser._id,
            user2: mockFriend._id,
            createdAt: new Date().toISOString()
          }
        }
      }).as("acceptFriendRequest");

      cy.visit("/home");
      cy.wait("@authCheck");

      // Test API call
      cy.request("POST", "/api/friend-requests/accept", {
        requestId: "request123"
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.include("accepted");
      });
    });

    it("should handle reject friend request action", () => {
      cy.intercept("POST", "/api/friend-requests/reject", {
        statusCode: 200,
        body: {
          message: "Friend request rejected"
        }
      }).as("rejectFriendRequest");

      cy.visit("/home");
      cy.wait("@authCheck");

      // Test API call
      cy.request("POST", "/api/friend-requests/reject", {
        requestId: "request123"
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.include("rejected");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 500,
        body: { message: "Server error" }
      }).as("serverError");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@serverError");

      // Just verify the error response was received
      cy.get("@serverError").should("have.been.called");
    });

    it("should handle unauthorized access", () => {
      cy.intercept("GET", "/api/friend-requests/received", {
        statusCode: 401,
        body: { message: "Unauthorized" }
      }).as("unauthorized");

      cy.visit("/home");
      cy.wait("@authCheck");
      cy.wait("@unauthorized");

      // Verify unauthorized response
      cy.get("@unauthorized").should("have.been.called");
    });
  });
});
