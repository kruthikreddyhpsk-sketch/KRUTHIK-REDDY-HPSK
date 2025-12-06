import React, { useState, useEffect, useRef } from 'react';
import { Shield, User as UserIcon, LogOut, Wallet, HeartPulse, Siren, Scale, Lock, Users, LayoutDashboard, ChevronRight, PenLine, Calendar, Star, ArrowRight, Mic, Camera, Image as ImageIcon, X, Briefcase, IndianRupee, Book, Sparkles, AlertCircle, HeartHandshake, Activity, RefreshCcw, Wifi } from 'lucide-react';
import { Screen, User } from './types';
import IncomeStabilizer from './components/IncomeStabilizer';
import SafetyBeacon from './components/SafetyBeacon';
import HealthCoach from './components/HealthCoach';
import LabourLaws from './components/LabourLaws';
import DailyPlanner from './components/DailyPlanner';
import VoiceAssistant from './components/VoiceAssistant';
import JobAssistant from './components/JobAssistant';
import Notebook from './components/Notebook';
import GeneralAiChat from './components/GeneralAiChat';
import Empowerment from './components/Empowerment';

// Removed fake demo accounts as requested.
const MOCK_USERS: User[] = [];

enum Tab {
  PLANNER = 'PLANNER',
  JOBS = 'JOBS',
  INCOME = 'INCOME',
  EMPOWERMENT = 'EMPOWERMENT',
  SAFETY = 'SAFETY',
  HEALTH = 'HEALTH',
  LAWS = 'LAWS',
  VOICE = 'VOICE',
  NOTEBOOK = 'NOTEBOOK',
  GENERAL_AI = 'GENERAL_AI',
}

const APP_FEATURES = [
  { id: Tab.PLANNER, icon: Calendar, label: 'Daily Planner', color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: Tab.JOBS, icon: Briefcase, label: 'Job Assistant', color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: Tab.EMPOWERMENT, icon: HeartHandshake, label: 'Empowerment', color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: Tab.NOTEBOOK, icon: Book, label: 'Notebook', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: Tab.GENERAL_AI, icon: Sparkles, label: 'ProEffist AI', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: Tab.INCOME, icon: Wallet, label: 'Income Stabilizer', color: 'text-sky-500', bg: 'bg-sky-50' },
  { id: Tab.SAFETY, icon: Siren, label: 'Safety Beacon', color: 'text-red-500', bg: 'bg-red-50' },
  { id: Tab.HEALTH, icon: HeartPulse, label: 'Health Coach', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: Tab.LAWS, icon: Scale, label: 'Labour Laws', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: Tab.VOICE, icon: Mic, label: 'Voice Assistant', color: 'text-cyan-500', bg: 'bg-cyan-50' },
];

interface LogEntry {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details?: string;
}

