
import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Check, BookOpen, ChevronDown, ChevronUp, ListFilter, Palette } from 'lucide-react';

interface ManageSubjectsViewProps {
  subjects: string[];
  topics: Record<string, string[]>;
  subjectColors: Record<string, string>;
  onAddSubject: (name: string) => void;
  onDeleteSubject: (name: string) => void;
  onRenameSubject: (oldName: string, newName: string) => void;
  onSetColor: (subject: string, color: string) => void;
  onAddTopic: (subject: string, topicName: string) => void;
  onDeleteTopic: (subject: string, topicName: string) => void;
  onRenameTopic: (subject: string, oldName: string, newName: string) => void;
  theme?: 'dark' | 'light';
  t: any;
}

const COLOR_PALETTE = [
  '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', 
  '#8b5cf6', '#f97316', '#84cc16', '#ec4899', '#64748b'
];

const ManageSubjectsView: React.FC<ManageSubjectsViewProps> = ({ 
  subjects, 
  topics, 
  subjectColors,
  onAddSubject, 
  onDeleteSubject, 
  onRenameSubject,
  onSetColor,
  onAddTopic,
  onDeleteTopic,
  onRenameTopic,
  theme = 'dark', 
  t 
}) => {
  const [newSub, setNewSub] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [newTopicValues, setNewTopicValues] = useState<Record<string, string>>({});
  const [editingTopicId, setEditingTopicId] = useState<{sub: string, topic: string} | null>(null);
  const [editTopicValue, setEditTopicValue] = useState('');
  
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);

  const isLight = theme === 'light';

  const handleAddSubject = () => {
    if (newSub.trim()) {
      onAddSubject(newSub.trim());
      setNewSub('');
    }
  };

  const toggleExpand = (s: string) => {
    const next = new Set(expandedSubjects);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    setExpandedSubjects(next);
  };

  const handleAddTopic = (s: string) => {
    const val = newTopicValues[s]?.trim();
    if (val) {
      onAddTopic(s, val);
      setNewTopicValues({ ...newTopicValues, [s]: '' });
    }
  };

  const startEditingTopic = (sub: string, topic: string) => {
    setEditingTopicId({ sub, topic });
    setEditTopicValue(topic);
  };

  const confirmRenameTopic = () => {
    if (editingTopicId && editTopicValue.trim()) {
      onRenameTopic(editingTopicId.sub, editingTopicId.topic, editTopicValue.trim());
      setEditingTopicId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 theme-logo-bg rounded-2xl text-white shadow-lg transition-all duration-500">
            <BookOpen size={24} />
          </div>
          <h1 className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.subjects_manage}</h1>
        </div>
        <p className={`${isLight ? 'text-slate-500' : 'text-zinc-500'} font-medium`}>{t.readyToStudy}</p>
      </div>

      <div className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${
        isLight ? 'bg-white border-slate-100 shadow-slate-200/50' : 'bg-[#0c0c0e]/80 border-zinc-800'
      }`}>
        <h3 className="font-black text-xl mb-10 flex items-center gap-3 text-indigo-500 uppercase tracking-tighter">
          <Plus size={24} strokeWidth={3} /> {t.manageSubjects}
        </h3>
        
        <div className="space-y-4 mb-10">
          {subjects.map(s => {
            const isExpanded = expandedSubjects.has(s);
            const subTopics = topics[s] || [];
            const subjectColor = subjectColors[s] || '#6366f1';

            return (
              <div key={s} className="space-y-2">
                <div className={`flex items-center justify-between p-6 border rounded-[1.5rem] transition-all ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 hover:border-indigo-400' 
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-indigo-500/30'
                }`}>
                  {editingId === s ? (
                    <div className="flex-1 flex items-center gap-3">
                      <input 
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editValue.trim() && editValue.trim() !== s) onRenameSubject(s, editValue.trim());
                            setEditingId(null);
                          }
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className={`flex-1 px-4 py-2 rounded-xl border text-base font-bold outline-none ${
                          isLight ? 'bg-white border-indigo-500 text-slate-900' : 'bg-zinc-950 border-indigo-500 text-white'
                        }`}
                      />
                      <button 
                        onClick={() => {
                          if (editValue.trim() && editValue.trim() !== s) onRenameSubject(s, editValue.trim());
                          setEditingId(null);
                        }}
                        className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        <Check size={18} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 flex-1 overflow-hidden mr-2">
                        <button 
                          onClick={() => toggleExpand(s)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                            isLight 
                              ? 'bg-white text-slate-400 border border-slate-100 hover:text-indigo-600' 
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 hover:text-indigo-400'
                          }`}
                        >
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <div 
                          className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: subjectColor }}
                        />
                        <span className={`text-base font-bold truncate ${isLight ? 'text-slate-800' : 'text-zinc-100'}`}>{s}</span>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => setColorPickerOpen(colorPickerOpen === s ? null : s)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                            isLight 
                              ? 'bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-600' 
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-indigo-400 hover:border-indigo-400'
                          }`}
                          title="Trocar cor"
                        >
                          <Palette size={18} />
                        </button>
                        <button 
                          onClick={() => { setEditingId(s); setEditValue(s); }}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                            isLight 
                              ? 'bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-600' 
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-indigo-400 hover:border-indigo-400'
                          }`}
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => onDeleteSubject(s)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                            isLight 
                              ? 'bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-500' 
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-red-400 hover:border-red-400'
                          }`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Color Picker Popover */}
                {colorPickerOpen === s && (
                  <div className={`p-4 rounded-[1.5rem] border animate-fade-in flex flex-wrap gap-2 justify-center shadow-xl ${
                    isLight ? 'bg-white border-slate-100' : 'bg-zinc-900 border-zinc-800'
                  }`}>
                    {COLOR_PALETTE.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          onSetColor(s, color);
                          setColorPickerOpen(null);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-125 ${
                          subjectColor === color 
                          ? (isLight ? 'border-indigo-600 scale-110' : 'border-white scale-110') 
                          : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}

                {/* Sub-lista de Assuntos (Expansível) */}
                {isExpanded && (
                  <div className={`ml-14 p-6 rounded-[1.5rem] border transition-all animate-slide-down ${
                    isLight ? 'bg-white border-slate-100' : 'bg-zinc-900/30 border-zinc-800/50'
                  }`}>
                    <div className="flex items-center gap-2 mb-6">
                      <ListFilter size={16} className="text-indigo-500" />
                      <span className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                        {t.topicsLabel} ({subTopics.length})
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      {subTopics.map(topic => (
                        <div key={topic} className={`flex items-center justify-between p-4 rounded-xl border ${
                          isLight ? 'bg-slate-50/50 border-slate-200/50' : 'bg-zinc-950/20 border-zinc-800/30'
                        }`}>
                          {editingTopicId?.sub === s && editingTopicId?.topic === topic ? (
                             <div className="flex-1 flex items-center gap-2">
                                <input 
                                  autoFocus
                                  value={editTopicValue}
                                  onChange={(e) => setEditTopicValue(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && confirmRenameTopic()}
                                  className={`flex-1 px-3 py-1.5 rounded-lg border text-sm font-bold outline-none ${
                                    isLight ? 'bg-white border-indigo-400' : 'bg-zinc-900 border-indigo-500'
                                  }`}
                                />
                                <button onClick={confirmRenameTopic} className="text-emerald-500 p-1 hover:scale-110 transition-transform"><Check size={18} /></button>
                             </div>
                          ) : (
                            <>
                              <span className={`text-sm font-bold truncate ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>{topic}</span>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => startEditingTopic(s, topic)}
                                  className="p-1.5 text-zinc-500 hover:text-indigo-400 transition-colors"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => onDeleteTopic(s, topic)}
                                  className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <input 
                        value={newTopicValues[s] || ''}
                        onChange={(e) => setNewTopicValues({ ...newTopicValues, [s]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(s)}
                        placeholder={t.newTopicPlaceholder}
                        className={`flex-1 px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all ${
                          isLight ? 'bg-slate-50 border-slate-200 focus:border-indigo-500' : 'bg-zinc-950 border-zinc-800 focus:border-indigo-500'
                        }`}
                      />
                      <button 
                        onClick={() => handleAddTopic(s)}
                        className="theme-logo-bg px-4 rounded-xl text-white hover:opacity-90 transition-all active:scale-95"
                      >
                        <Plus size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {subjects.length === 0 && (
            <div className={`text-center py-16 rounded-[1.5rem] border-2 border-dashed ${isLight ? 'border-slate-100 text-slate-300' : 'border-zinc-800 text-zinc-700'}`}>
              <p className="text-xs font-black uppercase tracking-[0.2em]">{t.noSubjects}</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <input 
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
            type="text" 
            placeholder={t.newSubjectPlaceholder} 
            className={`flex-1 border rounded-[1.2rem] px-5 py-4 text-base font-bold outline-none transition-all shadow-sm ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white' 
                : 'bg-zinc-950/50 border-zinc-800 text-white focus:border-indigo-500 focus:bg-zinc-900'
            }`}
          />
          <button 
            onClick={handleAddSubject}
            disabled={!newSub.trim()}
            className={`theme-logo-bg w-14 h-14 rounded-[1.2rem] flex items-center justify-center hover:opacity-90 transition-all text-white shadow-xl active:scale-90 shrink-0 ${!newSub.trim() ? 'opacity-40 cursor-not-allowed' : 'animate-shine'}`}
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageSubjectsView;
