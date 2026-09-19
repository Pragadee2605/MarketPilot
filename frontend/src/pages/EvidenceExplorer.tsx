import { useEffect, useState } from 'react'
import { apiUrl } from '../config'

type Ev = {
  id: number
  investigationId?: number
  title?: string
  snippet?: string
  sourceUrl?: string
  source?: string
  rating?: number
  reviewCount?: number
}

export default function EvidenceExplorer() {
  const [items, setItems] = useState<Ev[]>([])
  const [search, setSearch] = useState('')
  const [selectedSource, setSelectedSource] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(apiUrl('/api/evidence')).then(async res => {
      if (res.ok) setItems(await res.json())
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const sources = ['ALL', 'GOOGLE_SEARCH', 'GOOGLE_MAPS', 'GOOGLE_SHOPPING', 'GOOGLE_NEWS', 'YOUTUBE']

  const filtered = items.filter(i => {
    const matchesSearch = (i.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (i.snippet?.toLowerCase() || '').includes(search.toLowerCase())
    const matchesSource = selectedSource === 'ALL' || i.source === selectedSource
    return matchesSearch && matchesSource
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-[#12141c] border border-[#222634] p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Evidence Explorer</h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Inspect all collected real market evidence with complete provenance. Every item is indexed with its original source URL and metadata.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-semibold">
            Total Records: {items.length}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 pt-6 border-t border-[#222634] flex flex-col md:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search evidence titles or snippets..."
            className="w-full md:w-96 rounded-xl bg-[#181b26] border border-[#222634] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <div className="flex flex-wrap items-center gap-2">
            {sources.map(src => (
              <button
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedSource === src
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-[#181b26] text-slate-400 hover:text-white border border-[#222634]'
                }`}
              >
                {src.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading evidence stream...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#12141c] border border-[#222634]">
          <p className="text-slate-400 font-medium">No matching evidence found.</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or source filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(i => (
            <div key={i.id} className="rounded-2xl bg-[#12141c] border border-[#222634] p-6 shadow-xl space-y-4 hover:border-indigo-500/40 transition-all group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    Evidence #{i.id}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/30 font-semibold">
                    {i.source || 'GOOGLE_SEARCH'}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-base group-hover:text-indigo-300 transition-colors">
                  {i.title || 'Untitled Evidence'}
                </h3>
                <p className="text-sm text-slate-300 line-clamp-4">{i.snippet || 'No snippet available.'}</p>
              </div>

              <div className="pt-4 border-t border-[#222634] flex items-center justify-between">
                {i.rating ? (
                  <div className="flex items-center space-x-1 text-xs text-amber-400 font-medium">
                    <span>★ {i.rating}</span>
                    {i.reviewCount && <span className="text-slate-400">({i.reviewCount})</span>}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Verified Provenance</span>
                )}
                {i.sourceUrl ? (
                  <a
                    href={i.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                  >
                    <span>Source ↗</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">Internal DB</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
