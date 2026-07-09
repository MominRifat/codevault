import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  X, 
  Save, 
  CheckCircle2, 
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { MistakeJournal as Mistake, Problem } from '../types';

export default function MistakeJournalView() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Editor Modal States
  const [showEditor, setShowEditor] = useState(false);
  const [editingMistake, setEditingMistake] = useState<Mistake | null>(null);

  // Form Fields
  const [formProblemId, setFormProblemId] = useState('');
  const [formProblemName, setFormProblemName] = useState('');
  const [formMistake, setFormMistake] = useState('');
  const [formWrongApproach, setFormWrongApproach] = useState('');
  const [formCorrectApproach, setFormCorrectApproach] = useState('');
  const [formLessonLearned, setFormLessonLearned] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const mistakesList = await api.getMistakes();
      const problemsList = await api.getProblems();
      setMistakes(mistakesList);
      setProblems(problemsList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateMistake = () => {
    setEditingMistake(null);
    setFormProblemId(problems[0]?.id || 'custom');
    setFormProblemName(problems[0]?.name || 'General Contest Bug');
    setFormMistake('');
    setFormWrongApproach('');
    setFormCorrectApproach('');
    setFormLessonLearned('');
    setShowEditor(true);
  };

  const openEditMistake = (mis: Mistake) => {
    setEditingMistake(mis);
    setFormProblemId(mis.problemId);
    setFormProblemName(mis.problemName);
    setFormMistake(mis.mistake);
    setFormWrongApproach(mis.wrongApproach);
    setFormCorrectApproach(mis.correctApproach);
    setFormLessonLearned(mis.lessonLearned);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to purge this mistake from your CP journal?')) return;
    try {
      await api.deleteMistake(id);
      setMistakes(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      alert('Delete failed: ' + e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMistake.trim() || !formLessonLearned.trim()) {
      alert('Mistake Description and Lesson Learned are required.');
      return;
    }

    let pName = formProblemName;
    if (formProblemId !== 'custom') {
      const match = problems.find(p => p.id === formProblemId);
      if (match) pName = match.name;
    }

    const payload = {
      problemId: formProblemId,
      problemName: pName,
      mistake: formMistake.trim(),
      wrongApproach: formWrongApproach.trim(),
      correctApproach: formCorrectApproach.trim(),
      lessonLearned: formLessonLearned.trim()
    };

    try {
      if (editingMistake) {
        const updated = await api.updateMistake(editingMistake.id, payload);
        setMistakes(prev => prev.map(m => m.id === editingMistake.id ? updated : m));
      } else {
        const created = await api.createMistake(payload);
        setMistakes(prev => [created, ...prev]);
      }
      setShowEditor(false);
    } catch (err) {
      alert('Save failed: ' + err);
    }
  };

  const filteredMistakes = mistakes.filter(m => {
    return m.mistake.toLowerCase().includes(searchQuery.toLowerCase()) || 
           m.problemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           m.lessonLearned.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div id="mistake-journal" className="space-y-6">
      {/* Header section controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            <span>Mistake & Anti-Bug Journal</span>
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">Track your wrong approaches and analyze algorithmic failures to avoid them in live contests</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mistakes..."
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 w-full sm:w-60 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Log mistake button */}
          <button
            onClick={openCreateMistake}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Log Bug / Mistake</span>
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Mistakes Grid list */
        <>
          {filteredMistakes.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/10 border border-slate-800/80 border-dashed rounded-2xl text-slate-500 max-w-xl mx-auto">
              <AlertTriangle size={44} className="mx-auto stroke-1 text-slate-600 mb-3" />
              <p className="text-sm font-mono uppercase tracking-wider">No mistakes logged yet.</p>
              <p className="text-xs text-slate-600 mt-1">Analyzing failures is the single fastest way to raise your competitive programming rating.</p>
              <button
                onClick={openCreateMistake}
                className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
              >
                Log first mistake →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMistakes.map((mis) => (
                <motion.div
                  key={mis.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-red-500/5 border border-red-500/10 rounded-xl space-y-4"
                >
                  {/* Top header stats bar */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-red-950/40 text-red-400 border border-red-500/20 rounded uppercase">
                        {mis.problemName === 'General Contest Bug' ? 'Contest Warning' : 'Problem Specific'}
                      </span>
                      <h3 className="text-sm font-mono text-slate-200">
                        {mis.problemName}
                      </h3>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditMistake(mis)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(mis.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-850 rounded transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Core description card */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Description of Mistake:</span>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line bg-slate-950/30 p-3 rounded-lg border border-slate-800/80">
                      {mis.mistake}
                    </p>
                  </div>

                  {/* Dual columns logic comparisons */}
                  {(mis.wrongApproach || mis.correctApproach) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mis.wrongApproach && (
                        <div className="p-3 bg-red-950/10 border border-red-500/5 rounded-lg space-y-1 text-xs">
                          <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest font-bold flex items-center gap-1">
                            <TrendingDown size={11} />
                            <span>My Wrong Approach:</span>
                          </span>
                          <p className="text-slate-400 leading-relaxed font-sans">{mis.wrongApproach}</p>
                        </div>
                      )}

                      {mis.correctApproach && (
                        <div className="p-3 bg-green-950/10 border border-green-500/5 rounded-lg space-y-1 text-xs">
                          <span className="text-[9px] font-mono text-green-400 uppercase tracking-widest font-bold flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            <span>Correct Optimal Approach:</span>
                          </span>
                          <p className="text-slate-400 leading-relaxed font-sans">{mis.correctApproach}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lessons and preventative tips */}
                  <div className="p-3 bg-amber-500/5 border-l-2 border-amber-500 rounded-r-lg text-xs">
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold block mb-0.5">Lesson Learned & Practice Rule:</span>
                    <p className="text-slate-300 leading-relaxed font-sans">{mis.lessonLearned}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Editor Modal Overlay */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1524] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#090d16]/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={18} />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  {editingMistake ? 'Modify Bug Entry' : 'Log Bug & Approach Analysis'}
                </h3>
              </div>
              <button 
                onClick={() => setShowEditor(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Problem selection links */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Associated Problem</label>
                <select
                  value={formProblemId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormProblemId(val);
                    if (val === 'custom') {
                      setFormProblemName('General Contest Bug');
                    } else {
                      const match = problems.find(p => p.id === val);
                      if (match) setFormProblemName(match.name);
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-sans"
                >
                  <option value="custom">General / Not Problem Specific</option>
                  {problems.map(p => (
                    <option key={p.id} value={p.id}>{p.platform}: {p.name}</option>
                  ))}
                </select>
              </div>

              {/* Problem Name Custom input (only if Custom) */}
              {formProblemId === 'custom' && (
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Custom Context Name</label>
                  <input
                    type="text"
                    required
                    value={formProblemName}
                    onChange={(e) => setFormProblemName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Codeforces Round #850 Div.2 - Overflow bug"
                  />
                </div>
              )}

              {/* Mistake description */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">What Went Wrong?</label>
                <textarea
                  rows={3}
                  required
                  value={formMistake}
                  onChange={(e) => setFormMistake(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-200 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-red-500 font-sans"
                  placeholder="Explain exactly what bug, crash, TLE, or logical loophole was encountered..."
                />
              </div>

              {/* Wrong approach */}
              <div>
                <label className="block text-red-400 text-[10px] font-mono mb-1 uppercase tracking-wider font-semibold">Wrong / Naive Approach description</label>
                <textarea
                  rows={2}
                  value={formWrongApproach}
                  onChange={(e) => setFormWrongApproach(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-200 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-red-500 font-sans"
                  placeholder="e.g., Simulated grid walk directly using recursive backtracks resulting in O(2^(N*M)) time complexity..."
                />
              </div>

              {/* Correct approach */}
              <div>
                <label className="block text-green-400 text-[10px] font-mono mb-1 uppercase tracking-wider font-semibold">Correct / Optimal Approach description</label>
                <textarea
                  rows={2}
                  value={formCorrectApproach}
                  onChange={(e) => setFormCorrectApproach(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-200 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-green-500 font-sans"
                  placeholder="e.g., Formulate states as dynamic programming using coordinate compression..."
                />
              </div>

              {/* Lesson Learned */}
              <div>
                <label className="block text-amber-400 text-[10px] font-mono mb-1 uppercase tracking-wider font-bold">Rule of Thumb / Contest Lesson Learned</label>
                <textarea
                  rows={2}
                  required
                  value={formLessonLearned}
                  onChange={(e) => setFormLessonLearned(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-200 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                  placeholder="e.g., Always use 1LL << X instead of 1 << X when bit-shifting in C++ for long long ints."
                />
              </div>

              {/* Modal controls footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0f1524]">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Cancel Journaling
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Entry</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
