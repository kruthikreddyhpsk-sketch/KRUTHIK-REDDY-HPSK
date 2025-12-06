import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, Bot, Clock, Camera, Image as ImageIcon, X, Aperture } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { getHealthAdvice, analyzeHealthImage } from '../services/geminiService';
import { User as UserType } from '../types';

interface Props {
  user: UserType;
}

const HealthCoach: React.FC<Props> = ({ user }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string, image?: string }[]>([
    { role: 'model', text: `Hello ${user.fullName}! I'm your Health Coach. Since you work as a ${user.job}, I can help you manage stress and physical health. What's bothering you today?` }
  ]);
  const [input, setInput] = useState('');
  const [schedule, setSchedule] = useState('9 AM to 5 PM');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Mock Health Data
  const healthData = [
    { day: 'Mon', score: 85 },
    { day: 'Tue', score: 82 },
    { day: 'Wed', score: 75 },
    { day: 'Thu', score: 60 },
    { day: 'Fri', score: 78 },
    { day: 'Sat', score: 90 },
    { day: 'Sun', score: 88 },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      // Wait for render to attach ref
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please ensure you have granted permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    
    const userMsg = input;
    const imageToSend = selectedImage;

    // Reset input states immediately
    setInput('');
    setSelectedImage(null);
    setMessages(prev => [...prev, { role: 'user', text: userMsg, image: imageToSend || undefined }]);
    setLoading(true);

    let response = '';

    if (imageToSend) {
       // Extract base64 content
       const base64Data = imageToSend.split(',')[1];
       const mimeType = imageToSend.split(';')[0].split(':')[1];
       response = await analyzeHealthImage(base64Data, mimeType, userMsg);
    } else {
        const historyForGemini = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        response = await getHealthAdvice(user.job || 'Worker', schedule, userMsg, historyForGemini);
    }
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="space-y-6 relative">
      {/* Camera Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center">
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={stopCamera}
              className="bg-gray-800/50 text-white p-3 rounded-full hover:bg-gray-700 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="w-full max-w-md bg-black relative rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               className="w-full h-full object-cover"
             />
             {/* Guide Frame */}
             <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-lg pointer-events-none">
                 <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sky-400"></div>
                 <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-sky-400"></div>
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-sky-400"></div>
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sky-400"></div>
             </div>
          </div>

          <div className="mt-8">
             <button 
               onClick={capturePhoto}
               className="w-20 h-20 rounded-full bg-white border-4 border-sky-200 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
             >
               <div className="w-16 h-16 rounded-full bg-sky-500 border-2 border-white"></div>
             </button>
          </div>
          <p className="text-white/70 mt-4 text-sm font-medium">Point at an injury, medicine, or meal</p>
        </div>
      )}

      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Graph */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-sky-100 h-64">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-500" /> Wellness Score (Weekly)
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthData}>
                <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2fe" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="score" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Schedule Config */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100">
             <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-500" /> My Schedule
             </h3>
             <p className="text-xs text-slate-500 mb-3">Help the AI analyze your health based on your shift timings.</p>
             <textarea 
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full text-sm p-3 bg-sky-50 rounded-xl border border-sky-100 focus:outline-none focus:border-sky-400 h-32 resize-none text-slate-700"
                placeholder="e.g., Night shift 8pm to 4am, delivery driving."
             />
          </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-3xl shadow-lg border border-sky-100 overflow-hidden flex flex-col h-[500px]">
        <div className="bg-gradient-to-r from-sky-400 to-blue-500 p-4 text-white font-semibold flex items-center gap-2 shadow-md">
            <Bot className="w-6 h-6" /> AI Health Coach
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-sky-50/50">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.image && (
                         <img src={msg.image} alt="Upload" className="max-w-[200px] rounded-xl mb-2 border border-sky-200" />
                    )}
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-sky-500 text-white rounded-br-none' 
                        : 'bg-white border border-sky-100 text-slate-700 rounded-bl-none'
                    }`}>
                        {msg.text || (msg.image ? 'Analyzed Image' : '')}
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-white border border-sky-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                        <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-sky-50">
            {selectedImage && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-sky-50 rounded-lg border border-sky-200 w-fit">
                    <ImageIcon className="w-4 h-4 text-sky-500" />
                    <span className="text-xs text-sky-700">Image selected</span>
                    <button onClick={() => setSelectedImage(null)} className="text-sky-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
            )}
            <div className="flex gap-2">
                <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                />
                
                <button 
                    onClick={startCamera}
                    className="bg-sky-100 text-sky-600 p-3 rounded-full hover:bg-sky-200 transition"
                    title="Open Camera"
                >
                    <Camera className="w-5 h-5" />
                </button>

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-sky-50 text-sky-400 p-3 rounded-full hover:bg-sky-100 transition"
                    title="Upload from Gallery"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>

                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Describe symptoms or use camera..."
                    className="flex-1 bg-sky-50 border border-sky-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition text-slate-700"
                />
                <button 
                    onClick={handleSend}
                    disabled={loading || (!input && !selectedImage)}
                    className="bg-sky-500 text-white p-3 rounded-full hover:bg-sky-600 disabled:opacity-50 transition shadow-lg shadow-sky-200 transform active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCoach;