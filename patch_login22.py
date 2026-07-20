import re

file_path = 'src/components/admin/LoginGateway.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("if (passkey !== 'ONYX-ACCESS-2026' && passkey !== 'TEST') {", "if (passkey !== 'ONYX-ACCESS-2026') {")

with open(file_path, 'w') as f:
    f.write(content)
