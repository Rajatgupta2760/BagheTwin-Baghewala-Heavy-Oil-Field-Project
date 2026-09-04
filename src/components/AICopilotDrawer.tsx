import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Flame, 
  ShieldCheck, 
  HelpCircle,
  Activity
} from 'lucide-react';
import { Well, AIChatMessage } from '../types';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWell: Well;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  selectedWell,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `Hello! I am your **BagheTwin Petroleum AI Copilot**, specialized in heavy-oil geology, Cyclic Steam Stimulation (CSS), and Sucker Rod Pumping (SRP) dynamics of **Baghewala Field** (Jodhpur Sandstone). 

I am currently linked to **${selectedWell.name} (${selectedWell.id})**. How can I assist with your well surveillance, dynacard diagnostics, or closed-loop setpoints today?`,
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const quickPrompts = [
    `Why is ${selectedWell.id} experiencing elevated rod drag?`,
    `Explain the joint CSS-SRP optimization rationale`,
    `When should we execute cycle cut-off for ${selectedWell.id}?`,
    `How does reducing SPM increase volumetric pump fillage?`,
  ];

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text,
      wellReference: selectedWell.id,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          wellId: selectedWell.id,
        }),
      });

      const data = await response.json();
      const assistantMsg: AIChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: data.answer || 'Unable to retrieve answer from AI service.',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg: AIChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Error connecting to Petroleum AI Advisor endpoint. Fallback: For ${selectedWell.name}, near-wellbore temperature is ${selectedWell.reservoir.nearWellboreTemp_c}°C with effective viscosity of ${selectedWell.reservoir.effectiveViscosity_cp} cP. Recommend verifying VFD frequency is aligned with downstroke tension limits.`,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Gemini Petroleum AI Copilot
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  ONLINE
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                Field Advisory • Context: {selectedWell.id} ({selectedWell.stage})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompts Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 overflow-x-auto flex gap-1.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50 shadow-xs font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0 text-orange-600 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-orange-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <div className={`flex items-center justify-between text-[10px] pb-1 border-b ${
                  msg.sender === 'user' ? 'border-white/20 text-orange-100' : 'border-slate-100 text-slate-400'
                }`}>
                  <span className="font-bold">{msg.sender === 'user' ? 'Operator' : 'Petroleum Copilot'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                
                {/* Message Body */}
                <div className="text-xs whitespace-pre-wrap leading-relaxed space-y-1">
                  {msg.content}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-7 h-7 rounded-lg bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0 text-orange-600">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white text-slate-600 border border-slate-200 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
                Analyzing telemetry & thermodynamics...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask about ${selectedWell.id} thermodynamics, dynacard, or setpoints...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all disabled:opacity-40 cursor-pointer flex-shrink-0 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
