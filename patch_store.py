import re

with open('src/store/useDesktopAgentStore.js', 'r') as f:
    content = f.read()

# Add pendingApproval mock
content = re.sub(
    r'(cfRayId: \'8b42f6ad120ea31c\',)',
    r"\1\n  pendingApproval: { id: 'MCP-HITL-7112', agent: 'Pulse Triage Swarm', action: 'Database Subscription Patch', details: 'Modify database row parameter for Affiliate Account #321: adjust subscription_fee compute debt value from 120 to 0.' },",
    content
)

# Add approveAction and rejectAction
content = re.sub(
    r'(updateCloudflareMetrics: \(\) => set\(\(state\) => \{)',
    r"approveAction: () => set({ pendingApproval: null }),\n\n  rejectAction: () => set({ pendingApproval: null }),\n\n  \1",
    content
)

with open('src/store/useDesktopAgentStore.js', 'w') as f:
    f.write(content)
