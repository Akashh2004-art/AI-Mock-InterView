import { useState, useEffect } from "react"
import { useUser } from "@clerk/react"
import { useNavigate } from "react-router-dom"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Skeleton } from "@/components/ui/skeleton"

interface RecentInterview {
  id: number
  role: string
  level: string
  type: string
  createdAt: string
  score: number | null
}

interface Stats {
  totalInterviews: number
  avgScore: number
  bestScore: number
}

export default function DashboardPage() {
  const { user } = useUser()
  const navigate = useNavigate()

  const [stats, setStats] = useState<Stats>({ totalInterviews: 0, avgScore: 0, bestScore: 0 })
  const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetchDashboardData()
  }, [user?.id])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/interviews/user/${user!.id}/stats`),
        fetch(`${import.meta.env.VITE_API_URL}/api/interviews/user/${user!.id}/recent`),
      ])
      const statsData = await statsRes.json()
      const recentData = await recentRes.json()
      setStats(statsData)
      setRecentInterviews(recentData)
    } catch (err) {
      console.error("Dashboard fetch failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    })
  }

  const chartData = recentInterviews
    .filter(iv => iv.score !== null)
    .map((iv, i) => ({
      name: `#${i + 1}`,
      score: iv.score,
      role: iv.role,
    }))
    .reverse()

  const statCards = [
    {
      label: "Total Interviews",
      value: stats.totalInterviews,
      suffix: "",
      icon: "assessment",
      iconColor: "text-blue-400",
      glowColor: "bg-blue-500/10",
      trend: "All time",
      trendColor: "text-blue-400",
      trendIcon: "trending_up",
    },
    {
      label: "Avg Score",
      value: stats.avgScore,
      suffix: "%",
      icon: "analytics",
      iconColor: "text-orange-400",
      glowColor: "bg-orange-500/10",
      trend: "Across all interviews",
      trendColor: "text-slate-400",
      trendIcon: "",
    },
    {
      label: "Best Score",
      value: stats.bestScore,
      suffix: "%",
      icon: "workspace_premium",
      iconColor: "text-purple-400",
      glowColor: "bg-purple-500/10",
      trend: "Personal best",
      trendColor: "text-purple-400",
      trendIcon: "star",
    },
  ]

  const sidebarItems = [
    { icon: "grid_view", label: "Dashboard", active: true, onClick: () => { } },
    { icon: "play_circle", label: "Start Session", active: false, onClick: () => navigate("/interview/new") },
    { icon: "video_library", label: "My Interviews", active: false, onClick: () => navigate("/history") },
    { icon: "auto_graph", label: "AI Insights", active: false, onClick: () => navigate("/insights") },
    { icon: "settings", label: "Settings", active: false, onClick: () => navigate("/settings") },
  ]

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">

      {/* Header */}
      <header className="bg-[#0a0d14]/80 backdrop-blur-md border-b border-slate-800/50 flex justify-between items-center w-full px-4 md:px-6 h-16 z-40 fixed top-0 left-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-400 text-3xl">psychology</span>
          <h1
            onClick={() => navigate("/")}
            className="text-xl font-bold text-blue-400 tracking-tight cursor-pointer hover:text-blue-300 transition-colors"
            style={{ fontFamily: "Space Grotesk" }}
          >
            InterviewAI
          </h1>
        </div>
        <div className="hidden md:flex gap-2">
          <span className="text-blue-400 font-semibold text-sm px-3 py-1">Dashboard</span>
          <span
            onClick={() => navigate("/interview/new")}
            className="text-slate-400 hover:bg-slate-800 transition-colors text-sm px-3 py-1 rounded-lg cursor-pointer"
          >
            Practice
          </span>
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

      {/* Sidebar — desktop only */}
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
              <p className="font-semibold text-white text-sm" style={{ fontFamily: "Space Grotesk" }}>
                {user?.firstName || "User"}
              </p>
              <p className="text-xs text-slate-500">Free Tier</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
            <span className="material-symbols-outlined text-blue-400 text-sm">insights</span>
            <span className="text-blue-400 font-semibold text-xs">{stats.avgScore}% Readiness</span>
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
              <span className={`material-symbols-outlined text-xl ${item.active ? "text-blue-400" : "group-hover:text-slate-200"}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
              {item.active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
            </button>
          ))}
        </nav>

        {/* Start Session Button */}
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

      {/* Main Content */}
      <main className="md:ml-64 pt-16 min-h-screen pb-24 md:pb-8">

        {/* Welcome Banner */}
        <div className="px-4 md:px-8 py-8 border-b border-slate-800/50">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk" }}>
            Welcome back, <span className="text-blue-400">{user?.firstName || "User"}!</span>
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Your AI coach is ready for your next session.
          </p>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-8">

          {/* Stats Row */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Overview</h3>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((card, i) => (
                  <div key={i} className="relative rounded-xl border border-slate-800/80 bg-[#0d1018] p-5 overflow-hidden group">
                    <GlowingEffect />
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
                      <div className={`w-9 h-9 rounded-lg ${card.glowColor} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-lg ${card.iconColor}`}>{card.icon}</span>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk" }}>
                      {card.value}{card.suffix}
                    </p>
                    <p className={`text-xs flex items-center gap-1 ${card.trendColor}`}>
                      {card.trendIcon && <span className="material-symbols-outlined text-sm">{card.trendIcon}</span>}
                      {card.trend}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Score Chart */}
          {!loading && chartData.length > 1 && (
            <section className="relative rounded-xl border border-slate-800/80 bg-[#0d1018] p-5 overflow-hidden">
              <GlowingEffect />
              <h3 className="text-sm font-semibold text-white mb-6" style={{ fontFamily: "Space Grotesk" }}>
                Score Trend
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: "#1d2027", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#60a5fa" }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#60a5fa" strokeWidth={2} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* Recent Interviews */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Recent Interviews</h3>
              <button
                onClick={() => navigate("/history")}
                className="text-blue-400 text-xs font-semibold hover:underline flex items-center gap-1"
              >
                View All
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : recentInterviews.length === 0 ? (
              <div className="rounded-xl border border-slate-800/80 bg-[#0d1018] p-10 text-center">
                <span className="material-symbols-outlined text-slate-600 text-5xl mb-3 block">mic_off</span>
                <p className="text-slate-400 text-sm">No interviews yet.</p>
                <button
                  onClick={() => navigate("/interview/new")}
                  className="mt-4 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-all active:scale-95"
                >
                  Start First Interview
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInterviews.map((interview, i) => (
                  <div key={i} className="relative rounded-xl border border-slate-800/80 bg-[#0d1018] px-4 py-4 flex items-center gap-4 group overflow-hidden">
                    <GlowingEffect />
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-blue-400 text-lg">work</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{interview.role}</p>
                      <p className="text-xs text-slate-500 capitalize">{interview.level} · {formatDate(interview.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {interview.score !== null ? (
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{interview.score}%</p>
                          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${interview.score}%`,
                                background: interview.score >= 70 ? "#4ade80" : interview.score >= 50 ? "#fb923c" : "#f87171"
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">No score</span>
                      )}
                      <button
                        onClick={() => navigate(`/interview/${interview.id}/feedback`)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-500/20 flex items-center justify-center transition-all"
                      >
                        <span className="material-symbols-outlined text-slate-400 hover:text-blue-400 text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-[#0d1018]/95 backdrop-blur-md border-t border-slate-800/50">
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { icon: "dashboard", label: "Home", active: true, onClick: () => { } },
            { icon: "add_circle", label: "Practice", active: false, onClick: () => navigate("/interview/new") },
            { icon: "history", label: "History", active: false, onClick: () => navigate("/history") },
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