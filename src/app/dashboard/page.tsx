'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lock, Loader2, RefreshCw, BarChart3, BrainCircuit, Users, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [loading, setLoading] = useState(false);
  type DashboardData = { averages: Record<string, number>; individuals: { name: string; phase_1_score: number; phase_2_score: number; phase_3_score: number; phase_4_score: number; phase_5_score: number; }[] };
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cached = localStorage.getItem('sdlc_admin_token');
    if (cached) {
      setPassword(cached);
      handleLogin(cached);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (tokenToUse: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/results?adminToken=${tokenToUse}`);
      const result = await res.json();
      
      if (res.ok && result.success) {
        setIsAuthenticated(true);
        localStorage.setItem('sdlc_admin_token', tokenToUse);
        setData(result);
        fetchInsights(tokenToUse);
      } else {
        setError(result.error || 'Authentication failed');
        localStorage.removeItem('sdlc_admin_token');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async (token: string) => {
    setInsightsLoading(true);
    try {
      const res = await fetch(`/api/insights?adminToken=${token}`);
      const result = await res.json();
      if (res.ok && result.success) {
        setInsights(result.insight);
      } else {
        setInsights("Failed to load insights or no data available.");
      }
    } catch {
      setInsights("Error loading insights.");
    } finally {
      setInsightsLoading(false);
    }
  };

  // -------------------------
  // Render Login State
  // -------------------------
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-[100dvh] flex items-center justify-center p-4 bg-slate-950 overflow-hidden font-sans">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 shadow-lg shadow-black/50 mb-6 ring-1 ring-white/10">
            <Lock className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 text-sm mb-8">Enter executive password to access analytics</p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(password); }} className="space-y-4">
            <div className="relative group">
               <input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="relative w-full px-5 py-4 rounded-xl bg-slate-950/50 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 text-white placeholder-slate-500 outline-none text-center tracking-widest"
                 placeholder="••••••••"
                 required
               />
               <div className="absolute inset-0 rounded-xl bg-indigo-500 opacity-0 blur-md group-focus-within:opacity-20 transition-opacity duration-500 pointer-events-none" />
            </div>
            
            {error && <p className="text-rose-400 text-sm font-medium">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-slate-200 text-slate-900 font-bold py-4 transition-all hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-transparent"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-600" /> : 'Authenticate'}
              </span>
            </button>
          </form>
          <button onClick={() => router.push('/')} className="mt-6 text-sm text-slate-500 hover:text-white transition-colors uppercase tracking-wide font-medium">
             Return Home
          </button>
        </div>
      </div>
    );
  }

  // -------------------------
  // Render Dashboard
  // -------------------------
  const chartData = data ? [
    { name: 'Reqs', Average: data.averages.phase1, fullMax: 30 },
    { name: 'Design', Average: data.averages.phase2, fullMax: 30 },
    { name: 'Build', Average: data.averages.phase3, fullMax: 30 },
    { name: 'Test', Average: data.averages.phase4, fullMax: 30 },
    { name: 'Deploy', Average: data.averages.phase5, fullMax: 30 },
  ] : [];

  return (
    <div className="relative min-h-[100dvh] bg-slate-950 py-8 px-4 sm:px-8 font-sans overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none fixed" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] rounded-full bg-rose-600/5 blur-[120px] pointer-events-none fixed" />

      <div className="relative z-10 max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-500/20 rounded-xl ring-1 ring-indigo-500/30">
               <ShieldAlert className="w-8 h-8 text-indigo-400" />
             </div>
             <div>
               <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                  Executive Overlap
               </h1>
               <p className="text-slate-400 text-sm font-medium tracking-wide mt-1">SDLC Auditor Analytics Dashboard</p>
             </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex gap-3 sm:gap-4 self-stretch sm:self-auto">
             <button 
                onClick={() => handleLogin(password)} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 text-slate-300 font-medium px-5 py-3 rounded-xl border border-white/5 hover:bg-white/10 hover:text-white transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button 
                onClick={() => { localStorage.removeItem('sdlc_admin_token'); setIsAuthenticated(false); }} 
                className="flex-1 sm:flex-none bg-rose-500/10 text-rose-400 font-bold px-6 py-3 rounded-xl border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300 transition-all shadow-sm"
             >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Qualitative AI Insights Column */}
           <div className="lg:col-span-1 border border-white/10 bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 shadow-xl flex flex-col h-full relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-violet-500/20 rounded-xl ring-1 ring-violet-500/30">
                  <BrainCircuit className="w-6 h-6 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">AI Synthesized Insights</h2>
             </div>
             
             <div className="flex-1 flex flex-col">
                 {insightsLoading ? (
                   <div className="flex items-center justify-center flex-1 text-slate-400">
                     <Loader2 className="w-6 h-6 animate-spin mr-3 text-violet-400" /> Synthesizing team feedback...
                   </div>
                 ) : (
                   <div className="prose prose-invert prose-slate max-w-none">
                      {insights ? (
                        <div className="text-slate-300 leading-relaxed text-[15px] space-y-4 whitespace-pre-wrap">
                           {insights}
                        </div>
                      ) : (
                        <p className="italic text-slate-500 text-center mt-10">No friction feedback available yet.</p>
                      )}
                   </div>
                 )}
             </div>
           </div>

           {/* Quantitative Data Column */}
           <div className="lg:col-span-2 space-y-8">
             
              {/* Chart */}
              <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-bl-[100px] pointer-events-none" />
                 <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3 bg-indigo-500/20 rounded-xl ring-1 ring-indigo-500/30">
                       <BarChart3 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-white tracking-tight">Phase Averages</h2>
                       <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Maximum Score: 30</p>
                    </div>
                 </div>
                 <div className="h-[320px] w-full relative z-10">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 500}} axisLine={{stroke: '#334155'}} tickLine={false} dy={10} />
                        <YAxis domain={[0, 30]} tick={{fill: '#475569', fontSize: 13}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{fill: 'rgba(255,255,255,0.03)'}}
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', color: '#fff' }}
                          itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="Average" fill="url(#colorIndigo)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                        <defs>
                           <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#818cf8" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8}/>
                           </linearGradient>
                        </defs>
                      </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* Table */}
              <div className="bg-slate-900/40 backdrop-blur-xl p-8 xl:p-10 rounded-3xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-500/20 rounded-xl ring-1 ring-emerald-500/30">
                       <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Individual Matrix</h2>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-white/10 bg-white/[0.02]">
                        <tr>
                          <th className="px-5 py-4 rounded-tl-xl">Engineer Name</th>
                          <th className="px-5 py-4 text-center">Reqs</th>
                          <th className="px-5 py-4 text-center">Design</th>
                          <th className="px-5 py-4 text-center">Build</th>
                          <th className="px-5 py-4 text-center">Test</th>
                          <th className="px-5 py-4 text-center">Deploy</th>
                          <th className="px-5 py-4 text-center text-indigo-400 rounded-tr-xl">Total (150)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {data?.individuals?.map((ind, i) => {
                          const total = ind.phase_1_score + ind.phase_2_score + ind.phase_3_score + ind.phase_4_score + ind.phase_5_score;
                          return (
                            <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                              <td className="px-5 py-4 font-semibold text-white">{ind.name}</td>
                              <td className="px-5 py-4 text-center text-slate-300 font-medium">{ind.phase_1_score}</td>
                              <td className="px-5 py-4 text-center text-slate-300 font-medium">{ind.phase_2_score}</td>
                              <td className="px-5 py-4 text-center text-slate-300 font-medium">{ind.phase_3_score}</td>
                              <td className="px-5 py-4 text-center text-slate-300 font-medium">{ind.phase_4_score}</td>
                              <td className="px-5 py-4 text-center text-slate-300 font-medium">{ind.phase_5_score}</td>
                              <td className="px-5 py-4 text-center">
                                <span className="inline-flex items-center justify-center bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-full ring-1 ring-indigo-500/30">
                                  {total}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {data?.individuals?.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-5 py-12 text-center text-slate-500 italic bg-white/[0.01]">
                              No engineering assessments submitted.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}
