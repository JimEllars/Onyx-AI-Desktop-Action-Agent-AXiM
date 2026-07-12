import re

with open('src/components/chat/ChatInterface.jsx', 'r') as f:
    content = f.read()

# Add updateCloudflareMetrics to destructured store actions
content = re.sub(
    r'(const \{ messages, addMessage, addActionLog, systemStatus, setSystemStatus, setActiveTaskId \})',
    r'const { messages, addMessage, addActionLog, systemStatus, setSystemStatus, setActiveTaskId, updateCloudflareMetrics }',
    content
)

# Call updateCloudflareMetrics in handleSend after input validation
content = re.sub(
    r'(if \(!input.trim\(\)\) return;)',
    r'\1\n\n    updateCloudflareMetrics();',
    content
)

with open('src/components/chat/ChatInterface.jsx', 'w') as f:
    f.write(content)
