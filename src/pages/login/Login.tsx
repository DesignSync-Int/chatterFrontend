import { useAuthStore } from '../../store/auth.store.ts';
import { useState } from 'react';
import usePageStore from '../../store/page.store.ts';
import useUserStore from '../../store/user.store.ts';
import type { User } from '../../types/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, isLoggingIn, checkUser } = useAuthStore();
  const setCurrentPage = usePageStore(state => state.setCurrentPage);
  const setCurrentUser = useUserStore(state => state.setCurrentUser);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

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

  // useEffect(() => {
  //   checkUser()
  //     .then((user: User | null) => {
  //       if (user) {
  //         setCurrentUser(user);
  //         navigate('/home');
  //         setCurrentPage('home');
  //         useAuthStore.getState().connectSocket();
  //       } else {
  //         console.error('Login failed: No user returned');
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Login failed:', error);
  //     });
  // }, [checkUser, setCurrentUser, navigate, setCurrentPage]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-8 px-4 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Chatter</h1>
          <p className="text-gray-600 max-w-md">Connect back with your friends in a simple way.</p>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col gap-6">
        <div className="flex flex-col gap-4">
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
              disabled={isLoggingIn}
              className={`bg-blue-500 text-white rounded-md py-2 transition w-full ${
                isLoggingIn ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
