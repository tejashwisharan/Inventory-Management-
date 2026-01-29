import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { getInventoryAnalysis } from '../services/geminiService';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AIAdvisorProps {
  products: Product[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ products }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I'm your Inventory Intelligence Agent. I have access to your full SKU catalog, stock levels, and valuation data. How can I help you optimize your inventory today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Gemini Service
    const aiResponseText = await getInventoryAnalysis(products, userMsg.text);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
         <div className="flex items-center space-x-3">
             <div className="bg-indigo-600 p-2 rounded-lg">
                 <Bot className="text-white" size={20} />
             </div>
             <div>
                 <h2 className="font-bold text-slate-800">Inventory Assistant</h2>
                 <p className="text-xs text-slate-500">Powered by Gemini 3 Flash</p>
             </div>
         </div>
         <div className="text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
             Context: {products.length} SKUs loaded
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
               <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-500 ml-2' : 'bg-indigo-600 mr-2'}`}>
                  {msg.sender === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
               </div>
               <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                   msg.sender === 'user' 
                   ? 'bg-blue-500 text-white rounded-tr-none' 
                   : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
               }`}>
                  <div className="markdown-body whitespace-pre-wrap">{msg.text}</div>
                  <div className={`text-[10px] mt-2 ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
               </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
               <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none ml-10 shadow-sm">
                   <div className="flex space-x-1">
                       <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                       <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                   </div>
               </div>
           </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about high value items, overstock, or forecasting..."
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send size={18} />
            </button>
        </div>
        <p className="text-xs text-center text-slate-400 mt-2">
            AI can make mistakes. Verify critical inventory decisions.
        </p>
      </div>
    </div>
  );
};
