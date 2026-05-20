import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUser } from "@clerk/react"

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
  const [showTextInput, setShowTextInput] = useState(false)
  const [textAnswer, setTextAnswer] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [startTime, setStartTime] = useState(Date.now())
  const [speechSupported] = useState(!!SpeechRecognition)
  const [answerError, setAnswerError] = useState("")
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)

  const recognitionRef = useRef<any>(null)
  const textAnswerRef = useRef("")
  const questionsRef = useRef<Question[]>([])
  const currentQRef = useRef(0)

  useEffect(() => {
    textAnswerRef.current = textAnswer
  }, [textAnswer])

  useEffect(() => {
    questionsRef.current = questions
  }, [questions])

  useEffect(() => {
    currentQRef.current = currentQ
  }, [currentQ])

  const totalQ = questions.length
  const progress = totalQ > 0 ? Math.round((currentQ / totalQ) * 100) : 0

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
    setTimeLeft(60)

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)

          const currentAnswer = textAnswerRef.current
          const currQ = currentQRef.current
          const allQ = questionsRef.current

          const goNext = async () => {
            if (currentAnswer.trim()) {
              const durationSec = 60
              try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/answers`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    questionId: allQ[currQ]?.id,
                    userId: user?.id || "test-user",
                    answerText: currentAnswer,
                    durationSec,
                  }),
                })
              } catch (e) {
                console.error(e)
              }
            }

            if (currQ < allQ.length - 1) {
              setCurrentQ(currQ + 1)
              setShowTextInput(false)
              setTextAnswer("")
              setAnswerError("")
              setShowSkipConfirm(false)
              setIsRecording(false)
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
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0")
    const s = (sec % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const handleMicClick = () => {
    if (!speechSupported) {
      setShowTextInput(true)
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsRecording(true)
      setShowTextInput(true)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        }
      }
      if (finalTranscript) {
        setTextAnswer((prev) => prev + finalTranscript)
      }
    }

    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

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
        } catch (e) {
          console.error("Feedback failed for answer:", ans.id)
        }
      }
    } catch (e) {
      console.error("Failed to generate feedback:", e)
    }
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
    } catch (error) {
      console.error("Failed to save answer:", error)
    }
  }

  const handleNext = async () => {
    if (!textAnswer.trim()) {
      setAnswerError("Please provide an answer! Use mic or type. To skip without answering, press Skip.")
      return
    }
    setAnswerError("")

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    }

    setSaving(true)
    await saveAnswer(textAnswer)
    setSaving(false)

    if (currentQ < totalQ - 1) {
      setCurrentQ(currentQ + 1)
      setShowTextInput(false)
      setTextAnswer("")
      setTimeLeft(60)
      setAnswerError("")
      setShowSkipConfirm(false)
    } else {
      setSaving(true)
      await generateFeedbackForInterview(id!)
      setSaving(false)
      navigate(`/interview/${id}/feedback`)
    }
  }

  const handleSkipConfirm = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    }
    setShowSkipConfirm(false)
    setShowTextInput(false)
    setTextAnswer("")
    setAnswerError("")

    if (currentQ < totalQ - 1) {
      setCurrentQ(currentQ + 1)
      setTimeLeft(60)
    } else {
      navigate(`/interview/${id}/feedback`)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#10131a] flex items-center justify-center">
      <p className="text-blue-400 text-xl animate-pulse">Loading questions...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#10131a] text-white flex flex-col">

      {/* Header */}
      <header className="bg-[#10131a] border-b border-slate-800 flex justify-between items-center px-6 py-3 w-full z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:bg-slate-800 transition-colors active:scale-95 p-2 rounded-full"
          >
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
          <div className="flex flex-col">
            <span
              onClick={() => navigate("/")}
              className="text-xl font-semibold text-blue-400 cursor-pointer"
              style={{ fontFamily: "Space Grotesk" }}
            >
              Mock Interview
            </span>
            <span className="text-xs text-slate-400">AI Assessment</span>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft <= 30 ? "text-red-400 bg-red-500/10" : "text-blue-400 bg-blue-500/10"
          }`}>
          <span className="material-symbols-outlined text-lg">timer</span>
          <span className="font-semibold text-sm">{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-col items-center px-8 py-12 max-w-5xl mx-auto w-full">

        {/* Progress */}
        <div className="w-full mb-12">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-slate-400">
              Question {currentQ + 1} of {totalQ}
            </span>
            <span className="text-xs text-blue-400">{progress}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="w-full bg-[#1d2027] border border-slate-800 rounded-xl p-10 relative overflow-hidden group">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg mb-6 inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">psychology</span>
              <span className="font-semibold text-xs tracking-widest uppercase">Interview Question</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-6 max-w-3xl leading-snug" style={{ fontFamily: "Space Grotesk" }}>
              {questions[currentQ]?.text}
            </h1>
            <p className="text-slate-400 max-w-xl text-base">
              Take a moment to reflect. Focus on Specifics, Action, and Results (STAR method).
            </p>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="mt-12 flex flex-col items-center w-full max-w-md">

          {/* Waveform */}
          <div className="flex items-center justify-center gap-1 mb-6 h-8">
            {[12, 20, 16, 24, 14, 18, 10].map((h, i) => (
              <div
                key={i}
                className={`w-1 bg-blue-400 rounded-full transition-all duration-300 ${isRecording ? "animate-bounce" : "opacity-30"}`}
                style={{
                  height: isRecording ? `${h}px` : "4px",
                  animationDelay: `${[0.1, 0.3, 0.2, 0.4, 0.1, 0.5, 0.2][i]}s`,
                }}
              ></div>
            ))}
          </div>

          {/* Mic Button */}
          <button
            onClick={handleMicClick}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-90 ${isRecording
              ? "bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] animate-pulse"
              : "bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              }`}
          >
            <span className="material-symbols-outlined text-4xl text-white">
              {isRecording ? "stop" : "mic"}
            </span>
          </button>

          <p className={`mt-4 font-semibold text-xs tracking-widest uppercase transition-colors ${isRecording ? "text-red-400 animate-pulse" : "text-slate-500"
            }`}>
            {isRecording ? "Recording — Tap to Stop" : speechSupported ? "Tap to Record" : "Voice not supported"}
          </p>

          {/* Text Area */}
          <div className="mt-8 w-full">
            {!showTextInput ? (
              <button
                onClick={() => setShowTextInput(true)}
                className="w-full py-3 border border-dashed border-slate-700 rounded-lg text-slate-400 text-sm hover:bg-slate-800 hover:border-blue-500 transition-all duration-300"
              >
                Type your answer instead...
              </button>
            ) : (
              <div className="relative">
                <textarea
                  value={textAnswer}
                  onChange={(e) => {
                    setTextAnswer(e.target.value)
                    if (answerError) setAnswerError("")
                  }}
                  placeholder={isRecording ? "Listening... speak now" : "Type your answer here..."}
                  rows={5}
                  className={`w-full bg-[#1d2027] border rounded-lg px-4 py-3 text-white placeholder:text-slate-600 outline-none resize-none transition-all ${isRecording ? "border-red-500/50" : "border-slate-700 focus:border-blue-500"
                    }`}
                />
                {isRecording && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-red-400 text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                    Live
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Answer Error */}
          {answerError && (
            <div className="w-full mt-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex items-center gap-3 text-red-400 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {answerError}
            </div>
          )}

          {/* Skip Confirm */}
          {showSkipConfirm && (
            <div className="w-full mt-3 bg-orange-500/10 border border-orange-500/30 rounded-lg px-4 py-3">
              <p className="text-orange-400 text-sm font-semibold mb-3">
                Skip this question? Your answer won't be saved.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSkipConfirm}
                  className="flex-1 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-all"
                >
                  Yes, Skip
                </button>
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 py-2 bg-slate-700/50 border border-slate-600 text-slate-400 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Buttons Row */}
          <div className="mt-6 flex items-center gap-4 mb-12">
            <button
              onClick={() => setShowSkipConfirm(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-slate-400 border border-slate-700 hover:bg-slate-800 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">skip_next</span>
              Skip
            </button>

            <button
              onClick={handleNext}
              disabled={saving}
              className={`flex items-center gap-2 px-10 py-3 rounded-full font-semibold text-sm transition-all active:scale-95 ${saving
                ? "bg-blue-300 text-[#10131a] cursor-not-allowed"
                : "bg-blue-400 text-[#10131a] hover:bg-blue-300"
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
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </div>

        </div>
      </main>

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-slate-500/5 rounded-full blur-[100px]"></div>
      </div>

    </div>
  )
}