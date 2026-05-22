import { useState, useEffect } from "react"
import { useUser } from "@clerk/react"
import { useNavigate } from "react-router-dom"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Interview {
  id: number
  role: string
  level: string
  type: string
  createdAt: string
  score: number | null
}

const levelColors: Record<string, "success" | "info" | "warning" | "danger" | "default"> = {
  fresher: "success",
  junior: "info",
  mid: "default",
  senior: "warning",
  expert: "danger",
}

const typeColors: Record<string, string> = {
  technical: "text-blue-400 bg-blue-500/10",
  hr: "text-purple-400 bg-purple-500/10",
  behavioral: "text-emerald-400 bg-emerald-500/10",
}

export default function HistoryPage() {
  const { user } = useUser()
  const navigate = useNavigate()

  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (!user?.id) return
    fetchHistory()
  }, [user?.id])

  const fetchHistory = async () => {
    try {
      const [interviewsRes, recentRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/interviews/user/${user!.id}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/interviews/user/${user!.id}/recent`),
      ])
      const allInterviews: Interview[] = await interviewsRes.json()
      const recentWithScores: Interview[] = await recentRes.json()

      const merged = allInterviews.map((iv) => {
        const withScore = recentWithScores.find((r) => r.id === iv.id)
        return withScore || { ...iv, score: null }
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setInterviews(merged)
    } catch (err) {
      console.error("History fetch failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    })
  }

  const filtered = filter === "all"
    ? interviews
    : interviews.filter((iv) => iv.level.toLowerCase() === filter)

  const sidebarItems = [
    { icon: "grid_view", label: "Dashboard", active: false, onClick: () => navigate("/dashboard") },
    { icon: "play_circle", label: "Start Session", active: false, onClick: () => navigate("/interview/new") },
    { icon: "video_library", label: "My Interviews", active: true, onClick: () => {} },
    { icon: "auto_graph", label: "AI Insights", active: false, onClick: () => navigate("/insights") },
    { icon: "settings", label: "Settings", active: false, onClick: () => navigate("/settings") },
  ]

  const filters = [
    { key: "all", label: "All" },
    { key: "fresher", label: "Fresher" },
    { key: "junior", label: "Junior" },
    { key: "mid", label: "Mid" },
    { key: "senior", label: "Senior" },
    { key: "expert", label: "Expert" },
  ]

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">

      {/* Header */}
      <header className="bg-[#0a0d14]/80 backdrop-blur-md border-b border-slate-800/50 flex justify-between items-center w-full px-4 md:px-6 h-16 z-40 fixed top-0 left-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-400 text-base">psychology</span>
          </div>
          <h1
            onClick={() => navigate("/")}
            className="text-lg font-bold text-blue-400 tracking-tight cursor-pointer hover:text-blue-300 transition-colors"
            style={{ fontFamily: "Space Grotesk" }}
          >
            InterviewAI
          </h1>
        </div>
        <div className="hidden md:flex gap-2">
          <span onClick={() => navigate("/dashboard")} className="text-slate-400 hover:bg-slate-800 transition-colors text-sm px-3 py-1 rounded-lg cursor-pointer">Dashboard</span>
          <span onClick={() => navigate("/interview/new")} className="text-slate-400 hover:bg-slate-800 transition-colors text-sm px-3 py-1 rounded-lg cursor-pointer">Practice</span>
          <span className="text-blue-400 font-semibold text-sm px-3 py-1">History</span>
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
            <button
              key={i}
              onClick={item.onClick}
              className={`rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left group ${
                item.active
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
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

        {/* Page Header */}
        <div className="px-4 md:px-8 py-8 border-b border-slate-800/50">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1" style={{ fontFamily: "Space Grotesk" }}>
            My Interviews
          </h2>
          <p className="text-slate-400 text-sm">Your complete interview history</p>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-5">

          {/* Stats summary */}
          {!loading && interviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total", value: interviews.length, icon: "list_alt", color: "text-blue-400", bg: "bg-blue-500/10" },
              ].map((stat, i) => (
                <div key={i} className="relative rounded-xl border border-slate-800/80 bg-[#0d1018] px-4 py-3 flex items-center gap-3 overflow-hidden">
                  <GlowingEffect />
                  <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-lg ${stat.color}`}>{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="text-lg font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                  filter === f.key
                    ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-700 border border-slate-700/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-800/80 bg-[#0d1018] p-12 text-center">
              <span className="material-symbols-outlined text-slate-600 text-5xl mb-3 block">search_off</span>
              <p className="text-slate-400 text-sm">No interviews found.</p>
              <button
                onClick={() => navigate("/interview/new")}
                className="mt-4 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-all active:scale-95"
              >
                Start Interview
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((interview, i) => (
                <div key={interview.id} className="relative rounded-xl border border-slate-800/80 bg-[#0d1018] px-4 py-4 flex items-center gap-3 md:gap-4 overflow-hidden group">
                  <GlowingEffect />

                  {/* Number */}
                  <span className="text-slate-600 text-sm font-mono w-6 shrink-0 hidden md:block">#{i + 1}</span>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-blue-400 text-lg">work</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{interview.role}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={levelColors[interview.level.toLowerCase()] || "default"} className="text-[10px] px-2 py-0.5">
                        {interview.level}
                      </Badge>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${typeColors[interview.type.toLowerCase()] || "text-slate-400 bg-slate-800"}`}>
                        {interview.type}
                      </span>
                      <span className="text-slate-500 text-xs hidden md:block">{formatDate(interview.createdAt)}</span>
                    </div>
                    <span className="text-slate-500 text-xs md:hidden">{formatDate(interview.createdAt)}</span>
                  </div>

                  {/* Score */}
                  <div className="shrink-0 text-right">
                    {interview.score !== null ? (
                      <div>
                        <p className="text-sm font-bold text-white">{interview.score}%</p>
                        <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${interview.score}%`,
                              background: interview.score >= 70 ? "#4ade80" : interview.score >= 50 ? "#fb923c" : "#f87171"
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">No score</span>
                    )}
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => navigate(`/interview/${interview.id}/feedback`)}
                    className="w-9 h-9 rounded-lg bg-slate-800/60 hover:bg-blue-500/20 flex items-center justify-center transition-all shrink-0 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-slate-400 hover:text-blue-400 text-sm">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Count */}
          {!loading && interviews.length > 0 && (
            <p className="text-slate-600 text-xs">
              Showing {filtered.length} of {interviews.length} interviews
            </p>
          )}

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-[#0d1018]/95 backdrop-blur-md border-t border-slate-800/50">
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { icon: "dashboard", label: "Home", active: false, onClick: () => navigate("/dashboard") },
            { icon: "add_circle", label: "Practice", active: false, onClick: () => navigate("/interview/new") },
            { icon: "history", label: "History", active: true, onClick: () => {} },
            { icon: "auto_graph", label: "Insights", active: false, onClick: () => navigate("/insights") },
            { icon: "settings", label: "Settings", active: false, onClick: () => navigate("/settings") },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
                item.active ? "text-blue-400" : "text-slate-500 active:text-slate-300"
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${item.active ? "text-blue-400" : ""}`}>{item.icon}</span>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  )
}