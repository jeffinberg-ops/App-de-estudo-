
import React from 'react';
import { Clock, Activity, Flame, Layout } from 'lucide-react';
import { StudyLog, QuestionData } from '../types';
import { formatTime, formatTimeShort, getTodayISO, toLocalISO, calculateStreak } from '../utils';

interface DashboardProps {
  logs: StudyLog[];
  subjects: string[];
  questions?: Record<string, QuestionData>;
  username?: string;
  theme?: 'dark' | 'light';
  t: any;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, subjects, questions = {}, username = 'Usuário', theme = 'dark', t }) => {
  const today = getTodayISO();
  const logsToday = logs.filter(l => toLocalISO(new Date(l.date)) === today);
  const totalSecToday = logsToday.reduce((a, b) => a + b.duration, 0);
  const isLight = theme === 'light';
  
  const recentLogs = [...logs].reverse().slice(0, 10);
  
  const currentStreak = React.useMemo(() => calculateStreak(logs), [logs]);

  const questionSummary = React.useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    Object.values(questions).forEach((q: QuestionData) => {
      correct += q.correct;
      incorrect += q.incorrect;
    });
    const total = correct + incorrect;
    return { 
      correct, 
      incorrect, 
      total, 
      rate: total > 0 ? (correct / total) * 100 : 0 
    };
  }, [questions]);

  const recentSubjects = React.useMemo(() => {
    const seen = new Set();
    const result: StudyLog[] = [];
    for (const log of recentLogs) {
      if (!seen.has(log.subject) && result.length < 5) {
        seen.add(log.subject);
        result.push(log);
      }
    }
    return result;
  }, [recentLogs]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 theme-logo-bg rounded-2xl text-white shadow-lg transition-all duration-500">
              <Layout size={24} />
            </div>
            <h1 className={`text-3xl font-black tracking-tight theme-text-primary transition-all duration-500`}>
              {t.welcome}, {username.trim().replace(/\.+$/, '')}
            </h1>
          </div>
          <p className={`${isLight ? 'text-zinc-600 font-bold' : 'text-zinc-500 font-medium'}`}>{t.readyToStudy}</p>
        </div>

        {currentStreak > 0 && (
          <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-500 animate-bounce-subtle ${
            isLight 
              ? 'bg-orange-50 border-orange-200 text-orange-600' 
              : 'bg-orange-500/10 border-orange-500/20 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
          }`}>
            <Flame size={28} fill="currentColor" className="animate-pulse" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-3xl font-black">{currentStreak}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                {t.streakLabel}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className={`p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-500 border ${
          isLight ? 'bg-white border-zinc-200 shadow-zinc-300/20' : 'glass-panel bg-gradient-to-br from-indigo-600/5 to-transparent'
        }`}>
          <span className={`${isLight ? 'text-zinc-500' : 'text-zinc-400'} text-xs font-black mb-2 uppercase tracking-[0.2em]`}>{t.studiedToday}</span>
          <div className={`text-5xl font-black font-mono theme-text-primary transition-all duration-500`}>{formatTime(totalSecToday)}</div>
          <div className={`mt-4 px-4 py-1 rounded-full text-[10px] font-black border uppercase transition-all duration-500 ${
            isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-50 theme-accent border-indigo-500/20'
          }`}>
            {logsToday.length} {t.totalSessions}
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-500 border ${
          isLight ? 'bg-white border-zinc-200 shadow-zinc-300/20' : 'glass-panel bg-gradient-to-br from-emerald-600/5 to-transparent'
        }`}>
          <span className={`${isLight ? 'text-zinc-500' : 'text-zinc-400'} text-xs font-black mb-2 uppercase tracking-[0.2em]`}>{t.globalPerformance}</span>
          <div className={`text-5xl font-black font-mono theme-text-primary transition-all duration-500`}>{questionSummary.rate.toFixed(0)}%</div>
          <div className={`mt-4 px-4 py-1 rounded-full text-[10px] font-black border uppercase ${
            isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
          }`}>
            {questionSummary.correct} / {questionSummary.total}
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] shadow-2xl transition-all duration-500 lg:col-span-1 md:col-span-2 border ${
          isLight ? 'bg-white border-zinc-200 shadow-zinc-300/20' : 'glass-panel'
        }`}>
          <h3 className={`font-black text-xl mb-6 flex items-center gap-2 uppercase tracking-tighter theme-text-primary transition-all duration-500`}>
            <Clock className="theme-icon transition-all duration-500" size={20} /> {t.recentSubjects}
          </h3>
          <div className="space-y-3">
            {recentSubjects.length > 0 ? recentSubjects.map(log => (
              <div key={log.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                isLight ? 'bg-zinc-50 border-zinc-200 hover:border-indigo-300' : 'bg-zinc-800/30 border-zinc-800/50'
              }`}>
                <span className={`font-bold text-sm truncate pr-2 ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>{log.subject}</span>
                <span className={`text-[10px] font-black font-mono shrink-0 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            )) : (
              <p className={`${isLight ? 'text-zinc-400' : 'text-zinc-600'} italic py-2 text-sm`}>...</p>
            )}
          </div>
        </div>
      </div>

      <div className={`p-8 rounded-[3rem] shadow-2xl transition-all duration-500 border ${
        isLight ? 'bg-white border-zinc-300 shadow-zinc-300/20' : 'glass-panel'
      }`}>
        <h3 className={`font-black text-xl mb-6 flex items-center gap-2 uppercase tracking-tighter theme-text-primary transition-all duration-500`}>
          <Activity className="theme-icon transition-all duration-500" size={20} /> {t.recentSessions}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`${isLight ? 'text-zinc-500 border-zinc-200' : 'text-zinc-500 border-zinc-800'} text-xs uppercase tracking-widest border-b`}>
                <th className="pb-4 font-black">Matéria</th>
                <th className="pb-4 font-black">Tipo</th>
                <th className="pb-4 font-black text-right">Duração</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-zinc-100' : 'divide-zinc-800/50'}`}>
              {recentLogs.slice(0, 5).map(log => (
                <tr key={log.id} className="group">
                  <td className={`py-4 text-sm font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>{log.subject}</td>
                  <td className={`py-4 text-xs font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>{log.type}</td>
                  <td className="py-4 text-sm text-right font-black font-mono theme-accent">{formatTimeShort(log.duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
