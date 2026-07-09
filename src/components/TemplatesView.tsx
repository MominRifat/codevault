import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { 
  Code, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Save, 
  Clock, 
  Database,
  Terminal
} from 'lucide-react';
import { Template, Topic } from '../types';

export default function TemplatesView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Copy state per templateId
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editor Modal States
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formTopicId, setFormTopicId] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formComplexityTime, setFormComplexityTime] = useState('');
  const [formComplexitySpace, setFormComplexitySpace] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const templatesList = await api.getTemplates();
      const topicsList = await api.getTopics();
      setTemplates(templatesList);
      setTopics(topicsList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormTopicId(topics[0]?.id || 'intro');
    setFormCode('');
    setFormExplanation('');
    setFormComplexityTime('O(log N)');
    setFormComplexitySpace('O(N)');
    setShowEditor(true);
  };

  const openEditTemplate = (temp: Template) => {
    setEditingTemplate(temp);
    setFormTitle(temp.title);
    setFormTopicId(temp.topicId);
    setFormCode(temp.code);
    setFormExplanation(temp.explanation);
    setFormComplexityTime(temp.complexityTime);
    setFormComplexitySpace(temp.complexitySpace);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code template? This action cannot be undone.')) return;
    try {
      await api.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert('Delete failed: ' + e);
    }
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCode.trim()) {
      alert('Title and Code fields are required.');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      topicId: formTopicId,
      code: formCode.trim(),
      explanation: formExplanation.trim(),
      complexityTime: formComplexityTime.trim(),
      complexitySpace: formComplexitySpace.trim()
    };

    try {
      if (editingTemplate) {
        const updated = await api.updateTemplate(editingTemplate.id, payload);
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updated : t));
      } else {
        const created = await api.createTemplate(payload);
        setTemplates(prev => [created, ...prev]);
      }
      setShowEditor(false);
    } catch (err) {
      alert('Save failed: ' + err);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopicId === 'All' || t.topicId === selectedTopicId;
    return matchesSearch && matchesTopic;
  });

  return (
    <div id="templates-view" className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Code className="text-blue-500" size={20} />
            <span>Boilerplate & Template Repository</span>
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">Tested, robust, structured code setups ready for fast copying</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 w-full sm:w-52 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Topic Selector */}
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Topics</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>

          {/* Create Button */}
          <button
            onClick={openCreateTemplate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Register Template</span>
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Templates List */
        <>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/10 border border-slate-800/80 border-dashed rounded-2xl text-slate-500 max-w-xl mx-auto">
              <Code size={44} className="mx-auto stroke-1 text-slate-600 mb-3" />
              <p className="text-sm font-mono uppercase tracking-wider">No templates configured yet.</p>
              <p className="text-xs text-slate-600 mt-1">Add highly optimized code templates or core patterns to access them instantly.</p>
              <button
                onClick={openCreateTemplate}
                className="mt-4 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
              >
                Register a template →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTemplates.map((temp) => {
                const topicObj = topics.find(t => t.id === temp.topicId);
                const isCopied = copiedId === temp.id;
                return (
                  <motion.div
                    key={temp.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-[#0f1524]/60 border border-slate-800/80 rounded-xl space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono uppercase">
                            {topicObj?.title || 'General'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100 font-sans tracking-tight leading-snug">
                          {temp.title}
                        </h3>
                      </div>

                      {/* Controls and Complexity */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex gap-1.5 text-[10px] font-mono">
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 rounded flex items-center gap-1">
                            <Clock size={10} />
                            <span>Time: {temp.complexityTime}</span>
                          </span>
                          <span className="px-2 py-0.5 bg-violet-500/10 text-violet-300 border border-violet-500/25 rounded flex items-center gap-1">
                            <Database size={10} />
                            <span>Space: {temp.complexitySpace}</span>
                          </span>
                        </div>

                        <div className="flex gap-1 border-l border-slate-800 pl-3">
                          <button
                            onClick={() => openEditTemplate(temp)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(temp.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Description Explanation */}
                    {temp.explanation && (
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {temp.explanation}
                      </p>
                    )}

                    {/* Interactive Code block */}
                    <div className="relative group rounded-lg overflow-hidden border border-slate-800 bg-[#090d16]">
                      <div className="flex items-center justify-between px-4 py-2 bg-[#090d16] border-b border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                          <Terminal size={12} />
                          <span>C++ SOURCE FILE</span>
                        </span>

                        <button
                          onClick={() => handleCopy(temp.id, temp.code)}
                          className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded border transition-all cursor-pointer ${
                            isCopied 
                              ? 'bg-green-500/10 text-green-400 border-green-500/35' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check size={11} />
                              <span>Copied Template</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-green-300 overflow-x-auto max-h-80 scrollbar-thin">
                        <code>{temp.code}</code>
                      </pre>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Template Editor Modal Overlay */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1524] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#090d16]/50">
              <div className="flex items-center gap-2">
                <Code className="text-blue-500" size={18} />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  {editingTemplate ? 'Modify Code Template' : 'Register Code Template'}
                </h3>
              </div>
              <button 
                onClick={() => setShowEditor(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Associated Topic */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Associated Topic</label>
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

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Template Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                    placeholder="e.g., Django CBV with Custom Permission Mixin"
                  />
                </div>
              </div>

              {/* Time and Space complexities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Time Complexity</label>
                  <input
                    type="text"
                    required
                    value={formComplexityTime}
                    onChange={(e) => setFormComplexityTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="O(1) query time / O(N) memory"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Space Complexity</label>
                  <input
                    type="text"
                    required
                    value={formComplexitySpace}
                    onChange={(e) => setFormComplexitySpace(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="O(N)"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Template Explanation / Usage Guidelines</label>
                <textarea
                  rows={3}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-200 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans resize-none"
                  placeholder="Explain how to initialize, zero-base vs one-base requirements, or specific template limitations..."
                />
              </div>

              {/* Source code block */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Source Code (Python / HTML / JS / CSS)</label>
                <textarea
                  rows={8}
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full p-4 bg-[#090d16] border border-slate-800 text-green-300 rounded-lg text-xs font-mono placeholder-slate-700 focus:outline-none focus:border-blue-500 resize-y"
                  placeholder={`# Django view or vanilla JS component setup\n\n// Code goes here...`}
                />
              </div>

              {/* Modal controls footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0f1524]">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Cancel Registration
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Template</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
