import React, { useState, useEffect } from 'react';
import { HeartHandshake, Phone, Globe, ShieldCheck, Users } from 'lucide-react';
import { User } from '../types';
import { getEmpowermentResources } from '../services/geminiService';

interface Props {
  user: User;
}

const Empowerment: React.FC<Props> = ({ user }) => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
        setLoading(true);
        const data = await getEmpowermentResources(user.job || 'Gig Worker');
        setResources(data);
        setLoading(false);
    };
    fetchResources();
  }, [user.job]);

  return (
    <div className="space-y-6 animate-slide-up pb-20 md:pb-0">
       <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-8 rounded-3xl shadow-lg text-white">
          <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <HeartHandshake className="w-8 h-8 text-pink-200" /> Empowerment Zone
          </h2>
          <p className="text-pink-100 text-lg">
            Know your support network. Reach out to these organizations if your rights as a <b>{user.job}</b> are violated.
          </p>
       </div>

       {loading ? (
         <div className="flex flex-col items-center justify-center py-20">
             <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
             <p className="text-slate-400 font-medium">Finding support organizations...</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.length > 0 ? resources.map((res, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-rose-50 p-3 rounded-xl text-rose-500">
                            {res.type?.includes('Union') ? <Users className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wide">{res.type}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{res.name}</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{res.description}</p>
                    
                    <div className="pt-4 border-t border-rose-50 flex items-center gap-2 text-rose-600 font-medium">
                        {res.contact?.includes('http') || res.contact?.includes('www') ? (
                             <Globe className="w-4 h-4" />
                        ) : (
                             <Phone className="w-4 h-4" />
                        )}
                        <span className="text-sm">{res.contact}</span>
                    </div>
                </div>
            )) : (
                <div className="md:col-span-2 text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
                    No specific resources found at the moment. Please consult general labor helplines.
                </div>
            )}
         </div>
       )}
    </div>
  );
};

export default Empowerment;