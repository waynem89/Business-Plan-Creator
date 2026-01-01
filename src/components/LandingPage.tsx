import React from 'react';
import { LayoutTemplate, CheckCircle2, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface LandingPageProps {
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = () => {

  const handleGoogleLogin = async () => {
    await StorageService.login();
    // onLogin is handled by the AuthListener in App.tsx
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
            onClick={handleGoogleLogin}
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
              onClick={handleGoogleLogin}
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
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Get Started
            </h3>
            <p className="text-slate-500 mb-8">
                Sign in with your Google Account to save your plans to the cloud.
            </p>

            <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-sm"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Sign in with Google
            </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} RetailPlan AI. All rights reserved.
      </footer>
    </div>
  );
};