import React, { useState } from 'react';
import { Briefcase, MessageSquare, Search, Send, Bot, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getJobAdvice, getGigOpportunities } from '../services/geminiService';
import { User } from '../types';

interface Props {
  user: User;
}

const JobAssistant: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'FIND' | 'SUPPORT'>('FIND');
  
  // Support Chat State
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: `Hi ${user.fullName.split(' ')[0]}. I'm your Job Support Specialist. I can help you resolve disputes with platforms, write appeals for bans, or improve your profile. How can I assist?` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Job Search State
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [oppLoading, setOppLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    const historyForGemini = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const response = await getJobAdvice(user.job || 'Gig Worker', userMsg, historyForGemini);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setChatLoading(false);
  };

  const handleFindJobs = async () => {
    setOppLoading(true);
    setSearched(true);
    const results = await getGigOpportunities(user.job || 'General Gig Worker');
    setOpportunities(results);
    setOppLoading(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 p-6 rounded-3xl shadow-lg text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6" /> Job Assistant
          </h2>
          <p className="text-orange-50 font-medium opacity-90">Find work & resolve platform issues.</p>
        </div>
        <div className="bg-white/20 p-2 rounded-xl">
            <Briefcase className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-orange-100 w-full md:w-fit">
        <button
          onClick={() => setActiveTab('FIND')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'FIND' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'text-slate-500 hover:text-orange-500 hover:bg-orange-50'
          }`}
        >
          <Search className="w-4 h-4" /> Find Work
        </button>
        <button
          onClick={() => setActiveTab('SUPPORT')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'SUPPORT' 
              ? 'bg-orange-500 text-white shadow-md' 
              : 'text-slate-500 hover:text-orange-500 hover:bg-orange-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Issue Support
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* FIND WORK TAB */}
        {activeTab === 'FIND' && (
            <div className="h-full overflow-y-auto pr-2 animate-fade-in pb-20">
                {!searched ? (
                     <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border border-dashed border-orange-200 text-center p-8">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-8 h-8 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Discover New Opportunities</h3>
                        <p className="text-slate-500 max-w-sm mb-8">
                            Based on your profile as a <span className="font-semibold text-orange-500">{user.job}</span>, 
                            we can find high-paying gigs and platforms for you.
                        </p>
                        <button 
                            onClick={handleFindJobs}
                            disabled={oppLoading}
                            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition flex items-center gap-2"
                        >
                            {oppLoading ? 'Scanning...' : 'Scan for Jobs'} <Search className="w-4 h-4" />
                        </button>
                     </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-700">Recommended for you</h3>
                            <button onClick={handleFindJobs} className="text-orange-500 text-sm font-semibold hover:underline">Refresh</button>
                        </div>
                        
                        {oppLoading ? (
                             <div className="space-y-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse h-40"></div>
                                ))}
                             </div>
                        ) : (
                             opportunities.map((job, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition group animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition">{job.title}</h4>
                                            <p className="text-sm text-slate-500 font-semibold">{job.platform}</p>
                                        </div>
                                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" /> {job.income}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{job.description}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {job.requirements?.split(',').map((req: string, i: number) => (
                                            <span key={i} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100">
                                                {req.trim()}
                                            </span>
                                        ))}
                                    </div>

                                    <button className="w-full py-2.5 rounded-xl border-2 border-orange-500 text-orange-600 font-bold hover:bg-orange-500 hover:text-white transition text-sm">
                                        View Details & Apply
                                    </button>
                                </div>
                             ))
                        )}
                        {!oppLoading && opportunities.length === 0 && (
                            <p className="text-center text-slate-400 py-10">No jobs found. Try refreshing.</p>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* SUPPORT TAB */}
        {activeTab === 'SUPPORT' && (
            <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[400px] animate-fade-in">
                <div className="bg-orange-50 p-4 border-b border-orange-100 flex items-center gap-3">
                    <div className="bg-orange-500 p-2 rounded-full text-white">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Dispute & Application AI</h3>
                        <p className="text-xs text-slate-500">Ask about bans, appeals, or resume tips.</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-orange-500 text-white rounded-br-none' 
                                : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="flex justify-start">
                             <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                            placeholder="e.g., How do I appeal a ban on Uber?"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition text-slate-700 text-sm"
                        />
                        <button 
                            onClick={handleSendChat}
                            disabled={chatLoading || !chatInput.trim()}
                            className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 disabled:opacity-50 transition shadow-lg shadow-orange-200"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default JobAssistant;