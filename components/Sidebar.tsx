
import React, { useMemo } from 'react';
import { Layout, Zap, Target, BarChart2, Download, CheckSquare, Calendar, Trophy, Settings, Camera, HelpCircle, BookOpen, ClipboardList, Star, Pin } from 'lucide-react';
import { Tab, UserSettings } from '../types';
import { ACHIEVEMENTS, Difficulty } from '../constants/achievements';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onExport: () => void;
  isOpen: boolean;
  unlockedAchievements: string[];
  selectedAchievementId?: string;
  settings: UserSettings;
  t: any;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onExport, 
  isOpen, 
  unlockedAchievements, 
  selectedAchievementId, 
  settings, 
  t
}) => {
  const isLight = settings.theme === 'light';
  
  // Identifica a conquista fixada
  const pinnedAchievement = useMemo(() => {
    if (!selectedAchievementId) return null;
    const ach = ACHIEVEMENTS.find(a => a.id === selectedAchievementId);
    if (!ach || !unlockedAchievements.includes(ach.id)) return null;
    
    const translated = t.achievements_data?.[ach.id];
    return {
      ...ach,
      displayTitle: translated?.title || ach.title
    };
  }, [selectedAchievementId, unlockedAchievements, t]);

  // O tema visual global é ativado se 'isEpicMode' estiver ligado E a conquista Divindade (div-101) estiver desbloqueada
  const isEpicActive = settings.isEpicMode && unlockedAchievements.includes('div-101');

  const navItems = [
    { id: 'dashboard' as Tab, icon: Layout, label: t.dashboard },
    { id: 'focus' as Tab, icon: Zap, label: t.focus },
    { id: 'resumo' as Tab, icon: ClipboardList, label: t.summary },
    { id: 'subjects_manage' as Tab, icon: BookOpen, label: t.subjects_manage },
    { id: 'questoes' as Tab, icon: CheckSquare, label: t.questions },
    { id: 'conquistas' as Tab, icon: Trophy, label: t.achievements },
    { id: 'provas' as Tab, icon: Target, label: t.provas },
    { id: 'calendario' as Tab, icon: Calendar, label: t.calendar },
    { id: 'weekly' as Tab, icon: Target, label: t.goals },
    { id: 'stats' as Tab, icon: BarChart2, label: t.stats },
    { id: 'share' as Tab, icon: Camera, label: t.share },
    { id: 'ajuda' as Tab, icon: HelpCircle, label: t.help },
    { id: 'settings' as Tab, icon: Settings, label: t.settings }
  ];

  const getDifficultyStyles = (difficulty: Difficulty, isPinned: boolean) => {
    switch (difficulty) {
      case 'easy': 
        return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
      case 'medium': 
        return 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5 shadow-lg shadow-indigo-500/5';
      case 'hard': 
        return 'text-amber-500 border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
      case 'legendary': 
        return 'text-rose-500 border-rose-500/40 bg-rose-500/10 animate-shine shadow-[0_0_20px_rgba(225,29,72,0.2)]';
      case 'divine': 
        return `text-amber-300 border-amber-400/50 bg-gradient-to-br from-purple-900/80 via-amber-600/60 to-purple-900/80 animate-shine shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-1 ring-white/10 ${!isPinned ? 'animate-float-divine' : ''}`;
      default: 
        return 'text-zinc-400 border-zinc-800 bg-zinc-900';
    }
  };

  const getTitleColor = (difficulty: Difficulty) => {
    if (difficulty === 'divine') return 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]';
    if (difficulty === 'legendary') return 'text-rose-500';
    return '';
  };

  // Estilo da aba ativa (muda se o modo épico estiver ativo)
  const getActiveTabStyles = () => {
    if (isEpicActive) return 'bg-amber-500 text-purple-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
    return 'bg-indigo-600 text-white shadow-lg';
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 flex flex-col shrink-0 transition-all duration-300 h-full
      md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isLight ? 'bg-white border-r border-zinc-200' : 'bg-[#000000] border-r border-zinc-900 shadow-2xl shadow-black'}
    `}>
      {/* Cabeçalho que muda de cor se o Modo Épico estiver ativo */}
      <div className={`p-6 border-b shrink-0 flex flex-col items-center transition-all duration-700 ${
        isEpicActive 
          ? 'bg-gradient-to-br from-purple-900/40 via-amber-600/20 to-purple-900/40 border-amber-500/30' 
          : isLight ? 'border-zinc-200' : 'border-zinc-900'
      }`}>
        <div className="flex items-center gap-3 mb-6 w-full justify-center">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xl shadow-lg transition-all duration-500 ${
            isEpicActive ? 'bg-amber-500 text-purple-950 shadow-amber-500/20' : 'bg-indigo-600 text-white'
          }`}>
            F
          </div>
          <span className={`font-black text-2xl tracking-tighter transition-all duration-500 ${
            isEpicActive ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]' : (isLight ? 'text-zinc-900' : 'text-white')
          }`}>Focus</span>
        </div>
        
        <div className="w-full">
          {pinnedAchievement ? (
            <div className={`py-3.5 px-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-700 relative overflow-hidden group ${getDifficultyStyles(pinnedAchievement.difficulty, true)}`}>
              <span className={`text-xs font-black uppercase tracking-[0.05em] leading-tight break-words max-w-full flex items-center justify-center gap-2 ${getTitleColor(pinnedAchievement.difficulty)}`}>
                {pinnedAchievement.id === 'div-101' && (
                  <span className="inline-block animate-float-divine text-lg">🏆</span>
                )}
                {pinnedAchievement.difficulty === 'legendary' && (
                  <span className="inline-block animate-pulse">
                    <Star size={18} fill="currentColor" className="text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.9)]" />
                  </span>
                )}
                {pinnedAchievement.displayTitle}
              </span>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ) : (
            <div className={`py-3 px-4 rounded-2xl border flex items-center justify-center text-center ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-400' : 'bg-[#09090b] border-zinc-800 text-zinc-700'}`}>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.categories?.easy || 'Iniciante'}</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all group ${
                isActive 
                  ? getActiveTabStyles()
                  : isLight 
                    ? 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100' 
                    : 'text-zinc-600 hover:text-white hover:bg-zinc-900/40'
              }`}
            >
              <Icon size={18} className={isActive ? (isEpicActive ? 'text-purple-950' : 'text-white') : 'text-zinc-600 group-hover:text-zinc-400'} />
              <span className={`ml-3 text-sm transition-all ${isActive ? 'font-black' : 'font-semibold'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={`p-6 shrink-0 border-t ${isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-900'}`}>
        <div className={`mb-3 p-3 rounded-xl text-xs ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
          <div className={`${isLight ? 'text-blue-800' : 'text-blue-300'} font-semibold`}>
            💾 {t.offline_mode || 'Modo Offline'}
          </div>
          <div className="text-zinc-500 mt-1 text-[10px]">
            {t.offline_message || 'Seus dados são salvos localmente no dispositivo'}
          </div>
        </div>
        <button 
          onClick={onExport}
          className={`w-full p-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 border uppercase tracking-widest ${
            isLight ? 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100' : 'bg-[#09090b] text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          <Download size={12} /> {t.export || 'Exportar'} JSON
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
