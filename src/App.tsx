import React, { useState, useEffect } from 'react';
import { PlanProvider, usePlan } from './store/PlanContext';
import { Sidebar } from './components/Sidebar';
import { EditorArea } from './components/EditorArea';
import { InfoPanel } from './components/InfoPanel';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { StorageService } from './services/storageService';

// The "Router" component inside the provider
const MainLayout: React.FC = () => {
  const [view, setView] = useState<'landing' | 'dashboard' | 'editor'>('landing');
  const [taskOverlayId, setTaskOverlayId] = useState<string | null>(null);
  const { loadPlan, createNewPlan, sections } = usePlan();

  useEffect(() => {
    // Check auth on load
    const user = StorageService.getUser();
    if (user?.isLoggedIn) {
      setView('dashboard');
    } else {
      setView('landing');
    }
  }, []);

  const handleLogin = () => {
    setView('dashboard');
  };

  const handleLogout = () => {
    StorageService.logout();
    setView('landing');
  };

  const handleCreatePlan = () => {
    const newId = createNewPlan();
    // Plan created and loaded in context
    setView('editor');
  };

  const handleSelectPlan = (id: string) => {
    loadPlan(id);
    setView('editor');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
  };

  if (view === 'landing') {
    return <LandingPage onLogin={handleLogin} />;
  }

  if (view === 'dashboard') {
    return (
        <Dashboard 
            onSelectPlan={handleSelectPlan} 
            onCreatePlan={handleCreatePlan} 
            onLogout={handleLogout}
        />
    );
  }

  // Editor View
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <Sidebar 
        onOpenTaskOverlay={setTaskOverlayId} 
        onBackToDashboard={handleBackToDashboard}
      />

      <EditorArea />

      {/* Info Panel: Hide in print mode */}
      <div className="no-print h-full">
        <InfoPanel 
            taskOverlaySectionId={null} 
            onCloseOverlay={() => {}} 
        />
      </div>

      {taskOverlayId && (
        <InfoPanel 
          taskOverlaySectionId={taskOverlayId} 
          onCloseOverlay={() => setTaskOverlayId(null)} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <PlanProvider>
      <MainLayout />
    </PlanProvider>
  );
};

export default App;
