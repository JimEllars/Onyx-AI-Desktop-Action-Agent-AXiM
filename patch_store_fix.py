import re

with open('src/store/useDesktopAgentStore.js', 'r') as f:
    content = f.read()

# Fix the duplicate audioBitrate insertions due to multiple "actionLogs: [" matches
content = re.sub(r"      audioBitrate: '64 kbps',\n  actionLogs: \[", "      actionLogs: [", content)
content = re.sub(r"    audioBitrate: '64 kbps',\n  actionLogs: \[", "    actionLogs: [", content)
content = re.sub(r"  audioBitrate: '64 kbps',\n  actionLogs: \[", "  actionLogs: [", content)

# But ensure the initial state HAS audioBitrate
content = re.sub(r"  messages: \[\n    \{ id: 1, role: 'assistant', text: 'OnyX Mk3 Online. Vector systems initialized. Awaiting architectural commands, Sir.', timestamp: new Date\(\) \}\n  \],\n  actionLogs: \[", r"  messages: [\n    { id: 1, role: 'assistant', text: 'OnyX Mk3 Online. Vector systems initialized. Awaiting architectural commands, Sir.', timestamp: new Date() }\n  ],\n  audioBitrate: '64 kbps',\n  actionLogs: [", content)

with open('src/store/useDesktopAgentStore.js', 'w') as f:
    f.write(content)
