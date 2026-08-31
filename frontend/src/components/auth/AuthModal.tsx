import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, Phone, ShieldCheck, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, signup, googleLogin, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'otp' | 'forgot'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signup({ name, email, password, phone });
        setSuccessMsg('Account created successfully! Welcome to Scan & Stay.');
        setTimeout(() => onClose(), 800);
      } else if (mode === 'otp') {
        await api.verifyOtp(email, otp);
        setSuccessMsg('2FA OTP Verified successfully!');
        setTimeout(() => onClose(), 800);
      } else if (mode === 'forgot') {
        const res = await api.login(email, 'guest123'); // Reset helper
        setSuccessMsg('Password reset link sent to your registered email.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMock = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleLogin('Aarav Sharma', 'aarav.google@example.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreset = async (role: 'guest' | 'admin' | 'receptionist') => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemo(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-teal-500/10 overflow-hidden"
      >
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 mx-auto mb-3 shadow-lg shadow-teal-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'otp' && 'Two-Factor Verification'}
            {mode === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Access smart hotel bookings & contactless digital passes'}
            {mode === 'signup' && 'Join Scan & Stay to unlock instant 100 Welcome Points'}
            {mode === 'otp' && 'Enter the 6-digit verification code dispatched to your phone/email'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {/* 1-Click Fast Demo Logins */}
        <div className="mb-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fast 1-Click Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoPreset('guest')}
              className="px-2 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-[11px] font-medium text-teal-300 transition-colors text-center"
            >
              👤 Guest
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset('receptionist')}
              className="px-2 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-[11px] font-medium text-blue-300 transition-colors text-center"
            >
              💼 Reception
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset('admin')}
              className="px-2 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[11px] font-medium text-purple-300 transition-colors text-center"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
          )}

          {mode !== 'otp' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-teal-400 hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
          )}

          {mode === 'otp' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-semibold text-sm hover:from-teal-400 hover:to-emerald-400 shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Verify Code'}
          </button>
        </form>

        {/* Divider & Google Login */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-2 text-slate-500 font-semibold">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleMock}
          className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-medium text-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer Toggle */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-teal-400 hover:underline font-medium"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-teal-400 hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
