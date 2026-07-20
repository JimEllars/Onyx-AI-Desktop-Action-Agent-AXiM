import re

file_path = 'src/components/chat/ChatInterface.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("Disconnect Voice Trunk Line", "DISCONNECT VOICE TRUNK LINE")

with open(file_path, 'w') as f:
    f.write(content)
