import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToConstruct } from '../services/geminiService';

const Simulacrum: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'CONSTRUCT',
      text: "А ты... ты ещё кто?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Use a ref for the container instead of a dummy div at the end to prevent window scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.sender === 'USER' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Call Gemini
    const responseText = await sendMessageToConstruct(history, newMsg.text);

    const constructMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'CONSTRUCT',
      text: responseText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, constructMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black/80 border-l border-yellow-400/20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-yellow-400 flex items-center justify-between bg-yellow-900/10">
        <div className="flex items-center gap-2">
          <Cpu className="text-yellow-400 w-5 h-5 animate-pulse" />
          <h2 className="text-sm md:text-xl font-bold tracking-widest text-yellow-400 uppercase truncate max-w-[200px] md:max-w-none">ДЖОННИ_СИЛЬВЕРХЕНД // КОНСТРУКТ</h2>
        </div>
        <div className="text-xs text-red-500 flex items-center gap-1 whitespace-nowrap">
          <AlertTriangle size={12} />
          НЕСТАБИЛЬНОЕ СОЕДИНЕНИЕ
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth pb-20 md:pb-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'USER' ? 'items-end' : 'items-start'
            }`}
          >
            <div className={`max-w-[85%] md:max-w-[80%] p-3 border ${
              msg.sender === 'USER'
                ? 'border-cyan-500 bg-cyan-950/30 text-cyan-100 rounded-tl-lg rounded-bl-lg rounded-br-lg shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                : 'border-yellow-400 bg-yellow-950/30 text-yellow-100 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-[0_0_10px_rgba(252,238,10,0.1)]'
            }`}>
              <div className="text-[10px] opacity-50 mb-1 flex justify-between gap-4">
                 <span>{msg.sender === 'USER' ? 'НЕТРАННЕР' : 'ДЖ. СИЛЬВЕРХЕНД'}</span>
                 <span>{msg.timestamp}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex items-start">
             <div className="p-3 border border-yellow-400/50 bg-yellow-950/10 text-yellow-400 text-xs animate-pulse flex items-center gap-2">
               <Cpu size={14} className="animate-spin" />
               <span>КОНСТРУКТ ОБРАБАТЫВАЕТ ДАННЫЕ...</span>
             </div>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-yellow-400/30 bg-black">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold hidden md:inline">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Введите команду..."
            className="flex-1 bg-transparent border-b border-yellow-400/50 text-yellow-100 focus:outline-none focus:border-yellow-400 font-mono py-2 placeholder-yellow-900 text-sm md:text-base"
          />
          <button
            onClick={handleSend}
            className="p-2 hover:bg-yellow-400/20 text-yellow-400 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Simulacrum;