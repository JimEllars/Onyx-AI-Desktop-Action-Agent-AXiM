import React, { useEffect } from 'react';
import MainHUD from './components/layout/MainHUD';
import BatchIngressZone from './components/admin/BatchIngressZone';
import { useDesktopAgentStore } from './store/useDesktopAgentStore';
import LoginGateway from './components/admin/LoginGateway';
import { useAgentConnection } from './hooks/useAgentConnection';
import { aximCoreClient, isSupabaseConfigured } from './lib/supabaseClient';

function App() {
  const { currentView, walletConnected, loginUser, logoutUser } = useDesktopAgentStore();

  useAgentConnection();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined;
    }

    const syncSession = (session) => {
      if (session) {
        loginUser(session.user.email || session.user.id);
      } else {
        logoutUser(false);
      }
    };

    aximCoreClient.auth.getSession().then(({ data: { session } }) => {
      syncSession(session);
    });

    const { data: { subscription } } = aximCoreClient.auth.onAuthStateChange(
      (_event, session) => syncSession(session),
    );

    return () => subscription.unsubscribe();
  }, [loginUser, logoutUser]);

  return (
    <div className="antialiased selection:bg-emerald-500/30">
      {!walletConnected ? (
        <LoginGateway/>
      ) : currentView === 'HUD' ? (
        <MainHUD/>
      ) : (
        <BatchIngressZone/>
      )}
    </div>
  );
}

export default App;
