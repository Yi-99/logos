import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './contexts/AuthContext'
import PhilosopherSelectionPage from './pages/PhilosopherSelectionPage'
import PhilosopherChatPage from './pages/PhilosopherChatPage'
import ChatListPage from './pages/ChatListPage'
import VoiceCallPage from './pages/VoiceCallPage'
import UserSettingsPage from './pages/UserSettingsPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import GlobalNavigation from './components/GlobalNavigation'
import ScrollToTop from './components/ScrollToTop'
import { useAuth } from './contexts/AuthContext'

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />
      <ScrollToTop />
      {!isAuthenticated && <GlobalNavigation />}
      <div className={!isAuthenticated ? "pt-24" : ""}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/philosophers" element={<PhilosopherSelectionPage />} />
          <Route path="/chats" element={<ChatListPage />} />
          <Route path="/chat/new/:philosopherId" element={<PhilosopherChatPage />} />
          <Route path="/chat/:chatId" element={<PhilosopherChatPage />} />
          <Route path="/voice/:philosopherId" element={<VoiceCallPage />} />
          <Route path="/settings" element={<UserSettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
