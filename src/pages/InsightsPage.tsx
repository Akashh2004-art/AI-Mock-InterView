import { useState, useEffect } from "react"
import { useUser } from "@clerk/react"
import { useNavigate } from "react-router-dom"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Skeleton } from "@/components/ui/skeleton"

interface Insights {
  overallAnalysis: string
  strongAreas: string[]
  weakAreas: string[]
  tips: string[]
  noData?: boolean
}

export default function InsightsPage() {
  const { user } = useUser()
  const navigate = useNavigate()

  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user?.id) return
    fetchInsights()
  }, [user?.id])

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interviews/user/${user!.id}/insights`)
      const data = await res.json()
      setInsights(data)
    } catch {
      setError("Failed to load insights.")
    } finally {
      setLoading(false)
    }
  }

  const sidebarItems = [
    { icon: "grid_view", label: "Dashboard", active: false, onClick: () => navigate("/dashboard") },
    { icon: "play_circle", label: "Start Session", active: false, onClick: () => navigate("/interview/new") },
    { icon: "video_library", label: "My Interviews", active: false, onClick: () => navigate("/history") },
    { icon: "auto_graph", label: "AI Insights", active: true, onClick: () => {} },
    { icon: "settings", label: "Settings", active: false, onClick: () => navigate("/settings") },
  ]

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">

      {/* Header */}
      <header className="bg-[#0a0d14]/80 backdrop-blur-md border-b border-slate-800/50 flex justify-between items-center w-full px-4 md:px-6 h-16 z-40 fixed top-0 left-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-400 text-base">psychology</span>
          </div>
          <h1 onClick={() => navigate("/")} className="text-lg font-bold text-blue-400 tracking-tight cursor-pointer hover:text-blue-300 transition-colors" style={{ fontFamily: "Space Grotesk" }}>
            InterviewAI
          </h1>
        </div>
        <div className="hidden md:flex gap-2">
          <span onClick={() => navigate("/dashboard")} className="text-slate-400 hover:bg-slate-800 transition-colors text-sm px-3 py-1 rounded-lg cursor-pointer">Dashboard</span>
          <span className="text-blue-400 font-semibold text-sm px-3 py-1">AI Insights</span>
        </div>
        <div className="flex items-center gap-3">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="w-9 h-9 rounded-full border-2 border-blue-400/50 object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full border-2 border-blue-400/50 bg-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-lg">person</span>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen bg-[#0d1018] border-r border-slate-800/50 w-64 fixed left-0 top-0 pt-20 pb-6">
        <div className="px-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400">person</span>
              </div>
            )}
            <div>
              <p className="font-semibold text-white text-sm" style={{ fontFamily: "Space Grotesk" }}>{user?.firstName || "User"}</p>
              <p className="text-xs text-slate-500">Free Tier</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {sidebarItems.map((item, i) => (
            <button key={i} onClick={item.onClick}
              className={`rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left group ${
                item.active
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}>
              <span className={`material-symbols-outlined text-xl ${item.active ? "text-blue-400" : "group-hover:text-slate-200"}`}>{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
              {item.active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-3">
          <button
            onClick={() => navigate("/interview/new")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            New Interview
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-64 pt-16 min-h-screen pb-24 md:pb-8">

        <div className="px-4 md:px-8 py-8 border-b border-slate-800/50">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1" style={{ fontFamily: "Space Grotesk" }}>AI Insights</h2>
          <p className="text-slate-400 text-sm">Personalized analysis of your interview performance</p>
        </div>

        <div className="px-4 md:px-8 py-6">

          {loading ? (
            <div className="space-y-4 max-w-4xl">
              <Skeleton className="h-32 rounded-xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
              </div>
              <Skeleton className="h-48 rounded-xl" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <span className="material-symbols-outlined text-red-400 text-5xl">error</span>
              <p className="text-red-400">{error}</p>
            </div>
          ) : insights?.noData ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/60 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500 text-5xl">analytics</span>
              </div>
              <p className="text-slate-300 font-semibold text-lg">No data yet</p>
              <p className="text-slate-500 text-sm text-center max-w-xs">Complete a few interviews to unlock your personalized AI insights.</p>
              <button
                onClick={() => navigate("/interview/new")}
                className="mt-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-all active:scale-95"
              >
                Start Your First Interview
              </button>
            </div>
          ) : insights ? (
            <div className="flex flex-col gap-5 max-w-4xl">

              {/* Overall Analysis */}
              <div className="relative rounded-xl border border-blue-500/20 bg-blue-500/8 p-6 overflow-hidden">
                <GlowingEffect />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-400 text-lg">auto_awesome</span>
                  </div>
                  <span className="font-semibold text-blue-400 text-xs uppercase tracking-widest">Overall Analysis</span>
                </div>
                <p className="text-white leading-relaxed text-sm md:text-base">{insights.overallAnalysis}</p>
              </div>

              {/* Strong + Weak */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Strong Areas */}
                <div className="relative rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-5 overflow-hidden">
                  <GlowingEffect />
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-400 text-lg">thumb_up</span>
                    </div>
                    <span className="font-semibold text-emerald-400 text-xs uppercase tracking-widest">Strong Areas</span>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {insights.strongAreas.map((area, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-emerald-400 text-xs">check</span>
                        </span>
                        <span className="text-slate-200 text-sm leading-relaxed">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weak Areas */}
                <div className="relative rounded-xl border border-red-500/20 bg-red-500/8 p-5 overflow-hidden">
                  <GlowingEffect />
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-400 text-lg">trending_down</span>
                    </div>
                    <span className="font-semibold text-red-400 text-xs uppercase tracking-widest">Areas to Improve</span>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {insights.weakAreas.map((area, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-red-400 text-xs">close</span>
                        </span>
                        <span className="text-slate-200 text-sm leading-relaxed">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tips */}
              <div className="relative rounded-xl border border-orange-500/20 bg-[#0d1018] p-5 overflow-hidden">
                <GlowingEffect />
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-orange-400 text-lg">lightbulb</span>
                  </div>
                  <span className="font-semibold text-orange-400 text-xs uppercase tracking-widest">Coach Tips</span>
                </div>
                <ul className="flex flex-col gap-4">
                  {insights.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-200 text-sm leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchInsights}
                className="self-start flex items-center gap-2 px-5 py-2.5 border border-slate-700 text-slate-400 hover:text-white hover:border-blue-500/50 rounded-xl transition-all text-sm font-semibold active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh Insights
              </button>

            </div>
          ) : null}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-[#0d1018]/95 backdrop-blur-md border-t border-slate-800/50">
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { icon: "dashboard", label: "Home", active: false, onClick: () => navigate("/dashboard") },
            { icon: "add_circle", label: "Practice", active: false, onClick: () => navigate("/interview/new") },
            { icon: "history", label: "History", active: false, onClick: () => navigate("/history") },
            { icon: "auto_graph", label: "Insights", active: true, onClick: () => {} },
            { icon: "settings", label: "Settings", active: false, onClick: () => navigate("/settings") },
          ].map((item, i) => (
            <button key={i} onClick={item.onClick}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
                item.active ? "text-blue-400" : "text-slate-500 active:text-slate-300"
              }`}>
              <span className={`material-symbols-outlined text-2xl ${item.active ? "text-blue-400" : ""}`}>{item.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  )
}