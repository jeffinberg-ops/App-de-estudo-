
import React, { useState, useMemo } from 'react';
import { Camera, Clock, Target, Trophy, Calendar, Monitor, Smartphone, Eye, EyeOff, Flame } from 'lucide-react';
import { AppState } from '../types';
import { formatTimeShort, calculateStreak, toLocalISO } from '../utils';
import { ACHIEVEMENTS } from '../constants/achievements';

interface ShareViewProps {
  state: AppState;
  theme: 'dark' | 'light';
  t: any;
}

type SharePeriod = 'day' | 'week' | 'month' | 'year';
type LayoutMode = 'stories' | 'web';

const ShareView: React.FC<ShareViewProps> = ({ state, theme, t }) => {
  const [period, setPeriod] = useState<SharePeriod>('day');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('stories');
  const [showHint, setShowHint] = useState(true);
  const isLight = theme === 'light';

  // Streak centralizado e resiliente
  const currentStreak = useMemo(() => calculateStreak(state.logs), [state.logs]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDateStr = '';
    if (period === 'day') {
      startDateStr = toLocalISO(today);
    } else if (period === 'week') {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      startDateStr = toLocalISO(d);
    } else if (period === 'month') {
      const d = new Date(today);
      d.setMonth(d.getMonth() - 1);
      startDateStr = toLocalISO(d);
    } else if (period === 'year') {
      const d = new Date(today);
      d.setFullYear(d.getFullYear() - 1);
      startDateStr = toLocalISO(d);
    }

    // Filtra logs baseados no dia local (formato YYYY-MM-DD)
    const periodLogs = state.logs.filter(l => toLocalISO(new Date(l.date)) >= startDateStr);
    const periodQuestions = (state.questionLogs || []).filter(l => toLocalISO(new Date(l.date)) >= startDateStr);
    
    const totalSec = periodLogs.reduce((acc, log) => acc + log.duration, 0);
    const totalQuestions = periodQuestions.reduce((acc, log) => acc + log.correct + log.incorrect, 0);

    return {
      time: formatTimeShort(totalSec),
      questions: totalQuestions,
      sessions: periodLogs.length
    };
  }, [state.logs, state.questionLogs, period]);

  const achievement = useMemo(() => {
    if (!state.selectedAchievementId) return null;
    const baseAch = ACHIEVEMENTS.find(a => a.id === state.selectedAchievementId);
    if (!baseAch) return null;
    const translated = t.achievements_data?.[baseAch.id];
    return {
      ...baseAch,
      title: translated?.title || baseAch.title,
      description: translated?.desc || baseAch.description
    };
  }, [state.selectedAchievementId, t]);

  const isDivine = achievement?.difficulty === 'divine';
  const isLegendary = achievement?.difficulty === 'legendary';
  const isHard = achievement?.difficulty === 'hard';

  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10';
      case 'medium': return 'text-indigo-400 bg-indigo-500/5 border-indigo-500/10';
      case 'hard': return 'text-yellow-400 bg-yellow-500/5 border-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.1)]';
      case 'legendary': return 'text-red-500 bg-red-500/10 border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.2)] animate-shine';
      case 'divine': return 'text-amber-300 bg-gradient-to-br from-purple-900/90 via-amber-900/70 to-purple-900/90 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.4)] animate-shine';
      default: return 'text-zinc-400 bg-zinc-900/5 border-zinc-800';
    }
  };

  const getDifficultyTextColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-emerald-400';
      case 'medium': return 'text-indigo-400';
      case 'hard': return 'text-yellow-400';
      case 'legendary': return 'text-red-500';
      case 'divine': return 'text-amber-400';
      default: return 'text-zinc-400';
    }
  };

  const getTitleColor = () => {
    if (isDivine) return 'text-white drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]';
    if (isLegendary) return 'text-red-500';
    if (isHard) return 'text-yellow-400';
    return isLight ? 'text-slate-800' : 'text-white';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 theme-logo-bg rounded-2xl text-white shadow-lg transition-all duration-500">
              <Camera size={24} />
            </div>
            <h1 className={`text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.shareTitle}</h1>
          </div>
          <p className={`${isLight ? 'text-slate-500' : 'text-zinc-500'} font-medium`}>{t.shareSubtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
            <button
              onClick={() => setLayoutMode('stories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                layoutMode === 'stories' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Smartphone size={14} /> Stories
            </button>
            <button
              onClick={() => setLayoutMode('web')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                layoutMode === 'web' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Monitor size={14} /> Web
            </button>
          </div>
          <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
            {(['day', 'week', 'month', 'year'] as SharePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  period === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10 items-center justify-center">
        <div id="share-card" className={`
          w-full flex flex-col relative overflow-hidden shadow-2xl transition-all duration-700
          ${isLight ? 'bg-white border-2 border-slate-100 shadow-slate-200/50' : 'bg-zinc-950 border border-zinc-800 shadow-black/50'}
          ${isDivine ? 'ring-2 ring-amber-500/50' : ''}
          ${layoutMode === 'stories' ? 'max-w-sm aspect-[4/5.5] p-8 rounded-[2.5rem]' : 'max-w-5xl aspect-[1.8/1] p-10 rounded-[3rem]'}
        `}>
          <div className={`absolute top-[-15%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[120px] opacity-25 pointer-events-none ${isLight ? 'bg-indigo-200' : 'bg-indigo-600'}`}></div>
          <div className={`absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[100px] opacity-15 pointer-events-none ${isLight ? 'bg-blue-100' : 'bg-blue-900'}`}></div>
          
          {/* Badge de Streak Flutuante no Stories */}
          {currentStreak > 0 && layoutMode === 'stories' && (
            <div className="absolute top-8 right-8 flex flex-col items-center animate-bounce-subtle z-30">
              <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-500/40 relative animate-shine">
                <Flame size={24} fill="white" />
              </div>
              <span className="text-xl font-black mt-1 text-orange-500">{currentStreak}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-orange-600/60">{t.day}s</span>
            </div>
          )}

          {isDivine && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none animate-pulse"></div>
          )}

          <div className="relative z-10 flex flex-col h-full">
            <div className={`flex items-center gap-4 relative ${layoutMode === 'stories' ? 'justify-center mb-6' : 'justify-between mb-10'}`}>
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center text-white font-black shadow-lg z-20 transition-all duration-500 ${
                  layoutMode === 'stories' ? 'w-10 h-10 rounded-xl text-xl' : 'w-12 h-12 rounded-2xl text-2xl'
                } ${
                  isLegendary ? 'bg-red-600 shadow-red-600/40' : (isHard ? 'bg-yellow-500 shadow-yellow-500/30' : (isDivine ? 'bg-gradient-to-br from-amber-400 to-purple-600 shadow-amber-500/50 scale-110 ring-2 ring-white/20' : 'bg-indigo-600 shadow-indigo-600/20'))
                }`}>F</div>
                <div className="z-20">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-black leading-tight transition-colors duration-500 ${layoutMode === 'stories' ? 'text-base' : 'text-xl'} ${
                      isLegendary ? 'text-red-500' : (isHard ? 'text-yellow-400' : (isDivine ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : (isLight ? 'text-slate-900' : 'text-white')))
                    }`}>Focus</h4>
                    {isDivine && <span className={`${layoutMode === 'stories' ? 'text-xs' : 'text-xl'} animate-float-divine`}>🏆</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`font-black uppercase tracking-[0.3em] ${layoutMode === 'stories' ? 'text-[9px]' : 'text-[11px]'} ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>{state.settings.username || 'User'}</p>
                  </div>
                </div>
              </div>
              {layoutMode === 'web' && (
                <div className={`px-6 py-2 rounded-full border text-[11px] font-black tracking-[0.2em] uppercase ${isLight ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                  VISÃO GERAL: {t[period]}
                </div>
              )}
            </div>

            <div className={`flex flex-1 ${layoutMode === 'web' ? 'flex-row items-center justify-between gap-16 px-4' : 'flex-col justify-center space-y-4 text-center'}`}>
              <div className={`flex flex-col ${layoutMode === 'web' ? 'flex-1 gap-10' : 'gap-6'}`}>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 ${layoutMode === 'stories' ? 'justify-center' : ''}`}>
                    <Clock size={layoutMode === 'stories' ? 10 : 14} className="text-indigo-500" />
                    <span className={`font-black uppercase tracking-[0.25em] ${layoutMode === 'stories' ? 'text-[8px]' : 'text-[10px]'} ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{t.studyTime.toUpperCase()}</span>
                  </div>
                  <h2 className={`font-black font-mono tracking-tighter transition-all duration-500 ${isLight ? 'text-slate-900' : 'text-white'} ${layoutMode === 'stories' ? 'text-4xl' : 'text-7xl'}`}>
                    {stats.time}
                  </h2>
                </div>

                {/* Bloco de Streak na Versão Web */}
                {currentStreak > 0 && layoutMode === 'web' && (
                  <div className="space-y-1 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Flame size={14} className="text-orange-500" />
                      <span className={`font-black uppercase tracking-[0.25em] text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>SEQUÊNCIA ATUAL</span>
                    </div>
                    <h2 className={`font-black font-mono tracking-tighter text-6xl text-orange-500`}>
                      {currentStreak} {t.day.toUpperCase()}S
                    </h2>
                  </div>
                )}

                <div className="space-y-1">
                  <div className={`flex items-center gap-2 ${layoutMode === 'stories' ? 'justify-center' : ''}`}>
                    <Target size={layoutMode === 'stories' ? 10 : 14} className="text-emerald-500" />
                    <span className={`font-black uppercase tracking-[0.25em] ${layoutMode === 'stories' ? 'text-[8px]' : 'text-[10px]'} ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{t.totalQuestions.toUpperCase()}</span>
                  </div>
                  <h2 className={`font-black font-mono tracking-tighter transition-all duration-500 ${isLight ? 'text-slate-900' : 'text-white'} ${layoutMode === 'stories' ? 'text-4xl' : 'text-7xl'}`}>
                    {stats.questions}
                  </h2>
                </div>
              </div>

              <div className={`flex flex-col justify-center ${layoutMode === 'web' ? 'w-[45%]' : 'w-full mt-4'}`}>
                {achievement ? (
                  <div className={`rounded-overflow-hidden flex flex-col items-center text-center transition-all duration-500 relative ${
                    layoutMode === 'stories' ? 'p-6 rounded-[2.2rem]' : 'p-10 rounded-[2.5rem]'
                  } ${getDifficultyStyles(achievement.difficulty)}`}>
                    <div className="relative z-10 flex flex-col items-center w-full">
                      <div className={`flex items-center justify-center gap-2 bg-zinc-950/40 rounded-full border border-white/10 ${
                        layoutMode === 'stories' ? 'mb-3 px-3 py-1' : 'mb-6 px-5 py-2'
                      }`}>
                        <Trophy size={layoutMode === 'stories' ? 12 : 16} className={getDifficultyTextColor(achievement.difficulty)} />
                        <span className={`font-black uppercase tracking-[0.4em] ${layoutMode === 'stories' ? 'text-[8px]' : 'text-[10px]'} ${getDifficultyTextColor(achievement.difficulty)}`}>
                          {t.categories[achievement.difficulty]}
                        </span>
                        <Trophy size={layoutMode === 'stories' ? 12 : 16} className={getDifficultyTextColor(achievement.difficulty)} />
                      </div>
                      <div className={`w-full flex items-center justify-center transition-all ${
                          layoutMode === 'stories' ? 'py-2.5 px-3 rounded-xl mb-3' : 'py-4 px-6 rounded-2xl mb-6'
                        } ${
                          isDivine ? 'bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-white/5'
                      }`}>
                          <h3 className={`font-black uppercase leading-tight tracking-tighter ${
                            layoutMode === 'web' ? 'text-3xl' : 'text-xl'
                          } ${isDivine ? 'text-purple-950' : getTitleColor()}`}>
                              {achievement.title}
                          </h3>
                      </div>
                      <p className={`leading-relaxed font-bold px-4 tracking-wide ${isDivine ? 'text-amber-100' : (isLight ? 'text-slate-500' : 'text-zinc-400')} ${layoutMode === 'web' ? 'text-base line-clamp-4' : 'text-[11px] line-clamp-2'}`}>
                        {achievement.description}
                      </p>
                    </div>
                    {isDivine && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-amber-600/10 to-transparent pointer-events-none"></div>
                    )}
                  </div>
                ) : (
                  <div className={`rounded-3xl border border-dashed flex items-center justify-center text-center ${
                    layoutMode === 'stories' ? 'p-6' : 'p-10'
                  } ${isLight ? 'bg-slate-50/50 border-slate-200 text-slate-400' : 'bg-zinc-900/20 border-zinc-800 text-zinc-700'}`}>
                    <p className="text-xs font-black uppercase tracking-[0.2em]">{t.noAchievement}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={`mt-auto flex justify-between items-center border-t ${
              layoutMode === 'stories' ? 'py-4' : 'py-6 mt-10'
            } ${isLight ? 'border-slate-100' : 'border-zinc-900'}`}>
              <div className="flex items-center gap-2">
                 <Calendar size={layoutMode === 'stories' ? 10 : 14} className="text-zinc-500" />
                 <span className={`font-black text-zinc-500 uppercase tracking-widest ${layoutMode === 'stories' ? 'text-[9px]' : 'text-[11px]'}`}>
                   {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                 </span>
              </div>
              <span className={`font-black text-indigo-500 uppercase tracking-[0.3em] ${layoutMode === 'stories' ? 'text-[9px]' : 'text-[11px]'}`}>FOCUS.APP</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg flex flex-col items-center gap-4">
           <div className={`
             flex items-center transition-all duration-500
             ${!showHint ? 'p-0' : 'p-5 rounded-[2rem] border ' + (isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/60 border-zinc-800')}
           `}>
             <button 
               onClick={() => setShowHint(!showHint)}
               className={`transition-all ${!showHint ? 'p-5 rounded-full bg-zinc-900/40 backdrop-blur-sm' : 'p-3 rounded-xl'} ${isLight ? 'hover:bg-slate-100 text-indigo-600' : 'hover:bg-zinc-800 text-indigo-400'}`}
               title={showHint ? "Ocultar interface para print" : "Mostrar interface"}
             >
               {showHint ? <Eye size={20} /> : <EyeOff size={20} className="opacity-40" />}
             </button>
             {showHint && (
               <div className="flex items-center gap-4 pr-3 border-l border-zinc-800 ml-2 pl-4">
                 <Camera size={18} className="text-indigo-500" />
                 <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                   {layoutMode === 'stories' ? t.storiesFormatHint : t.webFormatHint}
                 </p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ShareView;
