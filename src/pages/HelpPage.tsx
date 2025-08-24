import { useState } from "react";
import { Link } from "react-router-dom";

// Custom SVG icon components - handcrafted for better performance
// These replace external icon libraries to reduce bundle size

const ChatBubbleLeftRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const UserGroupIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const BoltIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const CogIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const CodeBracketIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const HeartIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const HelpPage = () => {
  // Track which help section is currently active for better UX
  const [activeSection, setActiveSection] = useState("getting-started");

  // Define all help sections with their content - this makes it easy to maintain
  const helpSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BoltIcon,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Welcome to Chatter! 🚀
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Quick Start Guide
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
                <li>Create your account with a unique username</li>
                <li>Verify your email address (check spam folder if needed)</li>
                <li>Complete your profile with photo and details</li>
                <li>Start chatting with ChatterBot - your AI friend!</li>
                <li>Add friends by searching usernames</li>
                <li>Enjoy real-time messaging with smart notifications</li>
              </ol>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Try Guest Mode
              </h4>
              <p className="text-green-800 dark:text-green-200">
                Want to test Chatter without creating an account? Use Guest
                Login to instantly start chatting with ChatterBot and experience
                all the features!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "features",
      title: "Platform Features",
      icon: SparklesIcon,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Amazing Features 🌟
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900 dark:text-purple-100">
                  AI-Powered ChatterBot
                </h4>
              </div>
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                Chat with our Google Gemini-powered AI assistant that knows
                everything about Chatter!
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <BoltIcon className="w-5 h-5 text-indigo-600" />
                <h4 className="font-medium text-indigo-900 dark:text-indigo-100">
                  Real-time Messaging
                </h4>
              </div>
              <p className="text-indigo-800 dark:text-indigo-200 text-sm">
                Lightning-fast Socket.IO powered messaging with instant delivery
                and read receipts.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="w-5 h-5 text-orange-600" />
                <h4 className="font-medium text-orange-900 dark:text-orange-100">
                  Smart Notifications
                </h4>
              </div>
              <p className="text-orange-800 dark:text-orange-200 text-sm">
                Context-aware notifications that won't interrupt your active
                conversations.
              </p>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-2 mb-2">
                <UserGroupIcon className="w-5 h-5 text-teal-600" />
                <h4 className="font-medium text-teal-900 dark:text-teal-100">
                  Friend System
                </h4>
              </div>
              <p className="text-teal-800 dark:text-teal-200 text-sm">
                Connect with friends, send requests, and manage your social
                network easily.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Additional Features
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>Multiple chat windows support</li>
              <li>Email verification system</li>
              <li>Password recovery</li>
              <li>Profile customization</li>
              <li>CAPTCHA security protection</li>
              <li>Message censorship and filtering</li>
              <li>Dark/Light theme support</li>
              <li>Mobile responsive design</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "tech-stack",
      title: "Technology",
      icon: CodeBracketIcon,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Built with Modern Tech 🛠️
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Frontend Technologies
              </h4>
              <div className="space-y-2">
                {[
                  {
                    name: "React 19",
                    color:
                      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                  },
                  {
                    name: "TypeScript",
                    color:
                      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                  },
                  {
                    name: "Vite",
                    color:
                      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                  },
                  {
                    name: "Tailwind CSS",
                    color:
                      "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
                  },
                  {
                    name: "Socket.IO Client",
                    color:
                      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                  },
                  {
                    name: "Zustand",
                    color:
                      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
                  },
                ].map((tech, index) => (
                  <span
                    key={index}
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${tech.color} mr-2`}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Backend Technologies
              </h4>
              <div className="space-y-2">
                {[
                  {
                    name: "Node.js",
                    color:
                      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                  },
                  {
                    name: "Express.js",
                    color:
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
                  },
                  {
                    name: "MongoDB",
                    color:
                      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                  },
                  {
                    name: "Socket.IO",
                    color:
                      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                  },
                  {
                    name: "Google Gemini AI",
                    color:
                      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                  },
                  {
                    name: "JWT",
                    color:
                      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                  },
                ].map((tech, index) => (
                  <span
                    key={index}
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${tech.color} mr-2`}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Why These Technologies?
            </h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Each technology was carefully chosen for performance, scalability,
              and developer experience. This stack represents modern web
              development best practices and provides a solid foundation for
              real-time applications.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: CogIcon,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Common Issues & Solutions 🔧
          </h3>

          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                🔐 Can't receive verification email?
              </h4>
              <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-200 text-sm">
                <li>Check your spam/junk folder</li>
                <li>Ensure you entered the correct email address</li>
                <li>Wait a few minutes for delivery</li>
                <li>Try resending from the login page</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                📱 Messages not appearing in real-time?
              </h4>
              <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-200 text-sm">
                <li>Check your internet connection</li>
                <li>Refresh the page</li>
                <li>Clear browser cache and cookies</li>
                <li>Try a different browser</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                🤖 ChatterBot not responding?
              </h4>
              <ul className="list-disc list-inside space-y-1 text-green-800 dark:text-green-200 text-sm">
                <li>Wait a moment - AI responses may take a few seconds</li>
                <li>Try sending a simple message like "hello"</li>
                <li>Check if you're connected to the internet</li>
                <li>Refresh the page if the issue persists</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                🔔 Not receiving notifications?
              </h4>
              <ul className="list-disc list-inside space-y-1 text-purple-800 dark:text-purple-200 text-sm">
                <li>Enable browser notifications when prompted</li>
                <li>
                  Check if you have an active chat window open (smart
                  notifications)
                </li>
                <li>Ensure the browser tab is not muted</li>
                <li>Check your browser's notification settings</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      title: "Contact & Support",
      icon: EnvelopeIcon,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Get in Touch 📞
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Email Support
                </h4>
              </div>
              <p className="text-blue-800 dark:text-blue-200 mb-3">
                Have questions or need help? Send us an email!
              </p>
              <a
                href="mailto:sachin@chatter.dev"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                sachin@chatter.dev
              </a>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-4">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Live Chat
                </h4>
              </div>
              <p className="text-green-800 dark:text-green-200 mb-3">
                Chat with ChatterBot for instant help and platform guidance!
              </p>
              <Link
                to="/chat"
                className="text-green-600 dark:text-green-400 hover:underline font-medium"
              >
                Start Chatting →
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-4">
              <HeartIcon className="w-6 h-6 text-purple-600" />
              <h4 className="font-medium text-purple-900 dark:text-purple-100">
                About the Developer
              </h4>
            </div>
            <p className="text-purple-800 dark:text-purple-200 mb-3">
              Chatter is crafted with passion by <strong>Sachin Kumar</strong>,
              a full-stack developer who loves creating innovative web
              applications. This project showcases modern development practices,
              AI integration, and user-centric design.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-xs font-medium">
                Full-Stack Developer
              </span>
              <span className="bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-3 py-1 rounded-full text-xs font-medium">
                AI Enthusiast
              </span>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                React Expert
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Response Times
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-sm">
              <li>
                <strong>ChatterBot:</strong> Instant AI responses
              </li>
              <li>
                <strong>Email Support:</strong> Within 24 hours
              </li>
              <li>
                <strong>Bug Reports:</strong> Priority handling within 12 hours
              </li>
              <li>
                <strong>Feature Requests:</strong> Review within 48 hours
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Chatter Help Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Everything you need to know about using Chatter
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Topics
              </h2>
              <nav className="space-y-2">
                {helpSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {section.title}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/chat"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Chat with ChatterBot
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {
                helpSections.find((section) => section.id === activeSection)
                  ?.content
              }
            </div>
          </div>
        </div>

        {/* Back to App */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Chatter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
