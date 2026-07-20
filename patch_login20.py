import re

file_path = 'src/components/admin/LoginGateway.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace('<button data-testid="login-btn" data-testid="login-btn"', '<button data-testid="login-btn"')

with open(file_path, 'w') as f:
    f.write(content)
