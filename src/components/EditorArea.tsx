import React, { useState, useEffect, useRef } from 'react';
import { usePlan } from '../store/PlanContext';
import { FinancialModule } from './FinancialModule';
import { 
    CheckCircle2, 
    Circle, 
    Sparkles, 
    Send, 
    History, 
    RotateCcw,
    Loader2,
    BarChart3,
    FileEdit
} from 'lucide-react';

export const EditorArea: React.FC = () => {
  const { 
    activeSectionId, 
    sections, 
    updateSection, 
    generateContentHelp, 
    isLoadingAI 
  } = usePlan();

  const activeSection = sections.find(s => s.id === activeSectionId);
  const [chatInput, setChatInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'financials'>('editor');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSection?.chatHistory]);

  // Reset view mode when changing sections
  useEffect(() => {
    // If it has financial data, default to financials view potentially, or stick to editor.
    // Let's stick to 'editor' default unless it's strictly the financial plan.
    if (activeSection?.title === 'Financial Plan') {
        setViewMode('financials');
    } else {
        setViewMode('editor');
    }
  }, [activeSectionId]);

  if (!activeSection) {
    return <div className="flex-1 flex items-center justify-center bg-white text-slate-400">Select a section to begin editing</div>;
  }

  const handleChecklistToggle = (itemId: string) => {
    const newChecklist = activeSection.checklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateSection(activeSection.id, { checklist: newChecklist });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSection(activeSection.id, { content: e.target.value });
  };

  const handleBlur = () => {
    if (activeSection.content.trim() === '') return;
    const lastEntry = activeSection.history[activeSection.history.length - 1];
    if (!lastEntry || lastEntry.content !== activeSection.content) {
        const newHistory = [...activeSection.history, { timestamp: Date.now(), content: activeSection.content }];
        updateSection(activeSection.id, { history: newHistory });
    }
  };

  const restoreVersion = (content: string) => {
    updateSection(activeSection.id, { content });
    setShowHistory(false);
  };

  const sendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    const prompt = chatInput;
    setChatInput('');
    await generateContentHelp(activeSection.id, prompt);
  };

  const hasFinancialTools = !!activeSection.financialData;

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      
      {/* 1. Top Section: Checklist */}
      <div className="bg-indigo-50 border-b border-indigo-100 p-6 flex-shrink-0 max-h-48 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-indigo-900 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            AI Checklist for {activeSection.title}
          </h3>
          <span className="text-xs text-indigo-600 font-medium bg-indigo-100 px-2 py-1 rounded-full">
            {activeSection.checklist.filter(i => i.completed).length}/{activeSection.checklist.length} Completed
          </span>
        </div>
        
        {isLoadingAI && activeSection.checklist.length === 0 ? (
            <div className="flex items-center gap-2 text-indigo-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Generating standards...
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activeSection.checklist.map(item => (
                <div 
                key={item.id} 
                className={`flex items-start gap-2 p-2 rounded cursor-pointer transition-all ${item.completed ? 'opacity-50' : 'hover:bg-white/50'}`}
                onClick={() => handleChecklistToggle(item.id)}
                >
                <div className={`mt-0.5 ${item.completed ? 'text-green-500' : 'text-slate-400'}`}>
                    {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
                <span className={`text-sm ${item.completed ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                    {item.text}
                </span>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* 2. Middle Section: Editor or Financial Module */}
      <div className="flex-1 relative flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800">{activeSection.title}</h2>
                {hasFinancialTools && (
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('editor')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${viewMode === 'editor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FileEdit className="w-3 h-3" /> Text
                        </button>
                        <button 
                            onClick={() => setViewMode('financials')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 transition-all ${viewMode === 'financials' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <BarChart3 className="w-3 h-3" /> Projections
                        </button>
                    </div>
                )}
            </div>
            
            {viewMode === 'editor' && (
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-colors ${showHistory ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <History className="w-4 h-4" />
                    History
                </button>
            )}
        </div>

        {viewMode === 'financials' && activeSection.financialData ? (
            <FinancialModule sectionId={activeSection.id} data={activeSection.financialData} />
        ) : (
            <>
                {showHistory && (
                    <div className="absolute inset-0 top-[60px] bg-slate-50 z-20 overflow-y-auto p-4 space-y-3">
                        <h3 className="font-semibold text-slate-700">Version History</h3>
                        {activeSection.history.length === 0 && <p className="text-slate-400 text-sm">No history yet.</p>}
                        {[...activeSection.history].reverse().map((ver, idx) => (
                            <div key={idx} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-500">{new Date(ver.timestamp).toLocaleString()}</span>
                                    <button 
                                        onClick={() => restoreVersion(ver.content)}
                                        className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Restore
                                    </button>
                                </div>
                                <div className="text-xs text-slate-600 line-clamp-2 font-mono bg-slate-50 p-1 rounded">
                                    {ver.content.substring(0, 150)}...
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <textarea
                    className="flex-1 w-full p-8 resize-none outline-none text-slate-700 leading-relaxed text-lg font-serif"
                    placeholder="Start writing your plan here..."
                    value={activeSection.content}
                    onChange={handleContentChange}
                    onBlur={handleBlur}
                />
            </>
        )}
      </div>

      {/* 3. Bottom Section: AI Chat */}
      <div className="h-64 border-t border-slate-200 flex flex-col bg-slate-50 flex-shrink-0">
        <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Consultant Chat</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeSection.chatHistory.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoadingAI && (
                <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg rounded-bl-none shadow-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        <span className="text-xs text-slate-400">Thinking...</span>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendChat} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input 
                type="text" 
                className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ask AI to help draft this section..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
            />
            <button 
                type="submit" 
                disabled={isLoadingAI || !chatInput.trim()}
                className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
        </form>
      </div>
    </div>
  );
};