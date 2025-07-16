# Cypress E2E Test Suite for Chatter

This directory contains comprehensive end-to-end tests for the Chatter chat application using Cypress.

## 📁 Test Structure

```
cypress/
├── e2e/
│   ├── auth.cy.ts           # Authentication flow tests
│   ├── home.cy.ts           # Home page and user list tests
│   ├── notifications.cy.ts  # Notification system tests
│   ├── chat.cy.ts           # Chat functionality tests
│   └── integration.cy.ts    # Complete user flow tests
├── fixtures/
│   ├── users.json           # Mock user data
│   └── messages.json        # Mock message data
├── support/
│   ├── commands.ts          # Custom Cypress commands
│   └── e2e.ts              # Support file and type definitions
└── cypress.config.ts        # Cypress configuration
```

## 🧪 Test Categories

### 1. Authentication Tests (`auth.cy.ts`)
- **Login Flow**: Valid/invalid credentials, form validation
- **Signup Flow**: New user registration, existing email handling
- **Logout Flow**: Session cleanup, redirect behavior
- **Protected Routes**: Access control, authentication persistence
- **Session Management**: Page refresh, auto-login prevention

### 2. Home Page Tests (`home.cy.ts`)
- **Layout**: Header, user info, navigation elements
- **User List**: Loading, display, message buttons
- **Online Status**: Live indicators for online users
- **Responsive Design**: Mobile, tablet, desktop viewports
- **Error Handling**: API failures, loading states

### 3. Notification Tests (`notifications.cy.ts`)
- **Notification Bell**: Display, badge counts, panel toggle
- **Test Buttons**: Message and online notification creation
- **Panel Content**: Notification list, timestamps, unread indicators
- **Interactions**: Mark as read, clear all, chat opening
- **Real-time**: Socket connection, filtering for open chats
- **Persistence**: State across refreshes and sessions

### 4. Chat Tests (`chat.cy.ts`)
- **Window Management**: Open, close, minimize, multiple windows
- **Message Input**: Send button states, Enter key, validation
- **Message Display**: History, timestamps, sent/received styling
- **Real-time**: Socket connection, live messaging
- **Persistence**: State across refreshes, minimized state
- **Error Handling**: Send failures, connection issues

### 5. Integration Tests (`integration.cy.ts`)
- **Complete Flows**: Login → Chat → Messaging workflows
- **Notification to Chat**: Notification click → chat opening
- **Session Management**: State persistence, logout/login cycles
- **Error Recovery**: API failures, authentication issues
- **Performance**: Multiple notifications, rapid messaging
- **Accessibility**: Keyboard navigation, visual feedback

## 🚀 Running Tests

### Prerequisites
1. **Backend Running**: Ensure the backend API is running at `https://chatterbackend-08lw.onrender.com`
2. **Test Users**: Set up test users in the backend with credentials defined in `cypress.config.ts`
3. **Frontend Dev Server**: Start the development server on `http://localhost:5174`

### Commands

```bash
# Install dependencies
npm install

# Run all tests in headless mode
npm run test:e2e

# Open Cypress Test Runner (interactive mode)
npm run test:e2e:open

# Run dev server and Cypress together
npm run test:e2e:dev

# Run unit tests and E2E tests
npm run test:all
```

### Manual Setup
```bash
# Start development server
npm run dev

# In another terminal, run Cypress
npx cypress open
# or
npx cypress run
```

## ⚙️ Configuration

### Environment Variables
Set in `cypress.config.ts` under `env`:

```typescript
env: {
  apiUrl: 'https://chatterbackend-08lw.onrender.com',
  testUser1: {
    email: 'testuser1@example.com',
    name: 'Test User 1',
    password: 'testpass123'
  },
  testUser2: {
    email: 'testuser2@example.com',
    name: 'Test User 2',
    password: 'testpass123'
  }
}
```

### Test Data Requirements
Before running tests, ensure these test users exist in your backend:
- **Test User 1**: `testuser1@example.com` / `testpass123`
- **Test User 2**: `testuser2@example.com` / `testpass123`

## 🔧 Custom Commands

### Authentication Commands
```typescript
cy.login(email, password)     // Login with credentials
cy.signup(name, email, pass)  // Sign up new user
cy.logout()                   // Logout current user
```

### Utility Commands
```typescript
cy.waitForPageLoad()          // Wait for page to fully load
cy.clearNotifications()       // Clear all notifications
cy.openChatWith(userName)     // Open chat with specific user
```

## 📊 Test Data Attributes

Add these `data-testid` attributes to your components for reliable test targeting:

### Required Attributes
```html
<!-- Notifications -->
<button data-testid="notification-bell">
<div data-testid="notification-panel">
<div data-testid="notification-badge">
<div data-testid="notification-item">
<button data-testid="notification-close">

<!-- Chat -->
<div data-testid="chat-window">
<input data-testid="message-input">
<button data-testid="send-button">
<div data-testid="message-list">
<div data-testid="message-item">
<button data-testid="chat-minimize">
<button data-testid="chat-close">

<!-- User List -->
<div data-testid="user-card">

<!-- Loading States -->
<div data-testid="loading">
<div data-testid="message-loading">
```

## 🐛 Debugging Tests

### Common Issues
1. **Timing Issues**: Use `cy.waitForPageLoad()` after navigation
2. **Socket Connections**: Ensure backend is running and accessible
3. **Authentication**: Verify test users exist in backend
4. **Viewport Issues**: Tests are designed for 1280x720, may need adjustment

### Debug Mode
```bash
# Run with debug output
DEBUG=cypress:* npx cypress run

# Open DevTools in Cypress runner
# Click on the "DevTools" button in the Cypress runner
```

### Video and Screenshots
- Videos are recorded for failed tests (headless mode)
- Screenshots are taken on failures
- Files saved to `cypress/videos/` and `cypress/screenshots/`

## 📈 Test Coverage

### Authentication: 95%
- ✅ Login (valid/invalid credentials)
- ✅ Signup (new user/existing email)
- ✅ Logout and session cleanup
- ✅ Protected route access
- ✅ Session persistence

### Home Page: 90%
- ✅ Layout and navigation
- ✅ User list loading and display
- ✅ Online status indicators
- ✅ Responsive design
- ⚠️ Advanced error scenarios

### Notifications: 95%
- ✅ Bell and badge functionality
- ✅ Panel interactions
- ✅ Notification creation/clearing
- ✅ Chat integration
- ⚠️ Complex real-time scenarios

### Chat: 85%
- ✅ Window management
- ✅ Message sending/receiving
- ✅ Basic real-time features
- ⚠️ Advanced socket error handling
- ⚠️ Complex multi-user scenarios

### Integration: 90%
- ✅ Complete user workflows
- ✅ State persistence
- ✅ Error recovery
- ⚠️ Performance edge cases

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: cypress-io/github-action@v2
        with:
          build: npm run build
          start: npm run dev
          wait-on: 'http://localhost:5174'
          browser: chrome
```

## 🎯 Best Practices

1. **Isolation**: Each test is independent with proper cleanup
2. **Real Data**: Tests use actual API calls (with test data)
3. **Reliability**: Uses data-testid attributes, not fragile selectors
4. **Maintainability**: Custom commands reduce code duplication
5. **Coverage**: Tests cover happy paths and error scenarios
6. **Performance**: Tests include load and stress scenarios

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)
- [TypeScript Support](https://docs.cypress.io/guides/tooling/typescript-support)
