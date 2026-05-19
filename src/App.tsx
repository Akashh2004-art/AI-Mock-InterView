import { BrowserRouter, Routes, Route } from "react-router-dom"
import RootLayout from "@/layouts/RootLayout"
import LandingPage from "@/pages/LandingPage"
import DashboardPage from "@/pages/DashboardPage"
import NewInterviewPage from "@/pages/NewInterviewPage"
import InterviewPage from "@/pages/InterviewPage"
import FeedbackPage from "@/pages/FeedbackPage"
import HistoryPage from "@/pages/HistoryPage"
import InsightsPage from "@/pages/InsightsPage"
import SettingsPage from "@/pages/SettingsPage"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/interview/new" element={<NewInterviewPage />} />
          <Route path="/interview/:id" element={<InterviewPage />} />
          <Route path="/interview/:id/feedback" element={<FeedbackPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App