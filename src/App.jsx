import React, { useEffect } from 'react';
import MainHUD from './components/layout/MainHUD';
import BatchIngressZone from './components/admin/BatchIngressZone';
import { useDesktopAgentStore } from './store/useDesktopAgentStore';
import LoginGateway from './components/admin/LoginGateway';

function App() {
  const { currentView, updateTelemetry, walletConnected, addPendingApproval } = useDesktopAgentStore();

  useEffect(() => {
    if (!walletConnected) return;
    const interval = setInterval(() => {
      updateTelemetry();
      if (Math.random() < 0.15) {
        addPendingApproval({
          id: `MCP-HITL-${Math.floor(Math.random() * 10000)}`,
          agent: 'Swarm Background Ticker',
          action: 'Telemetry Injection',
          details: 'Routine stress test payload injection.'
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [updateTelemetry, walletConnected]);
  return (
    <div className="antialiased selection:bg-emerald-500/30">
      {!walletConnected ? <LoginGateway /> : (currentView === 'HUD' ? <MainHUD /> : <BatchIngressZone />)}
    </div>
  );
}

export default App;