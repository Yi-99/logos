import './App.css'
import ChatPage from './pages/ChatPage'
import HomePage from './pages/HomePage';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { useState, createContext } from 'react';
import { ToastContainer } from 'react-toastify';
import SideBar from './SideBar'

export const UserContext = createContext({});

function App() {
	const [theme, setTheme] = useState('light');

  return (
		<>
			<UserContext.Provider value={{ theme, setTheme }}>
				<BrowserRouter>
					<ToastContainer />
					<SideBar />
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/chat" element={<ChatPage />} />
					</Routes>
				</BrowserRouter>
			</UserContext.Provider>
		</>
  )
}

export default App
