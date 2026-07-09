import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  Layers, 
  FileText, 
  Code, 
  Cpu,
  BookmarkX
} from 'lucide-react';
import { Topic, Note, Template, Problem } from '../types';

interface BookmarksViewProps {
  onNavigateToTab: (tab: string) => void;
}

export default function BookmarksView({ onNavigateToTab }: BookmarksViewProps) {
  const [bookmarkedIds, setBookmarkedIds] = useState<any[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bmarks = await api.getBookmarks();
      const tops = await api.getTopics();
      const nts = await api.getNotes();
      const temps = await api.getTemplates();
      const probs = await api.getProblems();

      setBookmarkedIds(bmarks);
      setTopics(tops);
      setNotes(nts);
      setTemplates(temps);
      setProblems(probs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (type: 'topic' | 'note' | 'problem' | 'template', id: string) => {
    try {
      await api.toggleBookmark(type, id);
      setBookmarkedIds(prev => prev.filter(b => !(b.itemType === type && b.itemId === id)));
    } catch (e) {
      alert('Failed to remove bookmark: ' + e);
    }
  };

  // Resolve item references
  const getBookmarkedTopics = () => {
    const ids = bookmarkedIds.filter(b => b.itemType === 'topic').map(b => b.itemId);
    return topics.filter(t => ids.includes(t.id));
  };

  const getBookmarkedNotes = () => {
    const ids = bookmarkedIds.filter(b => b.itemType === 'note').map(b => b.itemId);
    return notes.filter(n => ids.includes(n.id));
  };

  const getBookmarkedTemplates = () => {
    const ids = bookmarkedIds.filter(b => b.itemType === 'template').map(b => b.itemId);
    return templates.filter(t => ids.includes(t.id));
  };

  const getBookmarkedProblems = () => {
    const ids = bookmarkedIds.filter(b => b.itemType === 'problem').map(b => b.itemId);
    return problems.filter(p => ids.includes(p.id));
  };

  const bTopics = getBookmarkedTopics();
  const bNotes = getBookmarkedNotes();
  const bTemplates = getBookmarkedTemplates();
  const bProblems = getBookmarkedProblems();

  const totalBookmarks = bTopics.length + bNotes.length + bTemplates.length + bProblems.length;

  return (
    <div id="bookmarks-view" className="space-y-6">
      {/* Header section layout */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bookmark className="text-blue-500 fill-blue-500/20" size={20} />
          <span>Global Bookmarked Resources</span>
        </h2>
        <p className="text-slate-400 text-xs font-mono mt-0.5">Quick access portal for flagged topics, algorithm implementations, and problems</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : totalBookmarks === 0 ? (
        <div className="text-center py-16 bg-[#0f1524]/20 border border-slate-800/80 border-dashed rounded-2xl text-slate-500 max-w-xl mx-auto">
          <BookmarkX size={44} className="mx-auto stroke-1 text-slate-600 mb-3" />
          <p className="text-sm font-mono uppercase tracking-wider">No bookmarks saved yet.</p>
          <p className="text-xs text-slate-600 mt-1">Flag essential resources, core syllabus topics, and solutions with the bookmark icon for rapid lookups here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Bookmarked Syllabus Topics */}
          {bTopics.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5">
                <Layers size={13} className="text-blue-400" />
                <span>Bookmarked Syllabus Topics ({bTopics.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bTopics.map(t => (
                  <div key={t.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700/60 transition-all">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{t.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{t.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-mono">
                      <button
                        onClick={() => onNavigateToTab('topics')}
                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Syllabus</span>
                        <ExternalLink size={10} />
                      </button>
                      <button
                        onClick={() => handleRemoveBookmark('topic', t.id)}
                        className="text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Bookmarked Theory Notes */}
          {bNotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5">
                <FileText size={13} className="text-blue-400" />
                <span>Bookmarked Theory Notes ({bNotes.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bNotes.map(n => (
                  <div key={n.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700/60 transition-all">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{n.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{n.content}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-mono">
                      <button
                        onClick={() => onNavigateToTab('notes')}
                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Notebook</span>
                        <ExternalLink size={10} />
                      </button>
                      <button
                        onClick={() => handleRemoveBookmark('note', n.id)}
                        className="text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Bookmarked Algorithm Templates */}
          {bTemplates.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5">
                <Code size={13} className="text-blue-400" />
                <span>Bookmarked Templates ({bTemplates.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bTemplates.map(t => (
                  <div key={t.id} className="p-4 bg-[#0f1524]/60 border border-slate-800/80 rounded-xl flex flex-col justify-between hover:border-slate-700/60 transition-all">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{t.title}</h4>
                      {t.explanation && <p className="text-xs text-slate-400 line-clamp-2 mt-1">{t.explanation}</p>}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-mono">
                      <button
                        onClick={() => onNavigateToTab('templates')}
                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Templates</span>
                        <ExternalLink size={10} />
                      </button>
                      <button
                        onClick={() => handleRemoveBookmark('template', t.id)}
                        className="text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Bookmarked Problems */}
          {bProblems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800/60 pb-1.5">
                <Cpu size={13} className="text-blue-400" />
                <span>Bookmarked Problems ({bProblems.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bProblems.map(p => (
                  <div key={p.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700/60 transition-all">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-mono font-bold px-1.5 bg-slate-950 text-slate-400 rounded">
                          {p.platform}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{p.name}</h4>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-mono">
                      <button
                        onClick={() => onNavigateToTab('problems')}
                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Solver</span>
                        <ExternalLink size={10} />
                      </button>
                      <button
                        onClick={() => handleRemoveBookmark('problem', p.id)}
                        className="text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
