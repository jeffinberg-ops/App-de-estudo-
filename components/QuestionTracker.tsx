
import React, { useState, useMemo } from 'react';
import { Plus, Minus, CheckCircle, XCircle, BarChart3, CheckSquare } from 'lucide-react';
import { QuestionData, QuestionLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface QuestionTrackerProps {
  subjects: string[];
  questions: Record<string, QuestionData>;
  questionLogs: QuestionLog[];
  subjectColors: Record<string, string>;
  onUpdate: (subject: string, data: QuestionData, logChange: { correct: number, incorrect: number }) => void;
  theme?: 'dark' | 'light';
  t: any;
}

// Filtros agora representam a UNIDADE de agregação
type TimeFilter = 'day' | 'week' | 'month' | 'year';

interface ChartDataItem {
  name: string;
  fullDate: string;
  count: number;
  subjects: Record<string, number>;
}

const CustomTooltip = ({ active, payload, label, isLight, t, subjectColors }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const subjects = Object.entries(data.subjects || {})
      .filter(([_, count]) => (count as number) > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number));

    if (subjects.length === 0 && data.count === 0) return null;

    return (
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${
        isLight ? 'bg-white/95 border-zinc-200' : 'bg-zinc-950/90 border-zinc-800'
      }`}>
        <p className={`text-sm font-black mb-3 border-b pb-2 ${isLight ? 'text-zinc-900 border-zinc-100' : 'text-white border-zinc-800'}`}>
          {label}
        </p>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
          {subjects.length > 0 ? subjects.map(([name, count], index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: subjectColors[name] || '#6366f1' }} 
                />
                <span className={`text-[11px] font-bold truncate max-w-[120px] ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  {name}
                </span>
              </div>
              <span className={`text-[11px] font-mono font-black theme-accent transition-all duration-500`}>
                {count as number}
              </span>
            </div>
          )) : (
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Nenhum dado</p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const QuestionTracker: React.FC<QuestionTrackerProps> = ({ subjects, questions, questionLogs, subjectColors, onUpdate, theme = 'dark', t }) => {
  // Inicializa com visão diária (que corresponde aos últimos 7 dias)
  const [filter, setFilter] = useState<TimeFilter>('day');
  // Usamos agora activePoint para rastrear o que está sob o cursor
  const [activePoint, setActivePoint] = useState<ChartDataItem | null>(null);
  const isLight = theme === 'light';

  const handleUpdate = (subject: string, type: 'correct' | 'incorrect', delta: number) => {
    const current = questions[subject] || { correct: 0, incorrect: 0 };
    const newValue = Math.max(0, current[type] + delta);
    
    const logChange = {
      correct: type === 'correct' ? delta : 0,
      incorrect: type === 'incorrect' ? delta : 0
    };

    onUpdate(subject, { ...current, [type]: newValue }, logChange);
  };

  const chartData: ChartDataItem[] = useMemo(() => {
    const now = new Date();
    const dataMap: Record<string, number> = {};
    const labelMap: Record<string, string> = {};
    const subjectDataMap: Record<string, Record<string, number>> = {};
    const order: string[] = [];
    
    if (filter === 'day') {
      // Agregação Diária: Últimos 7 dias
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dataMap[key] = 0;
        subjectDataMap[key] = {};
        labelMap[key] = d.toLocaleDateString(t.locale, { weekday: 'short' });
        order.push(key);
      }
    } else if (filter === 'week') {
      // Agregação Semanal: Últimas 4 semanas
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - (i * 7));
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));

        const key = monday.toISOString().split('T')[0];
        dataMap[key] = 0;
        subjectDataMap[key] = {};
        labelMap[key] = `${monday.getDate()}/${monday.getMonth() + 1}`;
        order.push(key);
      }
    } else if (filter === 'month') {
      // Agregação Mensal: Últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        dataMap[key] = 0;
        subjectDataMap[key] = {};
        labelMap[key] = d.toLocaleDateString(t.locale, { month: 'short' });
        order.push(key);
      }
    } else if (filter === 'year') {
      // Agregação Anual: Começa em 2026 e vai adiante
      const startYear = 2026;
      const currentYear = new Date().getFullYear();
      const endYear = Math.max(startYear, currentYear);

      for (let y = startYear; y <= endYear; y++) {
        const key = y.toString();
        dataMap[key] = 0;
        subjectDataMap[key] = {};
        labelMap[key] = key;
        order.push(key);
      }
    }

    questionLogs.forEach(log => {
      const logDate = new Date(log.date);
      let key = '';
      
      if (filter === 'year') {
        key = logDate.getFullYear().toString();
      } else if (filter === 'month') {
        key = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
      } else if (filter === 'week') {
        const d = new Date(logDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        key = monday.toISOString().split('T')[0];
      } else {
        key = logDate.toISOString().split('T')[0];
      }

      if (dataMap[key] !== undefined) {
        const totalInLog = Math.max(0, log.correct) + Math.max(0, log.incorrect);
        dataMap[key] += totalInLog;
        if (!subjectDataMap[key][log.subject]) subjectDataMap[key][log.subject] = 0;
        subjectDataMap[key][log.subject] += totalInLog;
      }
    });

    return order.map(key => ({
      name: labelMap[key],
      fullDate: key,
      count: dataMap[key],
      subjects: subjectDataMap[key]
    }));
  }, [questionLogs, filter, t.locale]);

  const totalInPeriod = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  // Atualiza o ponto ativo conforme o mouse se move sobre o gráfico
  const handleMouseMove = (data: any) => {
    if (data && data.activePayload && data.activePayload.length) {
      setActivePoint(data.activePayload[0].payload as ChartDataItem);
    } else {
      setActivePoint(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 theme-logo-bg rounded-2xl text-white shadow-lg transition-all duration-500">
              <CheckSquare size={24} />
            </div>
            <h1 className={`text-3xl font-black theme-text-primary transition-all duration-500`}>{t.questionTrackerTitle}</h1>
          </div>
          <p className={isLight ? 'text-slate-500 font-medium' : 'text-zinc-500 font-medium'}>{t.questionTrackerSubtitle}</p>
        </div>
        
        <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-900/50 border-zinc-800'}`}>
          {(['day', 'week', 'month', 'year'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setActivePoint(null);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                filter === f ? 'theme-logo-bg text-white shadow-lg' : isLight ? 'text-slate-50 hover:text-slate-700' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f === 'day' ? t.day : f === 'week' ? t.week : f === 'month' ? t.month : t.year}
            </button>
          ))}
        </div>
      </div>

      <div className={`p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative transition-all duration-500 ${
        isLight ? 'bg-white border border-slate-100' : 'glass-panel'
      }`}>
        <div className={`absolute top-0 right-0 p-8 opacity-5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
           <BarChart3 size={120} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 relative z-10 gap-4">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
            <BarChart3 size={20} className="text-indigo-500" /> 
            {t.resolvedVolume}
          </h3>
          <div className="flex items-center gap-6">
            {activePoint && (
              <div className="text-right animate-fade-in">
                <span className={`text-[10px] font-black uppercase tracking-widest block text-indigo-500`}>
                  Total em {activePoint.name}
                </span>
                <span className={`text-2xl font-black font-mono text-indigo-500`}>
                  {activePoint.count}
                </span>
              </div>
            )}
            <div className="text-right">
              <span className={`text-[10px] font-black uppercase tracking-widest block ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                Total Geral no Período
              </span>
              <span className={`text-2xl font-black font-mono theme-text-primary transition-all duration-500`}>
                {totalInPeriod}
              </span>
            </div>
          </div>
        </div>
        <div className="h-[250px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setActivePoint(null)}
                style={{ cursor: 'crosshair' }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#f1f5f9" : "#27272a"} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={isLight ? "#94a3b8" : "#52525b"} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                  className="capitalize"
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)' }}
                  content={<CustomTooltip isLight={isLight} t={t} subjectColors={subjectColors} />}
                />
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]} 
                  barSize={filter === 'day' ? 40 : 60}
                >
                  {chartData.map((entry, index) => {
                    const isActive = activePoint?.fullDate === entry.fullDate;
                    const hasData = entry.count > 0;
                    
                    let fillColor = hasData ? '#6366f1' : (isLight ? '#f1f5f9' : '#18181b');
                    if (isActive) fillColor = '#818cf8'; // Cor de destaque ao passar o mouse

                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={fillColor}
                        fillOpacity={activePoint ? (isActive ? 1 : 0.4) : 1}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-full flex flex-col items-center justify-center italic gap-2 ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>
              <p>{t.noDataChart}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => {
          const data = questions[subject] || { correct: 0, incorrect: 0 };
          const total = data.correct + data.incorrect;
          const hitRateValue = total > 0 ? (data.correct / total) * 100 : 0;
          
          let colorClass = isLight ? "text-slate-400" : "text-zinc-400";
          if (total > 0) {
            if (hitRateValue >= 75) colorClass = "text-emerald-500";
            else if (hitRateValue >= 50) colorClass = "text-yellow-500";
            else colorClass = "text-rose-500";
          }

          return (
            <div key={subject} className={`p-6 rounded-3xl flex flex-col shadow-xl group transition-all duration-500 border ${
              isLight 
                ? 'bg-white border-slate-100 hover:border-slate-200' 
                : 'glass-panel hover:border-zinc-500/30'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <h3 className={`font-bold text-lg truncate flex-1 pr-2 ${isLight ? 'text-slate-800' : 'text-zinc-100'}`}>{subject}</h3>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-zinc-800'
                } ${colorClass}`}>
                  {hitRateValue.toFixed(0)}% {t.hitRate}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-2xl border flex flex-col items-center transition-colors ${
                  isLight 
                    ? 'bg-slate-50 border-emerald-500/10 group-hover:bg-slate-100' 
                    : 'bg-zinc-900/50 border-emerald-500/10 group-hover:bg-zinc-900/80'
                }`}>
                  <CheckCircle className="text-emerald-500 mb-2" size={18} />
                  <span className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{data.correct}</span>
                  <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{t.correctPlaceholder}</span>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleUpdate(subject, 'correct', -1)}
                      className={`p-1.5 rounded-xl transition-colors ${isLight ? 'bg-slate-200 text-slate-500 hover:bg-slate-300' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                      <Minus size={14} />
                    </button>
                    <button 
                      onClick={() => handleUpdate(subject, 'correct', 1)}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white transition-all shadow-lg shadow-emerald-600/20 active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex flex-col items-center transition-colors ${
                  isLight 
                    ? 'bg-slate-50 border-rose-500/10 group-hover:bg-slate-100' 
                    : 'bg-zinc-900/50 border-rose-500/10 group-hover:bg-zinc-900/80'
                }`}>
                  <XCircle className="text-rose-500 mb-2" size={18} />
                  <span className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{data.incorrect}</span>
                  <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>{t.incorrectPlaceholder}</span>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleUpdate(subject, 'incorrect', -1)}
                      className={`p-1.5 rounded-xl transition-colors ${isLight ? 'bg-slate-200 text-slate-500 hover:bg-slate-300' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                      <Minus size={14} />
                    </button>
                    <button 
                      onClick={() => handleUpdate(subject, 'incorrect', 1)}
                      className="p-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-white transition-all shadow-lg shadow-rose-600/20 active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className={`mt-auto pt-4 border-t ${isLight ? 'border-slate-100' : 'border-zinc-800/50'}`}>
                <div className={`flex justify-between items-center text-xs font-bold uppercase tracking-tight ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  <span>{t.totalResolved}</span>
                  <span className={isLight ? 'text-slate-900' : 'text-zinc-200'}>{total}</span>
                </div>
                <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    style={{ width: `${hitRateValue}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {subjects.length === 0 && (
          <div className={`col-span-full py-20 text-center rounded-3xl border ${isLight ? 'bg-white border-slate-100' : 'glass-panel'}`}>
            <p className={`italic ${isLight ? 'text-slate-400' : 'text-zinc-600'}`}>{t.addSubjectsStats}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionTracker;
