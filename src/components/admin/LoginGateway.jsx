import React, { useState } from 'react';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';
import { motion } from 'framer-motion';

export default function LoginGateway() {
  const { loginUser } = useDesktopAgentStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate loading thread loop
    setTimeout(() => {
      loginUser("0x742d...444");
      setIsLoading(false);
    }, 900);
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
          <h1 className="text-xl font-bold tracking-widest text-emerald-400 mb-2">OnyX Mk3 // SECURE AUTHENTICATION REQUIRED</h1>
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent w-full mt-4"></div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-950 p-4 border border-slate-800 rounded text-sm text-slate-400">
            <p className="mb-2">SYSTEM: Authentication gateway active.</p>
            <p>AWAITING: Valid SIWE cryptographic handshake.</p>
          </div>

          <button
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
                VERIFYING SIGNATURE...
              </>
            ) : (
              'Connect Wallet & Sign Handshake (SIWE)'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
