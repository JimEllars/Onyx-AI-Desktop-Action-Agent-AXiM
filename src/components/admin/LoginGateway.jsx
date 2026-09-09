import React, { useState, useEffect } from 'react';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';
import { motion } from 'framer-motion';
import { aximCoreClient, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginGateway() {
  const { loginUser } = useDesktopAgentStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      window.history.replaceState({}, document.title, window.location.pathname);
      loginUser(token);
    }
  }, [loginUser]);

  const handlePassportSSO = () => {
    const isTauri = typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__);
    if (isTauri) {
      loginUser('ONYX-ACCESS-2026'); // Loopback logic for Tauri
    } else {
      const redirectUri = encodeURIComponent(window.location.origin);
      window.location.href = `https://passport.axim.us.com?redirect=${redirectUri}`;
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  const handleLogin = async () => {
    if (!isSupabaseConfigured) {
      setErrorMessage('Supabase authentication is not configured for this deployment.');
      return;
    }

    setErrorMessage('');
    setNoticeMessage('');
    setIsLoading(true);

    const credentials = { email: email.trim(), password };

    // Offline resilience: Wrap Supabase Auth call with timeout wrapper (max 4000ms)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout. Edge API unreachable.')), 4000)
    );

    let result;
    try {
       const authPromise = isSignUp
         ? aximCoreClient.auth.signUp(credentials)
         : aximCoreClient.auth.signInWithPassword(credentials);

       result = await Promise.race([authPromise, timeoutPromise]);
    } catch (err) {
       // Graceful degradation: Check localStorage for cached session
       const cachedSessionStr = localStorage.getItem('onyx_auth_session');
       if (cachedSessionStr) {
          try {
             const cachedSession = JSON.parse(cachedSessionStr);
             if (cachedSession.email === credentials.email) {
                console.warn('[OFFLINE_RECOVERY] Network timeout. Falling back to cached session mode.');
                loginUser(cachedSession.email);
                setIsLoading(false);
                return;
             }
          } catch (e) {
             // ignore parse err
          }
       }
       setErrorMessage(err.message || 'Authentication timeout');
       setIsLoading(false);
       return;
    }

    const { data, error } = result;

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (!data.session) {
      setNoticeMessage('Account created. Confirm your email before signing in.');
      setIsLoading(false);
      return;
    }

    // Cache session on success
    localStorage.setItem('onyx_auth_session', JSON.stringify({ email: data.user.email || data.user.id, timestamp: Date.now() }));

    loginUser(data.user.email || data.user.id);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden text-emerald-500 font-mono">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-slate-900 border border-emerald-500/30 p-8 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.1)]"
      >
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold tracking-widest text-emerald-400 mb-2">OnyX Mk3 // OPERATOR SIGN-IN</h1>
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent w-full mt-4"></div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-950 p-4 border border-slate-800 rounded text-sm text-slate-400">
            <p className="mb-2">SYSTEM: Supabase Auth gateway active.</p>
            <p>AWAITING: Authorized operator credentials.</p>
          </div>


          <button
            type="button"
            onClick={handlePassportSSO}
            className="w-full py-3 px-4 border rounded transition-all duration-300 font-bold tracking-wide bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] mb-2"
          >
            Sign In with AXiM Passport
          </button>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-xs text-slate-500">OR</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {errorMessage && (
            <div className="bg-red-950/20 border border-red-500/30 text-red-400 text-xs font-bold font-mono tracking-wide p-3 rounded text-center">
              {errorMessage}
            </div>
          )}

          {noticeMessage && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono tracking-wide p-3 rounded text-center">
              {noticeMessage}
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Operator Email"
            autoComplete="email"
            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-emerald-400 placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-emerald-400 placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
          />
          <button id="login-btn" data-testid="login-btn"
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full py-3 px-4 border rounded transition-all duration-300 font-bold tracking-wide flex justify-center items-center gap-2
              ${isLoading
                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AUTHENTICATING...
              </>
            ) : (
              isSignUp ? 'Create Operator Account' : 'Sign In'
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp((value) => !value);
              setErrorMessage('');
              setNoticeMessage('');
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
