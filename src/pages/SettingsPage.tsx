import { useState, useEffect } from "react"
import { useUser } from "@clerk/react"
import { useNavigate } from "react-router-dom"

const experienceLevels = ["Fresher", "Junior", "Mid", "Senior", "Expert"]
const interviewTypes = ["Technical", "HR", "Behavioral"]

export default function SettingsPage() {
    const { user } = useUser()
    const navigate = useNavigate()

    const [defaultLevel, setDefaultLevel] = useState("Mid")
    const [defaultType, setDefaultType] = useState("Technical")
    const [defaultCount, setDefaultCount] = useState(10)
    const [saved, setSaved] = useState(false)

    // localStorage theke load koro
    useEffect(() => {
        const prefs = localStorage.getItem("interviewPrefs")
        if (prefs) {
            const { level, type, count } = JSON.parse(prefs)
            if (level) setDefaultLevel(level)
            if (type) setDefaultType(type)
            if (count) setDefaultCount(count)
        }
    }, [])

    const handleSave = () => {
        localStorage.setItem("interviewPrefs", JSON.stringify({
            level: defaultLevel,
            type: defaultType,
            count: defaultCount,
        }))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const sidebarItems = [
        { icon: "grid_view", label: "Dashboard", active: false, onClick: () => navigate("/dashboard") },
        { icon: "play_circle", label: "Start Session", active: false, onClick: () => navigate("/interview/new") },
        { icon: "video_library", label: "My Interviews", active: false, onClick: () => navigate("/history") },
        { icon: "auto_graph", label: "AI Insights", active: false, onClick: () => navigate("/insights") },
        { icon: "settings", label: "Settings", active: true, onClick: () => { } },
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
                    <span className="text-blue-400 font-semibold text-sm px-3 py-1">Settings</span>
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
                    <h2 className="text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: "Space Grotesk" }}>Settings</h2>
                    <p className="text-slate-400">Manage your profile and interview preferences</p>
                </section>

                <div className="flex flex-col gap-6 max-w-2xl">

                    {/* Profile Card */}
                    <div className="bg-[#1d2027] border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "Space Grotesk" }}>Profile</h3>
                        <div className="flex items-center gap-4 mb-4">
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full border-2 border-blue-400 object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-blue-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-400 text-3xl">person</span>
                                </div>
                            )}
                            <div>
                                <p className="text-white font-semibold text-lg">{user?.fullName || "User"}</p>
                                <p className="text-slate-400 text-sm">{user?.primaryEmailAddress?.emailAddress || ""}</p>
                                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">Free Tier</span>
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs">Profile managed by Clerk. To update photo or name, visit your Clerk account.</p>
                    </div>

                    {/* Preferences Card */}
                    <div className="bg-[#1d2027] border border-slate-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6" style={{ fontFamily: "Space Grotesk" }}>Interview Preferences</h3>
                        <p className="text-slate-400 text-sm mb-6">These will be auto-filled when you start a new interview.</p>

                        <div className="flex flex-col gap-5">

                            {/* Default Level */}
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">Default Experience Level</label>
                                <div className="relative">
                                    <select
                                        value={defaultLevel}
                                        onChange={(e) => setDefaultLevel(e.target.value)}
                                        className="w-full bg-[#10131a] border border-slate-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white appearance-none outline-none"
                                    >
                                        {experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                                </div>
                            </div>

                            {/* Default Type */}
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">Default Interview Type</label>
                                <div className="flex gap-3">
                                    {interviewTypes.map((t) => (
                                        <button key={t} onClick={() => setDefaultType(t)}
                                            className={`flex-1 py-3 rounded-full font-semibold text-sm transition-all border ${defaultType === t ? "bg-blue-600 text-white border-blue-600" : "bg-[#10131a] text-slate-400 border-slate-700 hover:border-blue-500"}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Default Question Count */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">Default Question Count</label>
                                    <span className="text-blue-400 font-bold text-sm">{defaultCount}</span>
                                </div>
                                <input type="range" min={5} max={15} value={defaultCount}
                                    onChange={(e) => setDefaultCount(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                                    <span>5</span><span>15</span>
                                </div>
                            </div>

                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className={`mt-6 px-8 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${saved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-500"}`}
                        >
                            <span className="material-symbols-outlined text-sm">{saved ? "check" : "save"}</span>
                            {saved ? "Saved!" : "Save Preferences"}
                        </button>
                    </div>

                </div>
            </main>

        </div>
    )
}