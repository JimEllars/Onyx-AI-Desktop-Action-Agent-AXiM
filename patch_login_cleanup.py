import re

file_path = 'src/components/admin/LoginGateway.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace('<button id="login-btn" data-test data-test', '<button id="login-btn" data-testid="login-btn"')

with open(file_path, 'w') as f:
    f.write(content)
