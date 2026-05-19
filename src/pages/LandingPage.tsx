import { useState } from "react"
import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/react"
import { useNavigate } from "react-router-dom"

export default function LandingPage() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()

  const [modal, setModal] = useState<"privacy" | "terms" | null>(null)

  return (
    <div className="min-h-screen bg-[#10131a] text-white antialiased">

      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 fixed top-0 w-full z-50">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-3xl">psychology</span>
            <span
              onClick={() => navigate("/")}
              className="text-2xl font-bold tracking-tighter text-white cursor-pointer hover:text-blue-400 transition-colors"
              style={{ fontFamily: "Space Grotesk" }}
            >InterviewAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-400 hover:text-blue-400 transition-colors">How It Works</a>
          </nav>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-slate-400 hover:text-blue-400 transition-colors font-semibold px-4 py-2"
                >
                  Dashboard
                </button>
                <UserButton />
              </div>
            ) : (
              <>
                <SignInButton>
                  <button className="text-slate-400 hover:text-blue-400 transition-colors font-semibold px-4 py-2">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-500 transition-colors active:scale-95 duration-200">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20">

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
              </span>
              POWERED BY Groq AI
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight" style={{ fontFamily: "Space Grotesk" }}>
              Ace Your Next <span className="text-blue-400">Interview</span> with AI
            </h1>
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Practice with AI-generated questions, get instant feedback, and track your progress through immersive voice-first mock interviews.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              {isSignedIn ? (
                <button
                  onClick={() => navigate("/interview/new")}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 duration-200"
                >
                  Start Practicing Free
                </button>
              ) : (
                <SignUpButton>
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 duration-200">
                    Start Practicing Free
                  </button>
                </SignUpButton>
              )}
              <a href="#how-it-works">
                <button className="border border-slate-600 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-slate-800 transition-colors active:scale-95 duration-200">
                  See How It Works
                </button>
              </a>
            </div>
          </div>

          {/* Mockup Card */}
          <div className="relative">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full"></div>
            <div className="rounded-2xl p-8 shadow-2xl relative z-10 border border-slate-700/30"
              style={{ background: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(12px)" }}>

              {/* Card Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-400">account_circle</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">AI Interviewer</p>
                    <p className="text-xs text-slate-400">Active • Senior Product Manager</p>
                  </div>
                </div>
                {/* Animated Dots */}
                <div className="flex gap-2 items-end">
                  <span className="dot-1 w-2 h-2 rounded-full bg-red-400 inline-block"></span>
                  <span className="dot-2 w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                  <span className="dot-3 w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                </div>
              </div>

              {/* Question Box */}
              <div className="bg-[#10131a] rounded-xl p-6 border border-slate-700/20 mb-8">
                <p className="text-white text-base leading-relaxed">
                  "Can you describe a time when you had to manage a conflict within your team? How did you approach it and what was the outcome?"
                </p>
              </div>

              {/* Waveform + Mic */}
              <div className="flex flex-col items-center gap-6">
                {/* Animated Waveform */}
                <div className="flex items-end gap-1 h-12">
                  <div className="bar-1 w-1.5 bg-blue-400 rounded-full opacity-60"></div>
                  <div className="bar-2 w-1.5 bg-blue-400 rounded-full opacity-70"></div>
                  <div className="bar-3 w-1.5 bg-blue-400 rounded-full"></div>
                  <div className="bar-4 w-1.5 bg-blue-400 rounded-full opacity-80"></div>
                  <div className="bar-5 w-1.5 bg-blue-400 rounded-full opacity-90"></div>
                  <div className="bar-6 w-1.5 bg-blue-400 rounded-full opacity-70"></div>
                  <div className="bar-7 w-1.5 bg-blue-400 rounded-full opacity-60"></div>
                </div>
                <button className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-white">mic</span>
                </button>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Listening...</p>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 mt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "Space Grotesk" }}>
              Everything you need to crack interviews
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Our comprehensive AI suite provides personalized coaching for every stage of your career journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "tv_gen", iconColor: "text-blue-400", bgColor: "bg-blue-500/10", title: "AI Questions", desc: "Role-specific questions generated by Gemini AI tailored to your unique job description and seniority level." },
              { icon: "settings_voice", iconColor: "text-orange-400", bgColor: "bg-orange-500/10", title: "Voice Input", desc: "Answer naturally using your voice. Our speech-to-text captures nuances in your tone and delivery." },
              { icon: "analytics", iconColor: "text-red-400", bgColor: "bg-red-500/10", title: "Instant Feedback", desc: "Get detailed AI feedback and a confidence score for every answer. Learn exactly how to improve." },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl flex flex-col hover:border-blue-500/50 transition-colors group border border-slate-700/30"
                style={{ background: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(12px)" }}>
                <div className={`w-14 h-14 rounded-xl ${f.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined ${f.iconColor} text-3xl`}>{f.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>{f.title}</h3>
                <p className="text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 mt-20 py-20 border-y border-slate-800">
          <h2 className="text-4xl font-bold text-white text-center mb-16" style={{ fontFamily: "Space Grotesk" }}>How It Works</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Upload Resume", desc: "Our AI analyzes your experience to create personalized questions for your target role." },
              { step: "2", title: "Start Interview", desc: "Engage in a realistic mock interview with our conversational AI coach in real-time." },
              { step: "3", title: "Get Feedback", desc: "Receive a comprehensive report with scores, suggested answers, and areas for growth." },
            ].map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-blue-500 mx-auto flex items-center justify-center text-white font-bold text-xl mb-6 relative z-10">
                  {s.step}
                </div>
                {i < 2 && <div className="hidden lg:block absolute top-8 left-[60%] w-full border-t-2 border-dashed border-slate-700"></div>}
                <h4 className="text-xl font-semibold text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>{s.title}</h4>
                <p className="text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-6 mt-20">
          <div className="rounded-3xl p-12 text-center border border-blue-500/20 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(30,41,59,0.9))" }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 blur-[80px]"></div>
            <h2 className="text-4xl font-bold text-white mb-6 relative z-10" style={{ fontFamily: "Space Grotesk" }}>
              Ready to land your dream job?
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto relative z-10">
              Join thousands of candidates who improved their interview skills and secured offers at top companies.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              {isSignedIn ? (
                <button onClick={() => navigate("/interview/new")}
                  className="bg-blue-500 text-white font-semibold px-10 py-4 rounded-xl hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all">
                  Start Practicing
                </button>
              ) : (
                <SignUpButton>
                  <button className="bg-blue-500 text-white font-semibold px-10 py-4 rounded-xl hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all">
                    Get Started for Free
                  </button>
                </SignUpButton>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-8 py-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">psychology</span>
            <span className="text-lg font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>InterviewAI</span>
          </div>
          <div className="flex gap-8">
            <a href="#features" className="text-slate-500 hover:text-blue-400 transition-colors text-sm">Features</a>
            <a onClick={() => setModal("privacy")} className="text-slate-500 hover:text-blue-400 transition-colors text-sm cursor-pointer">Privacy</a>
            <a onClick={() => setModal("terms")} className="text-slate-500 hover:text-blue-400 transition-colors text-sm cursor-pointer">Terms</a>
          </div>
          <p className="text-slate-500 text-sm">© 2025 InterviewAI. All rights reserved.</p>
        </div>
      </footer>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setModal(null)}>
          <div className="bg-[#1d2027] border border-slate-700 rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white material-symbols-outlined"
            >
              close
            </button>

            {modal === "privacy" && (
              <>
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "Space Grotesk" }}>Privacy Policy</h2>
                <div className="flex flex-col gap-4 text-slate-400 text-sm leading-relaxed">
                  <p>Last updated: May 2026</p>
                  <h3 className="text-white font-semibold text-base">Information We Collect</h3>
                  <p>We collect information you provide directly — including your name, email address, and resume content — when you create an account or use our services.</p>
                  <h3 className="text-white font-semibold text-base">How We Use Your Information</h3>
                  <p>We use your information to generate personalized interview questions, provide AI feedback, and improve our services. Your resume data is processed securely and never shared with third parties.</p>
                  <h3 className="text-white font-semibold text-base">Data Storage</h3>
                  <p>Your interview history, answers, and feedback are stored securely in our database. You can request deletion of your data at any time by contacting us.</p>
                  <h3 className="text-white font-semibold text-base">Third-Party Services</h3>
                  <p>We use Groq AI for question generation and answer evaluation, Clerk for authentication, and Supabase for data storage. Each service has its own privacy policy.</p>
                  <h3 className="text-white font-semibold text-base">Contact</h3>
                  <p>For privacy-related questions, contact us at privacy@interviewai.app</p>
                </div>
              </>
            )}

            {modal === "terms" && (
              <>
                <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "Space Grotesk" }}>Terms of Service</h2>
                <div className="flex flex-col gap-4 text-slate-400 text-sm leading-relaxed">
                  <p>Last updated: May 2026</p>
                  <h3 className="text-white font-semibold text-base">Acceptance of Terms</h3>
                  <p>By accessing or using InterviewAI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
                  <h3 className="text-white font-semibold text-base">Use of Service</h3>
                  <p>InterviewAI is intended for personal interview practice only. You may not use our platform for commercial purposes, resale, or any unlawful activity.</p>
                  <h3 className="text-white font-semibold text-base">AI-Generated Content</h3>
                  <p>Interview questions and feedback are generated by AI and are for practice purposes only. They do not represent actual hiring decisions or guarantees of employment.</p>
                  <h3 className="text-white font-semibold text-base">Account Responsibility</h3>
                  <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                  <h3 className="text-white font-semibold text-base">Limitation of Liability</h3>
                  <p>InterviewAI is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of our services.</p>
                  <h3 className="text-white font-semibold text-base">Changes to Terms</h3>
                  <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the updated terms.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}