import re

file_path = 'src/store/useDesktopAgentStore.js'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("walletConnected: false,", "walletConnected: true,")

with open(file_path, 'w') as f:
    f.write(content)
