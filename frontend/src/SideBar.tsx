import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

const SideBar = () => {

  return (
    <>
        <aside className="w-64 bg-neutral-100 overflow-y-auto p-4 h-screen">
          <button className="cursor-pointer transition-all hover:scale-110 hover:!border-black mb-2">
            <MenuIcon />
          </button>
            <div className="flex gap-4 justify-center items-center">
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
              <button className="flex gap-2 ursor-pointer transition-all hover:scale-110">
                <SettingsIcon />
                Settings
              </button>
            </div>
            
        </aside>
    </>
  )   
}

export default SideBar;
