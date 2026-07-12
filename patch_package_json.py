import json

with open('package.json', 'r') as f:
    data = json.load(f)

# Ensure dependencies are added
if '@eslint/js' in data.get('dependencies', {}):
    del data['dependencies']['@eslint/js']

with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)
