import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUser } from "@clerk/react"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Skeleton } from "@/components/ui/skeleton"

interface FeedbackItem {
  question: string
  answer: string | null
  feedback: string | null
  score: number | null
}

const scoreColors = (score: number) => {
  if (score >= 7) return "bg-green-900/30 text-green-400 border-green-500/30"
  if (score >= 5) return "bg-orange-900/30 text-orange-400 border-orange-500/30"
  return "bg-red-900/30 text-red-400 border-red-500/30"
}

const starColor = (score: number) => {
  if (score >= 7) return "text-green-400"
  if (score >= 5) return "text-orange-400"
  return "text-red-400"
}

const scoreLabel = (score: number) => {
  if (score >= 7) return "High Performance"
  if (score >= 5) return "Room for Growth"
  return "Needs Improvement"
}

const scoreToStars = (score: number) => (score / 10) * 5

function StarRating({ stars, color }: { stars: number; color: string }) {
  return (
    <div className={`flex gap-0.5 ${color}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined text-xl"
          style={{ fontVariationSettings: i <= Math.floor(stars) ? "'FILL' 1" : "'FILL' 0" }}
        >
          {i <= stars ? "star" : i - 0.5 <= stars ? "star_half" : "star_outline"}
        </span>
      ))}
    </div>
  )
}

export default function FeedbackPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useUser()

  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    initFeedback()
  }, [id])

  const initFeedback = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/feedback/interview/${id}`)
      const data: FeedbackItem[] = await res.json()
      setFeedbackData(data)
    } catch (err) {
      console.error(err)
      setError("Failed to load feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const overallScore = feedbackData.length > 0
    ? Math.round(
      (feedbackData.reduce((sum, item) => sum + (item.score || 0), 0) / (feedbackData.length * 10)) * 100
    )
    : 0

  const circumference = 2 * Math.PI * 52
  const offset = circumference - (overallScore / 100) * circumference
  const scoreColor = overallScore >= 70 ? "#4ade80" : overallScore >= 50 ? "#fb923c" : "#f87171"

  if (loading) return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
      <p className="text-slate-400 text-sm">Analyzing your performance...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-red-400 text-5xl">error</span>
      <p className="text-red-400">{error}</p>
      <button
        onClick={() => navigate("/dashboard")}
        className="mt-4 px-6 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all"
      >
        Back to Dashboard
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white pb-32">

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
          <button
            onClick={() => navigate("/dashboard")}
            className="text-slate-400 hover:bg-slate-800 transition-colors text-sm px-3 py-1 rounded-lg"
          >
            Dashboard
          </button>
          <span className="text-blue-400 font-semibold text-sm px-3 py-1">Feedback</span>
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

      <main className="pt-24 px-4 md:px-8 max-w-4xl mx-auto">

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk" }}>
            Performance <span className="text-blue-400">Summary</span>
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Here's how you did in your interview session.</p>
        </div>

        {/* Overall Score Card */}
        <div className="relative rounded-2xl border border-slate-800/80 bg-[#0d1018] p-6 md:p-8 overflow-hidden mb-8">
          <GlowingEffect />
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: `${scoreColor}08` }} />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Circular Score */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle
                  cx="72" cy="72" r="52"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 8px ${scoreColor}60)` }}
                />
              </svg>
              <div className="flex flex-col items-center z-10">
                <span className="text-4xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>
                  {overallScore}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ 100</span>
              </div>
            </div>

            {/* Score Info */}
            <div className="flex-1 text-center md:text-left">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${
                overallScore >= 70
                  ? "bg-green-900/30 text-green-400 border-green-500/30"
                  : overallScore >= 50
                  ? "bg-orange-900/30 text-orange-400 border-orange-500/30"
                  : "bg-red-900/30 text-red-400 border-red-500/30"
              }`}>
                <span className="material-symbols-outlined text-sm">
                  {overallScore >= 70 ? "workspace_premium" : overallScore >= 50 ? "trending_up" : "trending_down"}
                </span>
                {overallScore >= 70 ? "Strong Performance" : overallScore >= 50 ? "Good Effort" : "Keep Practicing"}
              </div>
              <p className="text-white font-semibold text-lg mb-1" style={{ fontFamily: "Space Grotesk" }}>
                Overall Readiness Score
              </p>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                {overallScore >= 70
                  ? "Great job! Keep refining your answers with specific examples."
                  : overallScore >= 50
                  ? "Good effort! Focus on structure and depth in your answers."
                  : "Keep practicing! Use the STAR method to improve your responses."}
              </p>

              {/* Mini stat pills */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1">
                  <span className="material-symbols-outlined text-blue-400 text-sm">quiz</span>
                  <span className="text-xs text-slate-300">{feedbackData.length} Questions</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1">
                  <span className="material-symbols-outlined text-blue-400 text-sm">check_circle</span>
                  <span className="text-xs text-slate-300">
                    {feedbackData.filter(f => f.answer).length} Answered
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1">
                  <span className="material-symbols-outlined text-blue-400 text-sm">star</span>
                  <span className="text-xs text-slate-300">
                    Best: {Math.max(...feedbackData.map(f => f.score ?? 0))}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Detailed Question Analysis
          </h3>

          <div className="space-y-4">
            {feedbackData.map((item, i) => {
              const score = item.score ?? 0
              const stars = scoreToStars(score)

              return (
                <div key={i} className="relative rounded-xl border border-slate-800/80 bg-[#0d1018] p-5 md:p-6 overflow-hidden group">
                  <GlowingEffect />

                  {/* Question header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Question {i + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating stars={stars} color={starColor(score)} />
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreColors(score)}`}>
                        {score}/10
                      </span>
                    </div>
                  </div>

                  {/* Question text */}
                  <p className="text-white font-medium text-sm md:text-base mb-4 leading-relaxed">
                    {item.question}
                  </p>

                  {/* Your answer */}
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Answer</p>
                    <p className="text-slate-300 text-sm italic leading-relaxed">
                      {item.answer || "No answer provided"}
                    </p>
                  </div>

                  {/* AI Feedback */}
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-blue-400 text-base">auto_awesome</span>
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Insight</span>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed">
                      {item.feedback || "No feedback available"}
                    </p>
                  </div>

                  {/* Score label bottom */}
                  <div className="mt-3 flex justify-end">
                    <span className={`text-xs font-semibold ${starColor(score)}`}>
                      {scoreLabel(score)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <button
            onClick={() => navigate("/interview/new")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all active:scale-95 text-sm shadow-[0_0_20px_rgba(59,130,246,0.25)]"
          >
            <span className="material-symbols-outlined text-sm">replay</span>
            Try Again
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-800/60 border border-slate-700/80 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 transition-all active:scale-95 text-sm"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            Back to Dashboard
          </button>
        </div>

      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-[#0d1018]/95 backdrop-blur-md border-t border-slate-800/50">
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { icon: "dashboard", label: "Home", active: false, onClick: () => navigate("/dashboard") },
            { icon: "video_library", label: "Interviews", active: true, onClick: () => {} },
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