import re

file_path = 'src/components/chat/ChatInterface.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_str_audio = """          {communicationMode === 'AUDIO_ONLY' ? (
            <div className="bg-amber-950/10 border border-dashed border-amber-500/30 rounded-xl p-4 w-full text-center text-amber-500 font-mono text-xs animate-pulse">
              [VOICE_CHANNEL_STANDBY] Mr. Ellars, voice phone handshake authenticated over secure AXiM line. Awaiting audio input...
            </div>
          ) : communicationMode === 'DISCUSSION' ? (
            <div className="bg-purple-950/10 border border-dashed border-purple-500/30 text-purple-400 text-xs animate-pulse p-4 w-full text-center font-mono">
              [DISCUSSION_MODE_ACTIVE] Multi-modal conversation thread active. Synthetic audio-response bridge engaged.
            </div>
          ) : ("""

new_str_audio = """          {communicationMode === 'AUDIO_ONLY' ? (
            <div className="bg-amber-950/10 border border-dashed border-amber-500/30 rounded-xl p-4 w-full text-center text-amber-500 font-mono text-xs">
              <div className="border border-slate-800 text-slate-500 font-mono text-[9px] tracking-widest px-2 py-1 bg-slate-950 rounded mb-2 inline-block uppercase select-all">
                SECURE_VOICE_TRUNK: +1 (800) AXIM-ONYX // OPERATOR_EXT: 003
              </div>
              <div className="animate-pulse">
                [VOICE_CHANNEL_STANDBY] Mr. Ellars, voice phone handshake authenticated over secure AXiM line. Awaiting audio input...
              </div>
              <div className="flex justify-center items-center gap-1 h-6 mt-3 mb-4">
                {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-current opacity-60"
                    animate={{ height: [4, 24, 4] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay }}
                  />
                ))}
              </div>
              <button
                onClick={() => setCommunicationMode('TEXT')}
                className="text-[10px] font-bold tracking-widest uppercase border border-red-900/50 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg cursor-pointer inline-block"
              >
                Disconnect Voice Trunk Line
              </button>
            </div>
          ) : communicationMode === 'DISCUSSION' ? (
            <div className="bg-purple-950/10 border border-dashed border-purple-500/30 rounded-xl p-4 w-full text-center text-purple-400 font-mono text-xs">
              <div className="border border-slate-800 text-slate-500 font-mono text-[9px] tracking-widest px-2 py-1 bg-slate-950 rounded mb-2 inline-block uppercase select-all">
                SECURE_VOICE_TRUNK: +1 (800) AXIM-ONYX // OPERATOR_EXT: 003
              </div>
              <div className="animate-pulse">
                [DISCUSSION_MODE_ACTIVE] Multi-modal conversation thread active. Synthetic audio-response bridge engaged.
              </div>
              <div className="flex justify-center items-center gap-1 h-6 mt-3 mb-4">
                {[0, 0.1, 0.2, 0.3, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full bg-current opacity-60"
                    animate={{ height: [4, 24, 4] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay }}
                  />
                ))}
              </div>
              <button
                onClick={() => setCommunicationMode('TEXT')}
                className="text-[10px] font-bold tracking-widest uppercase border border-red-900/50 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg cursor-pointer inline-block"
              >
                Disconnect Voice Trunk Line
              </button>
            </div>
          ) : ("""

content = content.replace(old_str_audio, new_str_audio)

with open(file_path, 'w') as f:
    f.write(content)
