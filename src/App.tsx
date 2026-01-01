import React, { useState, useEffect } from 'react';
import { PlanProvider, usePlan } from './store/PlanContext';
import { Sidebar } from './components/Sidebar';
import { EditorArea } from './components/EditorArea';
import { InfoPanel } from './components/InfoPanel';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { StorageService } from './services/storageService';
import { Loader2 } from 'lucide-react';

// The "Router" component inside the provider
const MainLayout: React.FC = () => {
  const [view, setView] = useState<'landing' | 'dashboard' | 'editor'>('landing');
  const [taskOverlayId, setTaskOverlayId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { loadPlan, createNewPlan } = usePlan();

  useEffect(() => {
    // Subscribe to Firebase Auth changes
    const unsubscribe = StorageService.onAuthChange((user) => {
      if (user) {
        // If we are on landing, go to dashboard. Otherwise stay where we are (editor/dashboard).
        setView(current => current === 'landing' ? 'dashboard' : current);
      } else {
        setView('landing');
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    // Handled by onAuthChange
  };

  const handleLogout = () => {
    StorageService.logout();
    // Handled by onAuthChange
  };

  const handleCreatePlan = async () => {
    await createNewPlan();
    setView('editor');
  };

  const handleSelectPlan = async (id: string) => {
    await loadPlan(id);
    setView('editor');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
  };

  if (isAuthLoading) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );
  }

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