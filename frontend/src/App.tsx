import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import PhilosopherSelectionPage from './pages/PhilosopherSelectionPage'
import PhilosopherChatPage from './pages/PhilosopherChatPage'
import VoiceCallPage from './pages/VoiceCallPage'

function App() {
  return (
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
  )
}

export default App
