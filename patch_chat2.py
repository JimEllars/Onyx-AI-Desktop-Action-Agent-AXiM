import re

file_path = 'src/components/chat/ChatInterface.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_str_audio = """              <button
                onClick={() => setCommunicationMode('TEXT')}
                className="text-[10px] font-bold tracking-widest uppercase border border-red-900/50 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg cursor-pointer inline-block"
              >
                Disconnect Voice Trunk Line
              </button>"""

new_str_audio = """              <button data-testid="disconnect-btn"
                onClick={() => setCommunicationMode('TEXT')}
                className="text-[10px] font-bold tracking-widest uppercase border border-red-900/50 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg cursor-pointer inline-block"
              >
                Disconnect Voice Trunk Line
              </button>"""

content = content.replace(old_str_audio, new_str_audio)

with open(file_path, 'w') as f:
    f.write(content)
