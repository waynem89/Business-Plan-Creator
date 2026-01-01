import React, { useState } from 'react';
import { LayoutTemplate, CheckCircle2, TrendingUp, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
        StorageService.login(email);
        onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-y-auto">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xl">
          <LayoutTemplate className="w-6 h-6" />
          <span>RetailPlan AI</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-slate-600 font-medium hover:text-indigo-600"
          >
            Features
          </button>
          <button 
            onClick={() => setIsLoginView(true)}
            className="text-slate-600 font-medium hover:text-indigo-600"
          >
            Log In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Build a Professional <span className="text-indigo-400">Retail Business Plan</span> in Minutes
            </h1>
            <p className="text-slate-300 text-lg">
              AI-powered guidance, automated financial projections, and industry-standard templates tailored specifically for retail businesses.
            </p>
            <button 
              onClick={() => {
                setIsLoginView(false);
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-2 transition-all"
            >
              Start Your Plan Free <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full">
            <div className="bg-slate-800 rounded-xl p-4 shadow-2xl border border-slate-700 rotate-2 hover:rotate-0 transition-all duration-500">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-3 opacity-80">
                    <div className="h-4 bg-slate-600 rounded w-1/3"></div>
                    <div className="h-32 bg-slate-700 rounded w-full"></div>
                    <div className="flex gap-2">
                        <div className="h-20 bg-slate-700 rounded flex-1"></div>
                        <div className="h-20 bg-slate-700 rounded flex-1"></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-6 max-w-6xl mx-auto" id="features">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Everything You Need to Launch</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Stop struggling with spreadsheets and blank pages. RetailPlan AI gives you the structure and intelligence to succeed.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Content Consultant</h3>
            <p className="text-slate-600">
                Stuck on your marketing strategy? Ask our AI consultant to draft sections based on your specific retail niche.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-6">
                <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Automated Financials</h3>
            <p className="text-slate-600">
                Input your costs and pricing, and we generate professional P&L statements, break-even analysis, and sales forecasts instantly.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6">
                <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Checklists</h3>
            <p className="text-slate-600">
                Stay on track with section-specific checklists generated by AI to ensure you don't miss any critical details investors look for.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div id="auth-section" className="bg-indigo-50 py-20 px-6 flex justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                    {isLoginView ? 'Welcome Back' : 'Create Your Account'}
                </h3>
                <p className="text-slate-500 text-sm mt-2">
                    {isLoginView ? 'Enter your details to access your plans.' : 'Get started with a free account today.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input 
                        type="password" 
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    {isLoginView ? 'Log In' : 'Sign Up'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-slate-500">
                    {isLoginView ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                    onClick={() => setIsLoginView(!isLoginView)}
                    className="text-indigo-600 font-semibold hover:underline"
                >
                    {isLoginView ? 'Sign Up' : 'Log In'}
                </button>
            </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} RetailPlan AI. All rights reserved.
      </footer>
    </div>
  );
};