// Star Particle Component for Auth Screen - Updated to Sky Theme
const StarBackground = () => {
  const [stars, setStars] = useState<any[]>([]);
  
  useEffect(() => {
    const newStars = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 6 + 4, 
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-sky-200 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-sky-200 to-white opacity-90"></div>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] mix-blend-overlay"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `floatParticle ${star.duration}s infinite ease-in-out`,
            animationDelay: `${star.delay}s`,
            opacity: 0.6
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.LANDING);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Initialize usersList from localStorage to support persistent accounts
  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('gigguard_users');
      return savedUsers ? JSON.parse(savedUsers) : [];
    } catch (e) {
      console.error("Failed to load users", e);
      return [];
    }
  });

  // Admin Logs State
  const [activityLogs, setActivityLogs] = useState<LogEntry[]>(() => {
    try {
        const savedLogs = localStorage.getItem('gigguard_logs');
        return savedLogs ? JSON.parse(savedLogs) : [];
    } catch (e) {
        return [];
    }
  });

  // Admin UX States
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [currentTab, setCurrentTab] = useState<Tab>(Tab.PLANNER);
  const [amountSpent, setAmountSpent] = useState<number>(0);
  const [authError, setAuthError] = useState<string>("");

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Questionnaire States
  const [questionStep, setQuestionStep] = useState(0); // 0: Job, 1: Goal, 2: Income
  const [job, setJob] = useState('');
  const [goal, setGoal] = useState('');
  const [avgIncome, setAvgIncome] = useState<string>('');
  
  // Admin Logic
  const [showAdminPasswordInput, setShowAdminPasswordInput] = useState(false);
  const [adminPasswordAttempt, setAdminPasswordAttempt] = useState('');

  // Profile Picture Upload & Camera
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showProfileCamera, setShowProfileCamera] = useState(false);
  const [profileCameraStream, setProfileCameraStream] = useState<MediaStream | null>(null);
  const profileVideoRef = useRef<HTMLVideoElement>(null);
  const profileCanvasRef = useRef<HTMLCanvasElement>(null);

  // Helper to log activities - saves to localStorage for "Live" tracking across tabs
  const logActivity = (user: string, action: string, details?: string) => {
    const newLog: LogEntry = {
        id: Date.now().toString() + Math.random().toString().slice(2,6),
        timestamp: new Date().toLocaleString(),
        user,
        action,
        details
    };
    
    // Read latest logs to ensure we don't overwrite from other tabs
    try {
        const existingLogs = JSON.parse(localStorage.getItem('gigguard_logs') || '[]');
        const updated = [newLog, ...existingLogs].slice(0, 100); // Keep last 100 logs
        localStorage.setItem('gigguard_logs', JSON.stringify(updated));
        setActivityLogs(updated);
    } catch (e) {
        console.error("Failed to log activity", e);
    }
  };

  // Live Tracking Effect for Admin Panel
  useEffect(() => {
    if (screen === Screen.ADMIN) {
        const interval = setInterval(() => {
            try {
                const storedUsersRaw = localStorage.getItem('gigguard_users');
                const storedLogsRaw = localStorage.getItem('gigguard_logs');
                
                const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
                const storedLogs = storedLogsRaw ? JSON.parse(storedLogsRaw) : [];
                
                let hasUpdates = false;

                // Simple deep equality check using stringify for small datasets
                if (JSON.stringify(storedUsers) !== JSON.stringify(usersList)) {
                    setUsersList(storedUsers);
                    hasUpdates = true;
                }
                
                // Optimized check for logs (compare most recent ID or length)
                if (storedLogs.length !== activityLogs.length || (storedLogs.length > 0 && storedLogs[0].id !== activityLogs[0]?.id)) {
                    setActivityLogs(storedLogs);
                    hasUpdates = true;
                }

                if (hasUpdates) {
                    setIsLiveUpdating(true);
                    setTimeout(() => setIsLiveUpdating(false), 2000); // Flash update indicator
                }

            } catch (e) {
                console.error("Polling error", e);
            }
        }, 1000); // Poll every second for live updates

        return () => clearInterval(interval);
    }
  }, [screen, usersList, activityLogs]);

  const handleManualRefresh = () => {
      setIsRefreshing(true);
      setTimeout(() => {
        try {
            const storedUsers = JSON.parse(localStorage.getItem('gigguard_users') || '[]');
            const storedLogs = JSON.parse(localStorage.getItem('gigguard_logs') || '[]');
            setUsersList(storedUsers);
            setActivityLogs(storedLogs);
        } catch(e) {}
        setIsRefreshing(false);
      }, 800);
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const updatedUser = { ...currentUser, profilePicture: result };
        setCurrentUser(updatedUser);
        
        // Update local state and persistence
        const currentStoredUsers = JSON.parse(localStorage.getItem('gigguard_users') || '[]');
        const updatedList = currentStoredUsers.map((u: User) => u.id === currentUser.id ? updatedUser : u);
        localStorage.setItem('gigguard_users', JSON.stringify(updatedList));
        setUsersList(updatedList);
        
        logActivity(updatedUser.fullName, 'Updated Profile Picture');
        setShowProfileOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startProfileCamera = async () => {
    setShowProfileOptions(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setProfileCameraStream(stream);
      setShowProfileCamera(true);
      setTimeout(() => {
        if (profileVideoRef.current) {
          profileVideoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera.");
    }
  };

  const stopProfileCamera = () => {
    if (profileCameraStream) {
      profileCameraStream.getTracks().forEach(track => track.stop());
      setProfileCameraStream(null);
    }
    setShowProfileCamera(false);
  };

  const captureProfilePhoto = () => {
    if (profileVideoRef.current && profileCanvasRef.current && currentUser) {
      const video = profileVideoRef.current;
      const canvas = profileCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the image for better selfie UX
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        const updatedUser = { ...currentUser, profilePicture: dataUrl };
        setCurrentUser(updatedUser);
        
        // Update local state and persistence
        const currentStoredUsers = JSON.parse(localStorage.getItem('gigguard_users') || '[]');
        const updatedList = currentStoredUsers.map((u: User) => u.id === currentUser.id ? updatedUser : u);
        localStorage.setItem('gigguard_users', JSON.stringify(updatedList));
        setUsersList(updatedList);

        logActivity(updatedUser.fullName, 'Updated Profile Picture (Camera)');
        stopProfileCamera();
      }
    }
  };

  const handleAuth = () => {
    setAuthError("");
    const cleanEmail = email.trim();
    const cleanPass = password.trim();
    
    if (authMode === 'LOGIN') {
      if (!cleanEmail || !cleanPass) {
        setAuthError("Please fill in both email and password.");
        return;
      }

      // Reload users from local storage to ensure we have the latest data
      const currentUsers = JSON.parse(localStorage.getItem('gigguard_users') || '[]');
      const foundUser = currentUsers.find((u: User) => u.email.toLowerCase() === cleanEmail.toLowerCase());
      
      if (foundUser) {
        if (foundUser.password === cleanPass) {
            setCurrentUser(foundUser);
            setAmountSpent(foundUser.averageIncome ? foundUser.averageIncome * 0.4 : 0);
            logActivity(foundUser.fullName, 'Login', 'Success');
            setScreen(Screen.DASHBOARD);
        } else {
            setAuthError("Incorrect password. Please try again.");
            logActivity(foundUser.fullName || cleanEmail, 'Login Failed', 'Incorrect Password');
        }
      } else {
         setAuthError("No account found with this email. Please Sign Up.");
      }
    } else {
      // SIGN UP
      if (!fullName.trim() || !cleanEmail || !cleanPass || !phone.trim()) {
        setAuthError("Please complete all fields to create an account.");
        return;
      }
      
      // Check duplicate in fresh storage
      const currentUsers = JSON.parse(localStorage.getItem('gigguard_users') || '[]');
      if (currentUsers.some((u: User) => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
          setAuthError("This email is already registered. Please Log In.");
          return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password: cleanPass,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      // User is created but not yet saved to main list until questionnaire is done
      setCurrentUser(newUser);
      setScreen(Screen.QUESTIONNAIRE);
      setQuestionStep(0);
    }
  };

  const handleQuestionnaireSubmit = () => {
    if (!currentUser) return;
    const incomeNum = parseFloat(avgIncome);
    const updatedUser = { ...currentUser, job, goal, averageIncome: incomeNum };
    
    // Read latest from LS to avoid overwrites
    const currentStoredUsers = JSON.parse(localStorage.getItem('gigguard_users') || '[]');
    const newUserList = [...currentStoredUsers, updatedUser];
    
    // Save new user to persistence first, then state
    localStorage.setItem('gigguard_users', JSON.stringify(newUserList));
    setUsersList(newUserList);
    
    // Log Activity
    logActivity(updatedUser.fullName, 'User Registration', `Joined as ${job}`);

    setCurrentUser(updatedUser);
    setAmountSpent(incomeNum * 0.3);
    setScreen(Screen.DASHBOARD);
  };

  const handleAdminAccess = () => {
    if (adminPasswordAttempt === "KRUTHIK") {
      setScreen(Screen.ADMIN);
      setShowAdminPasswordInput(false);
      setAdminPasswordAttempt('');
    } else {
      alert("Incorrect Admin Password");
    }
  };

  const toggleAuthMode = (mode: 'LOGIN' | 'SIGNUP') => {
      setAuthMode(mode);
      setAuthError("");
  };

  const handleTabChange = (tab: Tab) => {
      setCurrentTab(tab);
      if (currentUser) {
          logActivity(currentUser.fullName, 'Navigation', `Accessed ${APP_FEATURES.find(f => f.id === tab)?.label}`);
      }
  };

  // --- RENDER FUNCTIONS ---

  if (screen === Screen.LANDING) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
        <StarBackground />
        
        <div className="relative z-10 text-center max-w-6xl mx-auto animate-slide-up">
            <div className="bg-gradient-to-r from-sky-400 to-blue-500 w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform rotate-6 border-4 border-white">
              <Shield className="w-14 h-14 text-white" />
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-sky-900 mb-6 tracking-tight drop-shadow-sm">
              GigGuard
            </h1>
            <p className="text-xl md:text-2xl text-sky-700 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              The ultimate companion for gig workers. <br/> Boost efficiency, ensure safety, and prioritize your health.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
               {[
                 { icon: Wallet, label: "Smart Income" },
                 { icon: Briefcase, label: "Job & Issues" },
                 { icon: HeartHandshake, label: "Empowerment" },
                 { icon: Calendar, label: "Daily Planner" },
                 { icon: Siren, label: "Safety Beacon" },
                 { icon: HeartPulse, label: "Health AI" },
                 { icon: Book, label: "Notebook" },
                 { icon: Sparkles, label: "ProEffist AI" },
                 { icon: Scale, label: "Legal Rights" },
                 { icon: Mic, label: "Voice Assistant" }
               ].map((f, i) => (
                 <div key={i} className="bg-white/40 backdrop-blur-md p-3 rounded-xl border border-white/60 text-sky-900 flex flex-col items-center gap-2 hover:bg-white/60 transition shadow-lg animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <f.icon className="w-5 h-5 text-sky-700" />
                    <span className="text-xs font-bold whitespace-nowrap">{f.label}</span>
                 </div>
               ))}
            </div>

            <button 
              onClick={() => setScreen(Screen.AUTH)}
              className="group bg-sky-600 text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-sky-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-sky-300/50 transform hover:-translate-y-1 flex items-center gap-3 mx-auto mb-16"
            >
              Get Started
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Developer Credits */}
            <div className="bg-white/30 backdrop-blur-sm p-6 rounded-2xl border border-white/40 max-w-3xl mx-auto animate-fade-in">
                 <h3 className="text-sky-900 font-bold uppercase tracking-widest text-xs mb-4">Developed by Students of HPSK</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-semibold text-sky-800">
                     <div className="bg-white/50 p-3 rounded-lg">
                         <p>CHINTALAPALLI KRUTHIK REDDY</p>
                         <p className="text-xs text-sky-600 mt-1">CLASS 9</p>
                     </div>
                     <div className="bg-white/50 p-3 rounded-lg">
                         <p>KONDURU JIGNESH</p>
                         <p className="text-xs text-sky-600 mt-1">CLASS 9</p>
                     </div>
                     <div className="bg-white/50 p-3 rounded-lg">
                         <p>SHAIK SHOAIB HUSSAIN</p>
                         <p className="text-xs text-sky-600 mt-1">CLASS 9</p>
                     </div>
                 </div>
            </div>
        </div>
      </div>
    );
  }

  if (screen === Screen.AUTH) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <StarBackground />

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-white/80 animate-slide-up">
          <div className="absolute top-4 right-4">
             {!showAdminPasswordInput ? (
                <button 
                    onClick={() => setShowAdminPasswordInput(true)}
                    className="text-sky-300 hover:text-sky-500 transition"
                >
                    <Lock className="w-4 h-4" />
                </button>
            ) : (
                <div className="flex gap-2 animate-fade-in bg-white shadow-lg p-1 rounded-lg border border-sky-100">
                    <input 
                        type="password" 
                        value={adminPasswordAttempt}
                        onChange={e => setAdminPasswordAttempt(e.target.value)}
                        placeholder="Admin Key"
                        className="w-24 px-2 py-1 text-xs border border-sky-200 rounded outline-none text-sky-800"
                    />
                    <button onClick={handleAdminAccess} className="bg-sky-600 text-white px-2 py-1 rounded text-xs hover:bg-sky-700">Go</button>
                    <button onClick={() => setShowAdminPasswordInput(false)} className="text-sky-400 px-1 text-xs">x</button>
                </div>
            )}
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-sky-900 tracking-tight">
              {authMode === 'LOGIN' ? 'Welcome Back' : 'Join GigGuard'}
            </h1>
            <p className="text-sky-500 font-medium">Your partner in the gig economy.</p>
          </div>

          <div className="flex bg-sky-100/50 p-1.5 rounded-2xl mb-6 border border-sky-100">
            <button 
              onClick={() => toggleAuthMode('LOGIN')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${authMode === 'LOGIN' ? 'bg-white shadow-md text-sky-600 scale-100' : 'text-sky-400 hover:text-sky-600'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => toggleAuthMode('SIGNUP')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${authMode === 'SIGNUP' ? 'bg-white shadow-md text-sky-600 scale-100' : 'text-sky-400 hover:text-sky-600'}`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-semibold">{authError}</p>
              </div>
          )}

          <div className="space-y-4 animate-fade-in" key={authMode}>
            {authMode === 'SIGNUP' && (
              <>
                <div className="animate-slide-in-right animate-delay-100">
                    <label className="block text-xs font-semibold text-sky-700 mb-1 ml-1">Full Name</label>
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={e => { setFullName(e.target.value); setAuthError(""); }}
                        className="w-full px-4 py-3 bg-white border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none transition text-sky-900 placeholder-sky-200" 
                        placeholder="John Doe" 
                    />
                </div>
                <div className="animate-slide-in-right animate-delay-200">
                    <label className="block text-xs font-semibold text-sky-700 mb-1 ml-1">Phone Number</label>
                    <input 
                        type="tel" 
                        value={phone} 
                        onChange={e => { setPhone(e.target.value); setAuthError(""); }}
                        className="w-full px-4 py-3 bg-white border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none transition text-sky-900 placeholder-sky-200" 
                        placeholder="+91 987 654 3210" 
                    />
                </div>
              </>
            )}
            <div className="animate-slide-in-right animate-delay-100">
                <label className="block text-xs font-semibold text-sky-700 mb-1 ml-1">Email Address</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={e => { setEmail(e.target.value); setAuthError(""); }}
                    className="w-full px-4 py-3 bg-white border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none transition text-sky-900 placeholder-sky-200" 
                    placeholder="you@example.com" 
                />
            </div>
            <div className="animate-slide-in-right animate-delay-200">
                <label className="block text-xs font-semibold text-sky-700 mb-1 ml-1">Password</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => { setPassword(e.target.value); setAuthError(""); }}
                    className="w-full px-4 py-3 bg-white border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white outline-none transition text-sky-900 placeholder-sky-200" 
                    placeholder="••••••••" 
                />
            </div>

            <button onClick={handleAuth} className="w-full mt-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:from-sky-600 hover:to-blue-600 transition transform active:scale-[0.98] animate-slide-up animate-delay-300">
              {authMode === 'LOGIN' ? 'Access Account' : 'Create Account'}
            </button>
          </div>
          
        </div>
      </div>
    );
  }

  if (screen === Screen.QUESTIONNAIRE) {
    return (
      <div className="min-h-screen bg-sky-50 p-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl border border-sky-100 relative overflow-hidden">
            
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-2 bg-sky-100 w-full">
                <div 
                    className="h-full bg-sky-500 transition-all duration-500" 
                    style={{ width: `${((questionStep + 1) / 3) * 100}%` }}
                ></div>
            </div>

            <div className="text-center mb-8 mt-4 animate-fade-in">
                <h2 className="text-3xl font-bold text-sky-900">Setup Profile</h2>
                <p className="mt-2 text-sky-500">Step {questionStep + 1} of 3</p>
            </div>
            
            <div className="min-h-[200px] flex flex-col justify-center">
                {questionStep === 0 && (
                    <div className="space-y-4 animate-slide-in-right">
                        <label className="block text-lg font-semibold text-sky-700">What is your current gig/job?</label>
                        <input 
                            type="text" 
                            value={job} 
                            onChange={e => setJob(e.target.value)}
                            autoFocus
                            className="w-full px-5 py-4 bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-400 outline-none transition text-lg text-sky-900" 
                            placeholder="e.g., Delivery Driver"
                        />
                        <button 
                            onClick={() => setQuestionStep(1)}
                            disabled={!job}
                            className="w-full bg-sky-500 text-white py-4 rounded-xl font-bold hover:bg-sky-600 transition mt-4 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}

                {questionStep === 1 && (
                    <div className="space-y-4 animate-slide-in-right">
                        <label className="block text-lg font-semibold text-sky-700">What is your long-term financial goal?</label>
                        <input 
                            type="text" 
                            value={goal} 
                            onChange={e => setGoal(e.target.value)}
                            autoFocus
                            className="w-full px-5 py-4 bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-400 outline-none transition text-lg text-sky-900" 
                            placeholder="e.g., Buy a new bike"
                        />
                        <div className="flex gap-3 mt-4">
                            <button 
                                onClick={() => setQuestionStep(0)}
                                className="px-6 py-4 text-sky-500 font-semibold hover:bg-sky-50 rounded-xl transition"
                            >
                                Back
                            </button>
                            <button 
                                onClick={() => setQuestionStep(2)}
                                disabled={!goal}
                                className="flex-1 bg-sky-500 text-white py-4 rounded-xl font-bold hover:bg-sky-600 transition disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {questionStep === 2 && (
                    <div className="space-y-4 animate-slide-in-right">
                        <label className="block text-lg font-semibold text-sky-700">Average Monthly Income (₹)</label>
                        <input 
                            type="number" 
                            value={avgIncome} 
                            onChange={e => setAvgIncome(e.target.value)}
                            autoFocus
                            className="w-full px-5 py-4 bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-400 outline-none transition text-lg text-sky-900" 
                            placeholder="25000"
                        />
                        <div className="flex gap-3 mt-4">
                             <button 
                                onClick={() => setQuestionStep(1)}
                                className="px-6 py-4 text-sky-500 font-semibold hover:bg-sky-50 rounded-xl transition"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleQuestionnaireSubmit}
                                disabled={!avgIncome}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition disabled:opacity-50 shadow-lg shadow-emerald-200"
                            >
                                Finish Setup <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  if (screen === Screen.ADMIN) {
    const newSignupsCount = usersList.filter(u => u.joinedDate === new Date().toISOString().split('T')[0]).length;
    
    return (
      <div className="min-h-screen bg-sky-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-sky-100">
                    <Shield className="w-8 h-8 text-sky-400" /> Admin Panel
                </h1>
                <div className="flex items-center gap-4">
                     <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all duration-500 border ${
                         isLiveUpdating 
                         ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                         : 'bg-emerald-900/30 border-transparent text-emerald-600'
                     }`}>
                         <div className={`w-2 h-2 rounded-full bg-emerald-400 ${isLiveUpdating ? 'animate-ping' : 'animate-pulse'}`}></div>
                         {isLiveUpdating ? 'SYNCING DATA...' : 'LIVE MONITORING'}
                     </div>
                    <button 
                        onClick={() => setScreen(Screen.AUTH)}
                        className="px-4 py-2 bg-sky-800 rounded-lg hover:bg-sky-700 transition text-sky-200"
                    >
                        Log Out
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-sky-800/50 p-6 rounded-xl border border-sky-700 transition hover:border-sky-500 group">
                    <h3 className="text-sky-300 text-sm mb-1 group-hover:text-sky-200">Total Active Users</h3>
                    <p className={`text-4xl font-bold text-white transition-all ${isLiveUpdating ? 'scale-105 text-sky-100' : ''}`}>{usersList.length}</p>
                </div>
                <div className="bg-sky-800/50 p-6 rounded-xl border border-sky-700 transition hover:border-emerald-500 group">
                    <h3 className="text-sky-300 text-sm mb-1 group-hover:text-emerald-200">New Signups (Today)</h3>
                    <p className={`text-4xl font-bold text-emerald-400 transition-all ${isLiveUpdating ? 'scale-105' : ''}`}>{newSignupsCount}</p>
                </div>
                <div className="bg-sky-800/50 p-6 rounded-xl border border-sky-700 transition hover:border-sky-500 group">
                    <h3 className="text-sky-300 text-sm mb-1 group-hover:text-sky-200">System Events (24h)</h3>
                    <p className={`text-4xl font-bold text-sky-400 transition-all ${isLiveUpdating ? 'scale-105' : ''}`}>{activityLogs.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Database */}
                <div className="bg-sky-800/50 rounded-xl overflow-hidden border border-sky-700 flex flex-col h-[600px]">
                    <div className="p-6 border-b border-sky-700 flex justify-between items-center bg-sky-900/20">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                             <Users className="w-5 h-5 text-sky-400" /> Registered Users
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-sky-400 bg-sky-900/50 px-2 py-1 rounded">Real-time DB</span>
                            <button onClick={handleManualRefresh} className={`text-sky-400 hover:text-sky-200 p-1 rounded-full hover:bg-sky-700 transition ${isRefreshing ? 'animate-spin' : ''}`}>
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-sky-800 text-sky-200 sticky top-0 shadow-md">
                                <tr>
                                    <th className="p-4 text-xs uppercase font-bold tracking-wider">Full Name</th>
                                    <th className="p-4 text-xs uppercase font-bold tracking-wider">Email</th>
                                    <th className="p-4 text-xs uppercase font-bold tracking-wider">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sky-700/50 overflow-y-auto">
                                {usersList.length > 0 ? usersList.map((u, i) => (
                                    <tr key={u.id} className="hover:bg-sky-700/50 transition group animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                                        <td className="p-4 font-medium text-white flex items-center gap-3">
                                            {u.profilePicture ? <img src={u.profilePicture} className="w-9 h-9 rounded-full border border-sky-500 object-cover" alt="" /> : <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold">{u.fullName[0]}</div>}
                                            <span className="group-hover:text-sky-200 transition">{u.fullName}</span>
                                        </td>
                                        <td className="p-4 text-sky-300 text-sm font-mono">{u.email}</td>
                                        <td className="p-4"><span className="px-2.5 py-1 bg-sky-700 text-sky-100 rounded-md text-xs font-medium border border-sky-600">{u.job || 'N/A'}</span></td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="p-12 text-center text-sky-400 italic">No registered users yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Activity Logs */}
                <div className="bg-sky-800/50 rounded-xl overflow-hidden border border-sky-700 flex flex-col h-[600px]">
                     <div className="p-6 border-b border-sky-700 flex justify-between items-center bg-sky-900/20">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Wifi className={`w-5 h-5 ${isLiveUpdating ? 'text-emerald-400 animate-pulse' : 'text-emerald-600'}`} /> 
                            Live Activity Feed
                        </h2>
                         <div className="flex items-center gap-3">
                            <button onClick={handleManualRefresh} className={`text-sky-400 hover:text-sky-200 p-1 rounded-full hover:bg-sky-700 transition ${isRefreshing ? 'animate-spin' : ''}`}>
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                            <button onClick={() => { localStorage.removeItem('gigguard_logs'); setActivityLogs([]); }} className="text-xs text-red-300 hover:text-red-100 hover:bg-red-900/30 px-2 py-1 rounded transition">Clear Logs</button>
                         </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-sky-600 scrollbar-track-transparent">
                        {activityLogs.length > 0 ? activityLogs.map((log) => (
                            <div key={log.id} className={`bg-sky-900/40 p-4 rounded-xl border border-sky-700/50 flex items-start gap-4 animate-slide-in-right hover:bg-sky-800/50 transition ${log.action.includes('Login') ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-sky-500'}`}>
                                <div className="mt-1">
                                    <div className={`w-2.5 h-2.5 rounded-full ${log.action.includes('Login') ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : log.action.includes('Registration') ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]' : 'bg-sky-400'}`}></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-bold text-sky-100">{log.user}</p>
                                        <span className="text-[10px] text-sky-500 font-mono bg-sky-900/50 px-1.5 py-0.5 rounded">{log.timestamp.split(',')[1]}</span>
                                    </div>
                                    <p className="text-xs text-sky-300 leading-relaxed"><span className="text-sky-200 font-semibold">{log.action}</span> {log.details && <span className="text-sky-400">— {log.details}</span>}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 text-sky-500 flex flex-col items-center">
                                <Activity className="w-12 h-12 mb-4 opacity-20" />
                                <p>Waiting for live user activity...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // DASHBOARD
  const profitableFund = currentUser?.averageIncome || 0;
  const savings = profitableFund - amountSpent;

  return (
    <div className="min-h-screen bg-sky-50 pb-20 md:pb-0 md:pl-24">
      
      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 md:top-0 md:left-0 w-full md:w-24 md:h-screen bg-white md:border-r border-t md:border-t-0 border-sky-100 z-50 flex md:flex-col items-center justify-around md:justify-start md:pt-8 gap-1 md:gap-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none py-2 md:py-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-sky-200">
         <div className="hidden md:block mb-4">
             <div className="bg-gradient-to-br from-sky-400 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                 <Shield className="w-7 h-7 text-white" />
             </div>
         </div>

         {/* Profile Avatar Trigger (Desktop Sidebar) */}
         <div className="hidden md:flex flex-col items-center mb-6 relative group cursor-pointer" onClick={() => setShowUserProfile(true)} title="View Profile">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky-200 shadow-md relative bg-sky-100 flex items-center justify-center transition-transform group-hover:scale-105">
                {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <UserIcon className="w-6 h-6 text-sky-400" />
                )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-sky-100">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
        </div>
         
         {APP_FEATURES.map((item) => (
             <button
                key={item.id}
                onClick={() => handleTabChange(item.id as Tab)}
                className={`group relative p-3 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1 ${currentTab === item.id ? 'bg-sky-100 text-sky-600 translate-x-1' : 'text-slate-400 hover:text-sky-500 hover:bg-sky-50'}`}
             >
                 {currentTab === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-500 rounded-r-full hidden md:block -ml-4"></div>
                 )}
                 <item.icon className={`w-6 h-6 transition-transform ${currentTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                 <span className="text-[10px] font-bold md:hidden">{item.label.split(' ')[0]}</span>
                 <span className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-sky-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50 shadow-md">
                    {item.label}
                 </span>
             </button>
         ))}

         <button onClick={() => setScreen(Screen.AUTH)} className="mt-auto hidden md:block p-3 text-slate-300 hover:text-red-500 mb-8 transition-colors">
             <LogOut className="w-6 h-6" />
         </button>
      </nav>

      {/* Main Content Area */}
      <main className="p-6 max-w-6xl mx-auto h-screen flex flex-col overflow-hidden relative">

        {/* User Profile Detail Modal */}
        {showUserProfile && currentUser && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowUserProfile(false)}>
                 <div className="bg-white rounded-[32px] p-8 shadow-2xl w-full max-w-lg relative max-h-[85vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => setShowUserProfile(false)}
                        className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>

                    <div className="flex flex-col items-center mb-8">
                        {/* Profile Picture with Edit Overlay */}
                        <div 
                            className="relative w-32 h-32 rounded-full border-4 border-sky-100 shadow-xl overflow-hidden mb-6 group cursor-pointer"
                            onClick={() => setShowProfileOptions(true)}
                        >
                             {currentUser.profilePicture ? (
                                <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full bg-sky-50 flex items-center justify-center">
                                    <UserIcon className="w-12 h-12 text-sky-300" />
                                </div>
                             )}
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Camera className="w-8 h-8 text-white" />
                             </div>
                        </div>

                        <h2 className="text-3xl font-bold text-slate-800 text-center">{currentUser.fullName}</h2>
                        
                        <div className="flex flex-wrap gap-2 justify-center mt-3">
                            <span className="px-4 py-1.5 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4" /> {currentUser.job}
                            </span>
                            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold flex items-center gap-1.5">
                                <IndianRupee className="w-4 h-4" /> {currentUser.averageIncome?.toLocaleString() || 0} / mo
                            </span>
                        </div>
                    </div>

                    <div className="mb-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">Quick Access</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {APP_FEATURES.map(feat => (
                                <button 
                                    key={feat.id}
                                    onClick={() => {
                                        handleTabChange(feat.id as Tab);
                                        setShowUserProfile(false);
                                    }}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${feat.bg} border-transparent hover:shadow-md text-left`}
                                >
                                    <div className={`p-2 bg-white rounded-xl shadow-sm ${feat.color}`}>
                                        <feat.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-slate-700 text-sm">{feat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                             setShowUserProfile(false);
                             setScreen(Screen.AUTH);
                             logActivity(currentUser.fullName, 'Logout');
                        }}
                        className="w-full mt-6 py-4 rounded-2xl border border-red-100 text-red-500 font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                 </div>
             </div>
        )}

        {/* Picture Upload/Camera Options Modal (Triggered from Profile Modal or Sidebar) */}
        {showProfileOptions && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowProfileOptions(false)}>
                <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Update Profile Picture</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={startProfileCamera} className="flex flex-col items-center justify-center gap-3 p-6 bg-sky-50 rounded-2xl border-2 border-sky-100 hover:border-sky-400 hover:bg-sky-100 transition group">
                            <div className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition">
                                <Camera className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-slate-600">Camera</span>
                        </button>
                        <button onClick={() => { fileInputRef.current?.click(); }} className="flex flex-col items-center justify-center gap-3 p-6 bg-sky-50 rounded-2xl border-2 border-sky-100 hover:border-sky-400 hover:bg-sky-100 transition group">
                            <div className="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-slate-600">Gallery</span>
                        </button>
                    </div>
                    {/* Hidden input moved here or accessible via ref globally */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleProfilePictureUpload}
                    />
                    <button onClick={() => setShowProfileOptions(false)} className="mt-6 w-full py-3 text-slate-400 font-semibold hover:text-slate-600">Cancel</button>
                </div>
            </div>
        )}

        {/* Profile Camera Overlay */}
        {showProfileCamera && (
            <div className="fixed inset-0 z-[70] bg-black flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 z-10">
                <button 
                onClick={stopProfileCamera}
                className="bg-gray-800/50 text-white p-3 rounded-full hover:bg-gray-700 backdrop-blur-sm"
                >
                <X className="w-6 h-6" />
                </button>
            </div>
            
            {/* Hidden Canvas for capture */}
            <canvas ref={profileCanvasRef} className="hidden" />

            <div className="w-full max-w-md bg-black relative rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl">
                <video 
                ref={profileVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect via CSS
                />
                {/* Guide Frame (Circle for profile) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                </div>
            </div>

            <div className="mt-8">
                <button 
                onClick={captureProfilePhoto}
                className="w-20 h-20 rounded-full bg-white border-4 border-sky-200 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
                >
                <div className="w-16 h-16 rounded-full bg-sky-500 border-2 border-white"></div>
                </button>
            </div>
            <p className="text-white/70 mt-4 text-sm font-medium">Take a clear photo of your face</p>
            </div>
        )}
        
        {/* Feature Content */}
        <div className="animate-fade-in flex-1 h-full overflow-y-auto pb-20 md:pb-0 scrollbar-thin scrollbar-thumb-sky-200 scrollbar-track-transparent">
            {currentTab === Tab.PLANNER && (
                <>
                   {/* Header only shown on Planner/Income/Safety to keep Voice/Laws clean */}
                   <header className="mb-8 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                {currentUser?.profilePicture && (
                                    <div className="md:hidden w-10 h-10 rounded-full overflow-hidden border border-sky-200" onClick={() => setShowUserProfile(true)}>
                                         <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-800">Hello, {currentUser?.fullName.split(' ')[0]}</h1>
                                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                        <p className="text-sm font-medium">{currentUser?.job}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="md:hidden">
                                <button onClick={() => setScreen(Screen.AUTH)} className="text-slate-400"><LogOut className="w-5 h-5" /></button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 hover:shadow-lg hover:shadow-sky-100/50 transition-all">
                            <div className="flex items-center gap-2 mb-6 text-sky-500 text-xs font-bold uppercase tracking-wider">
                                <LayoutDashboard className="w-4 h-4" /> Financial Snapshot
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-sky-50">
                                <div className="pt-4 md:pt-0">
                                    <p className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Profitable Fund</p>
                                    <p className="text-3xl font-bold text-slate-800 tracking-tight">₹{profitableFund.toLocaleString()}</p>
                                    <p className="text-xs text-sky-400 mt-1">Based on monthly average</p>
                                </div>
                                <div className="pt-4 md:pt-0 md:pl-8">
                                    <p className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Amount Spent</p>
                                    <div className="flex items-end gap-2 group">
                                        <span className="text-3xl font-bold text-slate-800">₹</span>
                                        <div className="relative flex-1">
                                            <input 
                                                type="number" 
                                                value={amountSpent} 
                                                onChange={(e) => setAmountSpent(Number(e.target.value))}
                                                className="text-3xl font-bold text-slate-800 w-full border-b-2 border-dashed border-sky-200 focus:border-sky-500 outline-none bg-transparent transition-colors pb-1"
                                            />
                                            <PenLine className="w-4 h-4 text-sky-300 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-sky-500 transition" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-sky-400 mt-1">Edit to update savings</p>
                                </div>
                                <div className="pt-4 md:pt-0 md:pl-8">
                                    <p className="text-slate-500 text-xs font-semibold mb-2 uppercase tracking-wide">Net Savings</p>
                                    <p className={`text-3xl font-bold tracking-tight flex items-center gap-2 ${savings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        ₹{savings.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-sky-400 mt-1">{savings >= 0 ? 'Great job!' : 'Over budget'}</p>
                                </div>
                            </div>
                        </div>
                   </header>
                   <DailyPlanner user={currentUser!} />
                </>
            )}
            {currentTab === Tab.INCOME && <IncomeStabilizer user={currentUser!} savings={savings} profitableFund={profitableFund} />}
            {currentTab === Tab.SAFETY && <SafetyBeacon />}
            {currentTab === Tab.HEALTH && <HealthCoach user={currentUser!} />}
            {currentTab === Tab.LAWS && <LabourLaws />}
            {currentTab === Tab.VOICE && <VoiceAssistant />}
            {currentTab === Tab.JOBS && <JobAssistant user={currentUser!} />}
            {currentTab === Tab.NOTEBOOK && <Notebook />}
            {currentTab === Tab.GENERAL_AI && <GeneralAiChat />}
            {currentTab === Tab.EMPOWERMENT && <Empowerment user={currentUser!} />}
        </div>

      </main>
    </div>
  );
}