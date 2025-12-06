import React, { useState } from 'react';
import { Phone, ShieldAlert, Heart, Truck, UserCheck, Volume2 } from 'lucide-react';
import { EmergencyContact } from '../types';

const CONTACTS: EmergencyContact[] = [
  { name: 'Police', number: '100', icon: 'police' },
  { name: 'Ambulance', number: '108', icon: 'ambulance' },
  { name: 'Women Helpline', number: '1091', icon: 'woman' },
  { name: 'Children Helpline', number: '1098', icon: 'child' },
];

const SafetyBeacon: React.FC = () => {
  const [sosActive, setSosActive] = useState(false);

  const toggleSOS = () => {
    setSosActive(!sosActive);
    // In a real app, this would trigger location sharing API or SMS
    if (!sosActive) {
        // Playing a dummy sound or vibration could go here
        if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
    }
  };

  return (
    <div className="space-y-6">
      {/* SOS Button */}
      <div className="flex flex-col items-center justify-center py-10 bg-white rounded-3xl shadow-md border border-sky-100">
        <button
            onClick={toggleSOS}
            className={`
                relative w-48 h-48 rounded-full flex items-center justify-center flex-col gap-2 transition-all duration-300
                ${sosActive ? 'bg-red-600 animate-pulse shadow-[0_0_40px_rgba(220,38,38,0.7)]' : 'bg-red-500 shadow-xl shadow-red-200 hover:bg-red-600 hover:scale-105'}
            `}
        >
            <ShieldAlert className={`w-16 h-16 text-white ${sosActive ? 'animate-bounce' : ''}`} />
            <span className="text-2xl font-black text-white tracking-wider">SOS</span>
            {sosActive && <span className="text-xs text-white font-semibold">BROADCASTING</span>}
        </button>
        <p className="mt-8 text-slate-500 text-center max-w-xs font-medium">
            {sosActive 
                ? "Alert is ACTIVE. Location is being shared with emergency contacts." 
                : "Tap to instantly alert emergency contacts and share your live location."}
        </p>
      </div>

      {/* Emergency Call Grid */}
      <div className="grid grid-cols-2 gap-4">
        {CONTACTS.map((contact, idx) => (
            <a 
                key={idx} 
                href={`tel:${contact.number}`}
                className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm border border-sky-50 hover:border-red-200 hover:shadow-lg transition active:scale-95 group"
            >
                <div className="p-4 rounded-full bg-red-50 text-red-500 mb-3 group-hover:bg-red-100 transition">
                    <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800">{contact.name}</h3>
                <span className="text-lg font-bold text-red-600">{contact.number}</span>
            </a>
        ))}
      </div>

      <div className="bg-sky-100/50 p-6 rounded-3xl border border-sky-200 flex items-start gap-4">
        <UserCheck className="w-6 h-6 text-sky-600 mt-1" />
        <div>
            <h4 className="font-bold text-sky-900">Trusted Contacts</h4>
            <p className="text-sm text-sky-700 mt-1">You have 0 trusted contacts added. Add family or friends to notify them during SOS.</p>
        </div>
      </div>
    </div>
  );
};

export default SafetyBeacon;