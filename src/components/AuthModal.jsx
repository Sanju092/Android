import React, { useState } from 'react';
import { X, User, Lock, LogIn, UserPlus, CheckCircle2, ShieldCheck } from 'lucide-react';

const USER_STORAGE_KEY = 'metrotrack_user_profile';

export function AuthModal({ isOpen, onClose, currentUser, onLoginSuccess, onLogout }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password should be at least 4 characters.');
      return;
    }

    if (isRegisterMode) {
      // Register user
      const userData = {
        username: username.trim(),
        registeredAt: new Date().toLocaleDateString(),
        tripsCount: 0
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      onLoginSuccess(userData);
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      // Basic login
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.username.toLowerCase() === username.trim().toLowerCase()) {
          onLoginSuccess(parsed);
          onClose();
          return;
        }
      }
      // Or automatic guest profile
      const newProfile = {
        username: username.trim(),
        registeredAt: new Date().toLocaleDateString(),
        tripsCount: 1
      };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newProfile));
      onLoginSuccess(newProfile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {currentUser ? 'Your Profile' : isRegisterMode ? 'Create Account' : 'Passenger Login'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser ? 'Logged in as commuter' : 'Basic details (No Gmail needed)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentUser ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
                {currentUser.username[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-base text-white">{currentUser.username}</div>
                <div className="text-xs text-slate-400">Member since {currentUser.registeredAt || 'Today'}</div>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-xl text-xs transition-all"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {errorMsg && <div className="text-xs text-red-400">{errorMsg}</div>}
            {successMsg && <div className="text-xs text-emerald-400">{successMsg}</div>}

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md mt-1"
            >
              {isRegisterMode ? 'Register Account' : 'Sign In'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setErrorMsg('');
                }}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                {isRegisterMode ? 'Already registered? Sign In' : 'Need an account? Register'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
