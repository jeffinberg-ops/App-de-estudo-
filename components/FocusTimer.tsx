
import React from 'react';
import { Save, Check, X, Target, ListFilter, Clock, Coffee, BookOpen } from 'lucide-react';
import { TimerMode, PomoState } from '../types';
import { formatTime } from '../utils';

interface FocusTimerProps {
  subjects: string[];
  topics: Record<string, string[]>;
  theme?: 'dark' | 'light';
  t: any;
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
  
  // Pomodoro
  pomoTimeLeft: number;
  pomoActive: boolean;
  setPomoActive: (active: boolean) => void;
  pomoPreset: number;
  setPomoPreset: (preset: number) => void;
  pomoState: PomoState;

  // Cronômetro
  stopwatchTimeLeft: number;
  stopwatchActive: boolean;
  setStopwatchActive: (active: boolean) => void;

  // Comuns
  breakPreset: number;
  setBreakPreset: (preset: number) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  sessionCorrect: number | string;
  setSessionCorrect: (val: number | string) => void;
  sessionIncorrect: number | string;
  setSessionIncorrect: (val: number | string) => void;
  onSaveSession: () => void;
  onStartBreak: () => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ 
  subjects, 
  topics, 
  theme = 'dark', 
  t,
  mode,
  setMode,
  pomoTimeLeft,
  pomoActive,
  setPomoActive,
  pomoPreset,
  setPomoPreset,
  pomoState,
  stopwatchTimeLeft,
  stopwatchActive,
  setStopwatchActive,
  breakPreset,
  setBreakPreset,
  selectedSubject,
  setSelectedSubject,
  selectedTopic,
  setSelectedTopic,
  sessionCorrect,
  setSessionCorrect,
  sessionIncorrect,
  setSessionIncorrect,
  onSaveSession,
  onStartBreak
}) => {
  const isLight = theme === 'light';
  const isPomo = mode === 'pomodoro';
  const subjectTopics = topics[selectedSubject] || [];

  const handleStartStop = () => {
    if (!selectedSubject) return;
    if (isPomo) {
      setPomoActive(!pomoActive);
    } else {
      setStopwatchActive(!stopwatchActive);
    }
  };

  const isBreak = pomoState === 'break';
  const hasFinished = isPomo && !isBreak && pomoTimeLeft === 0;

  // Valores dinâmicos baseados no modo ativo
  const currentTime = isPomo ? pomoTimeLeft : stopwatchTimeLeft;
  const isTimerActive = isPomo ? pomoActive : stopwatchActive;
  
  const workTime = pomoPreset * 60;
  const breakTimeTotal = breakPreset * 60;

  // Lógica de tamanho de fonte dinâmico
  const isLongTime = currentTime >= 3600;
  const timerFontSizeClass = isLongTime ? 'text-6xl md:text-8xl' : 'text-8xl md:text-9xl';

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] animate-slide-in pb-10 px-4">
      {/* Container de Seleção: Matéria e Assunto */}
      <div className="w-full max-w-md mb-10 space-y-4">
        {/* Seletor de Matéria */}
        <div className="relative group">
          <select 
            disabled={isTimerActive || isBreak}
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTopic(''); // Reseta tópico ao mudar matéria
            }}
            className={`w-full border-2 p-4 pl-14 rounded-2xl outline-none cursor-pointer transition-all font-black text-sm appearance-none shadow-xl ${
              isLight 
                ? 'bg-white border-zinc-200 text-zinc-900 focus:border-indigo-500' 
                : 'bg-[#0c0c0e] border-indigo-500/40 text-white focus:border-indigo-500 shadow-indigo-500/5'
            } ${isBreak || isTimerActive ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500/60'}`}
          >
            <option value="" className="bg-[#18181b]">-- Escolha a Matéria --</option>
            {subjects.map(s => <option key={s} value={s} className="bg-[#18181b]">{s}</option>)}
          </select>
          <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors theme-icon`}>
            <ListFilter size={20} />
          </div>
        </div>

        {/* Seletor de Assunto (Tópico) */}
        {selectedSubject && (
          <div className="relative group animate-slide-down">
            <select 
              disabled={isTimerActive || isBreak}
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className={`w-full border-2 p-4 pl-14 rounded-2xl outline-none cursor-pointer transition-all font-black text-sm appearance-none shadow-xl ${
                isLight 
                  ? 'bg-white border-zinc-200 text-zinc-900 focus:border-indigo-500' 
                  : 'bg-[#0c0c0e] border-indigo-500/20 text-white focus:border-indigo-500 shadow-indigo-500/5'
              } ${isBreak || isTimerActive ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500/40'}`}
            >
              <option value="" className="bg-[#18181b]">{t.noTopicLabel || 'Geral / Sem Assunto'}</option>
              {subjectTopics.map(t => <option key={t} value={t} className="bg-[#18181b]">{t}</option>)}
            </select>
            <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors theme-icon`}>
              <BookOpen size={20} />
            </div>
          </div>
        )}
      </div>

      <div className={`p-10 md:p-14 rounded-[3.5rem] text-center w-full max-w-lg shadow-2xl relative overflow-hidden transition-all duration-500 border ${
        isLight ? 'bg-white border-zinc-300 shadow-zinc-400/20' : 'glass-panel bg-[#0c0c0e]/90'
      }`}>
        <div 
          className={`absolute inset-x-0 bottom-0 transition-all duration-1000 ${isBreak ? 'bg-emerald-600/5' : 'theme-accent opacity-10'}`}
          style={{ height: `${isPomo ? (1 - pomoTimeLeft/ (isBreak ? breakTimeTotal : workTime)) * 100 : 0}%` }}
        />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Seletor de Modo Estilo Pílula */}
          <div className={`flex gap-2 justify-center p-1 rounded-full mb-10 ${isLight ? 'bg-zinc-100' : 'bg-zinc-900/60'}`}>
            <button 
              disabled={isBreak}
              onClick={() => setMode('pomodoro')}
              className={`px-8 py-2.5 rounded-full text-sm font-black transition-all ${
                mode === 'pomodoro' 
                  ? 'theme-logo-bg text-white shadow-lg'
                  : isLight ? 'text-zinc-500 hover:text-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
              } ${isBreak ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {t.pomodoro}
              {pomoActive && <span className="ml-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />}
            </button>
            <button 
              disabled={isBreak}
              onClick={() => setMode('stopwatch')}
              className={`px-8 py-2.5 rounded-full text-sm font-black transition-all ${
                mode === 'stopwatch' 
                  ? 'theme-logo-bg text-white shadow-lg' 
                  : isLight ? 'text-zinc-500 hover:text-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
              } ${isBreak ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {t.stopwatch}
              {stopwatchActive && <span className="ml-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />}
            </button>
          </div>

          {isPomo && !isBreak && (
            <div className="flex flex-row gap-8 items-center mb-10">
              {/* Configuração de Trabalho com Presets Rápidos */}
              <div className="flex flex-col items-center gap-2">
                 <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.workLabel}</span>
                 <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-950/60 border-zinc-800'}`}>
                      <Clock size={16} className="theme-icon transition-all duration-500" />
                      <input 
                        type="number"
                        disabled={isTimerActive}
                        value={pomoPreset}
                        onChange={(e) => setPomoPreset(parseInt(e.target.value) || 25)}
                        className={`w-10 bg-transparent outline-none text-center font-black text-sm ${isLight ? 'text-zinc-900' : 'text-white'}`}
                      />
                    </div>
                    <div className="flex gap-1.5 justify-center">
                      {[25, 50].map(p => (
                        <button 
                          key={p}
                          disabled={isTimerActive}
                          onClick={() => setPomoPreset(p)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                            pomoPreset === p 
                            ? 'theme-logo-bg border-transparent text-white' 
                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                          } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>

              {/* Configuração de Descanso com Presets Rápidos */}
              <div className="flex flex-col items-center gap-2">
                 <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.breakLabel}</span>
                 <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-950/60 border-zinc-800'}`}>
                      <Coffee size={16} className="text-emerald-500" />
                      <input 
                        type="number"
                        value={breakPreset}
                        onChange={(e) => setBreakPreset(parseInt(e.target.value) || 10)}
                        className={`w-10 bg-transparent outline-none text-center font-black text-sm ${isLight ? 'text-zinc-900' : 'text-white'}`}
                      />
                    </div>
                    <div className="flex gap-1.5 justify-center">
                      {[5, 10].map(p => (
                        <button 
                          key={p}
                          onClick={() => setBreakPreset(p)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all ${
                            breakPreset === p 
                            ? 'bg-emerald-600 border-emerald-500 text-white' 
                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center w-full">
            <span className={`text-xs uppercase tracking-[0.4em] font-black mb-6 transition-all duration-500 ${isBreak ? 'text-emerald-500' : 'theme-accent'}`}>
              {isBreak ? (t.pomoBreak.toUpperCase()) : (t.pomoWork.toUpperCase())}
            </span>
            <h2 className={`${timerFontSizeClass} font-mono font-black mb-12 tracking-tight transition-all duration-500 ${
              isBreak ? 'text-emerald-500' : 'theme-text-primary'
            }`}>
              {formatTime(currentTime)}
            </h2>
            
            {/* Auto-save indicator */}
            {isTimerActive && (
              <div className={`flex items-center gap-2 mb-8 text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'} animate-fade-in`}>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>{t.autoSaving}</span>
              </div>
            )}
          </div>

          <div className="flex gap-5 justify-center mb-8">
            {hasFinished ? (
              <div className="flex gap-4 animate-fade-in flex-wrap justify-center">
                 <button 
                  onClick={onStartBreak}
                  className="w-52 h-16 bg-emerald-600 rounded-2xl font-black text-lg hover:bg-emerald-500 transition-all text-white shadow-xl shadow-emerald-600/30 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Coffee size={24} /> {t.pomoBreak.toUpperCase()}
                </button>
                <button 
                  onClick={onSaveSession}
                  className={`h-16 px-8 rounded-2xl font-black text-lg transition-all border shadow-lg active:scale-95 flex items-center justify-center gap-3 ${
                    isLight ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <Save size={24} /> {t.save.toUpperCase()}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleStartStop}
                  className={`w-40 md:w-48 h-16 rounded-2xl font-black text-base md:text-lg transition-all text-white shadow-2xl active:scale-95 uppercase tracking-widest ${
                    isBreak 
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' 
                      : 'theme-logo-bg hover:opacity-90 shadow-lg'
                  }`}
                >
                  {isTimerActive ? t.timerPause : t.timerStart}
                </button>
                <button 
                  onClick={onSaveSession}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border shadow-lg active:scale-95 ${
                    isLight ? 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50' : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                  title={t.saveSession}
                >
                  <Save size={28} />
                </button>
              </div>
            )}
          </div>

          {!isBreak && (
            <div className={`pt-8 border-t w-full ${isLight ? 'border-zinc-200' : 'border-zinc-800/50'}`}>
               <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="theme-icon transition-all duration-500" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.resolvedVolume}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center rounded-xl px-3 py-2 border ${isLight ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-950/40 border-zinc-800'}`}>
                      <Check size={14} className="text-emerald-500 mr-2 font-black" />
                      <input 
                        type="number" 
                        min="0"
                        value={sessionCorrect}
                        onChange={(e) => setSessionCorrect(e.target.value)}
                        className={`w-10 bg-transparent outline-none text-center font-black font-mono ${isLight ? 'text-zinc-900' : 'text-white'}`}
                      />
                    </div>
                    <div className={`flex items-center rounded-xl px-3 py-2 border ${isLight ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-950/40 border-zinc-800'}`}>
                      <X size={14} className="text-rose-500 mr-2 font-black" />
                      <input 
                        type="number" 
                        min="0"
                        value={sessionIncorrect}
                        onChange={(e) => setSessionIncorrect(e.target.value)}
                        className={`w-10 bg-transparent outline-none text-center font-black font-mono ${isLight ? 'text-zinc-900' : 'text-white'}`}
                      />
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
