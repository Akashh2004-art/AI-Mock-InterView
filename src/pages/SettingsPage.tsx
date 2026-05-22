import { useState, useEffect } from "react"
import { useUser } from "@clerk/react"
import { useNavigate } from "react-router-dom"
import { GlowingEffect } from "@/components/ui/glowing-effect"

const experienceLevels = ["Fresher", "Junior", "Mid", "Senior", "Expert"]
const interviewTypes = ["Technical", "HR", "Behavioral"]

export default function SettingsPage() {
  const { user } = useUser()
  const navigate = useNavigate()

  const [defaultLevel, setDefaultLevel] = useState("Mid")
  const [defaultType, setDefaultType] = useState("Technical")
  const [defaultCount, setDefaultCount] = useState(10)
  const [saved, setSaved] = useState(false)

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
          <span
            onClick={() => navigate("/dashboard")}
            className="text-slate-400 hover:bg-slate-800 transition-colors text-sm px-3 py-1 rounded-lg cursor-pointer"
          >
            Dashboard
          </span>
          <span className="text-blue-400 font-semibold text-sm px-3 py-1">Settings</span>
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

        {/* Welcome Banner */}
        <div className="px-4 md:px-8 py-8 border-b border-slate-800/50">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk" }}>
            Settings
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Manage your profile and interview preferences.
          </p>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-5 max-w-2xl">

          {/* Profile Card */}
          <div className="relative rounded-xl border border-slate-800/80 bg-[#0d1018] p-5 overflow-hidden group">
            <GlowingEffect />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Profile</h3>
            <div className="flex items-center gap-4 mb-4">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full ring-2 ring-blue-500/30 object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-700 ring-2 ring-blue-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-400 text-3xl">person</span>
                </div>
              )}
              <div>
                <p className="text-white font-semibold text-base" style={{ fontFamily: "Space Grotesk" }}>
                  {user?.fullName || "User"}
                </p>
                <p className="text-slate-400 text-sm">{user?.primaryEmailAddress?.emailAddress || ""}</p>
                <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                  Free Tier
                </span>
              </div>
            </div>
            <p className="text-slate-600 text-xs">
              Profile is managed by Clerk. To update your photo or name, visit your Clerk account.
            </p>
          </div>

          {/* Preferences Card */}
          <div className="relative rounded-xl border border-slate-800/80 bg-[#0d1018] p-5 overflow-hidden group">
            <GlowingEffect />
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Interview Preferences</h3>
            <p className="text-slate-500 text-xs mb-5">These will be auto-filled when you start a new interview.</p>

            <div className="flex flex-col gap-6">

              {/* Default Level */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">
                  Default Experience Level
                </label>
                <div className="relative">
                  <select
                    value={defaultLevel}
                    onChange={(e) => setDefaultLevel(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-slate-700/80 focus:border-blue-500 rounded-lg px-4 py-3 text-white appearance-none outline-none text-sm transition-colors"
                  >
                    {experienceLevels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-lg">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Default Type */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">
                  Default Interview Type
                </label>
                <div className="flex gap-2">
                  {interviewTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setDefaultType(t)}
                      className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all border ${
                        defaultType === t
                          ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          : "bg-[#0a0d14] text-slate-400 border-slate-700/80 hover:border-slate-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Question Count */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">
                    Default Question Count
                  </label>
                  <span className="text-blue-400 font-bold text-sm bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                    {defaultCount}
                  </span>
                </div>
                <input
                  type="range" min={5} max={15} value={defaultCount}
                  onChange={(e) => setDefaultCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
                  <span>5 questions</span>
                  <span>15 questions</span>
                </div>
              </div>

            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={`mt-6 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center gap-2 ${
                saved
                  ? "bg-green-500/20 border border-green-500/30 text-green-400"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{saved ? "check_circle" : "save"}</span>
              {saved ? "Saved!" : "Save Preferences"}
            </button>
          </div>

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-[#0d1018]/95 backdrop-blur-md border-t border-slate-800/50">
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { icon: "dashboard", label: "Home", active: false, onClick: () => navigate("/dashboard") },
            { icon: "add_circle", label: "Practice", active: false, onClick: () => navigate("/interview/new") },
            { icon: "history", label: "History", active: false, onClick: () => navigate("/history") },
            { icon: "auto_graph", label: "Insights", active: false, onClick: () => navigate("/insights") },
            { icon: "settings", label: "Settings", active: true, onClick: () => { } },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
                item.active ? "text-blue-400" : "text-slate-500 active:text-slate-300"
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${item.active ? "text-blue-400" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-slate-500/4 rounded-full blur-[120px]" />
      </div>

    </div>
  )
}