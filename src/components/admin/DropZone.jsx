import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { FiDownloadCloud, FiFileText } from 'react-icons/fi';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function DropZone({ targetApplication }) {
  const [isDragging, setIsActiveDragging] = useState(false);
  const { incrementLocalBufferQueue, addActionLog } = useDesktopAgentStore();

  const handleDrop = (e) => {
    e.preventDefault();
    setIsActiveDragging(false);
    incrementLocalBufferQueue();
    addActionLog({ type: 'task', text: `Batch ingestion detected: [${targetApplication}]` });
  };

  return (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); setIsActiveDragging(true); }}
      onDragLeave={() => setIsActiveDragging(false)}
      onDrop={handleDrop}
      animate={{ 
        borderColor: isDragging ? '#10b981' : '#1e293b',
        backgroundColor: isDragging ? 'rgba(16,185,129,0.05)' : 'transparent'
      }}
      className="flex-1 min-h-[160px] border border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all cursor-crosshair group"
    >
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
          <SafeIcon icon={FiFileText} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Drop Command Frame</p>
          <p className="text-[8px] text-slate-600 mt-1">JSON / CSV / RAW</p>
        </div>
      </div>
    </motion.div>
  );
}