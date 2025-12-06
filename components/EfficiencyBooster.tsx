import React, { useState } from 'react';
import { Zap, TrendingUp, Calendar, CheckCircle2, Lightbulb, Sparkles, AlertCircle } from 'lucide-react';
import { getEfficiencyInsights } from '../services/geminiService';
import { User } from '../types';

interface Props {
  user: User;
}

const EfficiencyBooster: React.FC<Props> = ({ user }) => {
  const [data, setData] = useState<{
    seasonalTips: string;
    efficiencyHacks: string[];
    incomeBoosters: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
        const result = await getEfficiencyInsights(user.job || 'Gig Worker');
        if (result) {
            setData(result);
        } else {
            setError("Could not generate insights. Please try again.");
        }
    } catch (e) {
        setError("Connection error. Please check your internet.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-20 md:pb-0">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-yellow-300" /> Pro Efficiency Booster
          </h2>
          <p className="text-purple-100 max-w-xl text-lg">
            Tailored strategies for <b>{user.job}s</b> to maximize earnings in the current season and work smarter, not harder.
          </p>
          
          {!data && (
            <div className="mt-8 flex flex-col items-start gap-2">
                <button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-purple-50 transition transform active:scale-95 flex items-center gap-2"
                >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></span>
                        Generating Strategy...
                    </span>
                ) : (
                    <>
                    <Sparkles className="w-5 h-5" /> Analyze My Profession
                    </>
                )}
                </button>
                {error && (
                    <div className="flex items-center gap-2 text-red-200 bg-red-900/30 px-3 py-1 rounded-lg text-sm mt-2">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}
            </div>
          )}
        </div>
        
        {/* Background Decor */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Seasonal Strategy - Full Width */}
            <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-purple-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-2xl -mr-8 -mt-8 transition group-hover:bg-purple-100"></div>
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-purple-500" /> 
                        Seasonal & Timing Strategy
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        {data.seasonalTips}
                    </p>
                </div>
            </div>

            {/* Workflow Hacks */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" /> Workflow Hacks
                </h3>
                <div className="space-y-4">
                    {data.efficiencyHacks.map((hack, idx) => (
                        <div key={idx} className="flex gap-4 items-start p-4 rounded-xl bg-purple-50/50 border border-purple-50 hover:bg-purple-50 transition">
                            <span className="bg-white text-purple-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 mt-0.5">
                                {idx + 1}
                            </span>
                            <p className="text-slate-700 text-sm font-medium">{hack}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Income Boosters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" /> Income Multipliers
                </h3>
                <div className="space-y-4">
                    {data.incomeBoosters.map((tip, idx) => (
                        <div key={idx} className="flex gap-4 items-start p-4 rounded-xl bg-emerald-50/50 border border-emerald-50 hover:bg-emerald-50 transition">
                             <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <p className="text-slate-700 text-sm font-medium">{tip}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="md:col-span-2 text-center">
                 <button 
                    onClick={handleAnalyze}
                    className="text-purple-500 font-semibold hover:text-purple-700 hover:underline text-sm"
                 >
                    Regenerate Insights
                 </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default EfficiencyBooster;