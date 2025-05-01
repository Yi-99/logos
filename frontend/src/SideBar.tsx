import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

const SideBar = () => {
  const [isOpen, setisOpen] = useState(false);

  const ToggleSideBar = () => {
    setisOpen(!isOpen);
  }

  return (
    <>
      <aside className="w-12 bg-neutral-100 p-4 h-screen flex justify-center items-start">
        <button onClick={ToggleSideBar} className="cursor-pointer transition-all hover:scale-110">
          <MenuIcon />
        </button>
      </aside>

      <aside className={`transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'} bg-neutral-100 h-screen overflow-y-auto`}>
        <div className="flex gap-4 justify-end items-center mt-4 mr-4">
          <button className="cursor-pointer transition-all hover:scale-110">
            <SearchIcon />
          </button>
          <button className="cursor-pointer transition-all hover:scale-110">
            <OpenInNewIcon />
          </button>
        </div>
        
        <h3 className="font-bold mt-6 flex justify-start">Recent</h3>
        <div className="">
        </div>
        
        <div className="flex flex-col items-start font-bold gap-2 mt-6">
          <button className="flex gap-2 cursor-pointer transition-all hover:scale-110">
            <HistoryIcon />
            Activity
          </button>
          <button className="flex gap-2 cursor-pointer transition-all hover:scale-110">
            <SettingsIcon />
            Settings
          </button>
        </div>   
      </aside>
    </>
  )   
}

export default SideBar;
