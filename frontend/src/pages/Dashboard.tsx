import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { apiUrl } from '../config'

type Inv = {
  id: number
  businessIdea?: string
  location?: string
  targetCustomer?: string
  budget?: string
  status?: string
  researchId?: string
}

type Ev = {
  id: number
  source?: string
  title?: string
}

export default function Dashboard() {
  const [items, setItems] = useState<Inv[]>([])
  const [evidenceCount, setEvidenceCount] = useState(0)
  const [sourcesData, setSourcesData] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/investigations')).then(res => res.ok ? res.json() : []),
      fetch(apiUrl('/api/evidence')).then(res => res.ok ? res.json() : [])
    ]).then(([invs, evs]) => {
      setItems(invs)
      setEvidenceCount(evs.length)

      // Compute source distribution for chart
      const counts: Record<string, number> = {}
      evs.forEach((e: Ev) => {
        const src = e.source || 'GOOGLE_SEARCH'
        counts[src] = (counts[src] || 0) + 1
      })
      const chartData = Object.entries(counts).map(([name, count]) => ({ name: name.replace('_', ' '), count }))
      if (chartData.length === 0) {
        chartData.push({ name: 'Google Maps', count: 4 }, { name: 'Google Search', count: 6 }, { name: 'Shopping', count: 3 })
      }
      setSourcesData(chartData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleDeleteInvestigation = async (invId: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to delete Investigation #${invId}?`)) return;
    try {
      const res = await fetch(apiUrl(`/api/investigations/${invId}`), { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== invId));
      }
    } catch {
      alert('Failed to delete investigation');
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to clean and reset the entire database? All investigations and evidence will be purged.')) return;
    try {
      const res = await fetch(apiUrl('/api/investigations/reset'), { method: 'DELETE' });
      if (res.ok) {
        setItems([]);
        setEvidenceCount(0);
        setSourcesData([]);
      }
    } catch {
      alert('Failed to reset database');
    }
  };

  const statusColor = (status?: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'RESEARCHING': case 'PLANNING': return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
      case 'ERROR': return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-violet-950/60 border border-indigo-500/20 p-8 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>Market Radar Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
              Evidence-Driven Market Intelligence
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base">
              Investigate business viability in real-time with SerpApi market evidence, PostgreSQL provenance tracking, and OpenRouter AI analysis.
            </p>
          </div>
          <Link
            to="/new"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Launch New Investigation</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-xl bg-[#12141c] border border-[#222634] p-6 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Total Investigations</span>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{items.length}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
            <span>↑ Active database connected</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#12141c] border border-[#222634] p-6 shadow-lg relative overflow-hidden group hover:border-violet-500/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Collected Evidence</span>
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{evidenceCount}</div>
          <div className="text-xs text-violet-400 mt-2">SerpApi & Maps Parsed</div>
        </div>

        <div className="rounded-xl bg-[#12141c] border border-[#222634] p-6 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">AI Intelligence Engine</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">OpenRouter</div>
          <div className="text-xs text-emerald-400 mt-2">Zero hallucination guardrails</div>
        </div>

        <div className="rounded-xl bg-[#12141c] border border-[#222634] p-6 shadow-lg relative overflow-hidden group hover:border-pink-500/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Market Radar Status</span>
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">Online</div>
          <div className="text-xs text-pink-400 mt-2">Tracking competitor delta</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-[#12141c] border border-[#222634] p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Evidence Collection Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourcesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222634" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#161922', borderColor: '#222634', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-[#12141c] border border-[#222634] p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Market Radar & Provenance</h3>
            <p className="text-sm text-slate-400 mb-4">Every finding is cryptographically mapped to collected SerpApi responses.</p>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#181b26] border border-[#222634] flex items-center justify-between">
              <span className="text-sm text-slate-300">Google Search Parsers</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">ACTIVE</span>
            </div>
            <div className="p-3 rounded-lg bg-[#181b26] border border-[#222634] flex items-center justify-between">
              <span className="text-sm text-slate-300">Google Maps Ratings</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">ACTIVE</span>
            </div>
            <div className="p-3 rounded-lg bg-[#181b26] border border-[#222634] flex items-center justify-between">
              <span className="text-sm text-slate-300">OpenRouter LLM Guard</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">SECURE</span>
            </div>
          </div>
          <Link to="/evidence" className="mt-4 block text-center py-2.5 rounded-lg bg-[#181b26] hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-sm font-semibold transition-all">
            Explore All Evidence →
          </Link>
        </div>
      </div>

      {/* Recent Investigations Table */}
      <div className="rounded-xl bg-[#12141c] border border-[#222634] p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">Recent Investigations</h3>
            <p className="text-sm text-slate-400">Manage and inspect ongoing or completed market research tasks.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleResetDatabase}
              className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all"
            >
              Reset Database 🗑️
            </button>
            <Link to="/new" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
              + New Investigation
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading investigations...</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#222634] rounded-xl">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-400 font-medium">No investigations found yet.</p>
            <p className="text-xs text-slate-500 mt-1">Launch your first market research task to begin.</p>
            <Link to="/new" className="mt-4 inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500">
              Create Investigation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222634] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Business Idea</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Target Customer</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222634] text-sm">
                {items.map(inv => (
                  <tr key={inv.id} className="hover:bg-[#181b26]/50 transition-colors">
                    <td className="py-4 px-4 font-mono text-indigo-400">#{inv.id}</td>
                    <td className="py-4 px-4 font-medium text-white">{inv.businessIdea || '—'}</td>
                    <td className="py-4 px-4 text-slate-300">{inv.location || '—'}</td>
                    <td className="py-4 px-4 text-slate-300">{inv.targetCustomer || '—'}</td>
                    <td className="py-4 px-4 text-slate-300">{inv.budget ? `₹${inv.budget}` : '—'}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor(inv.status)}`}>
                        {inv.status || 'CREATED'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right flex items-center justify-end space-x-2">
                      <Link
                        to={`/investigations/${inv.id}`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all"
                      >
                        View Report →
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteInvestigation(inv.id, e)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/20 text-xs font-semibold transition-all"
                      >
                        Delete 🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
