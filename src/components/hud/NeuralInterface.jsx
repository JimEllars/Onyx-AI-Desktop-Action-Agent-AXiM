import React from 'react';
import { motion } from 'framer-motion';

export default function NeuralInterface() {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center mx-auto my-4">
      {/* Outer Rotating Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-2 border-emerald-500/20 rounded-full border-t-emerald-500/60"
      />
      
      {/* Middle Pulse Ring */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-4 border border-cyan-500/30 rounded-full"
      />

      {/* Inner Core */}
      <div className="relative z-10 w-24 h-24 rounded-full bg-slate-950 border border-emerald-500/40 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        <motion.div
          animate={{ 
            height: ["20%", "60%", "30%", "80%", "40%"],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-end gap-1 px-4"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: ["40%", "100%", "60%"] }}
              transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
              className="w-1 bg-emerald-400/80 rounded-full shadow-[0_0_8px_#10b981]"
            />
          ))}
        </motion.div>
      </div>

      {/* Floating Orbitals */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ rotate: -360 }}
          transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-400' : 'bg-cyan-400'} shadow-[0_0_10px_currentColor]`} />
        </motion.div>
      ))}
    </div>
  );
}