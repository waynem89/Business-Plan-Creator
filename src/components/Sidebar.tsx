import React, { useState, useRef, useEffect } from 'react';
import { usePlan } from '../store/PlanContext';
import { 
  Settings, 
  GripVertical, 
  Plus, 
  Trash2, 
  CheckSquare, 
  LayoutTemplate,
  MoreVertical
} from 'lucide-react';

interface ContextMenuState {
  x: number;
  y: number;
  sectionId: string | null;
  visible: boolean;
}

export const Sidebar: React.FC<{ onOpenTaskOverlay: (sectionId: string) => void }> = ({ onOpenTaskOverlay }) => {
  const { sections, activeSectionId, setActiveSectionId, reorderSections, addSection, deleteSection, updateSection } = usePlan();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, sectionId: null, visible: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedId) return;
    
    const draggedIndex = sections.findIndex(s => s.id === draggedId);
    if (draggedIndex === index) return;

    reorderSections(draggedIndex, index);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      sectionId,
      visible: true
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Renaming
  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    // Timeout to allow render before focusing
    setTimeout(() => {
        if(editInputRef.current) {
            editInputRef.current.value = currentTitle;
            editInputRef.current.focus();
        }
    }, 50);
  };

  const saveTitle = (id: string, newTitle: string) => {
    if (newTitle.trim()) {
      updateSection(id, { title: newTitle });
    }
    setEditingId(null);
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold">
          <LayoutTemplate className="w-5 h-5 text-indigo-500" />
          <span>RetailPlan AI</span>
        </div>
        <button className="hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Plan Structure
        </div>
        
        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable={editingId !== section.id}
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => setActiveSectionId(section.id)}
            onContextMenu={(e) => handleContextMenu(e, section.id)}
            className={`
              group flex items-center gap-2 px-3 py-2 mx-2 rounded-md cursor-pointer transition-colors text-sm relative
              ${activeSectionId === section.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800'}
              ${draggedId === section.id ? 'opacity-50' : 'opacity-100'}
            `}
          >
            <button className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white">
              <GripVertical className="w-4 h-4" />
            </button>
            
            {editingId === section.id ? (
              <input
                ref={editInputRef}
                className="bg-slate-700 text-white px-1 py-0.5 rounded w-full outline-none border border-indigo-500"
                onBlur={(e) => saveTitle(section.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle(section.id, e.currentTarget.value);
                }}
              />
            ) : (
              <span className="truncate flex-1 select-none">{section.title}</span>
            )}

            {/* Hover Actions (quick delete/edit) */}
            <div className={`absolute right-2 flex gap-1 ${activeSectionId === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button 
                  onClick={(e) => { e.stopPropagation(); startEditing(section.id, section.title); }}
                  className="p-1 hover:bg-slate-700 rounded"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
            </div>
          </div>
        ))}

        <button 
          onClick={() => addSection("New Section")}
          className="flex items-center gap-2 px-5 py-2 mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors w-full"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {/* Account / User */}
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
          JD
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-sm font-medium text-white truncate">John Doe</div>
          <div className="text-xs text-slate-500 truncate">Pro Account</div>
        </div>
      </div>

      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg py-1 w-48"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()} // Prevent closing immediately
        >
          <button 
            onClick={() => {
              if (contextMenu.sectionId) onOpenTaskOverlay(contextMenu.sectionId);
              closeContextMenu();
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Open Task List
          </button>
          <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
          <button 
            onClick={() => {
                if (contextMenu.sectionId) {
                    const sec = sections.find(s => s.id === contextMenu.sectionId);
                    if(sec) startEditing(sec.id, sec.title);
                }
                closeContextMenu();
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Rename
          </button>
          <button 
             onClick={() => {
                if(contextMenu.sectionId) deleteSection(contextMenu.sectionId);
                closeContextMenu();
             }}
             className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            Delete Page
          </button>
        </div>
      )}
    </div>
  );
};
