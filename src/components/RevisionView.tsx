import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  X,
  Save,
  CheckSquare,
  Square
} from 'lucide-react';
import { Revision, Problem } from '../types';

export default function RevisionView() {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('Pending');

  // Creator Modal states
  const [showEditor, setShowEditor] = useState(false);
  const [formProblemId, setFormProblemId] = useState('');
  const [formProblemName, setFormProblemName] = useState('');
  const [formNextRevisionDate, setFormNextRevisionDate] = useState('');
  const [formPriority, setFormPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const revList = await api.getRevisions();
      const probList = await api.getProblems();
      setRevisions(revList);
      setProblems(probList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateRevision = () => {
    setFormProblemId(problems[0]?.id || 'custom');
    setFormProblemName(problems[0]?.name || 'General Syllabus Review');
    setFormNextRevisionDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]); // 3 days from now
    setFormPriority('High');
    setShowEditor(true);
  };

  const handleToggleComplete = async (rev: Revision) => {
    try {
      const updated = await api.updateRevision(rev.id, {
        completed: !rev.completed
      });
      setRevisions(prev => prev.map(r => r.id === rev.id ? updated : r));
    } catch (e) {
      alert('Toggle failed: ' + e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this revision task?')) return;
    try {
      await api.deleteRevision(id);
      setRevisions(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      alert('Delete failed: ' + e);
    }
  };

  const handlePostpone = async (rev: Revision, days: number) => {
    const currentMs = new Date(rev.nextRevisionDate).getTime();
    const newDate = new Date(currentMs + 86400000 * days).toISOString().split('T')[0];
    try {
      const updated = await api.updateRevision(rev.id, {
        nextRevisionDate: newDate
      });
      setRevisions(prev => prev.map(r => r.id === rev.id ? updated : r));
      alert(`Revision task postponed by ${days} days!`);
    } catch (e) {
      alert('Postpone failed: ' + e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNextRevisionDate) {
      alert('Please specify a revision date.');
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
      nextRevisionDate: formNextRevisionDate,
      priority: formPriority,
      completed: false
    };

    try {
      const created = await api.createRevision(payload);
      setRevisions(prev => [created, ...prev]);
      setShowEditor(false);
    } catch (err) {
      alert('Save failed: ' + err);
    }
  };

  // Filter checks
  const filteredRevisions = revisions.filter(r => {
    const matchesPriority = selectedPriority === 'All' || r.priority === selectedPriority;
    
    let matchesStatus = true;
    if (selectedStatus === 'Pending') matchesStatus = !r.completed;
    if (selectedStatus === 'Completed') matchesStatus = r.completed;

    return matchesPriority && matchesStatus;
  });

  const getPriorityColor = (p: Revision['priority']) => {
    switch (p) {
      case 'High': return 'text-red-400 bg-red-500/10 border-red-500/25';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25';
      case 'Low': return 'text-blue-400 bg-blue-500/10 border-blue-500/25';
    }
  };

  return (
    <div id="revision-planner" className="space-y-6">
      {/* Header controls layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="text-blue-500" size={20} />
            <span>Spaced Repetition & Revision Schedule</span>
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">Maintain revision cards of tricky algorithms to strengthen retention rates</p>
        </div>

        <button
          onClick={openCreateRevision}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Plan Revision Card</span>
        </button>
      </div>

      {/* Revision Filters Tab */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-slate-900/30 border border-slate-800/80 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 uppercase">Review Status:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-800 bg-[#090d16]">
            {['Pending', 'Completed', 'All'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 text-xs cursor-pointer ${
                  selectedStatus === status 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 uppercase">Priority filter:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 bg-[#090d16] border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>
        </div>
      </div>

      {/* Loading states */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Revisions Stack list */
        <div className="space-y-4">
          {filteredRevisions.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/10 border border-slate-800/80 border-dashed rounded-2xl text-slate-500 max-w-xl mx-auto">
              <Calendar size={44} className="mx-auto stroke-1 text-slate-600 mb-3" />
              <p className="text-sm font-mono uppercase tracking-wider">No revision tasks in queue.</p>
              <p className="text-xs text-slate-600 mt-1">Pending cards are loaded here automatically when you log un-solved or attempted problem logs.</p>
              <button
                onClick={openCreateRevision}
                className="mt-4 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
              >
                Plan custom card →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRevisions.map((rev) => {
                const isOverdue = new Date(rev.nextRevisionDate).getTime() < Date.now() && !rev.completed;
                return (
                  <motion.div
                    key={rev.id}
                    layout="position"
                    className={`p-4 rounded-xl border flex items-start gap-4 justify-between transition-all ${
                      rev.completed 
                        ? 'bg-[#0f1524]/20 border-slate-900/80 opacity-60' 
                        : isOverdue 
                          ? 'bg-red-500/5 border-red-500/20' 
                          : 'bg-[#0f1524]/60 border-slate-800/80 hover:border-slate-700/80'
                    }`}
                  >
                    <div className="flex gap-3.5 items-start flex-1">
                      {/* Check toggler */}
                      <button 
                        onClick={() => handleToggleComplete(rev)}
                        className="mt-1 text-slate-500 hover:text-blue-400 cursor-pointer transition-colors"
                      >
                        {rev.completed ? (
                          <CheckSquare className="text-green-500" size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(rev.priority)}`}>
                            {rev.priority} Priority
                          </span>
                          
                          {isOverdue && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded flex items-center gap-1 animate-pulse">
                              <AlertCircle size={10} />
                              <span>Overdue</span>
                            </span>
                          )}
                        </div>

                        <h4 className={`text-sm font-bold text-slate-100 ${rev.completed ? 'line-through text-slate-500' : ''}`}>
                          {rev.problemName}
                        </h4>

                        {/* Timing indicator */}
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <Clock size={11} />
                          <span>Revision Target: {new Date(rev.nextRevisionDate).toLocaleDateString()}</span>
                        </div>

                        {/* Postpone short utilities buttons */}
                        {!rev.completed && (
                          <div className="pt-2 flex items-center gap-2">
                            <span className="text-[9px] font-mono text-slate-600">Postpone:</span>
                            <button
                              onClick={() => handlePostpone(rev, 2)}
                              className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded text-slate-400 hover:text-white cursor-pointer transition-colors"
                            >
                              +2d
                            </button>
                            <button
                              onClick={() => handlePostpone(rev, 7)}
                              className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded text-slate-400 hover:text-white cursor-pointer transition-colors"
                            >
                              +7d
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Purge button */}
                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer self-start"
                      title="Remove Revision Task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Editor Modal Overlay */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1524] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#090d16]/50">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-500" size={18} />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Plan Revision Card
                </h3>
              </div>
              <button 
                onClick={() => setShowEditor(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Problem reference selection */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Associated Problem</label>
                <select
                  value={formProblemId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormProblemId(val);
                    if (val === 'custom') {
                      setFormProblemName('General Syllabus Review');
                    } else {
                      const match = problems.find(p => p.id === val);
                      if (match) setFormProblemName(match.name);
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-sans"
                >
                  <option value="custom">General Syllabus / Concept Review</option>
                  {problems.map(p => (
                    <option key={p.id} value={p.id}>{p.platform}: {p.name}</option>
                  ))}
                </select>
              </div>

              {/* Problem Name custom input (only if Custom selected) */}
              {formProblemId === 'custom' && (
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Revision Task Name</label>
                  <input
                    type="text"
                    required
                    value={formProblemName}
                    onChange={(e) => setFormProblemName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Review segment tree propagation algorithms"
                  />
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Urgency Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="High">High (Needs daily focus)</option>
                  <option value="Medium">Medium (Within 3 days)</option>
                  <option value="Low">Low (General schedule)</option>
                </select>
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Next Target Date</label>
                <input
                  type="date"
                  required
                  value={formNextRevisionDate}
                  onChange={(e) => setFormNextRevisionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Modal footer controls */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0f1524]">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Schedule Task</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
