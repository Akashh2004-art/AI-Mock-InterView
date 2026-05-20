import { useState, useEffect } from "react"
import { useUser } from "@clerk/react"
import { useNavigate } from "react-router-dom"

interface Interview {
    id: number
    role: string
    level: string
    type: string
    createdAt: string
    score: number | null
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

            // recent route theke score nao, baki gulo score: null
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
        : interviews.filter((iv) => iv.level === filter)

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
                    <span
                        onClick={() => navigate("/dashboard")}
                        className="text-slate-400 hover:bg-slate-800 transition-colors text-sm px-3 py-1 rounded-lg cursor-pointer"
                    >
                        Dashboard
                    </span>
                    <span
                        onClick={() => navigate("/interview/new")}
                        className="text-slate-400 hover:bg-slate-800 transition-colors text-sm px-3 py-1 rounded-lg cursor-pointer"
                    >
                        Practice
                    </span>
                    <span className="text-blue-400 font-semibold text-sm px-3 py-1">History</span>
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
                </div>

                <nav className="flex flex-col gap-1">
                    {[
                        { icon: "grid_view", label: "Dashboard", active: false, onClick: () => navigate("/dashboard") },
                        { icon: "play_circle", label: "Start Session", active: false, onClick: () => navigate("/interview/new") },
                        { icon: "video_library", label: "My Interviews", active: true, onClick: () => { } },
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

            {/* Main */}
            <main className="md:ml-72 pt-20 px-6 pb-20 min-h-screen">

                <section className="mb-8">
                    <h2 className="text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "Space Grotesk" }}>
                        My Interviews
                    </h2>
                    <p className="text-slate-400">Your complete interview history</p>
                </section>

                {/* Filter */}
                <div className="flex gap-3 mb-6">
                    {["all", "junior", "mid", "senior", "expert"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${filter === f
                                ? "bg-blue-500 text-white"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                }`}
                        >
                            {f === "all" ? "All" : f}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-[#1d2027] rounded-xl overflow-hidden border border-slate-800">
                    <table className="w-full text-left">
                        <thead className="bg-[#272a31] border-b border-slate-800">
                            <tr>
                                {["#", "Date", "Role", "Level", "Type", "Score", "Action"].map((h) => (
                                    <th key={h} className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                        <span className="material-symbols-outlined animate-spin text-blue-400">progress_activity</span>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-sm">
                                        No interviews found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((interview, i) => (
                                    <tr key={interview.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 text-sm">#{i + 1}</td>
                                        <td className="px-6 py-4 text-slate-300 text-sm">{formatDate(interview.createdAt)}</td>
                                        <td className="px-6 py-4 font-medium text-white text-sm">{interview.role}</td>
                                        <td className="px-6 py-4 text-slate-300 text-sm capitalize">{interview.level}</td>
                                        <td className="px-6 py-4 text-slate-300 text-sm capitalize">{interview.type}</td>
                                        <td className="px-6 py-4">
                                            {interview.score !== null ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="bg-blue-400 h-full rounded-full" style={{ width: `${interview.score}%` }}></div>
                                                    </div>
                                                    <span className="text-white font-bold text-sm">{interview.score}%</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 text-xs">No feedback</span>
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

                {/* Total count */}
                {!loading && (
                    <p className="text-slate-500 text-sm mt-4">
                        Showing {filtered.length} of {interviews.length} interviews
                    </p>
                )}

            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 md:hidden bg-[#1d2027] border-t border-slate-800 rounded-t-xl shadow-lg">
                {[
                    { icon: "dashboard", label: "Home", onClick: () => navigate("/dashboard") },
                    { icon: "mic_external_on", label: "Practice", onClick: () => navigate("/interview/new") },
                    { icon: "history", label: "History", onClick: () => { } },
                    { icon: "insights", label: "Stats", onClick: () => { } },
                ].map((item, i) => (
                    <div
                        key={i}
                        onClick={item.onClick}
                        className={`flex flex-col items-center px-4 py-1 cursor-pointer ${i === 2 ? "text-blue-400" : "text-slate-400"}`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="text-xs mt-0.5">{item.label}</span>
                    </div>
                ))}
            </nav>

        </div>
    )
}