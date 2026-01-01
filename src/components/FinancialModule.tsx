import React, { useMemo } from 'react';
import { Section, FinancialItem } from '../types';
import { usePlan } from '../store/PlanContext';
import { 
    Plus, 
    Trash2, 
    DollarSign, 
    TrendingUp, 
    Activity,
    CreditCard,
    PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface FinancialModuleProps {
    sectionId: string;
    data: NonNullable<Section['financialData']>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

export const FinancialModule: React.FC<FinancialModuleProps> = ({ sectionId, data }) => {
    const { updateSection, sections } = usePlan();
    
    const section = sections.find(s => s.id === sectionId);

    const handleUpdate = (updates: Partial<typeof data>) => {
        if (!section) return;
        updateSection(sectionId, {
            financialData: { ...data, ...updates }
        });
    };

    const addItem = (listKey: 'startupCosts' | 'monthlyExpenses') => {
        const newItem: FinancialItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'New Item',
            amount: 0
        };
        handleUpdate({ [listKey]: [...data[listKey], newItem] });
    };

    const updateItem = (listKey: 'startupCosts' | 'monthlyExpenses', itemId: string, field: keyof FinancialItem, value: string | number) => {
        const newList = data[listKey].map(item => {
            if (item.id === itemId) {
                return { ...item, [field]: value };
            }
            return item;
        });
        handleUpdate({ [listKey]: newList });
    };

    const deleteItem = (listKey: 'startupCosts' | 'monthlyExpenses', itemId: string) => {
        const newList = data[listKey].filter(item => item.id !== itemId);
        handleUpdate({ [listKey]: newList });
    };

    // Calculations
    const totalStartupCosts = useMemo(() => data.startupCosts.reduce((acc, item) => acc + Number(item.amount), 0), [data.startupCosts]);
    const totalMonthlyFixedExpenses = useMemo(() => data.monthlyExpenses.reduce((acc, item) => acc + Number(item.amount), 0), [data.monthlyExpenses]);
    
    const monthlyRevenue = data.productPrice * data.dailyCustomers * 30;
    const monthlyCOGS = data.productCost * data.dailyCustomers * 30;
    const monthlyGrossProfit = monthlyRevenue - monthlyCOGS;
    const monthlyNetProfit = monthlyGrossProfit - totalMonthlyFixedExpenses;
    
    const contributionMargin = data.productPrice - data.productCost;
    const breakEvenUnits = contributionMargin > 0 ? Math.ceil(totalMonthlyFixedExpenses / contributionMargin) : 0;

    // Charts Data Generation
    const projectionData = useMemo(() => {
        const months = [];
        for (let i = 1; i <= 12; i++) {
            // Assume 5% growth per month
            const growthFactor = Math.pow(1.05, i - 1);
            const rev = monthlyRevenue * growthFactor;
            const cogs = monthlyCOGS * growthFactor;
            const gross = rev - cogs;
            const net = gross - totalMonthlyFixedExpenses;
            
            months.push({
                name: `M${i}`,
                Revenue: Math.round(rev),
                Expenses: Math.round(totalMonthlyFixedExpenses + cogs),
                Profit: Math.round(net)
            });
        }
        return months;
    }, [monthlyRevenue, monthlyCOGS, totalMonthlyFixedExpenses]);

    return (
        <div className="flex-1 bg-slate-50 overflow-y-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Financial Projections Module</h2>
                <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded border shadow-sm">
                    Currency: {data.currency}
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2 font-medium">
                        <TrendingUp className="w-5 h-5" /> Est. Monthly Revenue
                    </div>
                    <div className="text-2xl font-bold text-slate-800">${monthlyRevenue.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Based on {data.dailyCustomers} daily customers</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 text-green-600 mb-2 font-medium">
                        <DollarSign className="w-5 h-5" /> Net Profit Margin
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        {monthlyRevenue > 0 ? ((monthlyNetProfit / monthlyRevenue) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-xs text-slate-500">${monthlyNetProfit.toLocaleString()} / month</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 text-orange-600 mb-2 font-medium">
                        <Activity className="w-5 h-5" /> Break-Even Point
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{breakEvenUnits} units</div>
                    <div className="text-xs text-slate-500">To cover fixed costs</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Inputs Section */}
                <div className="space-y-6">
                    {/* Unit Economics */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Revenue Drivers
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Avg Price ($)</label>
                                <input 
                                    type="number" 
                                    className="w-full border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={data.productPrice}
                                    onChange={(e) => handleUpdate({ productPrice: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Avg Cost ($)</label>
                                <input 
                                    type="number" 
                                    className="w-full border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={data.productCost}
                                    onChange={(e) => handleUpdate({ productCost: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Daily Vol (Qty)</label>
                                <input 
                                    type="number" 
                                    className="w-full border border-slate-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={data.dailyCustomers}
                                    onChange={(e) => handleUpdate({ dailyCustomers: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Startup Costs */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-700">Startup Costs</h3>
                            <span className="text-sm font-bold text-slate-900">${totalStartupCosts.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {data.startupCosts.map(item => (
                                <div key={item.id} className="flex gap-2">
                                    <input 
                                        className="flex-1 text-sm border border-slate-200 rounded px-2 py-1"
                                        value={item.name}
                                        onChange={(e) => updateItem('startupCosts', item.id, 'name', e.target.value)}
                                        placeholder="Item Name"
                                    />
                                    <input 
                                        className="w-24 text-sm border border-slate-200 rounded px-2 py-1"
                                        type="number"
                                        value={item.amount}
                                        onChange={(e) => updateItem('startupCosts', item.id, 'amount', parseFloat(e.target.value) || 0)}
                                    />
                                    <button onClick={() => deleteItem('startupCosts', item.id)} className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => addItem('startupCosts')}
                            className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-800"
                        >
                            <Plus className="w-3 h-3" /> Add Cost
                        </button>
                    </div>

                    {/* Operating Expenses */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-700">Monthly Operating Expenses</h3>
                            <span className="text-sm font-bold text-slate-900">${totalMonthlyFixedExpenses.toLocaleString()}/mo</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {data.monthlyExpenses.map(item => (
                                <div key={item.id} className="flex gap-2">
                                    <input 
                                        className="flex-1 text-sm border border-slate-200 rounded px-2 py-1"
                                        value={item.name}
                                        onChange={(e) => updateItem('monthlyExpenses', item.id, 'name', e.target.value)}
                                        placeholder="Expense Name"
                                    />
                                    <input 
                                        className="w-24 text-sm border border-slate-200 rounded px-2 py-1"
                                        type="number"
                                        value={item.amount}
                                        onChange={(e) => updateItem('monthlyExpenses', item.id, 'amount', parseFloat(e.target.value) || 0)}
                                    />
                                    <button onClick={() => deleteItem('monthlyExpenses', item.id)} className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => addItem('monthlyExpenses')}
                            className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-800"
                        >
                            <Plus className="w-3 h-3" /> Add Expense
                        </button>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="space-y-6">
                    {/* Sales Forecast Chart */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> 12-Month Sales Forecast
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projectionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(val) => `$${val/1000}k`}/>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        formatter={(val: number) => `$${val.toLocaleString()}`}
                                    />
                                    <Legend />
                                    <Bar dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Expenses" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Profit Line Chart */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-700 mb-4">Cumulative Profit Projection</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={projectionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        formatter={(val: number) => `$${val.toLocaleString()}`}
                                    />
                                    <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Startup Costs Pie */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                             <PieIcon className="w-4 h-4" /> Startup Cost Breakdown
                        </h3>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.startupCosts as any[]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="amount"
                                    >
                                        {data.startupCosts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};