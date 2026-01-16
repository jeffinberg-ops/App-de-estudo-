
import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, BookOpen, Calendar, Award } from 'lucide-react';
import { StudyLog } from '../types';
import { formatTimeShort, toLocalISO, getWeekRange, getPreviousWeekRange, createTopicKey } from '../utils';

interface WeeklyGoalsProps {
  subjects: string[];
  topics: Record<string, string[]>;
  logs: StudyLog[];
  goals: Record<string, number>;
  topicGoals: Record<string, number>;
  onSetGoal: (subject: string, hours: number) => void;
  onSetTopicGoal: (topicKey: string, hours: number) => void;
  theme?: 'dark' | 'light';
  t: any;
}

const WeeklyGoals: React.FC<WeeklyGoalsProps> = ({ 
  subjects, 
  topics, 
  logs, 
  goals, 
  topicGoals, 
  onSetGoal, 
  onSetTopicGoal, 
  theme = 'dark', 
  t 
}) => {
  const isLight = theme === 'light';
  const [selectedSubjectForTopic, setSelectedSubjectForTopic] = useState('');
  const [selectedTopicForGoal, setSelectedTopicForGoal] = useState('');

  const { start: startOfWeek, end: endOfWeek } = getWeekRange();
  const { start: startOfLastWeek, end: endOfLastWeek } = getPreviousWeekRange();
  
  const logsThisWeek = useMemo(() => 
    logs.filter(l => {
      const logDate = toLocalISO(new Date(l.date));
      return logDate >= startOfWeek && logDate <= endOfWeek;
    }), 
    [logs, startOfWeek, endOfWeek]
  );
  
  const logsLastWeek = useMemo(() => 
    logs.filter(l => {
      const logDate = toLocalISO(new Date(l.date));
      return logDate >= startOfLastWeek && logDate <= endOfLastWeek;
    }), 
    [logs, startOfLastWeek, endOfLastWeek]
  );
  
  // Weekly insights calculations
  const weeklyInsights = useMemo(() => {
    const totalSecondsThisWeek = logsThisWeek.reduce((sum, log) => sum + log.duration, 0);
    const totalHoursThisWeek = totalSecondsThisWeek / 3600;
    
    const totalSecondsLastWeek = logsLastWeek.reduce((sum, log) => sum + log.duration, 0);
    const totalHoursLastWeek = totalSecondsLastWeek / 3600;
    
    const difference = totalHoursThisWeek - totalHoursLastWeek;
    
    // Most studied subject
    const subjectTime: Record<string, number> = {};
    logsThisWeek.forEach(log => {
      subjectTime[log.subject] = (subjectTime[log.subject] || 0) + log.duration;
    });
    const mostStudiedSubject = Object.entries(subjectTime).sort((a, b) => b[1] - a[1])[0];
    
    // Most studied topic
    const topicTime: Record<string, number> = {};
    logsThisWeek.forEach(log => {
      if (log.topic) {
        const key = `${log.subject} - ${log.topic}`;
        topicTime[key] = (topicTime[key] || 0) + log.duration;
      }
    });
    const mostStudiedTopic = Object.entries(topicTime).sort((a, b) => b[1] - a[1])[0];
    
    // Number of unique study days
    const uniqueDays = new Set(logsThisWeek.map(log => toLocalISO(new Date(log.date))));
    
    return {
      totalHoursThisWeek,
      totalHoursLastWeek,
      difference,
      mostStudiedSubject,
      mostStudiedTopic,
      studyDays: uniqueDays.size
    };
  }, [logsThisWeek, logsLastWeek]);

  const handleSetTopicGoal = () => {
    if (selectedSubjectForTopic && selectedTopicForGoal) {
      const topicKey = createTopicKey(selectedSubjectForTopic, selectedTopicForGoal);
      const currentGoal = topicGoals[topicKey] || 0;
      const newGoalStr = prompt(t.setTopicGoalPrompt || `Meta semanal para "${selectedTopicForGoal}" (horas):`, currentGoal.toString());
      if (newGoalStr !== null) {
        const parsedValue = parseFloat(newGoalStr);
        const hours = isNaN(parsedValue) ? 0 : Math.max(0, parsedValue);
        onSetTopicGoal(topicKey, hours);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 theme-logo-bg rounded-2xl text-white shadow-lg transition-all duration-500">
            <Target size={24} />
          </div>
          <h1 className={`text-3xl font-black theme-text-primary transition-all duration-500`}>{t.weeklyGoalsTitle}</h1>
        </div>
        <p className={isLight ? 'text-zinc-500 font-bold' : 'text-zinc-500 font-medium'}>{t.weeklyGoalsSubtitle}</p>
      </div>

      {/* Weekly Insights */}
      <div className={`p-6 rounded-3xl border ${isLight ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100' : 'glass-panel'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 theme-logo-bg rounded-xl text-white transition-all duration-500">
            <TrendingUp size={20} />
          </div>
          <h2 className={`text-xl font-black theme-text-primary transition-all duration-500`}>
            {t.weeklyInsights || 'Insights Semanais'}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-2xl ${isLight ? 'bg-white border border-indigo-100' : 'bg-zinc-900/40'}`}>
            <div className={`text-sm font-bold mb-2 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.totalThisWeek || 'Total Esta Semana'}
            </div>
            <div className={`text-3xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {weeklyInsights.totalHoursThisWeek.toFixed(1)}h
            </div>
            {weeklyInsights.totalHoursLastWeek > 0 && (
              <div className={`text-xs mt-2 font-bold ${
                weeklyInsights.difference > 0 
                  ? 'text-emerald-500' 
                  : weeklyInsights.difference < 0 
                  ? 'text-red-500' 
                  : isLight ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
                {weeklyInsights.difference > 0 && `+${weeklyInsights.difference.toFixed(1)}h `}
                {weeklyInsights.difference < 0 && `${weeklyInsights.difference.toFixed(1)}h `}
                {weeklyInsights.difference === 0 && '0h '}
                {weeklyInsights.difference > 0 && (t.moreThanLastWeek || 'a mais')}
                {weeklyInsights.difference < 0 && (t.lessThanLastWeek || 'a menos')}
                {weeklyInsights.difference === 0 && (t.sameAsLastWeek || 'igual')}
              </div>
            )}
          </div>
          
          <div className={`p-4 rounded-2xl ${isLight ? 'bg-white border border-indigo-100' : 'bg-zinc-900/40'}`}>
            <div className={`text-sm font-bold mb-2 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.mostStudiedSubject || 'Matéria Mais Estudada'}
            </div>
            <div className={`text-lg font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {weeklyInsights.mostStudiedSubject?.[0] || '-'}
            </div>
            {weeklyInsights.mostStudiedSubject && (
              <div className={`text-xs mt-2 font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {formatTimeShort(weeklyInsights.mostStudiedSubject[1])}
              </div>
            )}
          </div>
          
          <div className={`p-4 rounded-2xl ${isLight ? 'bg-white border border-indigo-100' : 'bg-zinc-900/40'}`}>
            <div className={`text-sm font-bold mb-2 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.mostStudiedTopic || 'Tópico Mais Estudado'}
            </div>
            <div className={`text-lg font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {weeklyInsights.mostStudiedTopic?.[0] || '-'}
            </div>
            {weeklyInsights.mostStudiedTopic && (
              <div className={`text-xs mt-2 font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {formatTimeShort(weeklyInsights.mostStudiedTopic[1])}
              </div>
            )}
          </div>
          
          <div className={`p-4 rounded-2xl ${isLight ? 'bg-white border border-indigo-100' : 'bg-zinc-900/40'}`}>
            <div className={`text-sm font-bold mb-2 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.studyDaysThisWeek || 'Dias de Estudo'}
            </div>
            <div className={`text-3xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {weeklyInsights.studyDays}
            </div>
            <div className={`text-xs mt-2 font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {t.of || 'de'} 7 {t.days || 'dias'}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Goals */}
      <div>
        <h2 className={`text-xl font-black mb-4 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
          {t.subjectGoals || 'Metas por Matéria'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(sub => {
            const durSec = logsThisWeek.filter(l => l.subject === sub).reduce((a, c) => a + c.duration, 0);
            const durHours = durSec / 3600;
            const goal = goals[sub] || 0;
            const pct = goal > 0 ? Math.min((durHours / goal) * 100, 100) : 0;

            return (
              <div key={sub} className={`p-6 rounded-3xl relative overflow-hidden group border transition-all duration-500 shadow-lg ${
                isLight ? 'bg-white border-zinc-100 shadow-zinc-200/40' : 'glass-panel'
              }`}>
                <div className="flex justify-between items-center mb-6">
                  <span className={`font-bold text-lg truncate pr-2 ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>{sub}</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.5" 
                      min="0"
                      value={goal} 
                      onChange={(e) => onSetGoal(sub, parseFloat(e.target.value) || 0)} 
                      className={`w-20 border rounded-xl px-3 py-1.5 text-center text-sm font-bold text-indigo-500 outline-none focus:border-indigo-500 transition-colors ${
                        isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/50 border-zinc-700'
                      }`}
                    />
                    <span className={`text-xs font-bold uppercase ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>hrs</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`flex justify-between text-xs font-bold mb-1 ${isLight ? 'text-zinc-400' : 'text-zinc-400'}`}>
                    <span>{t.summary}</span>
                    <span className={isLight ? 'text-zinc-600' : 'text-zinc-200'}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden shadow-inner ${isLight ? 'bg-zinc-100' : 'bg-zinc-900'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${pct >= 100 ? 'bg-emerald-500' : 'theme-logo-bg'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className={`flex justify-between text-[11px] font-bold tracking-tight pt-2 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <span>{formatTimeShort(durSec)}</span>
                    <span>{t.goals}: {goal}h</span>
                  </div>
                </div>
              </div>
            );
          })}
          {subjects.length === 0 && (
            <div className={`col-span-full text-center py-20 rounded-3xl border ${isLight ? 'bg-white border-zinc-100 text-zinc-400' : 'glass-panel text-zinc-600'}`}>
              {t.addSubjectsStats}
            </div>
          )}
        </div>
      </div>

      {/* Topic Goals */}
      <div>
        <h2 className={`text-xl font-black mb-4 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
          {t.topicGoalsTitle || 'Metas por Tópico'}
        </h2>
        
        <div className={`p-6 rounded-3xl border mb-6 ${isLight ? 'bg-white border-zinc-100' : 'glass-panel'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedSubjectForTopic}
              onChange={(e) => {
                setSelectedSubjectForTopic(e.target.value);
                setSelectedTopicForGoal('');
              }}
              className={`flex-1 px-4 py-3 rounded-xl border font-bold outline-none transition-colors ${
                isLight 
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                  : 'bg-zinc-900/50 border-zinc-700 text-white'
              }`}
            >
              <option value="">{t.selectSubjectForTopic || 'Selecione a matéria'}</option>
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            
            <select
              value={selectedTopicForGoal}
              onChange={(e) => setSelectedTopicForGoal(e.target.value)}
              disabled={!selectedSubjectForTopic}
              className={`flex-1 px-4 py-3 rounded-xl border font-bold outline-none transition-colors ${
                isLight 
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                  : 'bg-zinc-900/50 border-zinc-700 text-white'
              } disabled:opacity-50`}
            >
              <option value="">{t.selectTopicForGoal || 'Selecione o tópico'}</option>
              {selectedSubjectForTopic && topics[selectedSubjectForTopic]?.map(tp => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
            
            <button
              onClick={handleSetTopicGoal}
              disabled={!selectedSubjectForTopic || !selectedTopicForGoal}
              className={`px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed theme-logo-bg text-white hover:opacity-90`}
            >
              {t.setGoal || 'Definir Meta'}
            </button>
          </div>
        </div>
        
        {/* Display existing topic goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(topicGoals).filter(([_, hours]) => hours > 0).map(([topicKey, goalHours]) => {
            const parts = topicKey.split('::');
            const subject = parts[0];
            const topic = parts[1];
            
            const durSec = logsThisWeek.filter(l => l.subject === subject && l.topic === topic).reduce((a, c) => a + c.duration, 0);
            const durHours = durSec / 3600;
            const pct = goalHours > 0 ? Math.min((durHours / goalHours) * 100, 100) : 0;
            
            return (
              <div key={topicKey} className={`p-5 rounded-2xl border ${
                isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isLight ? 'bg-zinc-100' : 'bg-zinc-800'}`}>
                    <BookOpen size={18} className="text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-sm ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      {topic}
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {subject}
                    </p>
                  </div>
                  <div className={`text-xs font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {goalHours}h
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-zinc-100' : 'bg-zinc-900'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className={`flex justify-between text-[10px] font-bold ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <span>{formatTimeShort(durSec)}</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {Object.keys(topicGoals).filter(k => topicGoals[k] > 0).length === 0 && (
          <div className={`text-center py-12 rounded-3xl border ${
            isLight ? 'bg-white border-zinc-100 text-zinc-400' : 'glass-panel text-zinc-600'
          }`}>
            <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-bold">{t.noTopicsAvailable || 'Nenhum tópico com meta definida'}</p>
            <p className="text-sm mt-2">{t.addTopicsFirst || 'Configure metas para tópicos acima'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyGoals;
