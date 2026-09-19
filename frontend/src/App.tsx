import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import NewInvestigation from './pages/NewInvestigation'
import InvestigationDetails from './pages/InvestigationDetails'
import EvidenceExplorer from './pages/EvidenceExplorer'
import './index.css'

function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090a0f]/80 border-b border-[#222634] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white animate-pulse-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">MarketPilot</div>
              <div className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">AI Market Intelligence & Radar</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-2 pl-6 border-l border-[#222634]">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SerpApi & OpenRouter Live</span>
            </div>
          </div>
        </div>

        <nav className="flex items-center space-x-2">
          <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/')}`}>
            Dashboard
          </Link>
          <Link to="/evidence" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/evidence')}`}>
            Evidence Explorer
          </Link>
          <Link to="/new" className="ml-2 flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:from-indigo-500 hover:to-violet-500 transition-all transform active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Investigation</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewInvestigation />} />
            <Route path="/investigations/:id" element={<InvestigationDetails />} />
            <Route path="/evidence" element={<EvidenceExplorer />} />
          </Routes>
        </main>
        <footer className="border-t border-[#222634] py-6 text-center text-xs text-slate-500">
          MarketPilot Intelligence Suite • Evidence-Grounded Market Research & Radar
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
