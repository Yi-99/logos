import './App.css'
import SideBar from './SideBar'
import ChatPage from './pages/ChatPage'
import { ToastContainer } from 'react-toastify';

function App() {
  return (
		<div className="flex flex-row">
			<ToastContainer />
			<SideBar />
			<div className="flex flex-col w-full h-screen p-10">
				<ChatPage />
			</div>
		</div>
  )
}

export default App
