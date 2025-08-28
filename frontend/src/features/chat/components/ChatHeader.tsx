import type { User } from "../../../shared/types/User";
import { getInitials } from "../../../utils/string_utils";

interface ChatHeaderProps {
  user: User;
  encryptionMethod: 'RSA' | 'ML-KEM';
  onToggleEncryption: () => void;
}

export default function ChatHeader({ user, encryptionMethod, onToggleEncryption }: ChatHeaderProps) {
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
        
        {/* Action Buttons */}
        <button className="p-2 text-teal-200/70 hover:text-teal-200 hover:bg-white/10 rounded-lg transition-colors group">
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        
        <button className="p-2 text-teal-200/70 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors group">
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        
        <button className="p-2 text-teal-200/70 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors group">
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
