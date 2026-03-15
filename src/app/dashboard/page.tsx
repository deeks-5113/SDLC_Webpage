'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lock, Loader2, RefreshCw, BarChart3, BrainCircuit, Users } from 'lucide-react';
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

  // Initial check for cached password
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-slate-800 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-slate-800">Admin Login</h1>
            <p className="text-slate-500">Enter password to access dashboard</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(password); }} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-800"
              placeholder="Admin Password"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-lg flex justify-center items-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
            </button>
          </form>
           <button onClick={() => router.push('/')} className="mt-4 text-sm text-center w-full text-slate-500 hover:text-slate-800">Return Home</button>
        </div>
      </div>
    );
  }

  const chartData = data ? [
    { name: 'P1: Reqs', Average: data.averages.phase1, fullMax: 30 },
    { name: 'P2: Design', Average: data.averages.phase2, fullMax: 30 },
    { name: 'P3: Build', Average: data.averages.phase3, fullMax: 30 },
    { name: 'P4: Test', Average: data.averages.phase4, fullMax: 30 },
    { name: 'P5: Deploy', Average: data.averages.phase5, fullMax: 30 },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Intelligent SDLC Auditor</h1>
            <p className="text-slate-500">Executive Dashboard & Analytics</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
             <button 
                onClick={() => handleLogin(password)} 
                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={() => { localStorage.removeItem('sdlc_admin_token'); setIsAuthenticated(false); }} className="text-slate-500 hover:text-red-600 px-4 py-2 font-medium">
              Logout
            </button>
          </div>
        </div>

        {/* Qualitative Insights */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-[1px] shadow-lg">
          <div className="bg-white rounded-2xl h-full p-6 sm:p-8">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <BrainCircuit className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">AI Synthesized Insights</h2>
             </div>
             {insightsLoading ? (
               <div className="flex items-center text-slate-500 py-4">
                 <Loader2 className="w-5 h-5 animate-spin mr-3" /> Synthesizing feedback from team...
               </div>
             ) : (
               <div className="prose max-w-none text-slate-700">
                  {insights ? (
                    <p className="leading-relaxed text-lg">{insights}</p>
                  ) : (
                    <p className="italic text-slate-500">No friction feedback available yet.</p>
                  )}
               </div>
             )}
          </div>
        </div>

        {/* Quantitative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-bold text-slate-800">Team Average per Phase (Max 30)</h2>
             </div>
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 30]} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="Average" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Table */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
             <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-bold text-slate-800">Individual Scores</h2>
             </div>
             <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3 text-center">P1</th>
                      <th className="p-3 text-center">P2</th>
                      <th className="p-3 text-center">P3</th>
                      <th className="p-3 text-center">P4</th>
                      <th className="p-3 text-center">P5</th>
                      <th className="p-3 text-center text-indigo-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.individuals?.map((ind, i: number) => {
                      const total = ind.phase_1_score + ind.phase_2_score + ind.phase_3_score + ind.phase_4_score + ind.phase_5_score;
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-medium text-slate-800">{ind.name}</td>
                          <td className="p-3 text-center">{ind.phase_1_score}</td>
                          <td className="p-3 text-center">{ind.phase_2_score}</td>
                          <td className="p-3 text-center">{ind.phase_3_score}</td>
                          <td className="p-3 text-center">{ind.phase_4_score}</td>
                          <td className="p-3 text-center">{ind.phase_5_score}</td>
                          <td className="p-3 text-center font-bold text-indigo-600">{total}</td>
                        </tr>
                      );
                    })}
                    {data?.individuals?.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 italic">No assessments submitted yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
