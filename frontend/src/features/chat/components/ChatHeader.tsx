import type { User } from "../../../shared/types/User";
import { getInitials } from "../../../utils/string_utils";

interface ChatHeaderProps {
  user: User;
  encryptionMethod: 'RSA' | 'ML-KEM';
  onToggleEncryption: () => void;
  messageMode: 'Encrypted' | 'Normal';
  onToggleMessageMode: () => void;
}

export default function ChatHeader({ user, encryptionMethod, onToggleEncryption, messageMode, onToggleMessageMode }: ChatHeaderProps) {
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/10 backdrop-blur-md">
      {/* User Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center font-bold text-lg text-white">
          {getInitials(user.username)}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-teal-100">{user.username}</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <p className="text-sm text-teal-200/70">Online</p>
          </div>
        </div>
      </div>
      
      {/* Encryption Method Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-teal-200/70 font-medium mb-2">Encryption</span>
          <button
            onClick={onToggleEncryption}
            className={`w-16 h-8 rounded-full p-1 transition-all duration-300 ${
              encryptionMethod === 'ML-KEM' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : 'bg-gradient-to-r from-teal-500 to-blue-500'
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
              encryptionMethod === 'ML-KEM' ? 'translate-x-8' : 'translate-x-0'
            }`}></div>
          </button>
          <div className="text-center mt-2">
            <span className={`text-xs font-semibold ${
              encryptionMethod === 'ML-KEM' ? 'text-purple-300' : 'text-teal-300'
            }`}>
              {encryptionMethod}
            </span>
          </div>
        </div>
        
        {/* Encrypted/Normal Toggle (independent of ML-KEM/RSA) */}
        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1 border border-white/10">
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              messageMode === 'Encrypted'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-teal-200/80 hover:bg-white/10'
            }`}
            onClick={() => {
              if (messageMode !== 'Encrypted') onToggleMessageMode()
            }}
          >
            Encrypted
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              messageMode === 'Normal'
                ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                : 'text-teal-200/80 hover:bg-white/10'
            }`}
            onClick={() => {
              if (messageMode !== 'Normal') onToggleMessageMode()
            }}
          >
            Normal
          </button>
        </div>
      </div>
    </div>
  );
}
