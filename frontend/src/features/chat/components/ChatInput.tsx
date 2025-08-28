import type { FormEvent } from 'react';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <div className="px-6 py-4 bg-black/10 backdrop-blur-md border-t border-white/10">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Emoji Button */}
        <button 
          type="button" 
          className="p-3 text-teal-200/70 hover:text-amber-300 hover:bg-amber-500/10 rounded-full transition-colors group"
          title="Emoji"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            className="w-full px-4 py-3 bg-white/10 text-white placeholder-teal-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:bg-white/20 transition-all border border-white/10"
            placeholder="Type your message here..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
        
        {/* Send Button */}
        <button
          type="submit"
          className={`p-3 rounded-full transition-all ${
            text.trim() 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl' 
              : 'bg-white/20 text-teal-200/50 cursor-not-allowed'
          }`}
          disabled={!text.trim()}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
} 