
import React, { useMemo } from 'react';
import { Trophy, ShieldCheck, Zap, Star, Lock, CheckCircle2, Award, Pin } from 'lucide-react';
import { AppState } from '../types';
import { ACHIEVEMENTS, Difficulty } from '../constants/achievements';

interface AchievementsProps {
  state: AppState;
  onSelectHighlight: (id: string) => void;
  onMarkSeen?: (id: string) => void;
  theme?: 'dark' | 'light';
  t: any;
}

const Achievements: React.FC<AchievementsProps> = ({ state, onSelectHighlight, onMarkSeen, theme = 'dark', t }) => {
  const isLight = theme === 'light';

  const unlockedList = useMemo(() => {
    return new Set(state.unlockedAchievements || []);
  }, [state.unlockedAchievements]);

  const viewedList = useMemo(() => {
    return new Set(state.viewedAchievements || []);
  }, [state.viewedAchievements]);

  const stats = useMemo(() => {
    const total = ACHIEVEMENTS.length;
    const unlocked = unlockedList.size;
    const percent = Math.round((unlocked / total) * 100);
    return { total, unlocked, percent };
  }, [unlockedList]);

  const isDivineComplete = stats.percent === 100;

  const getCategoryStyles = (diff: Difficulty) => {
    switch(diff) {
      case 'easy':
        return isLight 
          ? { color: 'text-emerald-800', bg: 'bg-emerald-100 border-emerald-300 shadow-sm' } 
          : { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20 shadow-none' };
      case 'medium':
        return isLight 
          ? { color: 'text-indigo-800', bg: 'bg-indigo-100 border-indigo-300 shadow-sm' } 
          : { color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20 shadow-none' };
      case 'hard':
        return isLight 
          ? { color: 'text-amber-900', bg: 'bg-amber-100 border-amber-400 shadow-sm' } 
          : { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20 shadow-none' };
      case 'legendary':
        return isLight 
          ? { color: 'text-rose-900', bg: 'bg-rose-100 border-rose-400 shadow-md animate-pulse' } 
          : { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30 animate-pulse shadow-none' };
      case 'divine':
        return { 
          color: isLight ? 'text-amber-950' : 'text-amber-400', 
          bg: 'bg-gradient-to-br from-purple-700/80 via-amber-600/60 to-purple-700/80 border-amber-500/30 shadow-none' 
        };
      default:
        return { color: 'text-zinc-400', bg: 'bg-zinc-800' };
    }
  };

  const categories: { title: string; difficulty: Difficulty }[] = [
    { title: t.categories.easy, difficulty: 'easy' },
    { title: t.categories.medium, difficulty: 'medium' },
    { title: t.categories.hard, difficulty: 'hard' },
    { title: t.categories.legendary, difficulty: 'legendary' },
    { title: t.categories.divine, difficulty: 'divine' }
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 theme-logo-bg rounded-2xl text-white shadow-lg transition-all duration-500">
            <Trophy size={24} />
          </div>
          <h1 className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.achievements}</h1>
        </div>
        <p className={`${isLight ? 'text-slate-500' : 'text-zinc-500'} font-medium`}>{t.readyToStudy}</p>
      </div>

      <div className={`flex flex-col md:flex-row justify-between items-end gap-6 p-8 rounded-3xl border backdrop-blur-md relative overflow-hidden transition-all duration-1000 ${
        isDivineComplete 
          ? 'bg-gradient-to-br from-purple-900 via-amber-700/80 to-purple-900 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)]' 
          : isLight ? 'bg-white border-slate-300 shadow-xl' : 'bg-zinc-900/40 border-zinc-800'
      }`}>
        {isDivineComplete && (
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.2),transparent_70%)] pointer-events-none animate-pulse"></div>
        )}
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Trophy size={140} className={isDivineComplete ? 'text-amber-400' : (isLight ? 'text-slate-900' : 'text-white')} />
        </div>
        <div className="relative z-10">
          <h2 className={`text-2xl font-black mb-2 transition-colors duration-500 ${
            isDivineComplete 
              ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]' 
              : isLight ? 'text-slate-900' : 'text-white'
          }`}>Seu Progresso</h2>
          <p className={`${isDivineComplete ? 'text-amber-100/70' : (isLight ? 'text-slate-700 font-bold' : 'text-zinc-500 font-medium')} transition-colors duration-500`}>
             {stats.unlocked} / {stats.total} {t.achievements} desbloqueadas
          </p>
        </div>
        <div className="w-full md:w-64 relative z-10">
          <div className={`flex justify-between text-xs font-black uppercase tracking-widest mb-2 transition-colors duration-500 ${isDivineComplete ? 'text-amber-200' : (isLight ? 'text-slate-600' : 'text-zinc-500')}`}>
            <span>{t.summary}</span>
            <span>{stats.percent}%</span>
          </div>
          <div className={`h-3 rounded-full overflow-hidden border transition-colors duration-500 ${
            isDivineComplete ? 'bg-purple-950/40 border-amber-500/30' : (isLight ? 'bg-slate-200 border-slate-300' : 'bg-zinc-800 border-zinc-700/50')
          }`}>
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                isDivineComplete 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.6)]' 
                  : 'bg-indigo-600 shadow-md'
              }`}
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {categories.map(cat => {
        const styles = getCategoryStyles(cat.difficulty);
        return (
          <div key={cat.difficulty} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${styles.bg} border shadow-sm`}>
                {cat.difficulty === 'easy' && <Zap size={20} className={styles.color} />}
                {cat.difficulty === 'medium' && <Award size={20} className={styles.color} />}
                {cat.difficulty === 'hard' && <ShieldCheck size={20} className={styles.color} />}
                {cat.difficulty === 'legendary' && <Star size={20} className={styles.color} />}
                {cat.difficulty === 'divine' && <Trophy size={20} className={isLight ? 'text-amber-900' : "text-amber-400"} />}
              </div>
              <h2 className={`text-xl font-black uppercase tracking-tighter ${styles.color}`}>{cat.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ACHIEVEMENTS.filter(a => a.difficulty === cat.difficulty).map(ach => {
                const isUnlocked = unlockedList.has(ach.id);
                const isViewed = viewedList.has(ach.id);
                const isPinned = state.selectedAchievementId === ach.id;
                const translated = t.achievements_data?.[ach.id] || { title: ach.title, desc: ach.description };

                return (
                  <div 
                    key={ach.id}
                    onClick={() => {
                      if (isUnlocked) {
                        onMarkSeen?.(ach.id);
                      }
                    }}
                    className={`
                      relative p-8 rounded-2xl border transition-all duration-500 group min-h-[190px] flex flex-col items-center text-center justify-center overflow-hidden
                      ${isUnlocked 
                        ? `${styles.bg} border-current/30 shadow-md cursor-pointer ${isPinned ? 'ring-2 ring-indigo-500/60 scale-[1.03] z-10 shadow-indigo-500/20' : 'hover:scale-[1.02]'}` 
                        : isLight ? 'bg-slate-300/40 border-slate-400/50 grayscale-[0.3]' : 'bg-zinc-900/20 border-zinc-800 opacity-50'}
                    `}
                  >
                    {isUnlocked && !isViewed && (
                      <div className="absolute top-4 left-4 w-3 h-3 bg-rose-600 rounded-full shadow-[0_0_8px_rgba(225,29,72,0.8)] animate-pulse z-20" />
                    )}
                    {isUnlocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHighlight(ach.id);
                        }}
                        className={`absolute bottom-4 right-4 p-2 rounded-xl border transition-all hover:scale-110 active:scale-90 z-20 ${
                          isPinned 
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                            : isLight ? 'bg-white text-slate-400 border-slate-200 hover:text-indigo-600' : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white'
                        }`}
                        title="Fixar Conquista"
                      >
                        <Pin size={16} fill={isPinned ? "currentColor" : "none"} />
                      </button>
                    )}
                    <div className="absolute top-4 right-4">
                      {isUnlocked ? (
                        <CheckCircle2 size={16} className={styles.color} />
                      ) : (
                        <Lock size={16} className={isLight ? 'text-slate-600' : 'text-zinc-700'} />
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-4 w-full">
                      <h3 className={`font-black text-xl leading-tight ${
                        isUnlocked 
                          ? (cat.difficulty === 'divine' ? (isLight ? 'text-amber-950' : 'text-amber-400') : styles.color)
                          : (isLight ? 'text-slate-600' : 'text-zinc-600')
                      }`}>
                        {translated.title}
                      </h3>
                      <p className={`text-sm leading-relaxed max-w-[95%] ${
                        isUnlocked 
                          ? (isLight ? 'text-slate-800 font-semibold' : 'text-zinc-400')
                          : (isLight ? 'text-slate-600 font-medium' : 'text-zinc-700')
                      }`}>
                        {(isUnlocked || ach.id !== 'div-101') ? translated.desc : "???"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Achievements;
