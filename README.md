# Chatter Frontend

A modern, real-time chat application built with React, TypeScript, and Socket.IO. This is the frontend client for the Chatter messaging platform.

## 🚀 Features

- **Real-time Messaging**: Instant messaging with Socket.IO integration
- **User Authentication**: Secure login/signup with JWT tokens
- **Email Verification**: Email-based account verification system
- **Friend System**: Send and manage friend requests
- **Password Recovery**: Forgot password with email reset functionality
- **CAPTCHA Protection**: Built-in CAPTCHA system for security
- **Responsive Design**: Mobile-first responsive UI with Tailwind CSS
- **Dark Mode Support**: Automatic dark/light theme support
- **Message Censorship**: Built-in profanity filtering
- **File Uploads**: Profile picture and file sharing capabilities
- **Notifications**: Real-time notifications for messages and friend requests
- **Chat Windows**: Multiple floating chat windows support

## 🛠️ Tech Stack

- **React 19.1.0** - Frontend framework
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4.1.10** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **React Router DOM** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Zod** - Schema validation
- **Cypress** - End-to-end testing

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── chat/            # Chat-related components
│   ├── container/       # Layout containers
│   ├── friend-requests/ # Friend request components
│   ├── notifications/   # Notification components
│   └── ui/              # Generic UI components
├── hooks/               # Custom React hooks
├── layouts/             # Page layouts
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   ├── chat/           # Chat pages
│   ├── home/           # Home page components
│   └── login/          # Login page
├── routes/              # Application routing
├── services/            # API services
├── store/               # Zustand state stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── constants/           # Application constants
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running Chatter Backend server

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kumasachin/chatter-frontend.git
cd chatter-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
# Create src/config.ts with your backend URL
export const API_BASE_URL = 'http://localhost:4000/api';
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run Cypress tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:open` - Open Cypress test runner
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

## 🧪 Testing

The project includes comprehensive end-to-end testing with Cypress:

- Authentication flow testing
- Chat functionality testing
- Friend request system testing
- Profile management testing
- CAPTCHA integration testing

Run tests with:
```bash
npm run test:e2e
```

Open Cypress UI:
```bash
npm run test:e2e:open
```

## 🔧 Configuration

### Environment Variables

The application uses configuration files rather than environment variables. Update `src/config.ts`:

```typescript
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com/api'
  : 'http://localhost:4000/api';
```

### Backend Integration

Ensure the backend server is running on port 4000 (default) or update the API_BASE_URL in the configuration.

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Responsive design** with mobile-first approach
- **Dark mode support** built-in
- **Custom color palette** with brand colors
- **Consistent spacing** and typography

## 📱 Features Overview

### Authentication
- User registration with email verification
- Secure login with JWT tokens
- Password reset functionality
- CAPTCHA protection against bots

### Real-time Chat
- Instant messaging with Socket.IO
- Multiple chat windows
- Message history
- Online/offline status indicators
- Message censorship and filtering

### Social Features
- Friend request system
- User search and discovery
- Profile management
- Notification system

### Security
- Input validation with Zod schemas
- XSS protection
- CAPTCHA verification
- Rate limiting awareness

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

### Environment Configuration

Make sure to update the API endpoints for production in `src/config.ts`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Sachin Kumar**
- GitHub: [@kumasachin](https://github.com/kumasachin)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- Socket.IO for real-time capabilities
- All open-source contributors

---

© 2025 DesignSync. All rights reserved.
