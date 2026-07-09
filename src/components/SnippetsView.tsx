import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { 
  Terminal, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Save 
} from 'lucide-react';
import { Snippet } from '../types';

export default function SnippetsView() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Copy indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editor Modal States
  const [showEditor, setShowEditor] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formLanguage, setFormLanguage] = useState('python');
  const [formDescription, setFormDescription] = useState('');
  const [formTagsStr, setFormTagsStr] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getSnippets();
      setSnippets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateSnippet = () => {
    setEditingSnippet(null);
    setFormTitle('');
    setFormCode('');
    setFormLanguage('python');
    setFormDescription('');
    setFormTagsStr('');
    setShowEditor(true);
  };

  const openEditSnippet = (snip: Snippet) => {
    setEditingSnippet(snip);
    setFormTitle(snip.title);
    setFormCode(snip.code);
    setFormLanguage(snip.language);
    setFormDescription(snip.description);
    setFormTagsStr(snip.tags.join(', '));
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code snippet? This action cannot be undone.')) return;
    try {
      await api.deleteSnippet(id);
      setSnippets(prev => prev.filter(s => s.id !== id));
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
      alert('Title and Code are required.');
      return;
    }

    const tagsArray = formTagsStr.split(',').map(t => t.trim()).filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      code: formCode.trim(),
      language: formLanguage.trim(),
      description: formDescription.trim(),
      tags: tagsArray
    };

    try {
      if (editingSnippet) {
        const updated = await api.updateSnippet(editingSnippet.id, payload);
        setSnippets(prev => prev.map(s => s.id === editingSnippet.id ? updated : s));
      } else {
        const created = await api.createSnippet(payload);
        setSnippets(prev => [created, ...prev]);
      }
      setShowEditor(false);
    } catch (err) {
      alert('Save failed: ' + err);
    }
  };

  const filteredSnippets = snippets.filter(s => {
    return s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div id="snippets-view" className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="text-blue-500" size={20} />
            <span>Code Snippets Tracker</span>
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">Slightly reusable code fragments, custom fast macros, and coordinate compressions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search snippets..."
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 w-full sm:w-60 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Add Snippet Button */}
          <button
            onClick={openCreateSnippet}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Snippet</span>
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Snippets Grid layout */
        <>
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/10 border border-slate-800/80 border-dashed rounded-2xl text-slate-500 max-w-xl mx-auto">
              <Terminal size={44} className="mx-auto stroke-1 text-slate-600 mb-3" />
              <p className="text-sm font-mono uppercase tracking-wider">No snippets tracked yet.</p>
              <p className="text-xs text-slate-600 mt-1">Register small templates like directions array (dx/dy), fast modular multiplier, or sorting macros here.</p>
              <button
                onClick={openCreateSnippet}
                className="mt-4 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
              >
                Track a snippet →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSnippets.map((snip) => {
                const isCopied = copiedId === snip.id;
                return (
                  <motion.div
                    key={snip.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-4 hover:border-slate-700/80 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Top stats bar */}
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-slate-950 text-slate-400 rounded uppercase border border-slate-800">
                          {snip.language}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditSnippet(snip)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(snip.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-sm font-bold text-slate-100">{snip.title}</h3>
                      {snip.description && (
                        <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                          {snip.description}
                        </p>
                      )}

                      {/* Code Block with Copy action */}
                      <div className="relative group rounded-lg overflow-hidden border border-slate-800">
                        <button
                          onClick={() => handleCopy(snip.id, snip.code)}
                          className={`absolute right-3 top-3 px-2 py-1 text-[9px] font-mono rounded border transition-all cursor-pointer ${
                            isCopied 
                              ? 'bg-green-500/15 text-green-400 border-green-500/30' 
                              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {isCopied ? <Check size={10} /> : <Copy size={10} />}
                        </button>
                        <pre className="p-3 bg-[#090d16]/80 text-xs font-mono text-green-300 overflow-x-auto max-h-48 scrollbar-thin">
                          <code>{snip.code}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Footer Tags */}
                    {snip.tags.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/50 flex flex-wrap gap-1.5">
                        {snip.tags.map(t => (
                          <span key={t} className="text-[9px] font-mono text-slate-500 border border-slate-800 bg-slate-950/40 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f1524] border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#090d16]/50">
              <div className="flex items-center gap-2">
                <Terminal className="text-blue-500" size={18} />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  {editingSnippet ? 'Modify Snippet' : 'Track Snippet'}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Language selection */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Language</label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="python">Python</option>
                    <option value="django">Django</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Snippet Name</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                    placeholder="e.g., Django Custom Model Manager"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                  placeholder="e.g., Filters active users registered in the last 30 days"
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Source Code Fragment</label>
                <textarea
                  rows={6}
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full p-3 bg-[#090d16] border border-slate-800 text-green-300 rounded-lg text-xs font-mono placeholder-slate-700 focus:outline-none focus:border-blue-500 resize-y"
                  placeholder={`class ActiveUserQuerySet(models.QuerySet):\n    def active(self):\n        return self.filter(is_active=True)`}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formTagsStr}
                  onChange={(e) => setFormTagsStr(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Django, Models, ORM"
                />
              </div>

              {/* Modal controls footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0f1524]">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Cancel Tracking
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Snippet</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
