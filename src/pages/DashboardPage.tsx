import { useState, useEffect } from "react"
import { useUser } from "@clerk/react"
import { useNavigate } from "react-router-dom"

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

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">

      {/* Header */}
      <header className="bg-[#10131a] border-b border-slate-800 flex justify-between items-center w-full px-6 h-16 z-40 fixed top-0 left-0">
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
            <img src={user.imageUrl} alt="Profile" className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-blue-400 bg-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400">person</span>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col h-screen py-6 gap-2 bg-[#191b23] border-r border-slate-800 w-72 fixed left-0 top-0 pt-20">
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400">person</span>
              </div>
            )}
            <div>
              <p className="font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>
                {user?.firstName || "User"}
              </p>
              <p className="text-sm text-slate-400">Free Tier</p>
            </div>
          </div>
          <span className="text-blue-400 font-semibold text-xs bg-blue-500/10 px-2 py-0.5 rounded-full">
            {stats.avgScore}% Readiness
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {[
            { icon: "grid_view", label: "Dashboard", active: true, onClick: () => { } },
            { icon: "play_circle", label: "Start Session", active: false, onClick: () => navigate("/interview/new") },
            { icon: "video_library", label: "My Interviews", active: false, onClick: () => navigate("/history") },
            { icon: "auto_graph", label: "AI Insights", active: false, onClick: () => navigate("/insights") },
            { icon: "settings", label: "Settings", active: false, onClick: () => navigate("/settings") },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className={`mx-3 rounded-lg px-6 py-3 flex items-center gap-6 transition-all hover:translate-x-1 duration-200 text-left ${item.active ? "bg-slate-700 text-blue-400" : "text-slate-400 hover:bg-slate-800"
                }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 pt-20 px-6 pb-20 min-h-screen">

        {/* Welcome */}
        <section className="mb-12">
          <h2 className="text-5xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk" }}>
            Welcome back, <span className="text-blue-400">{user?.firstName || "User"}!</span>
          </h2>
          <p className="text-lg text-slate-400 mt-2">
            Your AI coach is ready for your next session.
          </p>
        </section>

        {/* Stats Row */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl border border-blue-500/10 bg-slate-800/50 animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Interviews */}
            <div className="p-6 rounded-xl border border-blue-500/10" style={{ background: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-400">Total Interviews</span>
                <span className="material-symbols-outlined text-blue-400">assessment</span>
              </div>
              <p className="text-4xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>{stats.totalInterviews}</p>
              <p className="text-blue-400 text-xs flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">trending_up</span> All time
              </p>
            </div>

            {/* Avg Score */}
            <div className="p-6 rounded-xl border border-blue-500/10" style={{ background: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-400">Avg Score</span>
                <span className="material-symbols-outlined text-orange-400">analytics</span>
              </div>
              <p className="text-4xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>{stats.avgScore}%</p>
              <p className="text-slate-400 text-xs mt-1">Across all interviews</p>
            </div>

            {/* Best Score */}
            <div className="p-6 rounded-xl border-l-4 border-l-blue-500 border border-blue-500/10" style={{ background: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(12px)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-400">Best Score</span>
                <span className="material-symbols-outlined text-blue-400">workspace_premium</span>
              </div>
              <p className="text-4xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>{stats.bestScore}%</p>
              <p className="text-blue-400 text-xs mt-1">Personal best</p>
            </div>
          </section>
        )}

        {/* Recent Interviews */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Recent Interviews</h3>
            <button
              onClick={() => navigate("/history")}
              className="text-blue-400 font-semibold text-sm hover:underline"
            >
              View All
            </button>
          </div>
          <div className="bg-[#1d2027] rounded-xl overflow-hidden border border-slate-800">
            <table className="w-full text-left">
              <thead className="bg-[#272a31] border-b border-slate-800">
                <tr>
                  {["Date", "Role", "Level", "Score", "Action"].map((h) => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      <span className="material-symbols-outlined animate-spin text-blue-400">progress_activity</span>
                    </td>
                  </tr>
                ) : recentInterviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                      No interviews yet. Start your first session!
                    </td>
                  </tr>
                ) : (
                  recentInterviews.map((interview, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-slate-300 text-sm">{formatDate(interview.createdAt)}</td>
                      <td className="px-6 py-4 font-medium text-white text-sm">{interview.role}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm capitalize">{interview.level}</td>
                      <td className="px-6 py-4">
                        {interview.score !== null ? (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className="bg-blue-400 h-full rounded-full" style={{ width: `${interview.score}%` }}></div>
                            </div>
                            <span className="text-white font-bold text-sm">{interview.score}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">No feedback yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/interview/${interview.id}/feedback`)}
                          className="text-blue-400 hover:text-blue-300 material-symbols-outlined"
                        >
                          visibility
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Start New Interview */}
        <div className="hidden md:flex justify-center mt-20">
          <button
            onClick={() => navigate("/interview/new")}
            className="bg-blue-600 text-white text-2xl font-semibold px-20 py-6 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-6 group"
            style={{ fontFamily: "Space Grotesk" }}
          >
            <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">mic_external_on</span>
            Start New Interview
          </button>
        </div>

      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 md:hidden bg-[#1d2027] border-t border-slate-800 rounded-t-xl shadow-lg">
        {[
          { icon: "dashboard", label: "Home", active: true },
          { icon: "mic_external_on", label: "Practice", active: false },
          { icon: "history", label: "History", active: false },
          { icon: "insights", label: "Stats", active: false },
        ].map((item, i) => (
          <div key={i} className={`flex flex-col items-center px-4 py-1 ${item.active ? "text-blue-400" : "text-slate-400"}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-xs mt-0.5">{item.label}</span>
          </div>
        ))}
      </nav>

    </div>
  )
}