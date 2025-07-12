import { useAuthStore } from '../../store/auth.store.ts';
import { useState } from 'react';
import usePageStore from '../../store/page.store.ts';
import useUserStore from '../../store/user.store.ts';
import type { User } from '../../types/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, isLoggingIn, checkUser, signup, isSigningUp } = useAuthStore();
  const setCurrentPage = usePageStore(state => state.setCurrentPage);
  const setCurrentUser = useUserStore(state => state.setCurrentUser);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = () => {
    setErrorMessage('');

    login({
      name: username,
      password,
    })
      .then((user: User | null) => {
        if (user) {
          console.log('Logged in successfully');
          setCurrentPage('home');
          navigate('/home');
          setCurrentUser(user);
        } else {
          setErrorMessage('Invalid username or password');
        }
      })
      .catch(error => {
        setErrorMessage(error.response?.data?.message || 'Login failed');
      });
  };

  useEffect(() => {
    checkUser()
      .then((user: User | null) => {
        if (user) {
          setCurrentUser(user);
          navigate('/home');
          setCurrentPage('home');
          useAuthStore.getState().connectSocket();
        } else {
          console.error('Login failed: No user returned');
        }
      })
      .catch(error => {
        console.error('Login failed:', error);
      });
  }, [checkUser, setCurrentUser, navigate, setCurrentPage]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-8 px-4 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Chatter</h1>
          <p className="text-gray-600 max-w-md">Connect back with your friends in a simple way.</p>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-6">
        <div className="flex justify-center mb-6">
          <button
            className={`px-6 py-2 rounded-t-md font-semibold ${
              activeTab === 'signup'
                ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                : 'bg-gray-100 text-gray-500'
            }`}
            onClick={() => setActiveTab('signup')}
            type="button"
          >
            Signup
          </button>
          <button
            className={`px-6 py-2 rounded-t-md font-semibold ${
              activeTab === 'login'
                ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                : 'bg-gray-100 text-gray-500'
            }`}
            onClick={() => setActiveTab('login')}
            type="button"
          >
            Login
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {activeTab === 'signup' && (
            <div className="flex-1 flex flex-col gap-4">
              {errorMessage && (
                <div className="text-red-600 text-center font-medium">{errorMessage}</div>
              )}
              <form
                className="flex flex-col gap-3 w-full max-w-[800px] mx-auto"
                onSubmit={async e => {
                  e.preventDefault();
                  setErrorMessage('');
                  try {
                    const profile = (document.getElementById('profile') as HTMLInputElement).value;
                    const user = await signup({
                      name: username,
                      password,
                      profile,
                      isSignup: true,
                    });
                    if (user) {
                      setCurrentPage('home');
                      navigate('/home');
                      setCurrentUser(user);
                    } else {
                      setErrorMessage('Signup failed');
                    }
                  } catch (error: any) {
                    setErrorMessage(error.response?.data?.message || 'Signup failed');
                  }
                }}
              >
                <input
                  type="text"
                  placeholder="Name"
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  id="signup-username"
                  onChange={e => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  id="signup-password"
                  onChange={e => setPassword(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Profile"
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  id="profile"
                />
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="bg-blue-500 text-white rounded-md py-2 transition w-full hover:bg-blue-600"
                >
                  Signup
                </button>
              </form>
            </div>
          )}
          {activeTab === 'login' && (
            <div className="flex-1 flex flex-col gap-4">
              <form
                className="flex flex-col gap-3 w-full max-w-[800px] mx-auto"
                onSubmit={e => {
                  e.preventDefault();
                  handleLogin();
                }}
              >
                {errorMessage && (
                  <div className="text-red-600 text-center font-medium">{errorMessage}</div>
                )}
                <input
                  type="text"
                  placeholder="Name"
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  id="username"
                  onChange={e => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  id="password"
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isSigningUp}
                  className={`bg-blue-500 text-white rounded-md py-2 transition w-full ${
                    isLoggingIn ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-600'
                  }`}
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
