import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@clerk/react"
import { motion } from "framer-motion"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import {
  saveResumeToCache,
  loadResumeFromCache,
  getCachedResumeAsFile,
  clearResumeCache,
} from "@/lib/resumeCache"

const interviewTypes = ["Technical", "HR", "Behavioral"]
const experienceLevels = ["Fresher", "Junior", "Mid", "Senior", "Expert"]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: "easeOut" as const },
  }),
}

export default function NewInterviewPage() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [activeTab, setActiveTab] = useState<"normal" | "resume">("normal")
  const [jobRole, setJobRole] = useState("")
  const savedPrefs = JSON.parse(localStorage.getItem("interviewPrefs") || "{}")
  const [experienceLevel, setExperienceLevel] = useState(savedPrefs.level || "Mid")
  const [interviewType, setInterviewType] = useState(savedPrefs.type || "Technical")
  const [questionCount, setQuestionCount] = useState(savedPrefs.count || 10)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [cachedResumeInfo, setCachedResumeInfo] = useState<{ fileName: string; timestamp: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [detectedRole, setDetectedRole] = useState("")

  // Load cached resume info on mount
  useEffect(() => {
    loadResumeFromCache().then(setCachedResumeInfo)
  }, [])

  // Clear cache on logout
  useEffect(() => {
    if (!user?.id) {
      clearResumeCache()
      setCachedResumeInfo(null)
      setResumeFile(null)
    }
  }, [user?.id])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setResumeFile(file)
      await saveResumeToCache(file) // await — properly saved before state update
      setCachedResumeInfo({ fileName: file.name, timestamp: Date.now() })
      setDetectedRole("")
      if (error) setError("")
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0]
      setResumeFile(file)
      await saveResumeToCache(file) // await
      setCachedResumeInfo({ fileName: file.name, timestamp: Date.now() })
      setDetectedRole("")
    }
  }

  const handleGenerate = async () => {
    setError("")
    if (activeTab === "normal" && !jobRole.trim()) { setError("Please enter a job role!"); return }

    // Resume tab — use cached if no new file selected
    let fileToUse = resumeFile
    if (activeTab === "resume" && !fileToUse) {
      fileToUse = await getCachedResumeAsFile()
    }
    if (activeTab === "resume" && !fileToUse) { setError("Please upload your resume PDF!"); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("userId", user?.id || "test-user")
      formData.append("level", experienceLevel)
      formData.append("type", interviewType)
      formData.append("questionCount", questionCount.toString())

      let url = `${import.meta.env.VITE_API_URL}/api/generate`
      if (activeTab === "normal") {
        formData.append("role", jobRole)
        if (fileToUse) formData.append("resume", fileToUse)
      } else {
        formData.append("resume", fileToUse!)
        url = `${import.meta.env.VITE_API_URL}/api/generate/resume`
      }

      const response = await fetch(url, { method: "POST", body: formData })
      const data = await response.json()
      if (!response.ok) { setError(data.error || "Something went wrong!"); return }
      if (data.detectedRole) setDetectedRole(data.detectedRole)
      if (data.interviewId) navigate(`/interview/${data.interviewId}`)
    } catch {
      setError("Server not reachable. Make sure the server is running!")
    } finally {
      setLoading(false)
    }
  }

  const activeResumeName = resumeFile?.name || cachedResumeInfo?.fileName
  const hasResume = !!activeResumeName

  const sidebarItems = [
    { icon: "grid_view", label: "Dashboard", path: "/dashboard", active: false },
    { icon: "add_circle", label: "New Interview", path: "/interview/new", active: true },
    { icon: "video_library", label: "My Interviews", path: "/history", active: false },
    { icon: "auto_graph", label: "AI Insights", path: "/insights", active: false },
    { icon: "settings", label: "Settings", path: "/settings", active: false },
  ]

  const typeColors: Record<string, string> = {
    Technical: "bg-blue-600 border-blue-600 text-white shadow-[0_0_14px_rgba(59,130,246,0.35)]",
    HR: "bg-purple-600 border-purple-600 text-white shadow-[0_0_14px_rgba(168,85,247,0.35)]",
    Behavioral: "bg-emerald-600 border-emerald-600 text-white shadow-[0_0_14px_rgba(52,211,153,0.35)]",
  }

  const levelColors: Record<string, string> = {
    Fresher: "text-emerald-400",
    Junior: "text-blue-400",
    Mid: "text-purple-400",
    Senior: "text-orange-400",
    Expert: "text-pink-400",
  }

  return (
    <div className="min-h-screen bg-[#080b12] text-white">

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-5%] right-[-10%] w-125 h-125 bg-blue-600/7 rounded-full blur-[130px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-100 h-100 bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="bg-[#080b12]/80 backdrop-blur-md border-b border-slate-800/60 flex justify-between items-center w-full px-4 md:px-6 h-16 fixed top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-lg border border-slate-800 bg-slate-800/50 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400 text-lg">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-base">psychology</span>
            </div>
            <h1
              onClick={() => navigate("/")}
              className="font-bold text-lg tracking-tight text-white cursor-pointer hover:text-blue-400 transition-colors"
              style={{ fontFamily: "Space Grotesk" }}
            >
              InterviewAI
            </h1>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-500/40">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-base">person</span>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen bg-[#0d1018] border-r border-slate-800/60 w-64 z-40 pt-20 pb-6">
        <div className="px-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400">person</span>
              </div>
            )}
            <div>
              <p className="font-semibold text-white text-sm">{user?.firstName || "User"}</p>
              <p className="text-xs text-slate-500">Free Tier</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {sidebarItems.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={`rounded-lg px-4 py-3 flex items-center gap-3 transition-all text-left group ${
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
      </aside>

      {/* Main */}
      <main className="relative z-10 pt-24 pb-28 md:pb-10 px-4 flex flex-col items-center md:ml-64">
        <div className="w-full max-w-lg mx-auto">

          {/* Page Title */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="mb-7 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-1.5" style={{ fontFamily: "Space Grotesk" }}>
              Start a New Session
            </h2>
            <p className="text-slate-400 text-sm">Configure your mock interview to match your dream role.</p>
          </motion.div>

          {/* Tab Switcher */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="flex gap-2 mb-5 bg-[#0d1018] border border-slate-800/60 p-1 rounded-xl"
          >
            {(["normal", "resume"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError("") }}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-[0_0_18px_rgba(59,130,246,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {tab === "normal" ? "work" : "description"}
                </span>
                {tab === "normal" ? "Normal Interview" : "Resume Interview"}
              </button>
            ))}
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="relative rounded-2xl border border-slate-800/70 bg-[#0d1018] p-6 overflow-hidden"
          >
            <GlowingEffect />
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/8 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-5">

              {/* Normal Tab */}
              {activeTab === "normal" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-1.5"
                >
                  <label className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold">Job Role</label>
                  <input
                    type="text"
                    value={jobRole}
                    onChange={(e) => { setJobRole(e.target.value); if (error) setError("") }}
                    placeholder="e.g. Senior Product Designer"
                    className={`w-full bg-[#080b12] border rounded-xl px-4 py-3 text-white placeholder:text-slate-600 text-sm transition-all outline-none focus:ring-1 ${
                      error && !jobRole.trim()
                        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                        : "border-slate-700/60 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                </motion.div>
              )}

              {/* Resume Tab */}
              {activeTab === "resume" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-2"
                >
                  <label className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold">
                    Resume (PDF) — Required
                  </label>

                  {/* Cached resume notice */}
                  {cachedResumeInfo && !resumeFile && (
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 mb-1">
                      <span className="material-symbols-outlined text-blue-400 text-base">history</span>
                      <span className="text-blue-400 text-xs font-medium flex-1 truncate">
                        Using: {cachedResumeInfo.fileName}
                      </span>
                      <button
                        onClick={async () => {
                          await clearResumeCache()
                          setCachedResumeInfo(null)
                          setResumeFile(null)
                        }}
                        className="text-slate-500 hover:text-red-400 transition-colors text-xs font-semibold"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("resume-input-tab")?.click()}
                    className={`border-2 border-dashed rounded-xl p-7 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      dragOver ? "border-blue-500 bg-blue-500/8"
                      : hasResume ? "border-emerald-500/60 bg-emerald-500/5"
                      : error && !hasResume ? "border-red-500/60 bg-red-500/5"
                      : "border-slate-700/60 hover:border-blue-500/50 hover:bg-blue-500/5"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      hasResume ? "bg-emerald-500/15" : dragOver ? "bg-blue-500/15" : "bg-slate-800/60"
                    }`}>
                      <span className={`material-symbols-outlined text-2xl ${
                        hasResume ? "text-emerald-400" : dragOver ? "text-blue-400" : error && !hasResume ? "text-red-400" : "text-slate-500"
                      }`}>
                        {hasResume ? "check_circle" : "cloud_upload"}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white text-sm">
                        {activeResumeName || "Tap to upload resume"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {hasResume ? "AI will auto-detect your role!" : "or drag and drop • PDF only"}
                      </p>
                    </div>
                    <input id="resume-input-tab" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </div>

                  {detectedRole && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-4 py-2.5"
                    >
                      <span className="material-symbols-outlined text-emerald-400 text-base">auto_awesome</span>
                      <span className="text-emerald-400 text-sm font-semibold">Detected: {detectedRole}</span>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Experience Level */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold">Experience Level</label>
                  <span className={`text-xs font-semibold ${levelColors[experienceLevel]}`}>{experienceLevel}</span>
                </div>
                <div className="relative">
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-[#080b12] border border-slate-700/60 focus:border-blue-500 rounded-xl px-4 py-3 text-white text-sm appearance-none transition-all outline-none focus:ring-1 focus:ring-blue-500/20"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-base">expand_more</span>
                </div>
              </div>

              {/* Interview Type */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold">Interview Type</label>
                <div className="flex gap-2">
                  {interviewTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setInterviewType(type)}
                      className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition-all border ${
                        interviewType === type
                          ? typeColors[type]
                          : "bg-[#080b12] text-slate-400 border-slate-700/60 hover:border-slate-600"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold">Questions</label>
                  <span className="text-blue-400 font-bold text-sm" style={{ fontFamily: "Space Grotesk" }}>{questionCount}</span>
                </div>
                <input
                  type="range" min={5} max={15} step={1} value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
                  <span>5 (Quick)</span>
                  <span>15 (Full)</span>
                </div>
              </div>

              {/* Optional Resume (Normal Tab) */}
              {activeTab === "normal" && (
                <div className="flex flex-col gap-2">
                  <label className="text-slate-500 uppercase tracking-widest text-[10px] font-semibold">Resume (PDF) — Optional</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("resume-input")?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all ${
                      dragOver ? "border-blue-500 bg-blue-500/8"
                      : hasResume ? "border-emerald-500/60 bg-emerald-500/5"
                      : "border-slate-700/60 hover:border-blue-500/50 hover:bg-blue-500/5"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${hasResume ? "bg-emerald-500/15" : "bg-slate-800/60"}`}>
                      <span className={`material-symbols-outlined text-xl ${hasResume ? "text-emerald-400" : "text-slate-500"}`}>
                        {hasResume ? "check_circle" : "cloud_upload"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">
                        {activeResumeName || "Upload resume (optional)"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {hasResume ? "File ready — cached for 30 days!" : "Personalize questions with your CV"}
                      </p>
                    </div>
                    <input id="resume-input" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ ease: "easeOut" }}
                  className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 flex items-center gap-2.5 text-red-400 text-sm"
                >
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </motion.div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2.5 text-base ${
                  loading
                    ? "bg-blue-500/50 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(59,130,246,0.45)] active:scale-[0.98]"
                }`}
                style={{ fontFamily: "Space Grotesk" }}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    {activeTab === "resume" ? "Analyzing Resume..." : "Generating Questions..."}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                    {activeTab === "resume" ? "Analyze & Start" : "Generate Questions"}
                  </>
                )}
              </button>

            </div>
          </motion.div>

          {/* Security note */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="mt-5 flex items-center justify-center gap-2 text-slate-600"
          >
            <span className="material-symbols-outlined text-sm">lock</span>
            <span className="text-xs">Your data is processed securely by our AI engine.</span>
          </motion.div>

        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0d1018]/95 backdrop-blur-md border-t border-slate-800/60">
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { icon: "dashboard", label: "Home", path: "/dashboard", active: false },
            { icon: "add_circle", label: "New", path: "/interview/new", active: true },
            { icon: "history", label: "History", path: "/history", active: false },
            { icon: "auto_graph", label: "Insights", path: "/insights", active: false },
            { icon: "settings", label: "Settings", path: "/settings", active: false },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
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