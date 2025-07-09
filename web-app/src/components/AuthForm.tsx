'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // To toggle between Login and Sign Up
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { signUpWithEmail, signInWithEmail, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (isLogin) {
      const user = await signInWithEmail(email, password);
      if (user) {
        setMessage('Signed in successfully!');
      } else {
        setError('Failed to sign in. Please check your credentials.');
      }
    } else {
      const user = await signUpWithEmail(email, password);
      if (user) {
        setMessage('Signed up successfully! You are now logged in.');
      } else {
        setError('Failed to sign up. The email might already be in use or password is too weak.');
      }
    }
  };

  return (
    <div className="w-full max-w-xs p-4 bg-white shadow-md rounded-lg dark:bg-neutral-800">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">
        {isLogin ? 'Login' : 'Sign Up'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-neutral-700 dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setMessage(null);
          }}
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
