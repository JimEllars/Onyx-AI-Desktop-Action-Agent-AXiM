import re

file_path = 'src/components/admin/LoginGateway.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("id=\"login-btn\"", "")
content = content.replace('<button', '<button id="login-btn"')

with open(file_path, 'w') as f:
    f.write(content)
