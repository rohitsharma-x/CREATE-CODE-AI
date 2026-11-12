import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Code2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState(initialTab); // 'login', 'register', 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register, demoLogin, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/dashboard');
      } else if (mode === 'register') {
        await register(name, email, password);
        navigate('/dashboard');
      } else if (mode === 'forgot') {
        setSuccessMsg('If an account exists for this email, password instructions have been sent.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] dark:bg-[#080F17] flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background glow circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#12D6C5]/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-white/60 dark:bg-[#111E2B]/60 backdrop-blur-md border border-[#D8E3EA] dark:border-[#263849] transition-all"
        >
          {isDark ? <Sun className="w-4 h-4 text-[#12D6C5]" /> : <Moon className="w-4 h-4 text-[#089E9A]" />}
        </button>
      </div>

      {/* Main Auth Card (Matching Reference Image 2) */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] rounded-2xl shadow-2xl p-8 backdrop-blur-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#12D6C5]/10 border border-[#12D6C5]/30 flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5] font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-[#0F172A] dark:text-[#F1F5F9]">
              CreateCode <span className="text-[#089E9A] dark:text-[#12D6C5]">AI</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Your Account' : 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 text-center">
            {mode === 'login'
              ? 'Sign in to your developer workspace'
              : mode === 'register'
              ? 'Start writing, reviewing, and optimizing code with AI'
              : 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-medium">
            {successMsg}
          </div>
        )}

        {mode !== 'forgot' && (
          <>
            {/* Social OAuth Buttons */}
            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] hover:bg-slate-100 dark:hover:bg-[#1f3348] text-[#0F172A] dark:text-[#F1F5F9] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleDemoSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] hover:bg-slate-100 dark:hover:bg-[#1f3348] text-[#0F172A] dark:text-[#F1F5F9] transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#D8E3EA] dark:border-[#263849] w-full" />
              <span className="bg-white dark:bg-[#111E2B] px-3 text-[11px] text-slate-400 uppercase tracking-wider">
                or
              </span>
              <div className="border-t border-[#D8E3EA] dark:border-[#263849] w-full" />
            </div>
          </>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] focus:ring-1 focus:ring-[#12D6C5]/30 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] focus:ring-1 focus:ring-[#12D6C5]/30 transition-all"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] focus:ring-1 focus:ring-[#12D6C5]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-[11px] text-[#089E9A] dark:text-[#12D6C5] hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full py-2.5 mt-2 font-bold text-xs"
          >
            {mode === 'login' ? 'Log In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
          </Button>

          {/* Instant 1-Click Recruiter Demo Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-[#089E9A] dark:text-[#12D6C5] bg-[#12D6C5]/10 hover:bg-[#12D6C5]/20 border border-[#12D6C5]/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Instant Demo Access (Recruiter One-Click)
            </button>
          </div>
        </form>

        {/* Footer switch */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#089E9A] dark:text-[#12D6C5] font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#089E9A] dark:text-[#12D6C5] font-semibold hover:underline"
              >
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

