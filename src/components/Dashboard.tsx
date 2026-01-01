import React, { useEffect, useState } from 'react';
import { StorageService, PlanSummary } from '../services/storageService';
import { Plus, FileText, Clock, Trash2, LayoutTemplate, LogOut, Loader2 } from 'lucide-react';

interface DashboardProps {
  onSelectPlan: (id: string) => void;
  onCreatePlan: () => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectPlan, onCreatePlan, onLogout }) => {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const user = StorageService.getCurrentUser();

  const loadPlans = async () => {
    setLoading(true);
    const data = await StorageService.getPlans();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this plan? This cannot be undone.')) {
        await StorageService.deletePlan(id);
        loadPlans();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Dashboard Header */}
       <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xl">
                <LayoutTemplate className="w-6 h-6 text-indigo-600" />
                <span>RetailPlan AI</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-slate-800">{user?.displayName || user?.email || 'User'}</div>
                    <div className="text-xs text-slate-500">Pro Plan (Student)</div>
                </div>
                {user?.photoURL && (
                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
                )}
                <button 
                    onClick={onLogout}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
       </header>

       {/* Main Content */}
       <main className="flex-1 max-w-6xl mx-auto w-full p-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">My Business Plans</h1>
                    <p className="text-slate-500 mt-1">Manage your existing retail plans or start a new one.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Card */}
                    <button 
                        onClick={onCreatePlan}
                        className="group bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer h-64"
                    >
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="font-semibold text-slate-600 group-hover:text-indigo-700">Create New Plan</span>
                    </button>

                    {/* Plan Cards */}
                    {plans.map(plan => (
                        <div 
                            key={plan.id}
                            onClick={() => onSelectPlan(plan.id)}
                            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all flex flex-col h-64 relative group"
                        >
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">{plan.name}</h3>
                            <div className="mt-auto flex items-center justify-between text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(plan.lastEdited).toLocaleDateString()}
                                </div>
                            </div>
                            
                            <button 
                                onClick={(e) => handleDelete(e, plan.id)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete Plan"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}

                    {plans.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            <p>No plans yet. Click the + button to create your first business plan.</p>
                        </div>
                    )}
                </div>
            )}
       </main>
    </div>
  );
};
