import React, { useState } from 'react';
import { PlanProvider } from './store/PlanContext';
import { Sidebar } from './components/Sidebar';
import { EditorArea } from './components/EditorArea';
import { InfoPanel } from './components/InfoPanel';

const AppLayout: React.FC = () => {
  const [taskOverlayId, setTaskOverlayId] = useState<string | null>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      {/* 1. Left Column: Sidebar */}
      <Sidebar onOpenTaskOverlay={setTaskOverlayId} />

      {/* 2. Middle Column: Content */}
      <EditorArea />

      {/* 3. Right Column: Info Panel */}
      <InfoPanel 
        taskOverlaySectionId={null} 
        onCloseOverlay={() => {}} 
      />

      {/* Task List Overlay (Context Menu Triggered) */}
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
      <AppLayout />
    </PlanProvider>
  );
};

export default App;
