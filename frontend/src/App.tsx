import { useState } from 'react'
import './App.css'
import SideBar from './SideBar'
import Advisor from './Advisor'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex">
          <SideBar />
          <Advisor/>
      </div>
    </>
  )
}

export default App
