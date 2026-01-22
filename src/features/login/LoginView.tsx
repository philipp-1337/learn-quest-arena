import { useState,type FormEvent, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useFirebaseAuth from '@hooks/useFirebaseAuth';
import { ArrowLeft, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

// ============================================
// LOGIN VIEW - Modern Implementation
// ============================================

interface LoginViewProps {
  onLogin: () => void;
  onBack: () => void;
}

export default function LoginView({ onLogin, onBack }: LoginViewProps) {
  const { login, error, loading } = useFirebaseAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Verwende useCallback um zu verhindern, dass die Funktion bei jedem Render neu erstellt wird
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    
    if (!normalizedEmail || !trimmedPassword) return;
    
    try {
      const user = await login(normalizedEmail, trimmedPassword);
      
      if (user) {
        onLogin();
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  }, [email, password, login, onLogin, navigate]);

  const isFormValid = email.trim() && password.trim();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-700">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center gap-2 group cursor-pointer"
          aria-label="Zurück zur Startseite"
          title="Zurück zur Startseite"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform w-4 h-4" />
          Zurück
        </button>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 force-break" lang="de">Admin Login</h1>
          <p className="text-gray-600 dark:text-gray-400 force-break" lang="de">Für Lehrer und Administratoren</p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              E-Mail
            </label>
            <input
              id="email"
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-shadow text-[16px]"
              placeholder="admin@schule.de"
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>
          
          {/* Password Input */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Passwort
            </label>
            <div className="relative">
              <input
                id="password"
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-shadow pr-12 text-[16px]"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                title={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div 
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
            title={loading ? 'Anmelden läuft' : 'Anmelden'}
            aria-label={loading ? 'Anmelden läuft' : 'Anmelden'}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                Anmelden...
              </span>
            ) : (
              'Anmelden'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}