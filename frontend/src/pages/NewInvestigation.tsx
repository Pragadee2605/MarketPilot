import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUrl } from '../config'

export default function NewInvestigation() {
  const navigate = useNavigate()
  const [businessIdea, setBusinessIdea] = useState('')
  const [location, setLocation] = useState('')
  const [targetCustomer, setTargetCustomer] = useState('')
  const [budget, setBudget] = useState('')
  const [additional, setAdditional] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [createdId, setCreatedId] = useState<number | null>(null)

  const templates = [
    {
      title: 'SaaS Billing Software',
      idea: 'Software product and service company building digital billing and inventory management tools',
      location: 'Chennai',
      customer: 'Small retail shops, local merchants, and end customers',
      budget: '20000',
      additional: 'Check competitor ratings, POS pricing tiers, and customer complaints'
    },
    {
      title: 'Bicycle Courier Service',
      idea: 'Eco-friendly bicycle courier and same-day parcel delivery for sustainable local boutiques',
      location: 'Chennai',
      customer: 'Independent fashion stores, zero-waste brands, and local cafes',
      budget: '35000',
      additional: 'Check competitor shipping rates, courier regulations, and delivery complaints'
    },
    {
      title: 'NEET/JEE Coaching Institute',
      idea: 'Hybrid offline and online coaching institute for NEET and JEE competitive exams',
      location: 'Chennai',
      customer: 'Class 11 & 12 students and ambitious parents',
      budget: '2000000',
      additional: 'Assess coaching center competitors, batch pricing structures, and faculty costs'
    }
  ]

  const applyTemplate = (t: typeof templates[0]) => {
    setBusinessIdea(t.idea)
    setLocation(t.location)
    setTargetCustomer(t.customer)
    setBudget(t.budget)
    setAdditional(t.additional)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus('Initializing investigation in PostgreSQL...')

    try {
      const payload = { businessIdea, location, targetCustomer, budget, additionalRequirements: additional }
      const res = await fetch(apiUrl('/api/investigations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        setStatus('Failed to create investigation')
        setLoading(false)
        return
      }
      const created = await res.json()
      setCreatedId(created.id)

      setStatus('Dispatching research tasks to SerpApi & AI Engine...')
      const startRes = await fetch(apiUrl(`/api/investigations/${created.id}/start`), { method: 'POST' })
      if (startRes.ok) {
        setStatus('Research initiated successfully! Redirecting...')
        setTimeout(() => {
          navigate(`/investigations/${created.id}`)
        }, 1200)
      } else {
        setStatus('Investigation created, but AI engine response timed out or unavailable.')
        setLoading(false)
      }
    } catch {
      setStatus('Network or backend connection error.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-[#12141c] border border-[#222634] p-8 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">New Market Investigation</h1>
        <p className="text-slate-400 text-sm">
          Define your business idea, location, and parameters. MarketPilot will plan research tasks, query SerpApi, normalize evidence, and run OpenRouter intelligence analysis.
        </p>

        {/* Templates */}
        <div className="mt-6 pt-6 border-t border-[#222634]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Quick Presets</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {templates.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(t)}
                className="p-3 rounded-xl bg-[#181b26] hover:bg-indigo-600/10 border border-[#222634] hover:border-indigo-500/30 text-left transition-all group"
              >
                <div className="font-semibold text-sm text-white group-hover:text-indigo-400">{t.title}</div>
                <div className="text-xs text-slate-400 mt-1 truncate">{t.location} • ₹{Number(t.budget).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-[#12141c] border border-[#222634] p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Business Idea / Concept *</label>
              <textarea
                required
                rows={3}
                value={businessIdea}
                onChange={e => setBusinessIdea(e.target.value)}
                placeholder="e.g. Healthy food delivery service focusing on custom calorie-tracked meal plans"
                className="w-full rounded-xl bg-[#181b26] border border-[#222634] p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Location *</label>
              <input
                required
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Chennai, Mumbai, Bangalore"
                className="w-full rounded-xl bg-[#181b26] border border-[#222634] p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Customers</label>
              <input
                type="text"
                value={targetCustomer}
                onChange={e => setTargetCustomer(e.target.value)}
                placeholder="e.g. Working professionals, fitness enthusiasts"
                className="w-full rounded-xl bg-[#181b26] border border-[#222634] p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Budget (₹)</label>
              <input
                type="text"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full rounded-xl bg-[#181b26] border border-[#222634] p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Additional Research Requirements</label>
              <input
                type="text"
                value={additional}
                onChange={e => setAdditional(e.target.value)}
                placeholder="e.g. Check competitor ratings and customer complaints"
                className="w-full rounded-xl bg-[#181b26] border border-[#222634] p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#222634] flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl border border-[#222634] text-slate-400 hover:text-white hover:bg-[#181b26] transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:from-indigo-500 hover:to-violet-500 transition-all transform active:scale-95 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && (
                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{loading ? 'Processing Research...' : 'Start Investigation'}</span>
            </button>
          </div>
        </form>

        {status && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center space-x-3 text-indigo-300 text-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></div>
            <span>{status}</span>
            {createdId && (
              <button
                onClick={() => navigate(`/investigations/${createdId}`)}
                className="ml-auto underline font-semibold hover:text-white"
              >
                View Live Report →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
