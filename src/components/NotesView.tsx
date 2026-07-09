import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Save, 
  X, 
  Code, 
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { Note, Topic } from '../types';

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Editor Modal States
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formTopicId, setFormTopicId] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCodeBlock, setFormCodeBlock] = useState('');
  const [formFormulaSection, setFormFormulaSection] = useState('');
  const [formImportantTips, setFormImportantTips] = useState('');
  const [formTagsStr, setFormTagsStr] = useState('');
  const [formReferencesStr, setFormReferencesStr] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const notesList = await api.getNotes();
      const topicsList = await api.getTopics();
      setNotes(notesList);
      setTopics(topicsList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateNote = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormTopicId(topics[0]?.id || 'intro');
    setFormContent('');
    setFormCodeBlock('');
    setFormFormulaSection('');
    setFormImportantTips('');
    setFormTagsStr('');
    setFormReferencesStr('');
    setFormImageUrl('');
    setShowEditor(true);
  };

  const openEditNote = (note: Note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormTopicId(note.topicId);
    setFormContent(note.content);
    setFormCodeBlock(note.codeBlock || '');
    setFormFormulaSection(note.formulaSection || '');
    setFormImportantTips(note.importantTips || '');
    setFormTagsStr(note.tags.join(', '));
    setFormReferencesStr(note.references.join(', '));
    // Sample image URL if any
    setFormImageUrl('');
    setShowEditor(true);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this CP note? This action cannot be undone.')) return;
    try {
      await api.deleteNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (e) {
      alert('Delete failed: ' + e);
    }
  };

  // Convert uploaded image to base64 and process
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG/JPG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      if (base64Data) {
        try {
          const res = await api.uploadImage(file.name, file.type, base64Data.split(',')[1]);
          // Append the image markdown or tag to the content editor cleanly
          setFormContent(prev => prev + `\n\n![${file.name}](${res.url})`);
          alert('Image uploaded successfully and appended to note text!');
        } catch (err) {
          alert('Upload failed: ' + err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Title is required');
      return;
    }

    const tagsArray = formTagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const refsArray = formReferencesStr.split(',').map(r => r.trim()).filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      topicId: formTopicId,
      content: formContent.trim(),
      codeBlock: formCodeBlock.trim(),
      formulaSection: formFormulaSection.trim(),
      importantTips: formImportantTips.trim(),
      tags: tagsArray,
      references: refsArray
    };

    try {
      if (editingNote) {
        const updated = await api.updateNote(editingNote.id, payload);
        setNotes(prev => prev.map(n => n.id === editingNote.id ? updated : n));
      } else {
        const created = await api.createNote(payload);
        setNotes(prev => [created, ...prev]);
      }
      setShowEditor(false);
    } catch (err) {
      alert('Save failed: ' + err);
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = selectedTopicId === 'All' || n.topicId === selectedTopicId;
    return matchesSearch && matchesTopic;
  });

  return (
    <div id="notes-view" className="space-y-6">
      {/* Header controls section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="text-blue-500" size={20} />
            <span>Competitive Programming Notebook</span>
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">Structure and formulate deep algorithmic logic and complex DP states</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search written notes..."
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 w-full sm:w-52 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Topic Dropdown */}
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

          {/* Add note button */}
          <button
            onClick={openCreateNote}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Write Theory Note</span>
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Notes grid */
        <>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/10 border border-slate-800/80 border-dashed rounded-2xl text-slate-500 max-w-xl mx-auto">
              <BookOpen size={44} className="mx-auto stroke-1 text-slate-600 mb-3" />
              <p className="text-sm font-mono uppercase tracking-wider">No notes compiled yet.</p>
              <p className="text-xs text-slate-600 mt-1">Start writing detailed notes about algorithms or DP equations to memorize them.</p>
              <button
                onClick={openCreateNote}
                className="mt-4 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
              >
                Create your first note →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNotes.map((note) => {
                const topicObj = topics.find(t => t.id === note.topicId);
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-[#0f1524]/60 border border-slate-800/80 rounded-xl space-y-4 hover:border-slate-700/80 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Note topic header tag & Controls */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-blue-400 font-mono uppercase">
                          {topicObj?.title || 'General'}
                        </span>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => openEditNote(note)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Edit Note"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Delete Note"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-100 tracking-tight leading-snug">
                        {note.title}
                      </h3>

                      {/* Content */}
                      <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line line-clamp-4">
                        {note.content}
                      </p>

                      {/* Formula section if any */}
                      {note.formulaSection && (
                        <div className="p-3 bg-blue-500/5 border-l-2 border-blue-500 text-slate-300 font-mono text-xs rounded-r-lg">
                          <span className="text-[9px] text-blue-400 font-bold block uppercase mb-0.5">Recurrence / Equation</span>
                          {note.formulaSection}
                        </div>
                      )}

                      {/* Tips section if any */}
                      {note.importantTips && (
                        <div className="p-3 bg-amber-500/5 border-l-2 border-amber-500 text-slate-300 text-xs rounded-r-lg">
                          <span className="text-[9px] text-amber-400 font-bold block uppercase mb-0.5">Contest Tip</span>
                          {note.importantTips}
                        </div>
                      )}

                      {/* Render images embedded in content if any exists */}
                      {note.content.includes('![') && (
                        <div className="flex gap-2 py-1 items-center text-[10px] text-slate-500 font-mono">
                          <ImageIcon size={12} className="text-blue-400" />
                          <span>Includes rich schematic diagrams / illustrations</span>
                        </div>
                      )}
                    </div>

                    {/* Tags & Updated date footer */}
                    <div className="pt-3 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map(t => (
                          <span key={t} className="text-[9px] text-slate-500 border border-slate-800 bg-[#090d16]/50 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-500">
                        Revised {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
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
            className="bg-[#0f1524] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#090d16]/50">
              <div className="flex items-center gap-2">
                <FileText className="text-blue-500" size={18} />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  {editingNote ? 'Modify Theory Note' : 'Compile Theory Note'}
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
                {/* Topic selector */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Associated Syllabus</label>
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
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Note Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                    placeholder="e.g., Dijkstra state relaxation with priority queues"
                  />
                </div>
              </div>

              {/* Text Area (Markdown Content with Drag & Drop Images support) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-400 text-[10px] font-mono uppercase tracking-wider">Notes Content (Rich Text / Description)</label>
                  
                  {/* File Upload click trigger */}
                  <label className="inline-flex items-center gap-1.5 text-[10px] font-mono text-blue-400 hover:text-blue-300 cursor-pointer hover:underline">
                    <Upload size={12} />
                    <span>Upload Image Illustration</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUploadChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative ${isDragging ? 'border-2 border-dashed border-blue-500 bg-blue-500/5' : ''}`}
                >
                  <textarea
                    rows={6}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-200 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans leading-relaxed resize-y"
                    placeholder="Describe the theory, proofs, state formulations, or general summaries. Hint: Drag & drop your drawing/diagram directly inside this editor to upload and embed it!"
                  />
                  {isDragging && (
                    <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center rounded-lg pointer-events-none">
                      <p className="text-blue-400 font-mono text-xs font-semibold uppercase tracking-widest animate-pulse">
                        Drop Image to Upload and Embed
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Code block pre-form */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Core Code Implementation</label>
                <textarea
                  rows={4}
                  value={formCodeBlock}
                  onChange={(e) => setFormCodeBlock(e.target.value)}
                  className="w-full p-3 bg-[#090d16] border border-slate-800 text-green-300 rounded-lg text-xs font-mono placeholder-slate-700 focus:outline-none focus:border-blue-500"
                  placeholder="void solve() { ... }"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Equation recurrence */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Mathematical Equation / Recurrence</label>
                  <input
                    type="text"
                    value={formFormulaSection}
                    onChange={(e) => setFormFormulaSection(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="e.g., dp[i][w] = dp[i-1][w]"
                  />
                </div>

                {/* Important tips */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Contest Tip / Edge Cases</label>
                  <input
                    type="text"
                    value={formImportantTips}
                    onChange={(e) => setFormImportantTips(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500 font-sans"
                    placeholder="e.g., Set dp values to -1e9 for unreachable states"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tags input */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formTagsStr}
                    onChange={(e) => setFormTagsStr(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="DP, Memoization, Backtracking"
                  />
                </div>

                {/* References input */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">References (comma-separated)</label>
                  <input
                    type="text"
                    value={formReferencesStr}
                    onChange={(e) => setFormReferencesStr(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="Codeforces blog, USACO Guide"
                  />
                </div>
              </div>

              {/* Modal controls footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0f1524]">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Cancel Compilation
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
