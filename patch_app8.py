import re

file_path = 'src/App.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("{true ? (currentView === 'HUD' ? <MainHUD /> : <BatchIngressZone />) : null}", "{!walletConnected ? <LoginGateway /> : (currentView === 'HUD' ? <MainHUD /> : <BatchIngressZone />)}")

with open(file_path, 'w') as f:
    f.write(content)
