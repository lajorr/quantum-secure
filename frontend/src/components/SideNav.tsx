import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
// import SmartDisplayIcon from "@mui/icons-material/SmartDisplay";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation, useNavigate } from "react-router-dom";
import { useChat } from "../features/chat/context/ChatContext";
import { useAuth } from "../features/auth/context/AuthContext";
import { getInitials } from "../utils/string_utils";

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isChats = location.pathname === "/";
  const isSettings = location.pathname.startsWith("/settings");
  const isProfile = location.pathname.startsWith("/profile");
  const { currentUser } = useChat();
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="w-20 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-6">
      <div className={`relative mb-8 cursor-pointer ${isProfile ? 'ring-2 ring-purple-400/70 rounded-full ring-offset-2 ring-offset-black/20' : ''}`} onClick={() => navigate('/profile')}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg ${isProfile ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-pink-400 to-purple-500'}`}>
          {currentUser ? getInitials(currentUser.username) : "?"}
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black/20"></div>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
            isChats
              ? 'bg-gradient-to-br from-teal-400 to-purple-500 border-teal-300 shadow-lg'
              : 'bg-gradient-to-br from-teal-400/40 to-purple-500/40 border-teal-400/50'
          }`}
          onClick={() => navigate('/')}
        >
          <ChatBubbleOutlineIcon style={{ fontSize: 20 }} className={isChats ? 'text-white' : 'text-teal-200'} />
        </div>
        
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
            isSettings ? 'bg-purple-500/30 border border-purple-300/60 shadow-md' : 'bg-white/10 hover:bg-purple-500/20'
          }`}
          onClick={() => navigate('/settings')}
        >
          <SettingsIcon style={{ fontSize: 20 }} className={isSettings ? 'text-purple-200' : 'text-white group-hover:text-purple-300 transition-colors'} />
        </div>
      </div>

      <div className="mt-auto">
        <div 
          className="w-10 h-10 bg-white/10 hover:bg-red-500/30 rounded-full flex items-center justify-center cursor-pointer transition-all"
          onClick={handleLogout}
        >
          <LogoutIcon style={{ fontSize: 20 }} className="text-white" />
        </div>
      </div>
    </div>
  );
}


