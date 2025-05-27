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
    <form onSubmit={handleSubmit} className="flex items-center px-6 py-4 bg-white border-t border-gray-200">
      <button type="button" className="mr-2 text-gray-400 hover:text-gray-600">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <input
        type="text"
        className="flex-1 px-4 py-2 rounded bg-gray-100 focus:outline-none"
        placeholder="Type your message"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        type="submit"
        className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold transition"
      >
        Send
      </button>
    </form>
  );
} 