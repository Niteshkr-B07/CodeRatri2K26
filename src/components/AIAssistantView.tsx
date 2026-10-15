import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { askGuardianAI } from '../services/gemini';
import { GeoPoint } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
}

interface AIAssistantViewProps {
  currentLocation: GeoPoint;
  onOpenSOS: () => void;
}

const QUICK_PROMPTS = [
  'Checklist for walking home alone late at night',
  'How to verify an auto-rickshaw or cab at night',
  'What should I do if I feel someone is following me?',
  'Explain how the SafeTrip route safety score works',
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  currentLocation,
  onOpenSOS,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am Guardian AI, your travel safety guide. I provide calm, practical tips on route preparation, situational awareness, and transit verification. How can I help you travel safely today?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputValue('');
    setIsLoading(true);

    // Call server AI proxy
    const context = `Near ${currentLocation.address || 'User GPS Point'}. Time: ${new Date().toLocaleTimeString()}`;
    const result = await askGuardianAI(textToSend, context);

    const aiMsg: Message = {
      id: 'ai-' + Date.now(),
      sender: 'ai',
      text: result.reply,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-xs">
      {/* Assistant Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm">Guardian AI</span>
              <span className="text-[10px] text-indigo-400 bg-indigo-950 px-1.5 py-0.2 rounded font-mono">
                Gemini 2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Advisory Travel Guidance & Safety Tips</p>
          </div>
        </div>

        <button
          onClick={onOpenSOS}
          className="touch-target px-2.5 py-1 text-[11px] font-bold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 rounded-lg flex items-center gap-1 transition-colors"
        >
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>Need Help? SOS</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${
                msg.sender === 'user'
                  ? 'bg-indigo-600'
                  : 'bg-slate-800 border border-slate-700 text-indigo-400'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3 leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Consulting safety protocols...</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1" />
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about travel safety, cab verification, or route tips..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputValue.trim()}
          className="touch-target p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-md transition-colors cursor-pointer shrink-0"
          aria-label="Send query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Non-alarmist reminder */}
      <div className="px-3 py-1 bg-slate-950 text-[10px] text-slate-500 text-center border-t border-slate-900">
        Guardian AI output is advisory. In immediate danger, call 112 or use the SOS trigger.
      </div>
    </div>
  );
};
