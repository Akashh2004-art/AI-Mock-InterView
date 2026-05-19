import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "@clerk/react"

const interviewTypes = ["Technical", "HR", "Behavioral"]
const experienceLevels = ["Fresher", "Junior", "Mid", "Senior", "Expert"]

export default function NewInterviewPage() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [activeTab, setActiveTab] = useState<"normal" | "resume">("normal")

  // Normal interview state
  const [jobRole, setJobRole] = useState("")

  // localStorage theke preferences load koro
  const savedPrefs = JSON.parse(localStorage.getItem("interviewPrefs") || "{}")

  // Shared state
  const [experienceLevel, setExperienceLevel] = useState(savedPrefs.level || "Mid")
  const [interviewType, setInterviewType] = useState(savedPrefs.type || "Technical")
  const [questionCount, setQuestionCount] = useState(savedPrefs.count || 10)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [detectedRole, setDetectedRole] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setResumeFile(e.target.files[0])
      setDetectedRole("")
      if (error) setError("")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.[0]) {
      setResumeFile(e.dataTransfer.files[0])
      setDetectedRole("")
    }
  }

  const handleGenerate = async () => {
    setError("")

    if (activeTab === "normal" && !jobRole.trim()) {
      setError("Please enter a job role!")
      return
    }

    if (activeTab === "resume" && !resumeFile) {
      setError("Please upload your resume PDF!")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("userId", user?.id || "test-user")
      formData.append("level", experienceLevel)
      formData.append("type", interviewType)
      formData.append("questionCount", questionCount.toString())

      let url = "http://localhost:3000/api/generate"

      if (activeTab === "normal") {
        formData.append("role", jobRole)
        if (resumeFile) formData.append("resume", resumeFile)
        url = "http://localhost:3000/api/generate"
      } else {
        formData.append("resume", resumeFile!)
        url = "http://localhost:3000/api/generate/resume"
      }

      const response = await fetch(url, { method: "POST", body: formData })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong! Please try again.")
        return
      }

      if (data.detectedRole) {
        setDetectedRole(data.detectedRole)
      }

      if (data.interviewId) {
        navigate(`/interview/${data.interviewId}`)
      }
    } catch (err) {
      setError("Server not reachable. Make sure the server is running!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#10131a] text-white">

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex justify-between items-center w-full px-4 h-16 fixed top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-blue-500 hover:bg-slate-800 transition-colors p-2 rounded-lg">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 onClick={() => navigate("/")} className="font-bold text-xl tracking-tight text-blue-500 cursor-pointer" style={{ fontFamily: "Space Grotesk" }}>
            InterviewAI
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400">person</span>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 w-64 z-40">
        <div onClick={() => navigate("/")} className="text-2xl font-black text-blue-500 px-6 py-8 cursor-pointer" style={{ fontFamily: "Space Grotesk" }}>
          InterviewAI
        </div>
        <nav className="flex-1 flex flex-col px-4 gap-2">
          {[
            { icon: "dashboard", label: "Dashboard", path: "/dashboard", active: false },
            { icon: "add_circle", label: "New Interview", path: "/interview/new", active: true },
            { icon: "history", label: "History", path: "/history", active: false },
            { icon: "auto_graph", label: "AI Insights", path: "/insights", active: false },
            { icon: "settings", label: "Settings", path: "/settings", active: false },
          ].map((item, i) => (
            <button key={i} onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-left ${item.active ? "bg-blue-500/10 text-blue-500 border-r-2 border-blue-500" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span style={{ fontFamily: "Space Grotesk" }}>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-4 flex flex-col items-center max-w-lg mx-auto md:ml-64 lg:mx-auto">
        <div className="w-full mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk" }}>Prepare for Success</h2>
          <p className="text-slate-400">Configure your mock session to match your dream job.</p>
        </div>

        {/* Tab Switcher */}
        <div className="w-full flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab("normal"); setError("") }}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "normal"
              ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              : "text-slate-400 hover:text-white"
              }`}
          >
            <span className="material-symbols-outlined text-sm">work</span>
            Normal Interview
          </button>
          <button
            onClick={() => { setActiveTab("resume"); setError("") }}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "resume"
              ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              : "text-slate-400 hover:text-white"
              }`}
          >
            <span className="material-symbols-outlined text-sm">description</span>
            Resume Interview
          </button>
        </div>

        {/* Form Card */}
        <div className="w-full rounded-xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden border border-blue-500/20"
          style={{ background: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(12px)" }}>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="flex flex-col gap-6 z-10">

            {/* Normal Tab — Job Role */}
            {activeTab === "normal" && (
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">Job Role</label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => { setJobRole(e.target.value); if (error) setError("") }}
                  placeholder="e.g. Senior Product Designer"
                  className={`w-full bg-[#10131a] border focus:ring-1 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 transition-all outline-none ${error && !jobRole.trim() ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                />
              </div>
            )}

            {/* Resume Tab — Upload */}
            {activeTab === "resume" && (
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">Resume (PDF) — Required</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("resume-input-tab")?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${dragOver ? "border-blue-500 bg-blue-500/10"
                    : resumeFile ? "border-green-500 bg-green-500/5"
                      : error && !resumeFile ? "border-red-500 bg-red-500/5"
                        : "border-slate-700 bg-[#10131a]/30 hover:bg-blue-500/5 hover:border-blue-500"
                    }`}
                >
                  <span className={`material-symbols-outlined text-4xl transition-colors ${resumeFile ? "text-green-400" : dragOver ? "text-blue-400" : error && !resumeFile ? "text-red-400" : "text-slate-500"
                    }`}>
                    {resumeFile ? "check_circle" : "cloud_upload"}
                  </span>
                  <div className="text-center">
                    <p className="font-semibold text-white text-sm">
                      {resumeFile ? resumeFile.name : "Tap to upload resume"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {resumeFile ? "AI will detect your role automatically!" : "or drag and drop here"}
                    </p>
                  </div>
                  <input id="resume-input-tab" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                </div>

                {/* Detected Role Badge */}
                {detectedRole && (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                    <span className="material-symbols-outlined text-green-400 text-sm">auto_awesome</span>
                    <span className="text-green-400 text-sm font-semibold">Detected Role: {detectedRole}</span>
                  </div>
                )}
              </div>
            )}

            {/* Experience Level */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">Experience Level</label>
              <div className="relative">
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-[#10131a] border border-slate-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white appearance-none transition-all outline-none"
                >
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
              </div>
            </div>

            {/* Interview Type */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">Interview Type</label>
              <div className="flex gap-3">
                {interviewTypes.map((type) => (
                  <button key={type} onClick={() => setInterviewType(type)}
                    className={`flex-1 py-3 rounded-full font-semibold text-sm transition-all border ${interviewType === type
                      ? "bg-blue-600 text-white border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      : "bg-[#191b23] text-slate-400 border-slate-700 hover:border-blue-500"
                      }`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">Questions</label>
                <span className="text-blue-400 font-bold" style={{ fontFamily: "Space Grotesk" }}>{questionCount}</span>
              </div>
              <input
                type="range" min={5} max={15} value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                <span>5</span><span>15</span>
              </div>
            </div>

            {/* Normal Tab — Optional Resume */}
            {activeTab === "normal" && (
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 uppercase tracking-widest text-[10px] font-semibold">Resume (PDF) — Optional</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("resume-input")?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${dragOver ? "border-blue-500 bg-blue-500/10"
                    : resumeFile ? "border-green-500 bg-green-500/5"
                      : "border-slate-700 bg-[#10131a]/30 hover:bg-blue-500/5 hover:border-blue-500"
                    }`}
                >
                  <span className={`material-symbols-outlined text-4xl transition-colors ${resumeFile ? "text-green-400" : dragOver ? "text-blue-400" : "text-slate-500"}`}>
                    {resumeFile ? "check_circle" : "cloud_upload"}
                  </span>
                  <div className="text-center">
                    <p className="font-semibold text-white text-sm">{resumeFile ? resumeFile.name : "Tap to upload resume"}</p>
                    <p className="text-xs text-slate-500">{resumeFile ? "File ready!" : "or drag and drop here"}</p>
                  </div>
                  <input id="resume-input" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                </div>
              </div>
            )}

          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex items-center gap-3 text-red-400 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full text-white text-xl font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 ${loading ? "bg-blue-400 cursor-not-allowed opacity-70" : "bg-blue-600 shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              }`}
            style={{ fontFamily: "Space Grotesk" }}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                {activeTab === "resume" ? "Analyzing Resume..." : "Generating Questions..."}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">auto_awesome</span>
                {activeTab === "resume" ? "Analyze & Generate" : "Generate Questions"}
              </>
            )}
          </button>
        </div>

        <div className="mt-6 flex items-center gap-2 text-slate-500">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span className="text-xs">Your data is processed securely by our AI engine.</span>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
        {[
          { icon: "dashboard", label: "Dashboard", active: false, path: "/dashboard" },
          { icon: "add_circle", label: "New", active: true, path: "/interview/new" },
          { icon: "history", label: "History", active: false, path: "/history" },
          { icon: "settings", label: "Settings", active: false, path: "/settings" },
        ].map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center py-1 px-4 ${item.active ? "text-blue-500" : "text-slate-500"}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-medium mt-0.5" style={{ fontFamily: "Space Grotesk" }}>{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  )
}