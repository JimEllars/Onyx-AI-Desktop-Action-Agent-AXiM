import re

file_path = 'src/store/useDesktopAgentStore.js'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("walletConnected: true,", "walletConnected: false,")

with open(file_path, 'w') as f:
    f.write(content)
