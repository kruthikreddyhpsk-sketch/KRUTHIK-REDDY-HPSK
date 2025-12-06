import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapPin, TrendingUp, Lightbulb } from 'lucide-react';
import { User } from '../types';
import { getIncomeTipsAndLocations } from '../services/geminiService';

interface Props {
  user: User;
  savings: number;
  profitableFund: number;
}

const IncomeStabilizer: React.FC<Props> = ({ user, savings, profitableFund }) => {
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Mock data for the bar graph (Simulating monthly income increase)
  const data = [
    { name: 'Month 1', income: user.averageIncome || 2000 },
    { name: 'Month 2', income: (user.averageIncome || 2000) * 1.05 },
    { name: 'Month 3', income: (user.averageIncome || 2000) * 1.08 },
    { name: 'Month 4', income: (user.averageIncome || 2000) * 1.15 },
  ];

  const savingsPercentage = profitableFund > 0 ? ((savings / profitableFund) * 100).toFixed(1) : 0;

  const handleGetTips = () => {
    setLoading(true);
    setLocationError(null);
    if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser");
        setLoading(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const result = await getIncomeTipsAndLocations(user.job || 'Gig Worker', { lat: latitude, lng: longitude });
        setTips(result.text);
        setGroundingChunks(result.grounding || []);
        setLoading(false);
      },
      () => {
        setLocationError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Metrics Card */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 rounded-3xl p-8 text-white shadow-lg shadow-sky-200">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-white" /> Income Efficiency
        </h3>
        <div className="mt-6 flex justify-between items-end">
          <div>
            <p className="text-sky-100 text-sm font-medium">Savings Ratio</p>
            <p className="text-5xl font-bold mt-1">{savingsPercentage}%</p>
            <p className="text-sky-100 text-xs mt-2 bg-white/20 px-2 py-1 rounded-full w-fit">of profitable fund saved</p>
          </div>
          <div className="text-right">
             <p className="text-sky-100 text-sm font-medium">Monthly Goal</p>
             <p className="text-3xl font-bold mt-1">₹{user.goal}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 h-80">
        <h4 className="font-semibold text-slate-700 mb-4">Projected Income Growth</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f2fe" />
            <XAxis dataKey="name" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{fill: '#f0f9ff'}}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="income" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`rgba(14, 165, 233, ${0.6 + (index * 0.1)})`} /> // Sky Blue shades
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Tips & Location */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100">
        <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-500" />
                Efficiency Hotspots & Tips
            </h4>
            <button 
                onClick={handleGetTips}
                disabled={loading}
                className="px-5 py-2.5 bg-sky-500 text-white text-sm font-bold rounded-xl hover:bg-sky-600 disabled:opacity-50 transition shadow-md shadow-sky-200"
            >
                {loading ? 'Analyzing Location...' : 'Scan Area'}
            </button>
        </div>

        {locationError && <p className="text-red-500 text-sm mb-4">{locationError}</p>}

        {tips ? (
            <div className="prose prose-sm max-w-none bg-sky-50/80 p-6 rounded-2xl border border-sky-100">
                <div className="flex items-start gap-3 mb-2">
                    <Lightbulb className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
                    <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{tips}</div>
                </div>
                
                {groundingChunks && groundingChunks.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-sky-200">
                        <h5 className="text-xs font-bold text-sky-500 uppercase mb-3">Sources & Locations</h5>
                        <ul className="space-y-2">
                            {groundingChunks.map((chunk, idx) => {
                                const mapData = chunk.web || chunk.maps;
                                if (!mapData) return null;
                                return (
                                    <li key={idx}>
                                        <a href={mapData.uri} target="_blank" rel="noreferrer" className="text-sky-600 hover:text-sky-800 hover:underline text-sm flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-sky-100 w-fit">
                                            <MapPin className="w-3 h-3" />
                                            {mapData.title || "View on Map"}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        ) : (
            <div className="text-center py-12 text-sky-400 bg-sky-50/50 rounded-2xl border border-dashed border-sky-200">
                <p>Click "Scan Area" to find high-demand locations for {user.job} nearby.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default IncomeStabilizer;