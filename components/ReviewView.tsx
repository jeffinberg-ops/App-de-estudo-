
import React, { useMemo, useState } from 'react';
import { Calendar, Clock, TrendingUp, BookOpen, Target, CalendarClock, LifeBuoy } from 'lucide-react';
import { ReviewState } from '../types';
import { parseTopicKey, toLocalISO, daysBetween } from '../utils';

interface ReviewViewProps {
  reviewStates: Record<string, ReviewState>;
  theme?: 'dark' | 'light';
  t: any;
  onPostpone?: (topicKey: string) => void;
  isVacationMode?: boolean;
  reviewSessionLimit?: number;
}

interface DueTopicInfo {
  topicKey: string;
  subject: string;
  topic: string;
  reviewState: ReviewState;
  daysOverdue: number;
}

const ReviewView: React.FC<ReviewViewProps> = ({ reviewStates, theme = 'dark', t, onPostpone, isVacationMode = false, reviewSessionLimit = 0 }) => {
  const isLight = theme === 'light';
  const [sortBy, setSortBy] = useState<'overdue' | 'subject'>('overdue');
  
  const dueTopics = useMemo(() => {
    const today = toLocalISO(new Date());
    const topics: DueTopicInfo[] = [];
    
    Object.entries(reviewStates || {}).forEach(([key, state]) => {
      const dueDate = toLocalISO(new Date(state.dueAt));
      const daysDifference = daysBetween(dueDate, today);
      
      if (daysDifference >= 0) {
        const { subject, topic } = parseTopicKey(key);
        topics.push({
          topicKey: key,
          subject,
          topic,
          reviewState: state,
          daysOverdue: daysDifference
        });
      }
    });
    
    // Sort by overdue first or by subject
    if (sortBy === 'overdue') {
      topics.sort((a, b) => b.daysOverdue - a.daysOverdue);
    } else {
      topics.sort((a, b) => {
        if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
        return a.topic.localeCompare(b.topic);
      });
    }
    
    // Apply session limit if set
    if (reviewSessionLimit > 0) {
      return topics.slice(0, reviewSessionLimit);
    }
    
    return topics;
  }, [reviewStates, sortBy, reviewSessionLimit]);
  
  const upcomingTopics = useMemo(() => {
    const today = toLocalISO(new Date());
    const topics: DueTopicInfo[] = [];
    
    Object.entries(reviewStates || {}).forEach(([key, state]) => {
      const dueDate = toLocalISO(new Date(state.dueAt));
      const daysDifference = daysBetween(dueDate, today);
      
      if (daysDifference < 0) {
        const { subject, topic } = parseTopicKey(key);
        topics.push({
          topicKey: key,
          subject,
          topic,
          reviewState: state,
          daysOverdue: daysDifference
        });
      }
    });
    
    topics.sort((a, b) => a.daysOverdue - b.daysOverdue);
    return topics.slice(0, 5);
  }, [reviewStates]);
  
  const getAccuracyRate = (state: ReviewState): number => {
    const total = state.correctTotal + state.incorrectTotal;
    if (total === 0) return 0;
    return (state.correctTotal / total) * 100;
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 theme-logo-bg rounded-2xl text-white shadow-lg transition-all duration-500">
            <Calendar size={24} />
          </div>
          <h1 className={`text-3xl font-black theme-text-primary transition-all duration-500`}>
            {t.reviewTitle || 'Revisar Hoje'}
          </h1>
        </div>
        <p className={isLight ? 'text-zinc-500 font-bold' : 'text-zinc-500 font-medium'}>
          {t.reviewSubtitle || 'Revise os tópicos agendados para reforçar seu aprendizado'}
        </p>
      </div>
      
      {/* Vacation Mode Banner */}
      {isVacationMode && (
        <div className={`p-5 rounded-2xl border-2 ${
          isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <CalendarClock size={24} className="text-amber-500" />
            <div>
              <h3 className={`font-bold ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
                {t.vacationModeActive || 'Modo Férias está ativo - revisões pausadas'}
              </h3>
              <p className={`text-sm ${isLight ? 'text-amber-700' : 'text-amber-500/80'}`}>
                {t.vacationModeDesc || 'Todos os agendamentos de revisão estão pausados'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-zinc-100' : 'glass-panel'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Clock size={20} className="text-red-500" />
            </div>
            <span className={`text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.overdueReviews || 'Atrasados'}
            </span>
          </div>
          <div className={`text-3xl font-black theme-text-primary transition-all duration-500`}>
            {dueTopics.filter(t => t.daysOverdue > 0).length}
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-zinc-100' : 'glass-panel'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Target size={20} className="text-amber-500" />
            </div>
            <span className={`text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.dueToday || 'Para Hoje'}
            </span>
          </div>
          <div className={`text-3xl font-black theme-text-primary transition-all duration-500`}>
            {dueTopics.filter(t => t.daysOverdue === 0).length}
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-zinc-100' : 'glass-panel'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp size={20} className="text-emerald-500" />
            </div>
            <span className={`text-sm font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {t.totalTopics || 'Total de Tópicos'}
            </span>
          </div>
          <div className={`text-3xl font-black theme-text-primary transition-all duration-500`}>
            {Object.keys(reviewStates || {}).length}
          </div>
        </div>
      </div>
      
      {/* Sort Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('overdue')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            sortBy === 'overdue'
              ? 'bg-indigo-600 text-white'
              : isLight
              ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          {t.sortByOverdue || 'Mais Atrasados'}
        </button>
        <button
          onClick={() => setSortBy('subject')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            sortBy === 'subject'
              ? 'bg-indigo-600 text-white'
              : isLight
              ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          {t.sortBySubject || 'Por Matéria'}
        </button>
      </div>
      
      {/* Due Topics List */}
      <div>
        <h2 className={`text-xl font-black mb-4 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
          {t.reviewNow || 'Para Revisar Agora'} ({dueTopics.length})
        </h2>
        
        {dueTopics.length === 0 ? (
          <div className={`p-12 rounded-3xl border text-center ${
            isLight ? 'bg-white border-zinc-100' : 'glass-panel'
          }`}>
            <div className="flex flex-col items-center gap-4 opacity-40">
              <Calendar size={64} className={isLight ? 'text-zinc-400' : 'text-zinc-600'} />
              <div>
                <h3 className={`font-black text-lg mb-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {t.noDueTopics || 'Nenhum tópico para revisar'}
                </h3>
                <p className={`text-sm ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {t.noDueTopicsDesc || 'Continue estudando com tópicos selecionados para agendar revisões'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {dueTopics.map((item) => {
              const accuracy = getAccuracyRate(item.reviewState);
              const hasQuestions = item.reviewState.correctTotal + item.reviewState.incorrectTotal > 0;
              
              return (
                <div
                  key={item.topicKey}
                  className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                    isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${isLight ? 'bg-zinc-100' : 'bg-zinc-800'}`}>
                        <BookOpen size={24} className="text-indigo-500" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                          {item.topic}
                        </h3>
                        <p className={`text-sm font-medium mb-2 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          {item.subject}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 text-xs">
                          {/* Recovery Mode Indicator */}
                          {item.reviewState.inRecoveryMode && (
                            <div className="px-3 py-1 rounded-lg font-bold bg-orange-500/10 text-orange-500 flex items-center gap-1.5">
                              <LifeBuoy size={14} />
                              {t.recoveryMode}
                              {item.reviewState.recoveryAttempts !== undefined && ` (${item.reviewState.recoveryAttempts + 1}ª tentativa)`}
                            </div>
                          )}
                          
                          <div className={`px-3 py-1 rounded-lg font-bold ${
                            item.daysOverdue > 0
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {item.daysOverdue > 0
                              ? `${item.daysOverdue} ${t.daysOverdue || 'dias atrasado'}`
                              : t.dueToday || 'Para hoje'}
                          </div>
                          
                          <div className={`px-3 py-1 rounded-lg font-bold ${
                            isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {item.reviewState.reviewCount} {t.reviews || 'revisões'}
                          </div>
                          
                          {hasQuestions && (
                            <div className={`px-3 py-1 rounded-lg font-bold ${
                              accuracy >= 70
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : accuracy >= 50
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {accuracy.toFixed(0)}% {t.accuracy || 'acerto'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Postpone Button */}
                    {onPostpone && !isVacationMode && (
                      <button
                        onClick={() => onPostpone(item.topicKey)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                          isLight 
                            ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' 
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        <CalendarClock size={18} />
                        {t.postpone || 'Adiar'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Upcoming Reviews */}
      {upcomingTopics.length > 0 && (
        <div>
          <h2 className={`text-xl font-black mb-4 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            {t.upcomingReviews || 'Próximas Revisões'}
          </h2>
          <div className="space-y-3">
            {upcomingTopics.map((item) => (
              <div
                key={item.topicKey}
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/20 border-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} className={isLight ? 'text-zinc-400' : 'text-zinc-500'} />
                    <div>
                      <h4 className={`font-bold text-sm ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        {item.topic}
                      </h4>
                      <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        {item.subject}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-3 py-1 rounded-lg ${
                    isLight ? 'bg-zinc-200 text-zinc-600' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {t.inDays || 'em'} {Math.abs(item.daysOverdue)} {t.days || 'dias'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewView;
