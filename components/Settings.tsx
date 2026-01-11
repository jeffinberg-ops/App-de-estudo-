
import React, { useState } from 'react';
import { User, Moon, Sun, Monitor, Shield, Database, Download, Upload, Trophy, Clock, CheckSquare, Zap, Languages, Trash2, Settings as SettingsIcon, Flame, Terminal, Play, Key, X, Check, Sparkles, LogOut } from 'lucide-react';
import { UserSettings, AppState, QuestionData, Language } from '../types';
import { formatTimeShort, calculateStreak } from '../utils';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<UserSettings>) => void;
  theme: 'dark' | 'light';
  appState: AppState;
  onExport: () => void;
  onImport: (data: AppState) => void;
  onReset: () => void;
  onUnlockAll?: () => void;
  onGenerateTestData?: () => void;
  onLogout?: () => void;
  t: any;
}

const TEST_MODE_PASSWORD = '705011FocusL';

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, theme, appState, onExport, onImport, onReset, onUnlockAll, onGenerateTestData, onLogout, t }) => {
  const isLight = theme === 'light';
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const isDivineUnlocked = appState.unlockedAchievements?.includes('div-101');

  const statsSummary = React.useMemo(() => {
    const totalSec = appState.logs.reduce((acc, log) => acc + log.duration, 0);
    const totalAchievements = appState.unlockedAchievements?.length || 0;
    let totalQuestions = 0;
    Object.values(appState.questions).forEach((q: QuestionData) => {
      totalQuestions += q.correct + q.incorrect;
    });

    const currentStreak = calculateStreak(appState.logs);

    return {
      totalHours: formatTimeShort(totalSec),
      totalAchievements,
      totalQuestions,
      sessionsCount: appState.logs.length,
      currentStreak
    };
  }, [appState]);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImport(json);
        alert(t.importSuccess || "Backup importado com sucesso! Seus dados foram restaurados.");
        e.target.value = ''; 
      } catch (err) {
        alert("Erro no arquivo de backup. Verifique se o formato JSON é válido.");
      }
    };
    reader.readAsText(file);
  };

  const handleToggleTestMode = () => {
    if (settings.isTestMode) {
      onUpdate({ isTestMode: false });
    } else {
      setShowPasswordPrompt(true);
      setPasswordInput('');
      setPasswordError(false);
    }
  };

  const handleConfirmPassword = () => {
    if (passwordInput === TEST_MODE_PASSWORD) {
      onUpdate({ isTestMode: true });
      setShowPasswordPrompt(false);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
            <SettingsIcon size={24} />
          </div>
          <h1 className={`text-3xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>{t.settings}</h1>
        </div>
        <p className={`${isLight ? 'text-zinc-500' : 'text-zinc-500'} font-medium`}>{t.readyToStudy}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-[2rem] shadow-lg transition-all duration-500 ${isLight ? 'bg-white border border-zinc-100 shadow-zinc-200/40' : 'glass-panel'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2.5 rounded-xl ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <User size={18} />
            </div>
            <h2 className={`text-lg font-bold ${isLight ? 'text-zinc-800' : 'text-white'}`}>{t.profile}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.usernameLabel}</label>
              <input 
                type="text" 
                value={settings.username}
                onChange={(e) => onUpdate({ username: e.target.value })}
                placeholder={t.usernamePlaceholder}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                  isLight 
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-indigo-500' 
                    : 'bg-zinc-900/50 border-zinc-800 text-white focus:border-indigo-500'
                }`}
              />
            </div>
          </div>
        </div>

        {onLogout && (
          <div className={`p-6 rounded-[2rem] shadow-lg transition-all duration-500 ${isLight ? 'bg-white border border-zinc-100 shadow-zinc-200/40' : 'glass-panel'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl ${isLight ? 'bg-rose-50 text-rose-600' : 'bg-rose-500/10 text-rose-400'}`}>
                <LogOut size={18} />
              </div>
              <h2 className={`text-lg font-bold ${isLight ? 'text-zinc-800' : 'text-white'}`}>{t.authSection || 'Conta'}</h2>
            </div>
            <div className="space-y-4">
              <p className={`text-sm ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {t.logoutDescription || 'Seus dados estão sincronizados com a nuvem. Você pode fazer logout e entrar novamente de qualquer dispositivo.'}
              </p>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                <LogOut size={18} />
                <span>{t.logout || 'Sair da Conta'}</span>
              </button>
            </div>
          </div>
        )}

        <div className={`p-6 rounded-[2rem] shadow-lg transition-all duration-500 ${isLight ? 'bg-white border border-zinc-100 shadow-zinc-200/40' : 'glass-panel'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2.5 rounded-xl ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/10 text-amber-400'}`}>
              <Monitor size={18} />
            </div>
            <h2 className={`text-lg font-bold ${isLight ? 'text-zinc-800' : 'text-white'}`}>{t.appearance}</h2>
          </div>
          <div className="space-y-3">
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.chooseTheme}</label>
            <div className="flex gap-3">
              <button 
                onClick={() => onUpdate({ theme: 'light' })}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group ${
                  settings.theme === 'light' 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                    : isLight 
                      ? 'border-zinc-100 hover:border-zinc-200 text-zinc-500' 
                      : 'border-zinc-800 hover:border-zinc-700 text-zinc-500'
                }`}
              >
                <Sun size={20} className={settings.theme === 'light' ? 'animate-spin-slow' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.lightMode}</span>
              </button>
              <button 
                onClick={() => onUpdate({ theme: 'dark' })}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group ${
                  settings.theme === 'dark' 
                    ? 'border-indigo-600 bg-indigo-500/10 text-indigo-400' 
                    : isLight 
                      ? 'border-zinc-100 hover:border-zinc-200 text-zinc-500' 
                      : 'border-zinc-800 hover:border-zinc-700 text-zinc-500'
                }`}
              >
                <Moon size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.darkMode}</span>
              </button>
            </div>
          </div>
        </div>

        {/* COMPORTAMENTO ÉPICO SECTION */}
        <div className={`p-6 rounded-[2rem] shadow-lg md:col-span-2 transition-all duration-500 ${
          isLight ? 'bg-white border border-zinc-100 shadow-zinc-200/40' : 'glass-panel'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isDivineUnlocked ? 'bg-amber-500 text-purple-900' : 'bg-zinc-800 text-zinc-600'}`}>
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isLight ? 'text-zinc-800' : 'text-white'}`}>{t.epicModeLabel}</h2>
                <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>{t.epicModeDescription}</p>
              </div>
            </div>
            <button 
              disabled={!isDivineUnlocked}
              onClick={() => onUpdate({ isEpicMode: !settings.isEpicMode })}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                !isDivineUnlocked 
                  ? 'bg-zinc-800 text-zinc-700 cursor-not-allowed' 
                  : settings.isEpicMode 
                    ? 'bg-amber-500 text-purple-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {settings.isEpicMode ? t.statusActive : t.statusDisabled}
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-[2rem] shadow-lg md:col-span-2 transition-all duration-500 ${isLight ? 'bg-white border border-zinc-100 shadow-zinc-200/40' : 'glass-panel'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2.5 rounded-xl ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'}`}>
              <Languages size={18} />
            </div>
            <h2 className={`text-lg font-bold ${isLight ? 'text-zinc-800' : 'text-white'}`}>{t.languageLabel}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onUpdate({ language: lang.code })}
                className={`flex flex-col items-center gap-2 p-4 rounded-[1.5rem] border-2 transition-all ${
                  settings.language === lang.code
                    ? 'border-indigo-600 bg-indigo-500/10 text-indigo-400 shadow-md'
                    : isLight
                      ? 'border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200'
                      : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MODO TESTE SECTION */}
        <div className={`p-6 rounded-[2.5rem] shadow-lg md:col-span-2 transition-all duration-500 ${
          isLight ? 'bg-indigo-50 border border-indigo-100' : 'bg-indigo-500/5 border border-indigo-500/20'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-600 text-white'}`}>
                <Terminal size={24} />
              </div>
              <div>
                <h2 className={`text-xl font-black ${isLight ? 'text-indigo-900' : 'text-white'}`}>{t.dashboard} / {t.stats}</h2>
                <p className={`text-xs ${isLight ? 'text-indigo-600/70' : 'text-indigo-400/70'}`}>Debug tools.</p>
              </div>
            </div>
            <button 
              onClick={handleToggleTestMode}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                settings.isTestMode 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : isLight ? 'bg-white border-zinc-200 text-zinc-400' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {settings.isTestMode ? t.statusActive : t.statusDisabled}
            </button>
          </div>

          {showPasswordPrompt && (
            <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 animate-slide-down flex flex-col gap-4">
               <div className="flex items-center gap-3 text-indigo-400">
                 <Key size={18} />
                 <span className="text-sm font-bold uppercase tracking-wider">{t.testModeFounderNotice}</span>
               </div>
               <div className="flex gap-3">
                  <input 
                    type="password"
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmPassword()}
                    placeholder={t.passwordPlaceholder}
                    className={`flex-1 px-4 py-3 rounded-xl border outline-none transition-all font-bold ${
                      passwordError 
                        ? 'border-rose-500 bg-rose-500/5' 
                        : (isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950 border-zinc-800 focus:border-indigo-500')
                    }`}
                  />
                  <button 
                    onClick={handleConfirmPassword}
                    className="px-6 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                  >
                    <Check size={16} /> {t.confirm}
                  </button>
                  <button 
                    onClick={() => setShowPasswordPrompt(false)}
                    className={`p-3 rounded-xl border transition-all ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                  >
                    <X size={18} />
                  </button>
               </div>
               {passwordError && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Senha incorreta. Acesso negado.</p>}
            </div>
          )}

          {settings.isTestMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-down">
               <button 
                onClick={onUnlockAll}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-amber-600/20 active:scale-95"
              >
                <Trophy size={18} /> LIBERAR TODAS AS CONQUISTAS
              </button>
              <button 
                onClick={onGenerateTestData}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                <Play size={18} /> GERAR HISTÓRICO DE ESTUDO
              </button>
            </div>
          )}
        </div>

        <div className={`p-6 rounded-[2.5rem] shadow-lg md:col-span-2 transition-all duration-500 ${isLight ? 'bg-white border border-zinc-100 shadow-zinc-200/40' : 'glass-panel'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                <Database size={24} />
              </div>
              <div>
                <h2 className={`text-xl font-black ${isLight ? 'text-zinc-800' : 'text-white'}`}>{t.backup}</h2>
                <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>{t.backupNotice}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                <Download size={16} /> {t.export}
              </button>
              <label className={`flex items-center gap-2 px-4 py-2 cursor-pointer font-bold rounded-xl text-sm transition-all border active:scale-95 ${
                isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
              }`}>
                <Upload size={16} /> {t.import}
                <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
              </label>
              <button 
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95"
              >
                <Trash2 size={16} /> {t.resetData}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-900/40 border-zinc-800'}`}>
              <Clock className="text-indigo-500 mb-2" size={20} />
              <div className={`text-xl font-black font-mono ${isLight ? 'text-zinc-900' : 'text-white'}`}>{statsSummary.totalHours}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.studyTime}</div>
            </div>
            <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-900/40 border-zinc-800'}`}>
              <CheckSquare className="text-emerald-500 mb-2" size={20} />
              <div className={`text-xl font-black font-mono ${isLight ? 'text-zinc-900' : 'text-white'}`}>{statsSummary.totalQuestions}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.totalQuestions}</div>
            </div>
            <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-900/40 border-zinc-800'}`}>
              <Trophy className="text-amber-500 mb-2" size={20} />
              <div className={`text-xl font-black font-mono ${isLight ? 'text-zinc-900' : 'text-white'}`}>{statsSummary.totalAchievements}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.achievements}</div>
            </div>
            <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-900/40 border-zinc-800'}`}>
              <Zap className="text-purple-500 mb-2" size={20} />
              <div className={`text-xl font-black font-mono ${isLight ? 'text-zinc-900' : 'text-white'}`}>{statsSummary.sessionsCount}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.totalSessions}</div>
            </div>
            <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-900/40 border-zinc-800'}`}>
              <Flame className="text-orange-500 mb-2" size={20} />
              <div className={`text-xl font-black font-mono ${isLight ? 'text-zinc-900' : 'text-white'}`}>{statsSummary.currentStreak}</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{t.streakLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
