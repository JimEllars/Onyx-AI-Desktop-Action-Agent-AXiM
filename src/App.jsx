import React from 'react';
import MainHUD from './components/layout/MainHUD';
import BatchIngressZone from './components/admin/BatchIngressZone';
import { useDesktopAgentStore } from './store/useDesktopAgentStore';
import LoginGateway from './components/admin/LoginGateway';
import { useAgentConnection } from './hooks/useAgentConnection';

function App() {
  const { currentView, walletConnected } = useDesktopAgentStore();

  // Conditionally subscribing based on walletConnected in the hook
  useAgentConnection();

  return (
    <div className="antialiased selection:bg-emerald-500/30">
      {!walletConnected ? <LoginGateway /> : (currentView === 'HUD' ? <MainHUD /> : <BatchIngressZone />)}
    </div>
  );
}

export default App;
