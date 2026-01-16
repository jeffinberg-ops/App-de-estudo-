
import React, { useMemo } from 'react';
import { StudyLog } from '../types';
import { formatTimeShort, getTodayISO, toLocalISO } from '../utils';
import { ClipboardList } from 'lucide-react';

interface DailySummaryProps {
  logs: StudyLog[];
  goals: Record<string, number>;
  theme?: 'dark' | 'light';
  t: any;
}

const DailySummary: React.FC<DailySummaryProps> = ({ logs, goals, theme = 'dark', t }) => {
  const todayISO = getTodayISO();
  const isLight = theme === 'light';

  const getStartOfWeek = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return toLocalISO(d);
  };

  const startOfWeek = getStartOfWeek();

  const todayData = useMemo(() => {
    const filteredToday = logs.filter(l => toLocalISO(new Date(l.date)) === todayISO);
    const logsThisWeek = logs.filter(l => toLocalISO(new Date(l.date)) >= startOfWeek);
    
    const dailyGrouped: Record<string, number> = {};
    let dailyTotal = 0;

    filteredToday.forEach(log => {
      dailyGrouped[log.subject] = (dailyGrouped[log.subject] || 0) + log.duration;
      dailyTotal += log.duration;
    });

    const subjectsWithProgress = Object.entries(dailyGrouped).map(([subject, durationToday]) => {
      const weeklyDuration = logsThisWeek
        .filter(l => l.subject === subject)
        .reduce((acc, curr) => acc + curr.duration, 0);
      
      const goalHours = goals[subject] || 0;
      const goalSeconds = goalHours * 3600;
      const progressPercent = goalSeconds > 0 ? Math.min((weeklyDuration / goalSeconds) * 100, 100) : 0;

      return {
        subject,
        durationToday,
        progressPercent
      };
    }).sort((a, b) => b.durationToday - a.durationToday);

    return {
      total: dailyTotal,
      subjects: subjectsWithProgress
    };
  }, [logs, todayISO, startOfWeek, goals]);

  const formattedDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(t.language, { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long' 
    }).toUpperCase();
  }, [t.language]);

  return (
    <div className="relative min-h-full w-full max-w-4xl mx-auto py-12 px-4 animate-fade-in overflow-hidden">
      <div className="flex justify-between items-start mb-16 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 theme-logo-bg rounded-2xl text-white shadow-lg transition-all duration-500">
              <ClipboardList size={24} />
            </div>
            <h1 className={`text-4xl font-extrabold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>{t.dailyReportTitle}</h1>
          </div>
          <p className={`${isLight ? 'text-zinc-400 font-bold' : 'text-zinc-500 font-bold'} tracking-[0.2em] text-sm`}>{formattedDate}</p>
        </div>
        <div className="text-right pt-2">
          <p className={`${isLight ? 'text-zinc-600' : 'text-zinc-600'} font-black text-[10px] tracking-[0.2em] uppercase mb-1`}>{t.totalToday}</p>
          <p className={`text-2xl font-mono font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            {formatTimeShort(todayData.total)}
          </p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {todayData.subjects.length > 0 ? todayData.subjects.map(({ subject, durationToday, progressPercent }) => (
          <div 
            key={subject} 
            className={`group relative backdrop-blur-md transition-all duration-300 rounded-2xl p-8 border shadow-2xl ${
              isLight 
                ? 'bg-white/80 border-zinc-200 hover:bg-white/90 shadow-zinc-200/20' 
                : 'bg-[#121214]/80 border-zinc-800/30 hover:bg-[#18181b]/90'
            }`}
          >
            <div className="flex justify-between items-end relative z-10">
              <div className="flex-1">
                <h3 className={`text-2xl font-bold mb-3 ${isLight ? 'text-zinc-800' : 'text-white'}`}>{subject}</h3>
                <div className={`w-full h-1 rounded-full overflow-hidden relative ${isLight ? 'bg-zinc-100' : 'bg-zinc-800'}`}>
                   <div 
                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                    style={{ width: `${progressPercent}%` }}
                   />
                </div>
              </div>
              <div className="pl-6 pb-0.5">
                <span className={`text-xl font-mono font-bold italic ${isLight ? 'text-zinc-700' : 'text-zinc-100'}`}>
                  {formatTimeShort(durationToday)}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center">
            <div className={`inline-flex p-6 rounded-full border mb-6 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'}`}>
              <span className={`${isLight ? 'text-zinc-400' : 'text-zinc-600'} italic`}>{t.noActivityToday}</span>
            </div>
            <p className={`${isLight ? 'text-zinc-500' : 'text-zinc-500'} text-sm font-medium`}>{t.startSessionReport}</p>
          </div>
        )}
      </div>

      <div className={`mt-20 pt-8 border-t flex justify-center relative z-10 ${isLight ? 'border-zinc-100' : 'border-zinc-900/50'}`}>
        <div className={`w-1/3 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent ${isLight ? 'text-zinc-200' : 'text-zinc-800'}`}></div>
      </div>
    </div>
  );
};

export default DailySummary;
