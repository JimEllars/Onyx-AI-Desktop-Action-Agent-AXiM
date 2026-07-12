import re

with open("src/components/hud/NeuralInterface.jsx", "r") as f:
    content = f.read()

replacement = """import React from 'react';
import { motion } from 'framer-motion';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function NeuralInterface() {
  const { systemStatus } = useDesktopAgentStore();

  let outerRingColor = "border-emerald-500/20 border-t-emerald-500/60";
  let middleRingColor = "border-cyan-500/30";
  let innerCoreColor = "border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]";
  let pulseBarsColor = "bg-emerald-400/80 shadow-[0_0_8px_#10b981]";
  let orbitalColor0 = "bg-emerald-400";

  let outerRotationDuration = 10;
  let pulseScale = [1, 1.1, 1];
  let pulseDuration = 3;
  let coreDuration = 1.5;
  let coreBarDuration = 0.8;

  if (systemStatus === 'ERROR') {
    outerRingColor = "border-red-500/50 border-t-red-500/80";
    middleRingColor = "border-red-500/50";
    innerCoreColor = "border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]";
    pulseBarsColor = "bg-red-400/80 shadow-[0_0_8px_#ef4444]";
    orbitalColor0 = "bg-red-400";
    outerRotationDuration = 4;
    pulseScale = [1, 1.2, 1];
  } else if (systemStatus === 'EXECUTING') {
    outerRingColor = "border-cyan-500/50 border-t-purple-500/80";
    middleRingColor = "border-cyan-500/50";
    innerCoreColor = "border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)]";
    pulseBarsColor = "bg-cyan-400/80 shadow-[0_0_8px_#06b6d4]";
    orbitalColor0 = "bg-cyan-400";
    coreDuration = 0.5;
    coreBarDuration = 0.3;
  }

  return (
    <div className="relative w-48 h-48 flex items-center justify-center mx-auto my-4">
      {/* Outer Rotating Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: outerRotationDuration, repeat: Infinity, ease: "linear" }}
        className={`absolute inset-0 border-2 rounded-full ${outerRingColor}`}
      />

      {/* Middle Pulse Ring */}
      <motion.div
        animate={{ scale: pulseScale, opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-4 border rounded-full ${middleRingColor}`}
      />

      {/* Inner Core */}
      <div className={`relative z-10 w-24 h-24 rounded-full bg-slate-950 border flex items-center justify-center overflow-hidden ${innerCoreColor}`}>
        <motion.div
          animate={{
            height: ["20%", "60%", "30%", "80%", "40%"],
          }}
          transition={{ duration: coreDuration, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-end gap-1 px-4"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: ["40%", "100%", "60%"] }}
              transition={{ duration: coreBarDuration, delay: i * 0.1, repeat: Infinity }}
              className={`w-1 rounded-full ${pulseBarsColor}`}
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
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${i === 0 ? orbitalColor0 : 'bg-cyan-400'} shadow-[0_0_10px_currentColor]`} />
        </motion.div>
      ))}
    </div>
  );
}
"""

with open("src/components/hud/NeuralInterface.jsx", "w") as f:
    f.write(replacement)
