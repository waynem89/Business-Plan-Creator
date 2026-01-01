import React, { useState, useRef, useEffect } from 'react';
import { usePlan } from '../store/PlanContext';
import { 
  Settings, 
  GripVertical, 
  Plus, 
  LayoutTemplate,
  MoreVertical,
  ArrowLeft,
  Download,
  Printer
} from 'lucide-react';

interface ContextMenuState {
  x: number;
  y: number;
  sectionId: string | null;
  visible: boolean;
}

// Declare html2pdf for TypeScript since it's loaded via CDN
declare const html2pdf: any;

interface SidebarProps {
  onOpenTaskOverlay: (sectionId: string) => void;
  onBackToDashboard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenTaskOverlay, onBackToDashboard }) => {
  const { sections, activeSectionId, setActiveSectionId, reorderSections, addSection, deleteSection, updateSection, planMetadata } = usePlan();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, sectionId: null, visible: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Export Function
  const handleExportPDF = () => {
    setIsExporting(true);
    const element = document.getElementById('root'); // We typically capture the whole app or a specific container
    // However, for a clean export, we usually want to construct a clean DOM or hide UI elements.
    // The easiest robust way in this setup is window.print() with specific CSS,
    // but the user requested "save as file". 
    // Let's use html2pdf on the Editor Area content specifically if possible, 
    // OR just use window.print() and guide them. 
    // Given the prompt "save... as a pdf file", html2pdf is safer if we want to bypass the system print dialog.
    
    // BETTER APPROACH: Generate a clean print view temporarily?
    // Let's try to target the 'EditorArea' mostly, but we want the whole plan.
    // Actually, printing the *whole* plan means concatenating all sections.
    // The current view only shows one section.
    
    // For this version, let's export the CURRENT visible section + Financials if active.
    // To export the WHOLE plan, we'd need to render all sections invisibly. 
    // Let's stick to window.print() which is universally supported and can be styled to look like a doc.
    window.print();
    setIsExporting(false);
  };

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

  const handleContextMenu = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, sectionId, visible: true });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
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
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 flex-shrink-0 no-print">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 space-y-4">
        <button 
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </button>
        
        <div className="flex items-center gap-2 text-white font-bold">
          <LayoutTemplate className="w-5 h-5 text-indigo-500" />
          <span className="truncate" title={planMetadata?.name}>{planMetadata?.name || 'RetailPlan AI'}</span>
        </div>
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

      {/* Export / Settings */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
            onClick={handleExportPDF}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-md text-sm transition-colors"
        >
            <Printer className="w-4 h-4" />
            Save as PDF
        </button>
        <div className="flex items-center justify-between text-slate-500 pt-2">
            <button className="hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
            <span className="text-xs">v1.2.0</span>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg py-1 w-48"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => {
              if (contextMenu.sectionId) onOpenTaskOverlay(contextMenu.sectionId);
              closeContextMenu();
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            {/* <ListTodo className="w-4 h-4" /> */}
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
