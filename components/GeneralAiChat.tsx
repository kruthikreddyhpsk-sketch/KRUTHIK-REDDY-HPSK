import React, { useState } from 'react';
import { Send, Image as ImageIcon, Sparkles, Bot } from 'lucide-react';
import { generalAiChat, generateProImage } from '../services/geminiService';

const GeneralAiChat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text?: string, image?: string }[]>([
    { role: 'model', text: "Hello! I'm ProEffist AI. You can ask me anything or ask me to 'generate an image' of something." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const lowerMsg = userMsg.toLowerCase();
    
    // Simple intent detection for image generation
    if (lowerMsg.startsWith('generate image') || lowerMsg.startsWith('create an image') || lowerMsg.startsWith('draw')) {
        const imageBase64 = await generateProImage(userMsg);
        if (imageBase64) {
            setMessages(prev => [...prev, { role: 'model', image: imageBase64 }]);
        } else {
            setMessages(prev => [...prev, { role: 'model', text: "I tried to generate that image but something went wrong. Please try a different prompt." }]);
        }
    } else {
        // Standard Text Chat
        const history = messages.filter(m => m.text).map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        const response = await generalAiChat(userMsg, history);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
    }
    
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-slide-up pb-20 md:pb-0">
       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-3xl shadow-lg text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300" /> ProEffist AI
          </h2>
          <p className="text-blue-100 font-medium opacity-90">Chat, Ask, and Create Images.</p>
        </div>
        <Bot className="w-10 h-10 text-white opacity-50" />
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
             {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.image ? (
                        <div className="max-w-[80%]">
                             <img src={msg.image} alt="Generated" className="rounded-2xl shadow-lg border border-slate-200" />
                             <p className="text-xs text-slate-400 mt-2 ml-1">Generated with Gemini 3 Pro</p>
                        </div>
                    ) : (
                        <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    )}
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                     <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-2 items-center">
                        <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="text-slate-500 text-xs font-bold">Thinking...</span>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
             <div className="flex gap-2 relative">
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask anything or type 'Generate image of...'"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 transition shadow-inner"
                />
                <button 
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white w-12 rounded-full hover:bg-blue-700 transition flex items-center justify-center shadow-md disabled:opacity-70 disabled:shadow-none"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2">
                Powered by ProEffist AI (Gemini Models)
            </p>
        </div>
      </div>
    </div>
  );
};

export default GeneralAiChat;