import React, { useState, useRef } from 'react';
import { Book, FileText, Headphones, Brain, GraduationCap, Layers, MessageSquare, Upload, Play, Pause, ChevronRight, X, Sparkles, FlipHorizontal, Send } from 'lucide-react';
import { generateStudyMaterials, generateAudioOverview, chatWithNotebook } from '../services/geminiService';

const Notebook: React.FC = () => {
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'INPUT' | 'OVERVIEW' | 'MINDMAP' | 'QUIZ' | 'FLASHCARDS' | 'CHAT'>('INPUT');
  const [isLoading, setIsLoading] = useState(false);
  const [studyData, setStudyData] = useState<any>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [showResults, setShowResults] = useState(false);

  // Flashcard State
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text);
      };
      reader.readAsText(file);
    }
  };

  const processContent = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    
    // Parallel execution for study data and audio
    try {
        const [materials, audioBase64] = await Promise.all([
            generateStudyMaterials(content),
            generateAudioOverview(content)
        ]);

        if (materials) setStudyData(materials);
        if (audioBase64) {
            // Fix base64 string for audio source
            const binaryString = atob(audioBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'audio/mp3' }); // Assuming MP3/PCM default wrapper usually works or raw PCM needs decode
            // Note: For Gemini TTS raw PCM, we usually need specific decoding, but standard audio elements often handle containerless mp3-like streams or we use a blob URL.
            // If raw PCM, a decoder is needed. The `generateAudioOverview` returns the raw data. 
            // For simplicity in this prototype, we'll try direct blob. If it fails, we assume valid mp3 return or needs the detailed decode logic from VoiceAssistant.
            // However, Gemini TTS usually returns MP3/WAV wrapped if not specified as raw PCM.
            // Let's assume standard behavior for `audio/mpeg`.
             const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
             setAudioSrc(URL.createObjectURL(audioBlob));
        }

        setActiveTab('OVERVIEW');
    } catch (e) {
        console.error(e);
        alert("Error processing content. Please try a shorter text.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleChat = async () => {
      if(!chatInput.trim()) return;
      const msg = chatInput;
      setChatInput('');
      setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
      
      const historyForApi = chatHistory.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
      }));

      const response = await chatWithNotebook(content, msg, historyForApi);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in pb-20">
      
      {/* Header / Nav */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <Book className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-slate-800">Smart Notebook</h2>
        </div>

        {studyData && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {[
                    { id: 'OVERVIEW', icon: Headphones, label: 'Overview' },
                    { id: 'MINDMAP', icon: Brain, label: 'Mind Map' },
                    { id: 'QUIZ', icon: GraduationCap, label: 'Quiz' },
                    { id: 'FLASHCARDS', icon: Layers, label: 'Cards' },
                    { id: 'CHAT', icon: MessageSquare, label: 'Tutor' },
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                            activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        
        {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
                <Sparkles className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-indigo-600 font-bold animate-pulse">Analyzing Content & Generating Study Aids...</p>
            </div>
        )}

        {/* INPUT MODE */}
        {activeTab === 'INPUT' && (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Upload or Paste Content</h3>
                <p className="text-slate-500 mb-8">
                    Upload a text file or paste your notes here. We'll generate audio summaries, mind maps, quizzes, and flashcards instantly.
                </p>

                <div className="w-full space-y-4">
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste your text here..."
                        className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none resize-none text-sm"
                    />
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 py-3 border-2 border-dashed border-indigo-200 text-indigo-500 font-bold rounded-xl hover:bg-indigo-50 transition"
                        >
                            Upload File (.txt)
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".txt"
                            onChange={handleFileUpload}
                        />

                        <button 
                            onClick={processContent}
                            disabled={!content.trim()}
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 transition"
                        >
                            Generate Notebook
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* OVERVIEW MODE */}
        {activeTab === 'OVERVIEW' && (
            <div className="p-8 flex flex-col items-center justify-center h-full">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-full shadow-2xl mb-8 relative">
                     <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-ping"></div>
                     <Headphones className="w-16 h-16 text-white relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Audio Overview</h3>
                <p className="text-slate-500 max-w-md text-center mb-8">
                    Listen to a concise, AI-generated podcast style summary of your material.
                </p>
                {audioSrc ? (
                    <audio controls src={audioSrc} className="w-full max-w-md shadow-lg rounded-full" />
                ) : (
                    <p className="text-red-400 text-sm">Audio generation failed or is processing.</p>
                )}
            </div>
        )}

        {/* MIND MAP MODE */}
        {activeTab === 'MINDMAP' && studyData && (
            <div className="p-6 h-full overflow-y-auto">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-pink-500" /> Structure Map
                </h3>
                <div className="space-y-4">
                    {studyData.mindMap.map((node: any, idx: number) => (
                        <div key={idx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                            <h4 className="font-bold text-indigo-700 text-lg mb-3">{node.label}</h4>
                            <div className="flex flex-wrap gap-2">
                                {node.children.map((child: string, cIdx: number) => (
                                    <span key={cIdx} className="px-3 py-1 bg-white border border-indigo-100 rounded-full text-sm text-slate-600 shadow-sm">
                                        {child}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* QUIZ MODE */}
        {activeTab === 'QUIZ' && studyData && (
            <div className="p-6 h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-green-500" /> Knowledge Check
                    </h3>
                    {!showResults && (
                        <button 
                            onClick={() => setShowResults(true)} 
                            className="text-sm font-bold text-indigo-600 hover:underline"
                        >
                            Submit Answers
                        </button>
                    )}
                    {showResults && (
                         <button 
                            onClick={() => { setShowResults(false); setQuizAnswers({}); }} 
                            className="text-sm font-bold text-slate-500 hover:underline"
                        >
                            Reset Quiz
                        </button>
                    )}
                </div>

                <div className="space-y-6 max-w-3xl mx-auto">
                    {studyData.quiz.map((q: any, idx: number) => (
                        <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-4 text-lg">
                                {idx + 1}. {q.question}
                            </h4>
                            <div className="space-y-2">
                                {q.options.map((opt: string, oIdx: number) => {
                                    const isSelected = quizAnswers[idx] === oIdx;
                                    const isCorrect = q.correctAnswer === oIdx;
                                    let btnClass = "border-slate-200 hover:bg-slate-50";
                                    
                                    if (showResults) {
                                        if (isCorrect) btnClass = "bg-green-100 border-green-300 text-green-800";
                                        else if (isSelected && !isCorrect) btnClass = "bg-red-100 border-red-300 text-red-800";
                                    } else if (isSelected) {
                                        btnClass = "bg-indigo-50 border-indigo-300 text-indigo-800 ring-1 ring-indigo-300";
                                    }

                                    return (
                                        <button
                                            key={oIdx}
                                            disabled={showResults}
                                            onClick={() => setQuizAnswers(prev => ({...prev, [idx]: oIdx}))}
                                            className={`w-full text-left p-3 rounded-xl border transition ${btnClass}`}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* FLASHCARDS MODE */}
        {activeTab === 'FLASHCARDS' && studyData && (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-50">
                <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full max-w-md aspect-video bg-white rounded-3xl shadow-xl border border-slate-200 cursor-pointer perspective-1000 relative group transition-transform hover:scale-[1.02]"
                >
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                {isFlipped ? 'Definition' : 'Term'}
                            </p>
                            <h3 className={`font-bold text-slate-800 ${isFlipped ? 'text-xl' : 'text-3xl'}`}>
                                {isFlipped ? studyData.flashcards[currentCard].definition : studyData.flashcards[currentCard].term}
                            </h3>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                        <FlipHorizontal className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition" />
                    </div>
                </div>

                <div className="flex items-center gap-6 mt-8">
                    <button 
                        onClick={() => {
                            setIsFlipped(false);
                            setCurrentCard(prev => Math.max(0, prev - 1));
                        }}
                        disabled={currentCard === 0}
                        className="p-3 rounded-full bg-white shadow-md disabled:opacity-50 hover:bg-slate-50 text-slate-700"
                    >
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <span className="font-bold text-slate-500">
                        {currentCard + 1} / {studyData.flashcards.length}
                    </span>
                    <button 
                        onClick={() => {
                            setIsFlipped(false);
                            setCurrentCard(prev => Math.min(studyData.flashcards.length - 1, prev + 1));
                        }}
                        disabled={currentCard === studyData.flashcards.length - 1}
                        className="p-3 rounded-full bg-white shadow-md disabled:opacity-50 hover:bg-slate-50 text-slate-700"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        )}

        {/* CHAT MODE */}
        {activeTab === 'CHAT' && (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {chatHistory.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            <p>Ask anything about your notes!</p>
                        </div>
                    )}
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <input 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        placeholder="Ask about your content..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={handleChat} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Notebook;