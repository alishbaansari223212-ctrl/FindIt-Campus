import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Building2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const {
    registerStudent,
    loginStudent,
    loginWithGoogle,
    loginAsGuestReviewer,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [college, setCollege] = useState('Poona College of Arts, Science & Commerce');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both student email and password.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setLocalError('Please enter your full student name.');
          setLoading(false);
          return;
        }
        await registerStudent(email, password, displayName, college);
      } else {
        await loginStudent(email, password);
      }
      onClose();
    } catch (err: any) {
      setLocalError(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setLocalError(null);
    clearAuthError();
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setLocalError(err?.message || 'Google sign-in was canceled.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickDemo = (role: string, studentEmail?: string) => {
    loginAsGuestReviewer(role, studentEmail);
    onClose();
  };

  const displayedError = localError || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#133e2b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {mode === 'login' ? 'Student Sign In' : 'Create Student Account'}
              </h3>
              <p className="text-xs text-emerald-200">
                Poona College Lost &amp; Found Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-white/10 text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Google Sign In (Primary provisioned Firebase provider) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-stone-50 border border-stone-300 rounded-2xl text-xs font-bold text-stone-800 shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
            ) : (
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
            )}
            <span>Sign In with Google Account</span>
          </button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider shrink-0">
              or use student credentials
            </span>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearAuthError();
                setLocalError(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'login'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                clearAuthError();
                setLocalError(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'register'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Register Student
            </button>
          </div>

          {displayedError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{displayedError}</span>
              </div>
              {displayedError.includes('Firebase Console') && (
                <div className="mt-1 pt-1.5 border-t border-rose-200/60 text-[11px] text-rose-800">
                  <p className="font-semibold">Quick Solution:</p>
                  <p>Use the Google Sign-In button above or choose a Demo Student profile below to test immediately!</p>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Farhan Shaikh"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    College / Campus Affiliation
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="Poona College of Arts, Science & Commerce"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Student Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@poonacollege.edu.in"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In with Email' : 'Register Student'}</span>
              )}
            </button>
          </form>

          {/* Quick 1-Tap Demo / Evaluator Profiles */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Instant Hackathon Evaluation Sign-In:</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('Farhan Shaikh (Student)', 'farhan.shaikh@poonacollege.edu.in')}
                className="p-2 text-left bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl transition text-xs"
              >
                <p className="font-bold text-stone-900 truncate">Farhan Shaikh</p>
                <p className="text-[10px] text-stone-500">SYBSc Student</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CodeCraft Judge', 'judge.codecraft@poonacollege.edu.in')}
                className="p-2 text-left bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl transition text-xs"
              >
                <p className="font-bold text-stone-900 truncate">Hackathon Judge</p>
                <p className="text-[10px] text-stone-500">Full Evaluator Role</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
