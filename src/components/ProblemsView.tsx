import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { 
  Cpu, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Youtube, 
  CheckCircle, 
  X, 
  Save, 
  AlertTriangle, 
  Code,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Problem, Topic } from '../types';

export default function ProblemsView() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Inspector States (allows expanding a card to inspect solution code, wrong approaches, mistakes, etc.)
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);

  // Editor Modal States
  const [showEditor, setShowEditor] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formTopicId, setFormTopicId] = useState('');
  const [formPlatform, setFormPlatform] = useState('Codeforces');
  const [formLink, setFormLink] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [formStatus, setFormStatus] = useState<'Solved' | 'Attempted' | 'Unsolved'>('Solved');
  const [formMyCode, setFormMyCode] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formMistakes, setFormMistakes] = useState('');
  const [formBetterSolution, setFormBetterSolution] = useState('');
  const [formEditorialLink, setFormEditorialLink] = useState('');
  const [formVideoLink, setFormVideoLink] = useState('');
  const [formTimeComplexity, setFormTimeComplexity] = useState('O(N)');
  const [formSpaceComplexity, setFormSpaceComplexity] = useState('O(1)');
  const [formDateSolved, setFormDateSolved] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const problemsList = await api.getProblems();
      const topicsList = await api.getTopics();
      setProblems(problemsList);
      setTopics(topicsList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateProblem = () => {
    setEditingProblem(null);
    setFormName('');
    setFormTopicId(topics[0]?.id || 'intro');
    setFormPlatform('Codeforces');
    setFormLink('');
    setFormDifficulty('Medium');
    setFormStatus('Solved');
    setFormMyCode('');
    setFormExplanation('');
    setFormMistakes('');
    setFormBetterSolution('');
    setFormEditorialLink('');
    setFormVideoLink('');
    setFormTimeComplexity('O(N)');
    setFormSpaceComplexity('O(1)');
    setFormDateSolved(new Date().toISOString().split('T')[0]);
    setShowEditor(true);
  };

  const openEditProblem = (prob: Problem) => {
    setEditingProblem(prob);
    setFormName(prob.name);
    setFormTopicId(prob.topicId);
    setFormPlatform(prob.platform);
    setFormLink(prob.link);
    setFormDifficulty(prob.difficulty);
    setFormStatus(prob.status);
    setFormMyCode(prob.myCode || '');
    setFormExplanation(prob.explanation || '');
    setFormMistakes(prob.mistakes || '');
    setFormBetterSolution(prob.betterSolution || '');
    setFormEditorialLink(prob.editorialLink || '');
    setFormVideoLink(prob.videoLink || '');
    setFormTimeComplexity(prob.timeComplexity || 'O(N)');
    setFormSpaceComplexity(prob.spaceComplexity || 'O(1)');
    setFormDateSolved(prob.dateSolved || new Date().toISOString().split('T')[0]);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this web development task/solution log? This will also remove any linked revision flags.')) return;
    try {
      await api.deleteProblem(id);
      setProblems(prev => prev.filter(p => p.id !== id));
      if (expandedProblemId === id) setExpandedProblemId(null);
    } catch (e) {
      alert('Delete failed: ' + e);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProblemId(prev => prev === id ? null : id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLink.trim()) {
      alert('Problem Name and Judge Link are required.');
      return;
    }

    const payload = {
      name: formName.trim(),
      topicId: formTopicId,
      platform: formPlatform.trim(),
      link: formLink.trim(),
      difficulty: formDifficulty,
      status: formStatus,
      myCode: formMyCode.trim(),
      explanation: formExplanation.trim(),
      mistakes: formMistakes.trim(),
      betterSolution: formBetterSolution.trim(),
      editorialLink: formEditorialLink.trim(),
      videoLink: formVideoLink.trim(),
      timeComplexity: formTimeComplexity.trim(),
      spaceComplexity: formSpaceComplexity.trim(),
      dateSolved: formDateSolved || new Date().toISOString().split('T')[0],
      tags: [formPlatform, formDifficulty] // Automatic metadata tags
    };

    try {
      if (editingProblem) {
        const updated = await api.updateProblem(editingProblem.id, payload);
        setProblems(prev => prev.map(p => p.id === editingProblem.id ? updated : p));
      } else {
        const created = await api.createProblem(payload);
        setProblems(prev => [created, ...prev]);

        // If user logged mistakes inside this problem, automatically seed a Mistake Journal entry!
        if (payload.mistakes.trim()) {
          await api.createMistake({
            problemId: created.id,
            problemName: created.name,
            mistake: 'Logged from problem creation',
            wrongApproach: 'Refer to problem explanation mistakes',
            correctApproach: 'Refer to problem optimized code',
            lessonLearned: payload.mistakes.trim()
          });
        }

        // If unsolved or attempted, automatically register a Revision flag to prompt spaced repetition!
        if (payload.status !== 'Solved') {
          await api.createRevision({
            problemId: created.id,
            problemName: created.name,
            nextRevisionDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
            priority: 'High',
            completed: false
          });
        }
      }
      setShowEditor(false);
    } catch (err) {
      alert('Save failed: ' + err);
    }
  };

  // Filter processors
  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'All' || p.platform === platformFilter;
    const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesDifficulty && matchesStatus;
  });

  const getDifficultyColor = (diff: Problem['difficulty']) => {
    switch (diff) {
      case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  const getStatusColor = (status: Problem['status']) => {
    switch (status) {
      case 'Solved': return 'text-green-400 bg-green-500/10 border-green-500/25';
      case 'Attempted': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25';
      case 'Unsolved': return 'text-red-400 bg-red-500/10 border-red-500/25';
    }
  };

  return (
    <div id="problems-view" className="space-y-6">
      {/* Header controls layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="text-blue-500" size={20} />
            <span>Web Dev Challenge & Task Tracker</span>
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">Maintain your history of solved and attempted full-stack tasks and challenges</p>
        </div>

        <button
          onClick={openCreateProblem}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Log Solved Problem</span>
        </button>
      </div>

      {/* Advanced Filter panels */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-900/30 border border-slate-800/80 rounded-xl">
        {/* Search Input */}
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Keyword Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Two Sum"
              className="w-full pl-9 pr-3 py-1.5 bg-[#090d16] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Platform Selection */}
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Platform / Source</label>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#090d16] border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Platforms</option>
            <option value="Frontend Mentor">Frontend Mentor</option>
            <option value="LeetCode">LeetCode</option>
            <option value="GitHub">GitHub</option>
            <option value="HackerRank">HackerRank</option>
            <option value="Project Euler">Project Euler</option>
            <option value="Personal Project">Personal Project</option>
          </select>
        </div>

        {/* Difficulty filter */}
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Problem Difficulty</label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#090d16] border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Verdict Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#090d16] border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Verdicts</option>
            <option value="Solved">Solved</option>
            <option value="Attempted">Attempted</option>
            <option value="Unsolved">Unsolved</option>
          </select>
        </div>
      </div>

      {/* Loading bar */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Problems Listing content */
        <div className="space-y-4">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/10 border border-slate-800/80 border-dashed rounded-2xl text-slate-500 max-w-xl mx-auto">
              <Cpu size={44} className="mx-auto stroke-1 text-slate-600 mb-3" />
              <p className="text-sm font-mono uppercase tracking-wider">No matching problems found.</p>
              <p className="text-xs text-slate-600 mt-1">Add competitive problems you solve during practice or contests to document your solution scripts.</p>
              <button
                onClick={openCreateProblem}
                className="mt-4 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
              >
                Log first problem →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProblems.map((prob) => {
                const isExpanded = expandedProblemId === prob.id;
                const topicObj = topics.find(t => t.id === prob.topicId);
                return (
                  <motion.div
                    key={prob.id}
                    layout="position"
                    className="p-5 bg-[#0f1524]/60 border border-slate-800/80 rounded-xl hover:border-slate-700/80 transition-all space-y-4"
                  >
                    {/* Collapsed top bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-800 rounded">
                            {prob.platform}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getDifficultyColor(prob.difficulty)}`}>
                            {prob.difficulty}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getStatusColor(prob.status)}`}>
                            {prob.status}
                          </span>
                          {topicObj && (
                            <span className="text-[9px] font-mono text-blue-400 px-2 py-0.5 bg-blue-500/5 rounded border border-blue-500/15">
                              {topicObj.title}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 cursor-pointer" onClick={() => toggleExpand(prob.id)}>
                          <span>{prob.name}</span>
                          <a href={prob.link} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 cursor-pointer" onClick={e => e.stopPropagation()}>
                            <ExternalLink size={14} />
                          </a>
                        </h3>
                      </div>

                      {/* Right controls */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-[10px] font-mono text-slate-500 hidden sm:block">
                          Solved: {prob.dateSolved || 'Recently'}
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEditProblem(prob)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(prob.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button
                            onClick={() => toggleExpand(prob.id)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Toggle Inspector"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Compressed short description */}
                    {!isExpanded && prob.explanation && (
                      <p className="text-xs text-slate-400 line-clamp-1 font-sans">
                        {prob.explanation}
                      </p>
                    )}

                    {/* Extended Inspector Layout (Only if Expanded) */}
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-slate-800/60 pt-4 space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Left Panel: Explanation, Better Solution & Mistakes */}
                          <div className="md:col-span-2 space-y-4">
                            {prob.explanation && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">My Solution Logic:</span>
                                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/30 p-3.5 border border-slate-800 rounded-lg whitespace-pre-wrap">
                                  {prob.explanation}
                                </p>
                              </div>
                            )}

                            {prob.betterSolution && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">Better / Alternative approach:</span>
                                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-blue-500/5 p-3.5 border border-blue-500/10 rounded-lg whitespace-pre-wrap">
                                  {prob.betterSolution}
                                </p>
                              </div>
                            )}

                            {prob.mistakes && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block font-bold">Wrong Approaches / Logged Bugs:</span>
                                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-red-500/5 p-3.5 border border-red-500/10 rounded-lg whitespace-pre-wrap">
                                  {prob.mistakes}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Right Panel: Complexity, Links & References */}
                          <div className="space-y-4">
                            {/* Complexities */}
                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Performance analysis:</span>
                              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase block leading-none">Time Complexity</span>
                                  <span className="text-slate-200 mt-0.5 block">{prob.timeComplexity}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 uppercase block leading-none">Space Complexity</span>
                                  <span className="text-slate-200 mt-0.5 block">{prob.spaceComplexity}</span>
                                </div>
                              </div>
                            </div>

                            {/* Reference Links */}
                            <div className="space-y-2">
                              {prob.editorialLink && (
                                <a
                                  href={prob.editorialLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white rounded-lg transition-all"
                                >
                                  <span>Official Editorial Link</span>
                                  <ExternalLink size={12} />
                                </a>
                              )}

                              {prob.videoLink && (
                                <a
                                  href={prob.videoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/10 text-xs font-mono text-red-400 hover:text-red-300 rounded-lg transition-all"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Youtube size={14} />
                                    <span>Video Solution Walkthrough</span>
                                  </span>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Code block solution inspector */}
                        {prob.myCode && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">My Solution Script:</span>
                            <div className="relative group rounded-lg overflow-hidden border border-slate-800">
                              <div className="px-4 py-2 bg-[#090d16] border-b border-slate-800 text-[10px] font-mono text-slate-500 flex items-center gap-2">
                                <Code size={12} />
                                <span>C++ SOLUTION SCRIPT</span>
                              </div>
                              <pre className="p-4 bg-[#090d16]/80 text-xs font-mono text-green-300 overflow-x-auto max-h-96 scrollbar-thin">
                                <code>{prob.myCode}</code>
                              </pre>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
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
            className="bg-[#0f1524] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#090d16]/50">
              <div className="flex items-center gap-2">
                <Cpu className="text-blue-500" size={18} />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  {editingProblem ? 'Modify Problem Record' : 'Log Problem Record'}
                </h3>
              </div>
              <button 
                onClick={() => setShowEditor(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Row 1: Problem Name & Judge URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Problem Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Two Sum II - Input Array Is Sorted"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Source / Platform</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Frontend Mentor">Frontend Mentor</option>
                    <option value="LeetCode">LeetCode</option>
                    <option value="GitHub">GitHub</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="Project Euler">Project Euler</option>
                    <option value="Personal Project">Personal Project</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Link & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Problem Link (URL)</label>
                  <input
                    type="url"
                    required
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    placeholder="https://leetcode.com/problems/..."
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Syllabus Topic</label>
                  <select
                    value={formTopicId}
                    onChange={(e) => setFormTopicId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Verdict, Difficulty, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Verdict Verdict</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-sans"
                  >
                    <option value="Solved">Solved (Passed tests)</option>
                    <option value="Attempted">Attempted (WA / TLE / MLE)</option>
                    <option value="Unsolved">Unsolved (Need revision)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Difficulty Rating</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-sans"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Date Logged</label>
                  <input
                    type="date"
                    value={formDateSolved}
                    onChange={(e) => setFormDateSolved(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 4: Complexities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Time Complexity</label>
                  <input
                    type="text"
                    value={formTimeComplexity}
                    onChange={(e) => setFormTimeComplexity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="e.g., O(N log N)"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Space Complexity</label>
                  <input
                    type="text"
                    value={formSpaceComplexity}
                    onChange={(e) => setFormSpaceComplexity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="e.g., O(N)"
                  />
                </div>
              </div>

              {/* Editorial / Video Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Editorial URL Reference</label>
                  <input
                    type="url"
                    value={formEditorialLink}
                    onChange={(e) => setFormEditorialLink(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">YouTube Explainer Video URL</label>
                  <input
                    type="url"
                    value={formVideoLink}
                    onChange={(e) => setFormVideoLink(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {/* Solution code script */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">My Code Solution (Python / Django / HTML / CSS / JS)</label>
                <textarea
                  rows={6}
                  value={formMyCode}
                  onChange={(e) => setFormMyCode(e.target.value)}
                  className="w-full p-3 bg-[#090d16] border border-slate-800 text-green-300 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500 resize-y"
                  placeholder="Paste your source file here..."
                />
              </div>

              {/* Row 5: Explanation / Mistakes / Better Solution */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Core Logic & Implementation Explanation</label>
                  <textarea
                    rows={2}
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-200 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                    placeholder="Explain the structure, algorithms, framework APIs, database designs, or styling methods utilized..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-red-400 text-[10px] font-mono mb-1 uppercase tracking-wider font-semibold">Wrong Approaches / Bugs Made</label>
                    <textarea
                      rows={2}
                      value={formMistakes}
                      onChange={(e) => setFormMistakes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-850 text-slate-200 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-red-500 font-sans"
                      placeholder="e.g., N+1 query issue, CSS responsive breakpoint overlap, unhandled JS async rejection..."
                    />
                  </div>

                  <div>
                    <label className="block text-blue-400 text-[10px] font-mono mb-1 uppercase tracking-wider font-semibold">Better Alternative Solutions</label>
                    <textarea
                      rows={2}
                      value={formBetterSolution}
                      onChange={(e) => setFormBetterSolution(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090d16] border border-slate-850 text-slate-200 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                      placeholder="e.g., using select_related() in Django views, using CSS grid instead of absolute sizing..."
                    />
                  </div>
                </div>
              </div>

              {/* Modal controls footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0f1524]">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Cancel Logging
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
