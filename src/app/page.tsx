'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('sdlc_user_name', name.trim());
      router.push('/assessment');
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-4 bg-slate-950 overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-lg bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-slate-200">
        
        <div className="relative p-10 text-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30 mb-6 ring-1 ring-white/20">
            <ShieldCheck className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-violet-200 mb-3 tracking-tight">
            AI-SDLC Auditor
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            Assess your team&apos;s adherence to the 5-phase intelligent workflow rules with AI-driven insights.
          </p>
        </div>
        
        <div className="p-10">
          <form onSubmit={handleStart} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 ml-1">
                Your Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 opacity-20 blur group-focus-within:opacity-40 transition-opacity duration-500" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="relative w-full px-5 py-4 rounded-xl bg-slate-950/50 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 text-white placeholder-slate-500 outline-none"
                  placeholder="e.g. Jane Doe"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!name.trim()}
              className="group relative w-full overflow-hidden rounded-xl bg-indigo-600 font-semibold text-white py-4 px-6 mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-white/10"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Assessment 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Button shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <a href="/dashboard" className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors tracking-wide uppercase px-3 py-1.5 rounded-full hover:bg-white/5">
                Admin Dashboard
             </a>
          </div>
        </div>
      </div>
    </div>
  );
}
