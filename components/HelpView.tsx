
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, ShieldCheck, Zap, Database } from 'lucide-react';

interface HelpViewProps {
  theme: 'dark' | 'light';
  t: any;
}

const HelpView: React.FC<HelpViewProps> = ({ theme, t }) => {
  const isLight = theme === 'light';
  const [openIndex, setOpenIndex] = useState<number | null>(4); // Deixa o item do Streak aberto como no print

  const faqs = t.faqs || [];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 theme-logo-bg rounded-2xl text-white shadow-lg transition-all duration-500">
            <HelpCircle size={24} />
          </div>
          <h1 className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.help}</h1>
        </div>
        <p className={`${isLight ? 'text-slate-500' : 'text-zinc-500'} font-medium`}>{t.readyToStudy}</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq: any, index: number) => {
          const isOpen = openIndex === index;
          const icons = [Zap, BookOpen, ShieldCheck];
          const Icon = icons[index % 3];
          
          return (
            <div 
              key={index} 
              className={`rounded-3xl border transition-all duration-500 overflow-hidden ${
                isLight 
                  ? (isOpen ? 'bg-white border-indigo-200 shadow-xl shadow-slate-200/50' : 'bg-white/50 border-slate-100 hover:border-slate-200') 
                  : (isOpen ? 'bg-[#0c0c0e] border-indigo-500/30 shadow-2xl shadow-black/40' : 'bg-[#09090b] border-zinc-800/60 hover:border-zinc-700')
              }`}
            >
              <button 
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isLight 
                      ? (isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400') 
                      : (isOpen ? 'bg-indigo-600 text-white' : 'bg-zinc-800/40 text-zinc-600')
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className={`font-bold text-sm md:text-base tracking-tight ${
                    isLight 
                      ? (isOpen ? 'text-indigo-600' : 'text-slate-700') 
                      : (isOpen ? 'text-white' : 'text-zinc-300')
                  }`}>
                    {faq.q}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp size={20} className="text-indigo-500 shrink-0" />
                ) : (
                  <ChevronDown size={20} className="text-zinc-600 shrink-0" />
                )}
              </button>
              
              <div className={`transition-all duration-500 ease-in-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className={`p-8 pt-0 text-sm md:text-base leading-relaxed border-t ${
                  isLight ? 'text-slate-500 border-slate-50' : 'text-zinc-400 border-zinc-800/30'
                }`}>
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card de Backup com visual idêntico ao print */}
      <div className={`p-10 rounded-[2.5rem] border-2 text-center relative overflow-hidden transition-all duration-700 ${
        isLight 
          ? 'bg-white border-indigo-100 shadow-xl' 
          : 'bg-[#09090b] border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.05)]'
      }`}>
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-2">
            <Database size={32} className="text-indigo-500" />
          </div>
          <h3 className={`font-black text-2xl tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.backup}</h3>
          <p className={`text-sm md:text-base max-w-lg leading-relaxed ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            {t.backupNotice} <strong className={isLight ? 'text-indigo-600' : 'text-indigo-400'}>{t.securityNotice}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpView;
