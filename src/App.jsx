import React, { useEffect } from 'react';
import MainHUD from './components/layout/MainHUD';
import BatchIngressZone from './components/admin/BatchIngressZone';
import { useDesktopAgentStore } from './store/useDesktopAgentStore';
import LoginGateway from './components/admin/LoginGateway';

function App() {
  const { currentView, updateTelemetry, walletConnected } = useDesktopAgentStore();

  useEffect(() => {
    const interval = setInterval(updateTelemetry, 3000);
    return () => clearInterval(interval);
  }, [updateTelemetry]);
  return (
    <div className="antialiased selection:bg-emerald-500/30">
      {!walletConnected ? <LoginGateway /> : (currentView === 'HUD' ? <MainHUD /> : <BatchIngressZone />)}
    </div>
  );
}

export default App;