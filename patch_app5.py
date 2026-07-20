import re

file_path = 'src/App.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("{!walletConnected ? <LoginGateway /> : (currentView === 'HUD' ? <MainHUD /> : <BatchIngressZone />)}", "{true ? (currentView === 'HUD' ? <MainHUD /> : <BatchIngressZone />) : null}")

with open(file_path, 'w') as f:
    f.write(content)
