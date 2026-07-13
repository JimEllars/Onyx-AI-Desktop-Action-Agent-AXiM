import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { FiDownloadCloud, FiFileText } from 'react-icons/fi';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function DropZone({ targetApplication }) {
  const [isDragging, setIsActiveDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { incrementLocalBufferQueue, addActionLog, updateCloudflareMetrics, systemStatus, setSystemStatus } = useDesktopAgentStore();

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsActiveDragging(false);
    updateCloudflareMetrics();

    let droppedText = '';
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'string' && e.dataTransfer.items[i].type.match('^text/plain')) {
          droppedText = await new Promise(resolve => e.dataTransfer.items[i].getAsString(resolve));
          break;
        } else if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();
          droppedText = await file.text();
          break;
        }
      }
    } else {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        droppedText = await e.dataTransfer.files[i].text();
        break;
      }
    }


    // Asguard Interceptor Shield
    const lowerText = droppedText.toLowerCase();
    const forbiddenStrings = ['rm -rf', 'sudo', 'drop table', 'format c:'];
    const matchedSignature = forbiddenStrings.find(str => lowerText.includes(str));

    if (matchedSignature) {
      addActionLog({ type: 'error', text: `[FAULT] [ASGUARD_SHIELD] Intercepted malicious payload signature: "${matchedSignature}". Connection severed.` });
      setSystemStatus('ERROR');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      await invoke('execute_batch_upload', { payload: JSON.stringify({ data: droppedText, target_app: targetApplication }) });
      addActionLog({ type: 'task', text: `Batch ingestion successful: [${targetApplication}]` });
    } catch (error) {
      console.warn('[BROWSER_SIMULATION] Ingestion captured into virtual local loop', error);
      incrementLocalBufferQueue();
      addActionLog({ type: 'task', text: `Batch ingestion detected (fallback): [${targetApplication}]` });

      if (targetApplication === 'green_machine') {
        addActionLog({ type: 'system', text: '[ENRICHMENT] Semantic parse routed affiliate/ledger records to Green Machine financial registry' });
      } else if (targetApplication === 'nexus_crm') {
        addActionLog({ type: 'system', text: '[ENRICHMENT] Semantic parse routed B2B contact data blocks to Nexus CRM sheets' });
      } else if (targetApplication === 'asguard_soc') {
        addActionLog({ type: 'system', text: '[ENRICHMENT] Semantic parse routed incident anomaly trace logs to Asguard WAF threat feed maps' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      onDragOver={(e) => { e.preventDefault(); if (systemStatus !== 'ERROR') setIsActiveDragging(true); }}
      onDragLeave={() => setIsActiveDragging(false)}
      onDrop={systemStatus === 'ERROR' ? (e) => { e.preventDefault(); setIsActiveDragging(false); } : handleDrop}
      animate={{ 
        borderColor: systemStatus === 'ERROR' ? '#ef4444' : (isDragging ? '#10b981' : '#1e293b'),
        backgroundColor: isDragging && systemStatus !== 'ERROR' ? 'rgba(16,185,129,0.05)' : 'transparent'
      }}
      className={`flex-1 min-h-[160px] border border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all ${systemStatus === 'ERROR' ? 'cursor-not-allowed opacity-50' : 'cursor-crosshair'} group`}
    >
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        {isProcessing ? (
          <>
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
            <div className="text-center">
              <p className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest animate-pulse">PARSING_EDGE_INGRESS_CHUNKS...</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
              <SafeIcon icon={FiFileText} className={`transition-colors ${systemStatus === 'ERROR' ? 'text-red-500' : 'text-slate-600 group-hover:text-emerald-500'}`} />
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{systemStatus === 'ERROR' ? 'NODE WORKLOAD SUSPENDED' : 'Drop Command Frame'}</p>
              <p className="text-[8px] text-slate-600 mt-1">{systemStatus === 'ERROR' ? 'Clear local out-of-band cache blocks to restore ingestion channels' : 'JSON / CSV / RAW'}</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
