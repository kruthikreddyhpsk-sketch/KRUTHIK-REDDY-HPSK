import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Radio, Activity } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const VoiceAssistant: React.FC = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Refs for Audio Contexts and cleanup
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<Promise<any> | null>(null);

  // Helper: Decode Audio
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Helper: Decode Audio Data
  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  // Helper: Create Payload for PCM
  const createPayload = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    
    // Encode to base64
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return {
      data: base64,
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopSession = async () => {
    // Cleanup Input
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    
    if (inputAudioContextRef.current) {
        // Just close it, don't wait indefinitely
        try { inputAudioContextRef.current.close(); } catch(e) {}
        inputAudioContextRef.current = null;
    }

    // Cleanup Output
    if (outputAudioContextRef.current) {
        try { outputAudioContextRef.current.close(); } catch(e) {}
        outputAudioContextRef.current = null;
    }
    
    // Stop Session
    if (sessionRef.current) {
        try {
            const session = await sessionRef.current;
            session.close();
        } catch (e) {
            console.log("Session close (harmless):", e);
        }
        sessionRef.current = null;
    }
    
    // Stop all playing sources
    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    setActive(false);
    setStatus('idle');
  };

  const startSession = async () => {
    if (active) return;
    setError(null);
    setStatus('connecting');
    setActive(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Setup Audio Contexts
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        // Resume contexts immediately
        await Promise.all([inputCtx.resume(), outputCtx.resume()]);

        inputAudioContextRef.current = inputCtx;
        outputAudioContextRef.current = outputCtx;
        nextStartTimeRef.current = 0;

        const outputNode = outputCtx.createGain();
        outputNode.connect(outputCtx.destination);

        // Get Microphone Stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Connect Gemini Live
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setStatus('listening');
                    // Setup Input Processing
                    const source = inputCtx.createMediaStreamSource(stream);
                    // Use smaller buffer (2048) for lower latency
                    const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (e) => {
                        // Avoid processing if context is closed/closing
                        if (!inputCtx || inputCtx.state === 'closed') return;
                        
                        const inputData = e.inputBuffer.getChannelData(0);
                        const payload = createPayload(inputData);
                        
                        sessionPromise.then(session => {
                             // Double check state before sending to avoid "Network Error" on closed socket
                             if (inputAudioContextRef.current) {
                                session.sendRealtimeInput({ media: payload });
                             }
                        }).catch(err => {
                             // Suppress errors during shutdown
                             console.log("Send ignored:", err);
                        });
                    };

                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputCtx.destination);
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    
                    if (base64Audio) {
                        setStatus('speaking');
                        
                        // Ensure we schedule ahead
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        
                        const audioBuffer = await decodeAudioData(
                            decode(base64Audio),
                            outputCtx,
                            24000,
                            1
                        );

                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        source.addEventListener('ended', () => {
                            sourcesRef.current.delete(source);
                            if (sourcesRef.current.size === 0) {
                                setStatus('listening');
                            }
                        });

                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                    
                    const interrupted = msg.serverContent?.interrupted;
                    if (interrupted) {
                        sourcesRef.current.forEach(s => s.stop());
                        sourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                        setStatus('listening');
                    }
                },
                onclose: () => {
                    setStatus('idle');
                    setActive(false);
                },
                onerror: (err) => {
                    console.error("Live API Error:", err);
                    // Only show error if we were actually trying to be active
                    if (active) {
                         setError("Connection interrupted. Please try again.");
                         stopSession();
                    }
                }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                },
                systemInstruction: "You are a friendly, ultra-fast AI assistant for gig workers. Keep responses short (1-2 sentences), concise, and helpful. React immediately.",
            }
        });
        
        sessionRef.current = sessionPromise;

    } catch (err: any) {
        console.error("Failed to start session:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             setError("Microphone permission required.");
        } else {
             setError("Could not connect to AI. Please check network.");
        }
        setStatus('idle');
        setActive(false);
    }
  };

  useEffect(() => {
    return () => {
        // Cleanup on unmount
        stopSession();
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="bg-gradient-to-b from-sky-900 to-blue-900 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-sky-700 relative overflow-hidden">
        
        {/* Animated Background Pulse */}
        {active && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
        )}

        <h2 className="text-2xl font-bold text-white mb-8 flex items-center justify-center gap-2 relative z-10">
          <Volume2 className="text-cyan-300" /> Voice AI
        </h2>

        <div className="relative z-10 mb-12">
            <div className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
                status === 'speaking' ? 'bg-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.6)] scale-110' :
                status === 'listening' ? 'bg-sky-600 shadow-[0_0_30px_rgba(2,132,199,0.4)]' :
                'bg-sky-800'
            }`}>
                {active ? (
                    <Activity className={`w-16 h-16 text-white ${status === 'speaking' ? 'animate-bounce' : 'animate-pulse'}`} />
                ) : (
                    <Radio className="w-16 h-16 text-sky-300" />
                )}
            </div>
            
            <p className="mt-6 text-sky-200 font-medium text-lg min-h-[1.75rem]">
                {status === 'idle' && "Tap to Start"}
                {status === 'connecting' && "Connecting..."}
                {status === 'listening' && "Listening..."}
                {status === 'speaking' && "Speaking..."}
            </p>
        </div>

        <div className="relative z-10">
            {!active ? (
                <button 
                    onClick={startSession}
                    disabled={status === 'connecting'}
                    className="bg-cyan-500 hover:bg-cyan-400 text-sky-950 font-bold py-4 px-10 rounded-full text-lg shadow-lg transition-transform transform active:scale-95 flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                    <Mic className="w-5 h-5" /> Start Conversation
                </button>
            ) : (
                <button 
                    onClick={stopSession}
                    className="bg-red-500 hover:bg-red-400 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg transition-transform transform active:scale-95 flex items-center gap-2 mx-auto"
                >
                    <MicOff className="w-5 h-5" /> End Call
                </button>
            )}
        </div>

        {error && (
            <p className="mt-4 text-red-300 text-sm relative z-10 bg-red-900/50 px-4 py-2 rounded-lg">{error}</p>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;