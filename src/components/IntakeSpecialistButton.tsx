import React, { useState, useRef, useEffect } from 'react';
import { HeartPulse, Send, X, Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const IntakeSpecialistButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hello! I am your AI Intake Specialist here at Display & Cell Pros. First of all, I want to say I completely understand how incredibly stressful it is when your device goes down and disrupts your day. Whether your screen is flickering, your battery isn't charging, or physical buttons are unresponsive, I am here to actively listen, support you, and map out the right diagnostic path.\n\nPlease tell me: What device are we working with, and what symptoms have you been observing?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    const userMsg: ChatMessage = {
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Map current React messages structure to API format
      const formattedMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/triage/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: formattedMessages,
          deviceDetails: {
            brand: 'Apple',
            model: 'iPhone'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: data.text || "Thank you for sharing that. I am processing the hardware diagnostics to help you find the absolute best path forward.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error("Failed to fetch triage intake:", error);
      // Fallback response with compassionate active-listening guidance
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: "I hear you completely. It sounds like a challenging hardware issue. Let's make sure we diagnose this carefully. Could you tell me a bit more about whether this began after a physical drop, liquid exposure, or if it started happening suddenly on its own?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Launch Button */}
      <button
        id="intake-specialist-button"
        className="flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-full hover:bg-teal-500 hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-teal-500/20 active:scale-95"
        onClick={() => setIsOpen(true)}
      >
        <HeartPulse className="w-5 h-5 mr-2 animate-pulse text-teal-200" />
        AI Intake Specialist
      </button>

      {/* Chat Dialog Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Chat Container */}
          <div className="bg-[#111111] border border-slate-800 rounded-2xl w-full max-w-lg h-[600px] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-900/30 to-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal-950 flex items-center justify-center border border-teal-500/30 shadow-inner">
                  <Bot className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">AI Intake Specialist</h3>
                  <p className="text-[11px] text-teal-400 font-mono tracking-wider uppercase">Active Listening & Hardware Diagnostics</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-850 transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[#111111] to-[#0a0a0a]">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                    m.role === 'user' 
                      ? 'bg-blue-950 border-blue-500/30 text-blue-400' 
                      : 'bg-teal-950 border-teal-500/30 text-teal-400'
                  }`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  <div className="space-y-1">
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                      m.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-900/40 to-blue-950/60 text-blue-100 border border-blue-900/30' 
                        : 'bg-gradient-to-r from-slate-900 to-slate-950 text-slate-100 border border-slate-850'
                    }`}>
                      {m.text}
                    </div>
                    <span className={`block text-[10px] text-slate-500 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="h-8 w-8 rounded-full bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-2xl px-4 py-3 text-sm text-slate-400 border border-slate-850 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                    <span>Actively listening and analyzing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-[#111111] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Tell me what's going on with your device..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-850 disabled:text-slate-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center min-w-[44px]"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
};
