import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUser } from "@clerk/react"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Skeleton } from "@/components/ui/skeleton"

interface Question {
  id: number
  text: string
}

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

export default function InterviewPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useUser()

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [textAnswer, setTextAnswer] = useState("")
  const [interimText, setInterimText] = useState("")
  const [timeLeft, setTimeLeft] = useState(180)
  const [startTime, setStartTime] = useState(Date.now())
  const [speechSupported] = useState(!!SpeechRecognition)
  const [answerError, setAnswerError] = useState("")
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)

  const recognitionRef = useRef<any>(null)
  const textAnswerRef = useRef("")
  const questionsRef = useRef<Question[]>([])
  const currentQRef = useRef(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { textAnswerRef.current = textAnswer }, [textAnswer])
  useEffect(() => { questionsRef.current = questions }, [questions])
  useEffect(() => { currentQRef.current = currentQ }, [currentQ])

  const totalQ = questions.length
  const progress = totalQ > 0 ? Math.round((currentQ / totalQ) * 100) : 0
  const timerPercent = (timeLeft / 180) * 100
  const timerColor = timeLeft <= 30 ? "#f87171" : timeLeft <= 60 ? "#fb923c" : "#60a5fa"

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interviews/${id}/questions`)
        const data = await res.json()
        setQuestions(data)
        questionsRef.current = data
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchQuestions()
  }, [id])

  useEffect(() => {
    setStartTime(Date.now())
    setTimeLeft(180)
    setTextAnswer("")
    setInterimText("")
    setAnswerError("")
    setShowSkipConfirm(false)
    setIsRecording(false)

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          const currentAnswer = textAnswerRef.current
          const currQ = currentQRef.current
          const allQ = questionsRef.current

          const goNext = async () => {
            if (currentAnswer.trim()) {
              try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/answers`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    questionId: allQ[currQ]?.id,
                    userId: user?.id || "test-user",
                    answerText: currentAnswer,
                    durationSec: 180,
                  }),
                })
              } catch (e) { console.error(e) }
            }
            if (currQ < allQ.length - 1) {
              setCurrentQ(currQ + 1)
            } else {
              await generateFeedbackForInterview(id!)
              navigate(`/interview/${id}/feedback`)
            }
          }
          goNext()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQ])

  useEffect(() => {
    return () => { recognitionRef.current?.stop() }
  }, [])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0")
    const s = (sec % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const handleMicClick = () => {
    if (!speechSupported) return

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      setInterimText("")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => setIsRecording(true)

    recognition.onresult = (event: any) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setTextAnswer((prev) => prev + finalTranscript)
        setInterimText("")
      } else {
        setInterimText(interimTranscript)
      }
    }

    recognition.onerror = () => { setIsRecording(false); setInterimText("") }
    recognition.onend = () => { setIsRecording(false); setInterimText("") }

    recognitionRef.current = recognition
    recognition.start()
  }

  const generateFeedbackForInterview = async (interviewId: string) => {
    try {
      const rawAnswersRes = await fetch(`${import.meta.env.VITE_API_URL}/api/answers/interview/${interviewId}`)
      const rawAnswers = await rawAnswersRes.json()
      for (const ans of rawAnswers) {
        if (!ans.answerText) continue
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answer_id: ans.id,
              question_text: ans.questionText,
              answer_text: ans.answerText,
            }),
          })
          await new Promise(r => setTimeout(r, 500))
        } catch (e) { console.error("Feedback failed for answer:", ans.id) }
      }
    } catch (e) { console.error("Failed to generate feedback:", e) }
  }

  const saveAnswer = async (answerText: string) => {
    if (!answerText.trim()) return
    const durationSec = Math.round((Date.now() - startTime) / 1000)
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questions[currentQ]?.id,
          userId: user?.id || "test-user",
          answerText,
          durationSec,
        }),
      })
    } catch (error) { console.error("Failed to save answer:", error) }
  }

  const handleNext = async () => {
    if (!textAnswer.trim()) {
      setAnswerError("Please provide an answer! Use mic or type. To skip, press Skip.")
      return
    }
    setAnswerError("")
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false) }

    setSaving(true)
    await saveAnswer(textAnswer)
    setSaving(false)

    if (currentQ < totalQ - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setSaving(true)
      await generateFeedbackForInterview(id!)
      setSaving(false)
      navigate(`/interview/${id}/feedback`)
    }
  }

  const handleSkipConfirm = () => {
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false) }
    setShowSkipConfirm(false)
    setTextAnswer("")
    setInterimText("")
    setAnswerError("")
    if (currentQ < totalQ - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      navigate(`/interview/${id}/feedback`)
    }
  }

  // Circular timer SVG params
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (timerPercent / 100) * circumference

  if (loading) return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading questions...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white flex flex-col">

      {/* Header */}
      <header className="bg-[#0a0d14]/80 backdrop-blur-md border-b border-slate-800/50 flex justify-between items-center px-4 md:px-6 h-16 z-40 fixed top-0 left-0 w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-slate-400 text-xl">close</span>
          </button>
          <div>
            <p className="text-base font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>
              Mock Interview
            </p>
            <p className="text-xs text-slate-500">AI Assessment</p>
          </div>
        </div>

        {/* Progress pill */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-4 py-1.5">
          <div className="w-24 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">{currentQ + 1}/{totalQ}</span>
        </div>

        {/* Circular timer */}
        <div className="flex items-center gap-2">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r={radius} fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle
                cx="32" cy="32" r={radius}
                fill="none"
                stroke={timerColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
              />
            </svg>
            <span
              className="text-xs font-bold z-10 tabular-nums"
              style={{ color: timerColor, fontFamily: "Space Grotesk" }}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-col items-center px-4 md:px-8 pt-24 pb-16 max-w-3xl mx-auto w-full">

        {/* Question number badge */}
        <div className="flex items-center gap-2 mb-6 self-start">
          <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Question {currentQ + 1} of {totalQ}
          </span>
          <span className="text-xs text-slate-500">{progress}% complete</span>
        </div>

        {/* Question Card */}
        <div className="relative w-full bg-[#0d1018] border border-slate-800/80 rounded-2xl p-6 md:p-8 overflow-hidden group mb-8">
          <GlowingEffect />
          {/* Decorative glow blob */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400 text-base">psychology</span>
              </div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Interview Question</span>
            </div>
            <h1
              className="text-xl md:text-2xl font-bold text-white leading-snug mb-4"
              style={{ fontFamily: "Space Grotesk" }}
            >
              {questions[currentQ]?.text}
            </h1>
            <p className="text-slate-500 text-sm">
              Use the <span className="text-slate-400 font-medium">STAR method</span> — Situation, Task, Action, Result.
            </p>
          </div>
        </div>

        {/* Answer Section */}
        <div className="relative w-full bg-[#0d1018] border border-slate-800/80 rounded-2xl overflow-hidden group mb-6">
          <GlowingEffect />

          {/* Textarea header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500 text-base">edit_note</span>
              <span className="text-xs text-slate-500 font-medium">Your Answer</span>
            </div>
            {/* Mic button inline */}
            <button
              onClick={handleMicClick}
              disabled={!speechSupported}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                isRecording
                  ? "bg-red-500/20 border border-red-500/40 text-red-400"
                  : "bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
              } ${!speechSupported ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {isRecording ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="material-symbols-outlined text-sm">stop</span>
                  Stop
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">mic</span>
                  {speechSupported ? "Record" : "No mic"}
                </>
              )}
            </button>
          </div>

          {/* Waveform bars when recording */}
          {isRecording && (
            <div className="flex items-center gap-1 px-4 py-2">
              {[12, 20, 16, 24, 14, 18, 10, 22, 15].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-400 rounded-full animate-bounce"
                  style={{
                    height: `${h}px`,
                    animationDelay: `${i * 0.07}s`,
                    animationDuration: "0.6s",
                  }}
                />
              ))}
              <span className="ml-2 text-xs text-red-400 font-medium animate-pulse">Listening...</span>
            </div>
          )}

          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={textAnswer + interimText}
              onChange={(e) => {
                // Only update if not recording (manual typing)
                if (!isRecording) {
                  setTextAnswer(e.target.value)
                  if (answerError) setAnswerError("")
                }
              }}
              placeholder={
                isRecording
                  ? "Speak now — your words will appear here in real-time..."
                  : "Type your answer here, or click Record to use your mic..."
              }
              rows={6}
              className={`w-full bg-transparent px-4 py-3 text-white placeholder:text-slate-600 text-sm outline-none resize-none leading-relaxed ${
                isRecording ? "text-slate-300" : ""
              }`}
              style={{ caretColor: isRecording ? "transparent" : "auto" }}
            />
            {/* Interim text highlight */}
            {isRecording && interimText && (
              <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                <span className="text-sm text-slate-500 italic">{interimText}</span>
              </div>
            )}
          </div>

          {/* Char count */}
          <div className="px-4 pb-3 flex justify-end">
            <span className="text-xs text-slate-600">{textAnswer.length} characters</span>
          </div>
        </div>

        {/* Answer Error */}
        {answerError && (
          <div className="w-full mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400 text-sm">
            <span className="material-symbols-outlined text-lg shrink-0">error</span>
            {answerError}
          </div>
        )}

        {/* Skip Confirm */}
        {showSkipConfirm && (
          <div className="w-full mb-4 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-4">
            <p className="text-orange-400 text-sm font-semibold mb-3">
              Skip this question? Your answer won't be saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSkipConfirm}
                className="flex-1 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-all active:scale-95"
              >
                Yes, Skip
              </button>
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="flex-1 py-2.5 bg-slate-800/60 border border-slate-700 text-slate-400 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => setShowSkipConfirm(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-slate-400 border border-slate-700/80 hover:bg-slate-800/60 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">skip_next</span>
            Skip
          </button>

          <button
            onClick={handleNext}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              saving
                ? "bg-blue-500/50 text-white/60 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]"
            }`}
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Saving...
              </>
            ) : (
              <>
                {currentQ < totalQ - 1 ? "Next Question" : "Finish Interview"}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            )}
          </button>
        </div>

      </main>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-slate-500/4 rounded-full blur-[120px]" />
      </div>

    </div>
  )
}