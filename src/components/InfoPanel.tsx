import React, { useState } from 'react';
import { usePlan } from '../store/PlanContext';
import { 
    StickyNote, 
    FileText, 
    ListTodo, 
    Upload, 
    Trash, 
    Plus
} from 'lucide-react';

export const InfoPanel: React.FC<{ taskOverlaySectionId: string | null, onCloseOverlay: () => void }> = ({ taskOverlaySectionId, onCloseOverlay }) => {
  const { activeSectionId, sections, updateSection } = usePlan();
  
  // If overlay is active, show that section, otherwise show active section
  const targetSectionId = taskOverlaySectionId || activeSectionId;
  const section = sections.find(s => s.id === targetSectionId);
  const isOverlay = !!taskOverlaySectionId;

  const [newTask, setNewTask] = useState('');

  if (!section) return <div className="w-72 bg-slate-50 border-l border-slate-200"></div>;

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSection(section.id, { notes: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const newFile = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            uploadDate: new Date().toISOString()
        };
        updateSection(section.id, { researchFiles: [...section.researchFiles, newFile] });
    }
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task = {
        id: Math.random().toString(36).substr(2, 9),
        text: newTask,
        completed: false
    };
    updateSection(section.id, { tasks: [...section.tasks, task] });
    setNewTask('');
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = section.tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateSection(section.id, { tasks: updatedTasks });
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = section.tasks.filter(t => t.id !== taskId);
    updateSection(section.id, { tasks: updatedTasks });
  };

  // If it's an overlay (from context menu), wrap in absolute positioning
  const Container = isOverlay 
    ? ({ children }: { children: React.ReactNode }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCloseOverlay}>
            <div className="bg-white w-[500px] h-[600px] rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">Tasks for {section.title}</h3>
                    <button onClick={onCloseOverlay} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                    {children}
                </div>
            </div>
        </div>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col h-full overflow-y-auto">
             <div className="p-4 border-b border-slate-200 font-semibold text-slate-700 bg-white">
                Context & Data
             </div>
             {children}
        </div>
      );

  // If overlay mode, we only show tasks. If sidebar mode, we show everything.
  return (
    <Container>
      {/* Tasks Section */}
      <div className={`mb-6 ${isOverlay ? '' : 'p-4'}`}>
        {!isOverlay && (
            <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-3">
                <ListTodo className="w-4 h-4" />
                <h3>Tasks</h3>
            </div>
        )}
        
        <form onSubmit={addTask} className="flex gap-2 mb-3">
            <input 
                className="flex-1 text-sm border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Add a task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
            />
            <button type="submit" className="bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
            </button>
        </form>

        <div className="space-y-2">
            {section.tasks.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No tasks yet.</p>}
            {section.tasks.map(task => (
                <div key={task.id} className="group flex items-center gap-2 bg-white p-2 rounded border border-slate-200 shadow-sm">
                    <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={() => toggleTask(task.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {task.text}
                    </span>
                    <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash className="w-3 h-3" />
                    </button>
                </div>
            ))}
        </div>
      </div>

      {!isOverlay && (
        <>
            <hr className="border-slate-200 mx-4 mb-6" />

            {/* Notes Section */}
            <div className="p-4 pt-0 mb-6">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-3">
                    <StickyNote className="w-4 h-4" />
                    <h3>Private Notes</h3>
                </div>
                <textarea 
                    className="w-full h-32 text-sm p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none bg-yellow-50 text-slate-700 placeholder:text-slate-400"
                    placeholder="Jot down quick thoughts here. Not visible in plan."
                    value={section.notes}
                    onChange={handleNotesChange}
                />
            </div>

            <hr className="border-slate-200 mx-4 mb-6" />

            {/* Research Data Section */}
            <div className="p-4 pt-0">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-3">
                    <FileText className="w-4 h-4" />
                    <h3>Research & Data</h3>
                </div>
                
                <div className="space-y-2 mb-3">
                    {section.researchFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-xs">
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <span className="text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                    ))}
                </div>

                <label className="flex items-center justify-center gap-2 w-full p-2 border-2 border-dashed border-slate-300 rounded-md text-slate-500 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-xs font-medium">Upload File</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
            </div>
        </>
      )}
    </Container>
  );
};
