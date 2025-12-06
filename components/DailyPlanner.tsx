import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, Zap } from 'lucide-react';
import { generateSchedule } from '../services/geminiService';
import { User } from '../types';

interface Props {
  user: User;
}

const DailyPlanner: React.FC<Props> = ({ user }) => {
  const [todayGoal, setTodayGoal] = useState('');
  const [schedule, setSchedule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!todayGoal.trim()) return;
    setLoading(true);
    const result = await generateSchedule(user.job || 'Gig Worker', todayGoal);
    setSchedule(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-sky-500" /> Daily Planner
        </h2>
        <p className="text-slate-500 mb-6">Tell us your target for today, and we'll optimize your schedule.</p>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={todayGoal}
            onChange={(e) => setTodayGoal(e.target.value)}
            placeholder="e.g., Earn ₹2000, Complete 15 deliveries..."
            className="flex-1 px-5 py-4 bg-sky-50 border border-sky-200 rounded-xl focus:ring-2 focus:ring-sky-400 outline-none transition text-slate-700"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !todayGoal}
            className="px-8 py-4 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-sky-200"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Zap className="w-5 h-5" />
            )}
            {loading ? 'Planning...' : 'Generate Schedule'}
          </button>
        </div>
      </div>

      {schedule && (
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-sky-100 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 to-blue-500"></div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-500" /> Optimized Schedule
          </h3>
          <div className="prose prose-sky max-w-none text-slate-600 bg-sky-50/50 p-6 rounded-2xl border border-sky-50">
            <div className="whitespace-pre-wrap">{schedule}</div>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
                onClick={() => setSchedule(null)}
                className="text-sm text-sky-400 hover:text-sky-600 underline"
            >
                Clear Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPlanner;