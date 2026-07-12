import json

with open("package.json", "r") as f:
    data = json.load(f)

data["scripts"]["build"] = "npm run lint && vite build && cp public/_redirects dist/"

with open("package.json", "w") as f:
    json.dump(data, f, indent=2)
