
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Clock, Zap, BookOpen, Target } from 'lucide-react';
import { StudyLog, ReviewState, ExamEvent } from '../types';
import { formatTimeShort, toLocalISO, parseTopicKey } from '../utils';

interface CalendarViewProps {
  logs: StudyLog[];
  reviewStates?: Record<string, ReviewState>;
  examEvents?: ExamEvent[];
  theme?: 'dark' | 'light';
  t: any;
}

const CalendarView: React.FC<CalendarViewProps> = ({ logs, reviewStates = {}, examEvents = [], theme = 'dark', t }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const isLight = theme === 'light';

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    const firstDay = date.getDay();
    const firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;
    
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString(t.locale, { month: 'long' });
  const yearValue = currentDate.getFullYear();

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getLogsForDate = (date: Date) => {
    const dateStr = toLocalISO(date);
    return logs.filter(log => {
      const logLocalDate = toLocalISO(new Date(log.date));
      return logLocalDate === dateStr;
    });
  };

  const getReviewsForDate = (date: Date) => {
    const dateStr = toLocalISO(date);
    return Object.entries(reviewStates).filter(([key, state]) => {
      const dueDate = toLocalISO(new Date(state.dueAt));
      return dueDate === dateStr;
    });
  };

  const getExamsForDate = (date: Date) => {
    const dateStr = toLocalISO(date);
    return examEvents.filter(exam => {
      const examDate = toLocalISO(new Date(exam.date));
      return examDate === dateStr;
    });
  };

  const selectedDayLogs = useMemo(() => {
    return selectedDate ? getLogsForDate(selectedDate) : [];
  }, [selectedDate, logs]);

  const selectedDayReviews = useMemo(() => {
    return selectedDate ? getReviewsForDate(selectedDate) : [];
  }, [selectedDate, reviewStates]);

  const selectedDayExams = useMemo(() => {
    return selectedDate ? getExamsForDate(selectedDate) : [];
  }, [selectedDate, examEvents]);

  const weekDays = useMemo(() => {
    const baseDate = new Date(2021, 0, 4); 
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      return d.toLocaleDateString(t.locale, { weekday: 'short' });
    });
  }, [t.locale]);

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
              <CalendarIcon size={24} />
            </div>
            <h1 className={`text-3xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>{t.historyTitle}</h1>
          </div>
          <p className={isLight ? 'text-zinc-500 font-bold' : 'text-zinc-500 font-medium'}>{t.historySubtitle}</p>
        </div>

        <div className={`flex items-center gap-4 p-2 rounded-2xl border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-900/50 border-zinc-800'}`}>
          <button 
            onClick={() => changeMonth(-1)}
            className={`p-2 rounded-xl transition-colors ${isLight ? 'hover:bg-zinc-200 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            <ChevronLeft size={20} />
          </button>
          <div className={`min-w-[140px] text-center font-bold text-lg capitalize ${isLight ? 'text-zinc-800' : 'text-white'}`}>
            {monthName} <span className={`${isLight ? 'text-zinc-400' : 'text-zinc-500'} font-medium`}>{yearValue}</span>
          </div>
          <button 
            onClick={() => changeMonth(1)}
            className={`p-2 rounded-xl transition-colors ${isLight ? 'hover:bg-zinc-200 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={`rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 border ${
        isLight ? 'bg-white border-zinc-100' : 'glass-panel'
      }`}>
        <div className={`grid grid-cols-7 border-b ${isLight ? 'border-zinc-100 bg-zinc-50/50' : 'border-zinc-800/50 bg-zinc-900/30'}`}>
          {weekDays.map(day => (
            <div key={day} className={`py-4 text-center text-xs font-bold uppercase tracking-widest border-r last:border-r-0 ${
              isLight ? 'text-zinc-400 border-zinc-100' : 'text-zinc-500 border-zinc-800/50'
            }`}>
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {daysInMonth.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className={`aspect-square border-r border-b ${isLight ? 'bg-zinc-50/20 border-zinc-100' : 'bg-zinc-950/20 border-zinc-800/50'}`} />;
            
            const dayLogs = getLogsForDate(date);
            const dayReviews = getReviewsForDate(date);
            const dayExams = getExamsForDate(date);
            const isToday = toLocalISO(new Date()) === toLocalISO(date);
            const hasActivity = dayLogs.length > 0 || dayReviews.length > 0 || dayExams.length > 0;
            
            const uniqueSubjects = Array.from(new Set(dayLogs.map(l => l.subject)));
            const totalDuration = dayLogs.reduce((acc, curr) => acc + curr.duration, 0);

            return (
              <button 
                key={date.toISOString()} 
                onClick={() => setSelectedDate(date)}
                className={`
                  aspect-square border-r border-b p-2 md:p-3 relative group transition-all flex flex-col gap-1 text-left outline-none
                  ${isLight ? 'border-zinc-100' : 'border-zinc-800/50'}
                  ${isToday ? (isLight ? 'bg-indigo-50' : 'bg-indigo-600/5') : (isLight ? 'hover:bg-zinc-50' : 'hover:bg-zinc-800/20')}
                  ${hasActivity ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                <div className="flex justify-between items-start w-full">
                  <span className={`
                    text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-transform group-hover:scale-110
                    ${isToday ? 'bg-indigo-600 text-white shadow-lg' : isLight ? 'text-zinc-400' : 'text-zinc-400'}
                  `}>
                    {date.getDate()}
                  </span>
                  {totalDuration > 0 && (
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      {formatTimeShort(totalDuration)}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-col gap-1 overflow-hidden w-full">
                  {uniqueSubjects.slice(0, 1).map(sub => (
                    <div key={sub} className={`text-[9px] md:text-[10px] font-medium border px-1.5 py-0.5 rounded truncate ${
                      isLight ? 'text-zinc-600 bg-zinc-50 border-zinc-200/50' : 'text-zinc-300 bg-zinc-800/50 border-zinc-700/50'
                    }`}>
                      {sub}
                    </div>
                  ))}
                  {uniqueSubjects.length > 1 && (
                    <div className={`text-[9px] italic px-1 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      + {uniqueSubjects.length - 1} {t.more || 'more'}
                    </div>
                  )}
                  
                  {dayReviews.length > 0 && (
                    <div className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      isLight ? 'text-amber-700 bg-amber-50 border-amber-200/50' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}>
                      {t.reviewsLabel || 'Revisões'}: {dayReviews.length}
                    </div>
                  )}
                  
                  {dayExams.length > 0 && (
                    <div className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded border truncate ${
                      isLight ? 'text-rose-700 bg-rose-50 border-rose-200/50' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    }`}>
                      {dayExams[0].name}{dayExams.length > 1 ? ` +${dayExams.length - 1}` : ''}
                    </div>
                  )}
                </div>

                {hasActivity && (
                  <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all group-hover:scale-150" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="flex gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-indigo-600"></div>
          <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.todayLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
          <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.activityLabel}</span>
        </div>
      </div>

      {/* Modal de Detalhes do Dia */}
      {selectedDate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedDate(null)}
          />
          <div className={`relative w-full max-w-xl max-h-[80vh] overflow-hidden rounded-[2.5rem] shadow-2xl border flex flex-col animate-slide-in ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-800 text-white'
          }`}>
            <div className={`p-6 border-b flex items-center justify-between ${isLight ? 'bg-zinc-50' : 'bg-zinc-900/50'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black capitalize">
                    {selectedDate.toLocaleDateString(t.locale, { weekday: 'long' })}
                  </h3>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {selectedDate.toLocaleDateString(t.locale, { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-zinc-200 text-zinc-400' : 'hover:bg-zinc-800 text-zinc-500 hover:text-white'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {/* Exam Events Section */}
              {selectedDayExams.length > 0 && (
                <div className="space-y-3">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {t.examsLabel || 'Provas / Simulados'}
                  </h3>
                  {selectedDayExams.map((exam) => (
                    <div 
                      key={exam.id}
                      className={`p-4 rounded-2xl border ${
                        isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-900/20 border-rose-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                          <Target size={20} className="text-rose-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold ${isLight ? 'text-rose-900' : 'text-rose-200'}`}>
                            {exam.name}
                          </h4>
                          <p className={`text-xs font-medium ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
                            {new Date(exam.date).toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Items Section */}
              {selectedDayReviews.length > 0 && (
                <div className="space-y-3">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {t.reviewsLabel || 'Revisões'}
                  </h3>
                  {selectedDayReviews.map(([key, state]) => {
                    const { subject, topic } = parseTopicKey(key);
                    return (
                      <div 
                        key={key}
                        className={`p-4 rounded-2xl border ${
                          isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-900/20 border-amber-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 rounded-lg">
                            <BookOpen size={20} className="text-amber-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-bold ${isLight ? 'text-amber-900' : 'text-amber-200'}`}>
                              {topic}
                            </h4>
                            <p className={`text-xs font-medium ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                              {subject} • {state.reviewCount} {state.reviewCount === 1 ? (t.review || 'revisão') : (t.reviews || 'revisões')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Study Logs Section */}
              {selectedDayLogs.length > 0 && (
                <div className="space-y-4">
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {t.breakdown || 'Breakdown'}
                  </h3>
                  {(() => {
                    // Group by subject and topic
                    const grouped: Record<string, Record<string, { duration: number; count: number }>> = {};
                    
                    selectedDayLogs.forEach(log => {
                      if (!grouped[log.subject]) {
                        grouped[log.subject] = {};
                      }
                      const topicKey = log.topic || t.noTopicLabel || 'Geral';
                      if (!grouped[log.subject][topicKey]) {
                        grouped[log.subject][topicKey] = { duration: 0, count: 0 };
                      }
                      grouped[log.subject][topicKey].duration += log.duration;
                      grouped[log.subject][topicKey].count += 1;
                    });
                    
                    return (
                      <>
                        {Object.entries(grouped).map(([subject, topics]) => (
                          <div key={subject} className={`p-4 rounded-2xl border ${
                            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/40 border-zinc-800'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className={`font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                                {subject}
                              </h4>
                              <span className="text-sm font-mono font-bold text-indigo-600">
                                {formatTimeShort(Object.values(topics).reduce((sum, t) => sum + t.duration, 0))}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              {Object.entries(topics).map(([topic, data]) => (
                                <div 
                                  key={topic}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                                    isLight ? 'bg-white border border-zinc-200' : 'bg-zinc-950/40'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <BookOpen size={14} className={isLight ? 'text-zinc-400' : 'text-zinc-500'} />
                                    <span className={`text-sm ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                                      {topic}
                                    </span>
                                    <span className={`text-xs ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                      ({data.count} {data.count === 1 ? (t.session || 'sessão') : (t.sessions || 'sessões')})
                                    </span>
                                  </div>
                                  <span className="text-sm font-mono font-bold text-indigo-500">
                                    {formatTimeShort(data.duration)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        <div className={`pt-4 border-t flex justify-between items-center ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`}>
                          <span className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.totalDay || 'Daily Total'}</span>
                          <span className="text-xl font-black font-mono text-indigo-600">
                            {formatTimeShort(selectedDayLogs.reduce((acc, curr) => acc + curr.duration, 0))}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Empty state */}
              {selectedDayLogs.length === 0 && selectedDayReviews.length === 0 && selectedDayExams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-40 gap-4">
                  <Clock size={48} className="text-zinc-600" />
                  <p className="font-bold text-xs uppercase tracking-widest">{t.noActivityToday || 'No activity today'}</p>
                </div>
              )}
            </div>
            
            <div className={`p-6 border-t ${isLight ? 'bg-zinc-50' : 'bg-zinc-950'}`}>
               <button 
                onClick={() => setSelectedDate(null)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 text-sm uppercase tracking-widest"
               >
                 {t.save.toUpperCase()}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
