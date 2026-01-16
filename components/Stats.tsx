
import React, { useMemo } from 'react';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, Clock, Layers, BarChart2, Calendar, TrendingUp } from 'lucide-react';
import { StudyLog, ReviewState } from '../types';
import { formatTimeShort, toLocalISO, parseTopicKey, daysBetween } from '../utils';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart
} from 'recharts';

interface StatsProps {
  subjects: string[];
  logs: StudyLog[];
  subjectColors: Record<string, string>;
  reviewStates?: Record<string, ReviewState>;
  theme?: 'dark' | 'light';
  t: any;
}

const adjustColor = (hex: string, percent: number) => {
  const num = parseInt(hex.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
};

const CustomTooltip = ({ active, payload, label, isLight, t }: any) => {
  if (active && payload && payload.length) {
    // Filtramos apenas os tópicos que têm valor > 0 para esta matéria
    const activeTopics = payload
      .filter((p: any) => p.value > 0)
      .sort((a: any, b: any) => b.value - a.value);

    const totalHours = activeTopics.reduce((acc: number, p: any) => acc + p.value, 0);

    return (
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${
        isLight ? 'bg-white/95 border-zinc-200' : 'bg-zinc-950/90 border-zinc-800'
      }`}>
        <p className={`text-sm font-black mb-3 border-b pb-2 ${isLight ? 'text-zinc-900 border-zinc-100' : 'text-white border-zinc-800'}`}>
          {label}
          <span className={`block text-[10px] uppercase tracking-widest mt-1 ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Total: {formatTimeShort(Math.round(totalHours * 3600))}
          </span>
        </p>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
          {activeTopics.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                <span className={`text-[11px] font-bold truncate max-w-[120px] ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  {entry.name}
                </span>
              </div>
              <span className={`text-[11px] font-mono font-black ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                {formatTimeShort(Math.round(entry.value * 3600))}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Stats: React.FC<StatsProps> = ({ subjects, logs, subjectColors, reviewStates = {}, theme = 'dark', t }) => {
  const isLight = theme === 'light';

  const processedData = useMemo(() => {
    const allTopicsSet = new Set<string>();
    logs.forEach(log => {
      if (log.topic) allTopicsSet.add(log.topic);
    });
    const allTopics = Array.from(allTopicsSet);
    const noTopicLabel = t.noTopicLabel;

    const data = subjects.map(subject => {
      const subjectLogs = logs.filter(l => l.subject === subject);
      const totalSec = subjectLogs.reduce((acc, log) => acc + log.duration, 0);
      
      const topicBreakdown: Record<string, number> = {};
      let totalHours = 0;

      subjectLogs.forEach(log => {
        const topicName = log.topic || noTopicLabel;
        const hours = log.duration / 3600;
        topicBreakdown[topicName] = (topicBreakdown[topicName] || 0) + hours;
        totalHours += hours;
      });

      return {
        name: subject,
        color: subjectColors[subject] || '#6366f1',
        totalHours: parseFloat(totalHours.toFixed(2)),
        totalSeconds: totalSec,
        formattedTotal: formatTimeShort(totalSec),
        ...topicBreakdown
      };
    }).filter(d => d.totalHours > 0).sort((a, b) => b.totalHours - a.totalHours);

    return { data, allTopics: [noTopicLabel, ...allTopics] };
  }, [subjects, logs, subjectColors, t.noTopicLabel]);

  const pieData = useMemo(() => {
    return processedData.data.map(d => ({
      name: d.name,
      value: d.totalHours,
      seconds: d.totalSeconds,
      color: d.color
    }));
  }, [processedData.data]);

  // Future Reviews Forecast (next 30 days)
  const futureReviewsData = useMemo(() => {
    const today = toLocalISO(new Date());
    const data: { date: string; count: number }[] = [];
    
    for (let i = 0; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = toLocalISO(date);
      
      const count = Object.values(reviewStates).filter(state => {
        const dueDate = toLocalISO(new Date(state.dueAt));
        return dueDate === dateStr;
      }).length;
      
      data.push({ date: dateStr, count });
    }
    
    return data;
  }, [reviewStates]);

  // Topic Maturity Analysis
  const topicMaturityData = useMemo(() => {
    const newTopics: string[] = [];
    const learningTopics: string[] = [];
    const matureTopics: string[] = [];
    
    Object.entries(reviewStates).forEach(([key, state]) => {
      if (state.reviewCount === 0) {
        newTopics.push(key);
      } else if (state.reviewCount <= 3) {
        learningTopics.push(key);
      } else {
        matureTopics.push(key);
      }
    });
    
    return [
      { name: t.newTopics || 'New', value: newTopics.length, color: '#f59e0b' },
      { name: t.learningTopics || 'Learning', value: learningTopics.length, color: '#3b82f6' },
      { name: t.matureTopics || 'Mature', value: matureTopics.length, color: '#10b981' }
    ];
  }, [reviewStates, t]);

  // Review Interval Distribution
  const intervalDistributionData = useMemo(() => {
    const today = toLocalISO(new Date());
    const intervals: Record<string, number> = {
      [t.interval_0_1 || '0-1 days']: 0,
      [t.interval_2_7 || '2-7 days']: 0,
      [t.interval_8_30 || '8-30 days']: 0,
      [t.interval_31_90 || '31-90 days']: 0,
      [t.interval_90_plus || '90+ days']: 0
    };
    
    const keys = {
      interval_0_1: t.interval_0_1 || '0-1 days',
      interval_2_7: t.interval_2_7 || '2-7 days',
      interval_8_30: t.interval_8_30 || '8-30 days',
      interval_31_90: t.interval_31_90 || '31-90 days',
      interval_90_plus: t.interval_90_plus || '90+ days'
    };
    
    Object.values(reviewStates).forEach(state => {
      const dueDate = toLocalISO(new Date(state.dueAt));
      const daysUntil = daysBetween(today, dueDate);
      
      if (daysUntil <= 1) {
        intervals[keys.interval_0_1]++;
      } else if (daysUntil <= 7) {
        intervals[keys.interval_2_7]++;
      } else if (daysUntil <= 30) {
        intervals[keys.interval_8_30]++;
      } else if (daysUntil <= 90) {
        intervals[keys.interval_31_90]++;
      } else {
        intervals[keys.interval_90_plus]++;
      }
    });
    
    return Object.entries(intervals).map(([name, value]) => ({ name, value }));
  }, [reviewStates, t]);

  const hasData = processedData.data.length > 0;
  const hasReviewData = Object.keys(reviewStates).length > 0;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 theme-logo-bg rounded-2xl text-white shadow-lg transition-all duration-500">
            <BarChart2 size={24} />
          </div>
          <h1 className={`text-3xl font-black theme-text-primary transition-all duration-500`}>{t.stats}</h1>
        </div>
        <p className={isLight ? 'text-zinc-500 font-bold' : 'text-zinc-500 font-medium'}>{t.weeklyGoalsSubtitle}</p>
      </div>

      {!hasData ? (
        <div className={`p-20 rounded-[3rem] border-2 border-dashed text-center flex flex-col items-center gap-6 ${
          isLight ? 'bg-white border-zinc-200 text-zinc-300' : 'bg-zinc-900/20 border-zinc-800 text-zinc-700'
        }`}>
          <BarChartIcon size={64} strokeWidth={1} className="opacity-20" />
          <p className="font-black uppercase tracking-[0.3em] text-xs">{t.noDataChart}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 p-8 md:p-10 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
            isLight ? 'bg-white border-zinc-200 shadow-zinc-300/20' : 'bg-[#0c0c0e]/80 border-zinc-800 shadow-black/40'
          }`}>
            <div className="flex items-center justify-between mb-12">
              <h3 className={`font-black text-xl flex items-center gap-4 uppercase tracking-tighter theme-text-primary transition-all duration-500`}>
                <Layers size={24} className="theme-icon transition-all duration-500" /> {t.timeDistribution}
              </h3>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isLight ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-900 text-zinc-500'}`}>
                <Clock size={12} /> {t.totalHours}
              </div>
            </div>
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart 
                  data={processedData.data} 
                  layout="vertical" 
                  margin={{ left: 20, right: 40, top: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#f4f4f5" : "#18181b"} horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke={isLight ? "#71717a" : "#52525b"} 
                    fontSize={11} 
                    fontWeight="900"
                    tickLine={false} 
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }}
                    content={<CustomTooltip isLight={isLight} t={t} />}
                  />
                  {processedData.allTopics.map((topic, index) => (
                    <Bar 
                      key={topic} 
                      dataKey={topic} 
                      stackId="a" 
                      radius={index === processedData.allTopics.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                    >
                      {processedData.data.map((entry, idx) => (
                        <Cell 
                          key={`cell-${idx}`} 
                          fill={adjustColor(entry.color, index * -8)} 
                        />
                      ))}
                    </Bar>
                  ))}
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={`p-8 md:p-10 rounded-[2.5rem] border shadow-2xl transition-all duration-500 flex flex-col items-center justify-between ${
            isLight ? 'bg-white border-zinc-200 shadow-zinc-300/20' : 'bg-[#0c0c0e]/80 border-zinc-800 shadow-black/40'
          }`}>
            <h3 className={`font-black text-xl mb-10 w-full flex items-center gap-4 uppercase tracking-tighter theme-text-primary transition-all duration-500`}>
              <PieChartIcon size={24} className="theme-icon transition-all duration-500" /> Visão Geral
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ 
                      backgroundColor: isLight ? '#ffffff' : '#09090b', 
                      border: isLight ? '1px solid #d4d4d8' : '1px solid #27272a', 
                      borderRadius: '12px'
                    }}
                    labelStyle={{ color: isLight ? '#18181b' : '#ffffff' }}
                    itemStyle={{ color: isLight ? '#18181b' : '#f4f4f5' }}
                    formatter={(value: number, name: string, props: any) => [formatTimeShort(Math.round(value * 3600)), props.payload.name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-4 mt-6">
              {pieData.slice(0, 5).map((item, index) => {
                const totalHours = pieData.reduce((acc, curr) => acc + curr.value, 0);
                const percentage = totalHours > 0 ? ((item.value / totalHours) * 100).toFixed(1) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className={`text-sm font-bold truncate max-w-[120px] ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{item.name}</span>
                    </div>
                    <span className="text-sm font-black theme-accent transition-all duration-500">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Statistics Section */}
      {hasReviewData && (
        <>
          <div className="mt-12">
            <h2 className={`text-2xl font-black mb-6 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {t.reviewTitle || 'Review Statistics'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Future Reviews Forecast */}
            <div className={`p-8 md:p-10 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
              isLight ? 'bg-white border-zinc-200 shadow-zinc-300/20' : 'bg-[#0c0c0e]/80 border-zinc-800 shadow-black/40'
            }`}>
              <h3 className={`font-black text-xl mb-10 flex items-center gap-4 uppercase tracking-tighter theme-text-primary transition-all duration-500`}>
                <Calendar size={24} className="theme-icon transition-all duration-500" /> {t.futureReviews || 'Revisões Futuras'}
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={futureReviewsData}>
                    <defs>
                      <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#f4f4f5" : "#18181b"} />
                    <XAxis 
                      dataKey="date" 
                      stroke={isLight ? "#71717a" : "#52525b"}
                      fontSize={10}
                      fontWeight="900"
                      tickLine={false}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis 
                      stroke={isLight ? "#71717a" : "#52525b"}
                      fontSize={11}
                      fontWeight="900"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isLight ? '#ffffff' : '#09090b', 
                        border: isLight ? '1px solid #d4d4d8' : '1px solid #27272a', 
                        borderRadius: '12px'
                      }}
                      labelStyle={{ color: isLight ? '#18181b' : '#ffffff', fontWeight: 'bold' }}
                      itemStyle={{ color: isLight ? '#18181b' : '#f4f4f5' }}
                      formatter={(value: number) => [`${value} ${t.reviewsScheduled || 'revisões'}`, '']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorReviews)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Topic Maturity */}
            <div className={`p-8 md:p-10 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
              isLight ? 'bg-white border-zinc-200 shadow-zinc-300/20' : 'bg-[#0c0c0e]/80 border-zinc-800 shadow-black/40'
            }`}>
              <h3 className={`font-black text-xl mb-10 flex items-center gap-4 uppercase tracking-tighter theme-text-primary transition-all duration-500`}>
                <TrendingUp size={24} className="theme-icon transition-all duration-500" /> {t.topicMaturity || 'Maturidade dos Tópicos'}
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topicMaturityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topicMaturityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isLight ? '#ffffff' : '#09090b', 
                        border: isLight ? '1px solid #d4d4d8' : '1px solid #27272a', 
                        borderRadius: '12px'
                      }}
                      labelStyle={{ color: isLight ? '#18181b' : '#ffffff' }}
                      itemStyle={{ color: isLight ? '#18181b' : '#f4f4f5' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value, entry: any) => (
                        <span className={`text-sm font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Review Interval Distribution */}
          <div className={`p-8 md:p-10 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
            isLight ? 'bg-white border-zinc-200 shadow-zinc-300/20' : 'bg-[#0c0c0e]/80 border-zinc-800 shadow-black/40'
          }`}>
            <h3 className={`font-black text-xl mb-10 flex items-center gap-4 uppercase tracking-tighter theme-text-primary transition-all duration-500`}>
              <BarChartIcon size={24} className="theme-icon transition-all duration-500" /> {t.intervalDistribution || 'Distribuição de Intervalos'}
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={intervalDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#f4f4f5" : "#18181b"} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke={isLight ? "#71717a" : "#52525b"}
                    fontSize={11}
                    fontWeight="900"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke={isLight ? "#71717a" : "#52525b"}
                    fontSize={11}
                    fontWeight="900"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isLight ? '#ffffff' : '#09090b', 
                      border: isLight ? '1px solid #d4d4d8' : '1px solid #27272a', 
                      borderRadius: '12px'
                    }}
                    labelStyle={{ color: isLight ? '#18181b' : '#ffffff', fontWeight: 'bold' }}
                    itemStyle={{ color: isLight ? '#18181b' : '#f4f4f5' }}
                    formatter={(value: number) => [`${value} ${t.topics || 'tópicos'}`, '']}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Stats;
