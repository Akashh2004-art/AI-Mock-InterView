# InterviewAI — Frontend

> AI-powered mock interview platform. Practice for your dream job with real-time speech recognition, instant AI feedback, and performance tracking.

🌐 **Live:** [ai-mock-inter-view.vercel.app](https://ai-mock-inter-view.vercel.app)

---

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Framer Motion**
- **Clerk** — Authentication
- **Recharts** — Score trend charts
- **Deployed on Vercel**

---

## Features

- 🎤 Real-time speech-to-text answer recording
- 📄 Resume-based interview generation (PDF upload)
- 📊 Score trend charts and performance dashboard
- 🤖 Per-question AI feedback and insights
- 💾 Resume cached locally for 30 days (IndexedDB)
- 📱 Fully responsive — mobile + desktop

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.dev) account
- Backend server running (see [AI-Mock-InterView-Server](https://github.com/Akashh2004-art/AI-Mock-InterView-Server))

### Installation

```bash
# Clone the repo
git clone https://github.com/Akashh2004-art/AI-Mock-InterView.git
cd AI-Mock-InterView/Frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the `Frontend/` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000
```

> For production, set `VITE_API_URL` to your deployed backend URL.

### Run Locally

```bash
npm run dev
```

App will be running at `http://localhost:5173`

---

## Project Structure

```
Frontend/src/
├── components/ui/       # Reusable UI components (Badge, Card, GlowingEffect, Skeleton)
├── layouts/             # RootLayout with Clerk provider
├── lib/                 # Utilities (resumeCache, utils)
└── pages/
    ├── LandingPage.tsx
    ├── DashboardPage.tsx
    ├── NewInterviewPage.tsx
    ├── InterviewPage.tsx
    ├── FeedbackPage.tsx
    ├── HistoryPage.tsx
    ├── InsightsPage.tsx
    └── SettingsPage.tsx
```

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `Frontend`
4. Add environment variables in Vercel dashboard:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` → your Render backend URL

---

## Related

- 🖥️ **Backend Repo:** [AI-Mock-InterView-Server](https://github.com/Akashh2004-art/AI-Mock-InterView-Server)
