
import React, { useMemo } from 'react';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, Clock, Layers, BarChart2 } from 'lucide-react';
import { StudyLog } from '../types';
import { formatTimeShort, toLocalISO } from '../utils';
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
  Pie
} from 'recharts';

interface StatsProps {
  subjects: string[];
  logs: StudyLog[];
  subjectColors: Record<string, string>;
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

const Stats: React.FC<StatsProps> = ({ subjects, logs, subjectColors, theme = 'dark', t }) => {
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

  const hasData = processedData.data.length > 0;

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
    </div>
  );
};

export default Stats;
