import { useState, useEffect } from "react"
import { useUser } from "@clerk/react"
import { useNavigate } from "react-router-dom"

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
        try {
            const res = await fetch(`http://localhost:3000/api/interviews/user/${user!.id}/insights`)
            const data = await res.json()
            setInsights(data)
        } catch (err) {
            setError("Failed to load insights.")
        } finally {
            setLoading(false)
        }
    }

    const sidebarItems = [
        { icon: "grid_view", label: "Dashboard", active: false, onClick: () => navigate("/dashboard") },
        { icon: "play_circle", label: "Start Session", active: false, onClick: () => navigate("/interview/new") },
        { icon: "video_library", label: "My Interviews", active: false, onClick: () => navigate("/history") },
        { icon: "auto_graph", label: "AI Insights", active: true, onClick: () => { } },
        { icon: "settings", label: "Settings", active: false, onClick: () => navigate("/settings") },
    ]

    return (
        <div className="min-h-screen bg-[#0F172A] text-white">

            {/* Header */}
            <header className="bg-[#10131a] border-b border-slate-800 flex justify-between items-center w-full px-6 h-16 z-40 fixed top-0 left-0">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-400 text-3xl">psychology</span>
                    <h1 onClick={() => navigate("/")} className="text-xl font-bold text-blue-400 tracking-tight cursor-pointer hover:text-blue-300 transition-colors" style={{ fontFamily: "Space Grotesk" }}>
                        InterviewAI
                    </h1>
                </div>
                <div className="hidden md:flex gap-2">
                    <span onClick={() => navigate("/dashboard")} className="text-slate-400 hover:bg-slate-800 transition-colors text-sm px-3 py-1 rounded-lg cursor-pointer">Dashboard</span>
                    <span className="text-blue-400 font-semibold text-sm px-3 py-1">AI Insights</span>
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
                            <p className="font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>{user?.firstName || "User"}</p>
                            <p className="text-sm text-slate-400">Free Tier</p>
                        </div>
                    </div>
                </div>
                <nav className="flex flex-col gap-1">
                    {sidebarItems.map((item, i) => (
                        <button key={i} onClick={item.onClick}
                            className={`mx-3 rounded-lg px-6 py-3 flex items-center gap-6 transition-all hover:translate-x-1 duration-200 text-left ${item.active ? "bg-slate-700 text-blue-400" : "text-slate-400 hover:bg-slate-800"}`}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="font-semibold text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main */}
            <main className="md:ml-72 pt-20 px-6 pb-20 min-h-screen">
                <section className="mb-8">
                    <h2 className="text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "Space Grotesk" }}>AI Insights</h2>
                    <p className="text-slate-400">Personalized analysis of your interview performance</p>
                </section>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <span className="material-symbols-outlined text-blue-400 text-5xl animate-spin">progress_activity</span>
                        <p className="text-blue-400 font-semibold">Analyzing your performance...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-center py-20">{error}</div>
                ) : insights?.noData ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <span className="material-symbols-outlined text-slate-500 text-6xl">analytics</span>
                        <p className="text-slate-400 text-lg">No interview data yet.</p>
                        <button onClick={() => navigate("/interview/new")} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 transition-all">
                            Start Your First Interview
                        </button>
                    </div>
                ) : insights ? (
                    <div className="flex flex-col gap-6 max-w-4xl">

                        {/* Overall Analysis */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-3 text-blue-400">
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <span className="font-semibold text-sm uppercase tracking-widest">Overall Analysis</span>
                            </div>
                            <p className="text-white leading-relaxed">{insights.overallAnalysis}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Strong Areas */}
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4 text-green-400">
                                    <span className="material-symbols-outlined">thumb_up</span>
                                    <span className="font-semibold text-sm uppercase tracking-widest">Strong Areas</span>
                                </div>
                                <ul className="flex flex-col gap-3">
                                    {insights.strongAreas.map((area, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-green-400 text-sm mt-0.5">check_circle</span>
                                            <span className="text-white text-sm">{area}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weak Areas */}
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4 text-red-400">
                                    <span className="material-symbols-outlined">trending_down</span>
                                    <span className="font-semibold text-sm uppercase tracking-widest">Areas to Improve</span>
                                </div>
                                <ul className="flex flex-col gap-3">
                                    {insights.weakAreas.map((area, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">error</span>
                                            <span className="text-white text-sm">{area}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-[#1d2027] border border-slate-800 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4 text-orange-400">
                                <span className="material-symbols-outlined">lightbulb</span>
                                <span className="font-semibold text-sm uppercase tracking-widest">Coach Tips</span>
                            </div>
                            <ul className="flex flex-col gap-4">
                                {insights.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded-full min-w-6 text-center">{i + 1}</span>
                                        <span className="text-white text-sm leading-relaxed">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Refresh button */}
                        <button
                            onClick={() => { setLoading(true); fetchInsights() }}
                            className="self-start flex items-center gap-2 px-6 py-3 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/10 transition-all text-sm font-semibold"
                        >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            Refresh Insights
                        </button>

                    </div>
                ) : null}
            </main>

        </div>
    )
}