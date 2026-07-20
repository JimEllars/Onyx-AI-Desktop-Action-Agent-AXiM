import re

file_path = 'src/components/chat/ChatInterface.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("className=\"text-[10px] font-bold tracking-widest uppercase border border-red-900/50 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg cursor-pointer inline-block\"", "className=\"text-[10px] font-bold tracking-widest uppercase border border-red-900/50 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg cursor-pointer inline-block z-50 relative pointer-events-auto\"")

with open(file_path, 'w') as f:
    f.write(content)
