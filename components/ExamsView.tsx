
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Target, Clock, Zap, Star, Eye, EyeOff, Plus, Trash2, X } from 'lucide-react';
import { ExamEvent, ThemePreset } from '../types';

interface ExamsViewProps {
  examEvents: ExamEvent[];
  onAddExam: (name: string, date: string) => void;
  onRemoveExam: (id: string) => void;
  theme: ThemePreset;
  t: any;
}

const ExamsView: React.FC<ExamsViewProps> = ({ examEvents, onAddExam, onRemoveExam, theme, t }) => {
  const isLight = theme === 'light';
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [showWarning, setShowWarning] = useState(false);
  const [nextExam, setNextExam] = useState<ExamEvent | null>(null);

  const quote = useMemo(() => {
    const quotes = t.motivationQuotes || [];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [t.motivationQuotes]);

  // Find next exam (earliest upcoming or most recent past exam)
  useEffect(() => {
    if (!examEvents || examEvents.length === 0) {
      setNextExam(null);
      return;
    }

    const now = new Date().getTime();
    const sorted = [...examEvents].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    // Find first future exam or use last exam if all are past
    const upcomingExam = sorted.find(e => new Date(e.date).getTime() >= now);
    setNextExam(upcomingExam || sorted[sorted.length - 1]);
  }, [examEvents]);

  // Update countdown timer for next exam
  useEffect(() => {
    if (!nextExam) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      return;
    }

    const targetDate = new Date(nextExam.date);
    if (isNaN(targetDate.getTime())) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const distance = target - now;

      if (isNaN(distance) || distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: -1 });
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, total: distance });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextExam]);

  const handleAddExam = () => {
    if (!newExamName.trim() || !newExamDate) return;
    onAddExam(newExamName.trim(), newExamDate);
    setNewExamName('');
    setNewExamDate('');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const yearMatch = val.match(/^(\d+)/);
    if (yearMatch && yearMatch[1].length > 4) {
      return;
    }
    setNewExamDate(val);
  };

  const formattedNextExamDate = useMemo(() => {
    if (!nextExam) return null;
    const date = new Date(nextExam.date);
    if (isNaN(date.getTime())) return null;
    
    return new Intl.DateTimeFormat(t.locale || 'pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(date);
  }, [nextExam, t.locale]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600 rounded-2xl text-white shadow-lg shadow-rose-600/20">
            <Target size={24} />
          </div>
          <h1 className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.provas}</h1>
        </div>
        <p className={`${isLight ? 'text-slate-500' : 'text-zinc-500'} font-medium`}>{t.examTabSubtitle}</p>
      </div>

      {/* Add New Exam Form */}
      <div className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
        isLight ? 'bg-white border-slate-100' : 'glass-panel'
      }`}>
        <h2 className={`text-lg font-black mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {t.addExamLabel || 'Adicionar Prova/Simulado'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{t.examNameLabel}</label>
            <input 
              type="text"
              value={newExamName}
              onChange={(e) => setNewExamName(e.target.value)}
              placeholder="Ex: ENEM 2025"
              className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500' : 'bg-zinc-950/50 border-zinc-800 text-white focus:border-rose-500'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{t.examDateLabel}</label>
            <input 
              type="datetime-local"
              value={newExamDate}
              onChange={handleDateChange}
              max="9999-12-31T23:59"
              className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500' : 'bg-zinc-950/50 border-zinc-800 text-white focus:border-rose-500'
              }`}
            />
          </div>
        </div>
        <button
          onClick={handleAddExam}
          disabled={!newExamName.trim() || !newExamDate}
          className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            !newExamName.trim() || !newExamDate
              ? isLight ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg active:scale-95'
          }`}
        >
          <Plus size={18} /> {t.addButton || 'Adicionar'}
        </button>
      </div>

      {/* Exams List */}
      {examEvents && examEvents.length > 0 && (
        <div className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
          isLight ? 'bg-white border-slate-100' : 'glass-panel'
        }`}>
          <h2 className={`text-lg font-black mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {t.examListLabel || 'Provas Cadastradas'}
          </h2>
          <div className="space-y-3">
            {examEvents
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((exam) => {
                const examDate = new Date(exam.date);
                const isValid = !isNaN(examDate.getTime());
                const isPast = isValid && examDate.getTime() < new Date().getTime();
                const isNextExam = nextExam?.id === exam.id;
                
                return (
                  <div 
                    key={exam.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isNextExam
                        ? isLight ? 'bg-rose-50 border-rose-300' : 'bg-rose-900/20 border-rose-500/50'
                        : isPast
                          ? isLight ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-zinc-900/40 border-zinc-800 opacity-60'
                          : isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/40 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold truncate ${
                            isNextExam
                              ? isLight ? 'text-rose-900' : 'text-rose-200'
                              : isPast
                                ? isLight ? 'text-slate-500' : 'text-zinc-500'
                                : isLight ? 'text-slate-900' : 'text-white'
                          }`}>
                            {exam.name}
                          </h3>
                          {isNextExam && (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                              isLight ? 'bg-rose-600 text-white' : 'bg-rose-500 text-white'
                            }`}>
                              {t.nextExamBadge || 'Próxima'}
                            </span>
                          )}
                          {isPast && (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                              isLight ? 'bg-slate-300 text-slate-600' : 'bg-zinc-700 text-zinc-400'
                            }`}>
                              {t.pastExamBadge || 'Realizada'}
                            </span>
                          )}
                        </div>
                        {isValid && (
                          <p className={`text-xs font-medium mt-1 ${
                            isNextExam
                              ? isLight ? 'text-rose-700' : 'text-rose-400'
                              : isPast
                                ? isLight ? 'text-slate-400' : 'text-zinc-600'
                                : isLight ? 'text-slate-600' : 'text-zinc-400'
                          }`}>
                            {new Intl.DateTimeFormat(t.locale || 'pt-BR', {
                              dateStyle: 'long',
                              timeStyle: 'short'
                            }).format(examDate)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveExam(exam.id)}
                        className={`p-2 rounded-xl transition-all ${
                          isLight 
                            ? 'hover:bg-rose-100 text-rose-500' 
                            : 'hover:bg-rose-900/30 text-rose-400 hover:text-rose-300'
                        }`}
                        title={t.removeButton || 'Remover'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Countdown for Next Exam */}
      {nextExam && (
        <div className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
          isLight ? 'bg-white border-slate-100' : 'glass-panel'
        }`}>
          <div className="flex flex-col items-center">
            <h2 className={`text-lg font-black mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {nextExam.name}
            </h2>
            {formattedNextExamDate && (
              <div className={`mb-6 text-xs font-bold uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                {formattedNextExamDate}
              </div>
            )}
            
            {timeLeft.total < 0 ? (
               <div className="text-center py-10 space-y-4">
                 <div className="text-4xl font-black text-emerald-500 uppercase tracking-tighter animate-bounce">{t.examFinished}</div>
                 <div className="text-6xl">✨ 🍀 ✨</div>
               </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {[
                  { value: timeLeft.days, label: t.daysLabel },
                  { value: timeLeft.hours, label: t.hoursLabel },
                  { value: timeLeft.minutes, label: t.minutesLabel },
                  { value: timeLeft.seconds, label: t.secondsLabel }
                ].map((item, idx) => (
                  <div key={idx} className={`p-6 rounded-3xl border text-center flex flex-col items-center justify-center transition-all ${
                    isLight ? 'bg-slate-50 border-slate-100' : 'bg-zinc-900/50 border-zinc-800/50'
                  }`}>
                    <span className={`text-4xl md:text-5xl font-mono font-black mb-1 ${isLight ? 'text-rose-600' : 'text-rose-500'}`}>
                      {item.value.toString().padStart(2, '0')}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className={`mt-10 p-6 w-full rounded-2xl border text-center relative overflow-hidden ${
              isLight ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-rose-950/20 border-rose-500/20 text-rose-100'
            }`}>
              <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none">
                 <Zap size={48} />
              </div>
              <p className="text-sm md:text-base font-black italic tracking-wide relative z-10 leading-relaxed">
                "{quote}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!examEvents || examEvents.length === 0) && (
        <div className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
          isLight ? 'bg-white border-slate-100' : 'glass-panel'
        }`}>
          <div className="py-16 text-center flex flex-col items-center gap-4 opacity-40">
            <Calendar size={48} className="text-zinc-600" />
            <p className="font-bold text-zinc-500 uppercase tracking-widest text-xs px-10">
              {t.examPlaceholderHint || 'Nenhuma prova cadastrada. Adicione sua primeira prova acima!'}
            </p>
          </div>
        </div>
      )}

      {/* Warning Section */}
      <div className={`p-8 rounded-[2.5rem] border text-center space-y-6 relative overflow-hidden transition-all duration-700 max-w-xl mx-auto shadow-2xl ${
        isLight 
          ? 'bg-red-900 text-white border-red-800 shadow-red-900/10' 
          : 'bg-[#2d0a0a] text-white border-red-900/20 shadow-black/60'
      }`}>
         <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
            <Star size={64} fill="white" />
         </div>
         
         <div className="space-y-2 relative z-10 px-4">
           <h2 className="text-xl font-black tracking-tight">{t.examConstancyTitle}</h2>
           <p className="text-sm font-bold opacity-90 max-w-sm mx-auto leading-relaxed">
             {t.examConstancyDesc}
           </p>
         </div>

         <div className="relative z-10 flex flex-col items-center pt-2">
            <button 
              onClick={() => setShowWarning(!showWarning)}
              className={`p-3 rounded-2xl transition-all shadow-md ${
                isLight ? 'bg-white/10 hover:bg-white/20' : 'bg-red-950/40 hover:bg-red-900/50'
              }`}
              title="Aviso de Ansiedade"
            >
              {showWarning ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
            
            {showWarning && (
              <div className={`mt-6 p-6 rounded-[1.5rem] animate-slide-down border text-xs leading-relaxed font-bold shadow-inner ${
                isLight ? 'bg-black/20 border-white/10' : 'bg-black/30 border-white/5'
              }`}>
                ⚠️ Caso você sinta que colocar alguma data de alguma prova aqui te deixará mais ansioso do que o recomendável, por favor, não faça isto. Você é mais importante do que qualquer prova neste mundo.
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ExamsView;
