import React, { useState } from 'react';
import { BookOpen, Shield, Gavel, Users, ChevronRight, CheckCircle } from 'lucide-react';

const LAWS = [
  {
    id: 'wages',
    title: "Code on Wages",
    year: "2019",
    icon: Users,
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    description: "Consolidates laws relating to wages and bonus and makes universal provisions for minimum wages.",
    features: [
      "Universalizes minimum wage provisions to all employees.",
      "Ensures timely payment of wages.",
      "Prohibits gender discrimination in wages for same work.",
      "Floor wage to be fixed by the Central Government."
    ],
    applicability: "Applies to all employees in organized and unorganized sectors, including gig workers where an employer-employee relationship exists.",
    provisions: [
      "Overtime wages must be at least twice the normal rate.",
      "Deductions from wages are strictly regulated.",
      "Payment of wages can be made via coin, currency notes, cheque, or bank account.",
      "Penalties for non-compliance have been increased."
    ]
  },
  {
    id: 'ir',
    title: "Industrial Relations",
    year: "2020",
    icon: Gavel,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    description: "Streamlines laws related to trade unions, conditions of employment in industrial establishments, and settlement of industrial disputes.",
    features: [
      "Simplifies compliance burden for employers.",
      "Promotes Fixed Term Employment.",
      "Establishment of a Re-skilling fund for retrenched workers.",
      "Definition of 'Strike' expanded."
    ],
    applicability: "Applies to industrial establishments. Key for gig platforms to understand dispute resolution mechanisms.",
    provisions: [
      "Single Negotiating Union required if there are multiple unions.",
      "14-day notice period mandatory for strikes.",
      "Grievance Redressal Committee mandatory for establishments with 20+ workers.",
      "Standing orders now applicable to establishments with 300+ workers."
    ]
  },
  {
    id: 'ss',
    title: "Social Security",
    year: "2020",
    icon: Shield,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    description: "Extends social security benefits to all employees and workers either in the organized or unorganized or any other sectors.",
    features: [
      "Specifically recognizes 'Gig Workers' and 'Platform Workers'.",
      "Proposes a National Social Security Board for gig workers.",
      "Mandatory registration of gig workers on a web portal.",
      "Aggregators (like Uber, Zomato) to contribute 1-2% of turnover."
    ],
    applicability: "Directly applicable to Gig and Platform workers.",
    provisions: [
      "Schemes for life and disability cover, health and maternity benefits.",
      "Gratuity eligibility for fixed-term employees (pro-rata).",
      "Aadhaar based registration for unorganized workers.",
      "Social Security Fund to be established."
    ]
  },
  {
    id: 'osh',
    title: "OSH & Conditions",
    year: "2020",
    icon: BookOpen,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    description: "Consolidates laws regulating the occupational safety, health and working conditions of the persons employed in an establishment.",
    features: [
      "National Occupational Safety and Health Advisory Board.",
      "Annual health check-up for employees above a certain age.",
      "One nation, one license concept.",
      "Gender equality in working conditions."
    ],
    applicability: "Factories, mines, docks, building workers, and others.",
    provisions: [
      "Issuance of appointment letter is mandatory.",
      "Women entitled to work at night with consent and safety conditions.",
      "Portable benefits for Inter-state migrant workers.",
      "Journey allowance for migrant workers."
    ]
  }
];

const LabourLaws: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const activeLaw = LAWS[activeTab];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Labour Laws & ILO Codes</h2>
        <p className="text-slate-500">Know your rights. The 4 codes that replaced 29 distinct laws.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1">
        {/* Tabs */}
        <div className="w-full md:w-1/3 flex flex-col gap-3">
          {LAWS.map((law, idx) => (
            <button
              key={law.id}
              onClick={() => setActiveTab(idx)}
              className={`text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group border-2 ${
                activeTab === idx 
                  ? `${law.bg} ${law.border} shadow-md scale-[1.02]` 
                  : 'bg-white border-transparent hover:bg-sky-50'
              }`}
            >
              <div className={`p-3 rounded-xl ${activeTab === idx ? 'bg-white shadow-sm' : 'bg-sky-100 group-hover:bg-white'} transition-colors`}>
                <law.icon className={`w-6 h-6 ${law.color}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${activeTab === idx ? 'text-slate-900' : 'text-slate-600'}`}>{law.title}</h3>
                <p className="text-xs text-slate-400">Code {law.year}</p>
              </div>
              {activeTab === idx && <ChevronRight className={`w-5 h-5 ${law.color}`} />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-sky-100 animate-fade-in relative overflow-hidden">
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-64 h-64 ${activeLaw.bg} rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none`}></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <activeLaw.icon className={`w-8 h-8 ${activeLaw.color}`} />
                    <h2 className="text-3xl font-bold text-slate-800">{activeLaw.title}</h2>
                    <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full">{activeLaw.year}</span>
                </div>

                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                    {activeLaw.description}
                </p>

                <div className="space-y-8">
                    <div>
                        <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${activeLaw.color} flex items-center gap-2`}>
                            <BookOpen className="w-4 h-4" /> Key Features
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeLaw.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 bg-sky-50/50 p-4 rounded-xl border border-sky-50">
                                    <CheckCircle className={`w-5 h-5 ${activeLaw.color} flex-shrink-0 mt-0.5`} />
                                    <p className="text-sm text-slate-700">{feature}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
                        <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 ${activeLaw.color}`}>Applicability</h4>
                        <p className="text-slate-700 font-medium">{activeLaw.applicability}</p>
                    </div>

                    <div>
                        <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${activeLaw.color} flex items-center gap-2`}>
                            <Shield className="w-4 h-4" /> Important Provisions
                        </h4>
                        <ul className="space-y-3">
                            {activeLaw.provisions.map((provision, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 border-b border-sky-50 pb-2 last:border-0">
                                    <span className={`w-2 h-2 rounded-full ${activeLaw.bg.replace('bg-', 'bg-slate-')} bg-slate-400`}></span>
                                    {provision}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LabourLaws;