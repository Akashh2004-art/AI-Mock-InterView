import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUser } from "@clerk/react"

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
    <div className={`flex ${color}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="material-symbols-outlined text-2xl"
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

  const circumference = 2 * Math.PI * 110
  const offset = circumference - (overallScore / 100) * circumference

  if (loading) return (
    <div className="min-h-screen bg-[#10131a] flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-blue-400 text-5xl animate-spin">progress_activity</span>
      <p className="text-blue-400 text-xl font-semibold" style={{ fontFamily: "Space Grotesk" }}>
        Loading feedback...
      </p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#10131a] flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-red-400 text-5xl">error</span>
      <p className="text-red-400 text-xl">{error}</p>
      <button onClick={() => navigate("/dashboard")} className="mt-4 px-6 py-3 bg-slate-700 text-white rounded-xl">
        Back to Dashboard
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#10131a] text-white pb-40">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#10131a] border-b border-slate-800 flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-400 text-3xl">psychology</span>
          <span className="text-2xl font-bold text-blue-400" style={{ fontFamily: "Space Grotesk" }}>InterviewAI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate("/dashboard")} className="text-slate-400 hover:bg-slate-800 transition-colors px-4 py-2 rounded-lg text-sm font-semibold">Home</button>
          <button className="text-blue-400 font-semibold px-4 py-2 rounded-lg text-sm">Interviews</button>
        </nav>
        <div className="w-10 h-10 rounded-full border border-slate-700 overflow-hidden">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400">person</span>
            </div>
          )}
        </div>
      </header>

      <main className="mt-20 pt-12 px-8 max-w-5xl mx-auto">

        {/* Overall Score */}
        <section className="flex flex-col items-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-12 text-center" style={{ fontFamily: "Space Grotesk" }}>
            Performance Summary
          </h2>
          <div className="relative flex items-center justify-center w-64 h-64">
            <svg className="w-full h-full">
              <circle cx="128" cy="128" r="110" fill="transparent" stroke="#272a31" strokeWidth="12" />
              <circle
                cx="128" cy="128" r="110"
                fill="transparent"
                stroke="#60a5fa"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.35s" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>{overallScore}</span>
              <span className="text-sm font-semibold text-slate-400 tracking-widest">OF 100</span>
            </div>
          </div>
          <p className="mt-6 text-slate-400 text-lg text-center max-w-md leading-relaxed">
            {overallScore >= 70
              ? "Great job! Keep refining your answers with specific examples."
              : overallScore >= 50
                ? "Good effort! Focus on structure and depth in your answers."
                : "Keep practicing! Use the STAR method to improve your responses."}
          </p>
        </section>

        {/* Feedback Cards */}
        <section className="space-y-6">
          <h3 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: "Space Grotesk" }}>
            Detailed Question Analysis
          </h3>

          {feedbackData.map((item, i) => {
            const score = item.score ?? 0
            const stars = scoreToStars(score)

            return (
              <div key={i} className="bg-[#1d2027] border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${scoreColors(score)}`}>
                      {score}/10
                    </span>
                    <h4 className="text-xl font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>
                      Question {i + 1}
                    </h4>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Question</p>
                  <p className="text-white mb-4">"{item.question}"</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Your Answer</p>
                  <p className="text-slate-400 text-sm italic mb-4">
                    "{item.answer || "No answer provided"}"
                  </p>
                  <div className="bg-[#191b23] p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                      <span className="material-symbols-outlined text-lg">auto_awesome</span>
                      <span className="text-xs font-semibold tracking-widest uppercase">AI Insight</span>
                    </div>
                    <p className="text-white text-sm">{item.feedback || "No feedback available"}</p>
                  </div>
                </div>
                <div className="md:w-32 flex flex-col items-center justify-start py-2">
                  <StarRating stars={stars} color={starColor(score)} />
                  <span className="text-xs text-slate-400 mt-2 text-center">{scoreLabel(score)}</span>
                </div>
              </div>
            )
          })}
        </section>

        {/* Action Buttons */}
        <div className="mt-20 flex flex-col md:flex-row gap-6 items-center justify-center pb-20">
          <button
            onClick={() => navigate("/interview/new")}
            className="w-full md:w-auto px-10 py-4 bg-transparent border-2 border-blue-400 text-blue-400 text-xl font-semibold rounded-xl hover:bg-blue-400/10 transition-all active:scale-95"
            style={{ fontFamily: "Space Grotesk" }}
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full md:w-auto px-10 py-4 bg-slate-700 text-white text-xl font-semibold rounded-xl hover:bg-slate-600 transition-all active:scale-95"
            style={{ fontFamily: "Space Grotesk" }}
          >
            Back to Dashboard
          </button>
        </div>

      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 bg-[#1d2027] border-t border-slate-800 z-50">
        {[
          { icon: "dashboard", label: "Home", active: false },
          { icon: "video_chat", label: "Interviews", active: true },
          { icon: "analytics", label: "Progress", active: false },
          { icon: "settings", label: "Settings", active: false },
        ].map((item, i) => (
          <div key={i} className={`flex flex-col items-center justify-center px-4 py-1 ${item.active ? "text-blue-400 bg-blue-500/10 rounded-xl" : "text-slate-400"}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-xs mt-0.5">{item.label}</span>
          </div>
        ))}
      </nav>

    </div>
  )
}