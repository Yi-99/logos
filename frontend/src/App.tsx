import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './contexts/AuthContext'
import PhilosopherSelectionPage from './pages/PhilosopherSelectionPage'
import PhilosopherChatPage from './pages/PhilosopherChatPage'
import VoiceCallPage from './pages/VoiceCallPage'
import UserSettingsPage from './pages/UserSettingsPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
	const [theme, setTheme] = useState('light');

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <ToastContainer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/philosophers" element={<PhilosopherSelectionPage />} />
          <Route path="/chat/:philosopherId" element={<PhilosopherChatPage />} />
          <Route path="/voice/:philosopherId" element={<VoiceCallPage />} />
          <Route path="/settings" element={<UserSettingsPage />} />
        </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
