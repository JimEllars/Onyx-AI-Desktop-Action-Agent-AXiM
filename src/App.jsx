import React from 'react';
import MainHUD from './components/layout/MainHUD';
import BatchIngressZone from './components/admin/BatchIngressZone';
import { useDesktopAgentStore } from './store/useDesktopAgentStore';

function App() {
  const { currentView } = useDesktopAgentStore();
  return (
    <div className="antialiased selection:bg-emerald-500/30">
      {currentView === 'HUD' ? <MainHUD /> : <BatchIngressZone />}
    </div>
  );
}

export default App;