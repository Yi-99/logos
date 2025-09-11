import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './contexts/AuthContext'
import PhilosopherSelectionPage from './pages/PhilosopherSelectionPage'
import PhilosopherChatPage from './pages/PhilosopherChatPage'
import VoiceCallPage from './pages/VoiceCallPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <ToastContainer />
          <Routes>
            <Route path="/" element={<PhilosopherSelectionPage />} />
            <Route path="/chat/:philosopherId" element={<PhilosopherChatPage />} />
            <Route path="/voice/:philosopherId" element={<VoiceCallPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
