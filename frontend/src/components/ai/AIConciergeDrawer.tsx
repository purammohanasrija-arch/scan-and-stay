import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Mic, MicOff, X, Bot, User, ArrowRight,
  HelpCircle, ShieldCheck, MapPin, Building2
} from 'lucide-react';
import { api } from '../../services/api';

interface AIConciergeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToHotel?: (hotelId: number) => void;
}

interface Message {
  role: 'bot' | 'user';
  text: string;
  suggestedActions?: string[];
  recommendedHotels?: number[];
  timestamp: string;
}

export const AIConciergeDrawer: React.FC<AIConciergeDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToHotel,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: "👋 Hi! I am **StayBot**, your AI Concierge at Scan & Stay. I can recommend luxury hotels, explain our 5-second QR check-in, or assist with your in-room stay requests. How can I help you today?",
      suggestedActions: ["🏖️ Beach Resorts in Goa", "👑 Royal Havelis Jaipur", "📱 How QR Pass Works", "💰 Budget Deals Under ₹4000"],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const userMsg: Message = {
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.chatWithAI(query);
      const botMsg: Message = {
        role: 'bot',
        text: res.reply,
        suggestedActions: res.suggested_actions,
        recommendedHotels: res.recommended_hotels,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: "I'm having a slight hiccup connecting to the intelligence server, but you can explore all hotels directly in the Explore section!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Voice Input (Web Speech API)
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSendMessage(transcript);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-md shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">StayBot AI Concierge</h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Powered by LangChain & Smart NLP</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-teal-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-2.5'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(action)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-teal-300 transition-colors text-left"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                {/* Hotel Deep Links */}
                {msg.recommendedHotels && msg.recommendedHotels.length > 0 && onNavigateToHotel && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onNavigateToHotel(msg.recommendedHotels![0])}
                      className="w-full py-1.5 px-3 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-semibold text-[11px] border border-teal-500/30 transition-all flex items-center justify-between"
                    >
                      <span>View Recommended Hotel</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className={`text-[9px] ${msg.role === 'user' ? 'text-slate-800' : 'text-slate-500'} text-right`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening to voice...' : 'Ask StayBot about hotels, QR key...'}
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  isListening ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-800 focus:border-teal-500'
                }`}
              />
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                  isListening ? 'text-amber-400 animate-pulse' : 'text-slate-400 hover:text-teal-400'
                }`}
                title="Voice Input"
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
