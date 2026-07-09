import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { 
  Layers, 
  Search, 
  Bookmark, 
  ExternalLink, 
  ArrowLeft, 
  FileText, 
  Code, 
  Cpu, 
  Video,
  Plus,
  Trash2,
  Share2,
  BookmarkCheck,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Topic, Note, Template, Problem, Video as VideoType } from '../types';

interface TopicsViewProps {
  onQuickAction: (actionType: string, defaultTopicId?: string) => void;
}

export default function TopicsView({ onQuickAction }: TopicsViewProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Topic Drilldown specific resource lists
  const [drilldownTab, setDrilldownTab] = useState<'notes' | 'templates' | 'problems' | 'videos'>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await api.getTopics();
        setTopics(data);
        const bms = await api.getBookmarks();
        setBookmarkedIds(bms.filter(b => b.itemType === 'topic').map(b => b.itemId));
      } catch (e) {
        console.error(e);
      }
    };
    fetchTopics();

    // Check if a topic id was stored for direct drilldown redirection
    const redirectId = localStorage.getItem('codevault_topic_drilldown');
    if (redirectId) {
      setSelectedTopicId(redirectId);
      localStorage.removeItem('codevault_topic_drilldown');
    }
  }, []);

  useEffect(() => {
    if (selectedTopicId) {
      const topic = topics.find(t => t.id === selectedTopicId);
      if (topic) {
        setSelectedTopic(topic);
        fetchTopicResources(selectedTopicId);
      }
    } else {
      setSelectedTopic(null);
    }
  }, [selectedTopicId, topics]);

  const fetchTopicResources = async (topicId: string) => {
    setLoadingResources(true);
    try {
      const notesList = await api.getNotes(topicId);
      const templatesList = await api.getTemplates(topicId);
      const problemsList = await api.getProblems(topicId);
      const videosList = await api.getVideos(topicId);

      setNotes(notesList);
      setTemplates(templatesList);
      setProblems(problemsList);
      setVideos(videosList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation();
    try {
      const res = await api.toggleBookmark('topic', topicId);
      if (res.bookmarked) {
        setBookmarkedIds(prev => [...prev, topicId]);
      } else {
        setBookmarkedIds(prev => prev.filter(id => id !== topicId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = difficultyFilter === 'All' || t.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (diff: Topic['difficulty']) => {
    switch (diff) {
      case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  return (
    <div id="topics-view" className="space-y-6">
      {!selectedTopicId ? (
        /* Full Topics grid view */
        <>
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="text-blue-500" size={20} />
                <span>Competitive Programming Syllabus Matrix</span>
              </h2>
              <p className="text-slate-400 text-xs font-mono mt-0.5">Explore the core blocks of computer science and CP mechanics</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search syllabus..."
                  className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 w-full sm:w-60 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Difficulty Filter Tabs */}
              <div className="flex bg-[#090d16] border border-slate-800 rounded-lg p-0.5">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      difficultyFilter === diff 
                        ? 'bg-blue-500/25 text-blue-400 font-semibold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic, idx) => {
              const isBookmarked = bookmarkedIds.includes(topic.id);
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.4) }}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className="bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700/80 hover:shadow-xl hover:bg-slate-900/60 transition-all group cursor-pointer flex flex-col justify-between h-56 relative"
                >
                  <div>
                    {/* Top image header banner overlay */}
                    <div className="h-2 w-full bg-slate-800 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-indigo-500/50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyColor(topic.difficulty)}`}>
                          {topic.difficulty}
                        </span>
                        <button
                          onClick={(e) => handleBookmarkToggle(e, topic.id)}
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-400 hover:text-yellow-400 transition-all cursor-pointer"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck size={14} className="text-yellow-400" />
                          ) : (
                            <Bookmark size={14} />
                          )}
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-slate-200 group-hover:text-blue-400 transition-colors tracking-tight line-clamp-1">
                        {topic.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-3 font-sans leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>

                  {/* Tags footer */}
                  <div className="px-5 pb-5 pt-2 flex flex-wrap gap-1.5">
                    {topic.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[9px] font-mono text-slate-500 border border-slate-800 bg-[#090d16]/60 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                    {topic.tags.length > 3 && (
                      <span className="text-[9px] font-mono text-slate-600 px-1.5 py-0.5">
                        +{topic.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        /* Single Topic Drill-Down layout */
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedTopicId(null)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Syllabus Matrix</span>
          </button>

          {/* Topic Header banner summary card */}
          {selectedTopic && (
            <div className="relative p-6 md:p-8 bg-gradient-to-r from-slate-900/90 to-[#0e172a]/70 backdrop-blur-md border border-slate-800/60 rounded-2xl overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-full opacity-5 pointer-events-none">
                <Layers size={240} className="text-white" />
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${getDifficultyColor(selectedTopic.difficulty)}`}>
                      {selectedTopic.difficulty}
                    </span>
                    {selectedTopic.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-slate-400 border border-slate-800 bg-slate-950 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    {selectedTopic.title}
                  </h2>

                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-sans">
                    {selectedTopic.description}
                  </p>

                  {selectedTopic.relatedTopics.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Related Syllabi:</span>
                      {selectedTopic.relatedTopics.map(relId => {
                        const relTopic = topics.find(t => t.id === relId);
                        return relTopic ? (
                          <button
                            key={relId}
                            onClick={() => setSelectedTopicId(relId)}
                            className="text-[10px] font-mono text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                          >
                            {relTopic.title}
                          </button>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => handleBookmarkToggle(e, selectedTopic.id)}
                  className="p-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-slate-300 hover:text-yellow-400 transition-all shrink-0 cursor-pointer flex items-center gap-2 text-xs font-mono"
                >
                  {bookmarkedIds.includes(selectedTopic.id) ? (
                    <>
                      <BookmarkCheck size={16} className="text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Bookmarked Topic</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={16} />
                      <span>Bookmark Topic</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab buttons switcher */}
          <div className="flex border-b border-slate-800/60">
            {[
              { id: 'notes', label: 'Theory Notes', count: notes.length, icon: FileText },
              { id: 'templates', label: 'Reusable Templates', count: templates.length, icon: Code },
              { id: 'problems', label: 'Logged Problems', count: problems.length, icon: Cpu },
              { id: 'videos', label: 'Lectures / Videos', count: videos.length, icon: Video }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDrilldownTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-mono transition-all border-b-2 cursor-pointer ${
                    drilldownTab === tab.id 
                      ? 'text-blue-400 border-blue-500 bg-slate-900/10' 
                      : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/5'
                  }`}
                >
                  <TabIcon size={14} />
                  <span>{tab.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-slate-500 rounded border border-slate-800">{tab.count}</span>
                </button>
              );
            })}
          </div>

          {/* Resources listing dynamic section */}
          <div className="space-y-4">
            {loadingResources ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 font-mono text-xs">
                <div className="w-8 h-8 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                <span>Syncing topic repositories...</span>
              </div>
            ) : (
              <div>
                {/* 1. NOTES TAB */}
                {drilldownTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">Theory Notebook</h4>
                      <button
                        onClick={() => onQuickAction('note', selectedTopicId || undefined)}
                        className="flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Log Theory Note</span>
                      </button>
                    </div>

                    {notes.length === 0 ? (
                      <div className="text-center py-12 bg-slate-900/20 border border-slate-800/80 border-dashed rounded-xl text-slate-500">
                        <FileText size={36} className="mx-auto stroke-1 text-slate-600 mb-2" />
                        <p className="text-xs font-mono">No specific theory notes written for this syllabus.</p>
                        <button
                          onClick={() => onQuickAction('note', selectedTopicId || undefined)}
                          className="text-xs text-blue-400 hover:underline mt-2 cursor-pointer font-mono font-medium"
                        >
                          Write the first note now →
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {notes.map((note) => (
                          <div key={note.id} className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-4">
                            <div className="flex justify-between items-start">
                              <h5 className="text-base font-bold text-slate-100">{note.title}</h5>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Updated {new Date(note.updatedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                              {note.content}
                            </p>

                            {note.codeBlock && (
                              <div className="relative group">
                                <button
                                  onClick={() => copyToClipboard(note.codeBlock)}
                                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 bg-slate-900 border border-slate-800 p-1.5 text-slate-400 hover:text-white rounded transition-all cursor-pointer"
                                  title="Copy Code"
                                >
                                  <Code size={14} />
                                </button>
                                <pre className="p-4 bg-[#090d16] border border-slate-800/80 rounded-lg text-xs font-mono text-green-300 overflow-x-auto max-h-60 scrollbar-thin">
                                  <code>{note.codeBlock}</code>
                                </pre>
                              </div>
                            )}

                            {note.formulaSection && (
                              <div className="p-3 bg-blue-500/5 border-l-2 border-blue-500 text-slate-300 font-mono text-xs rounded-r-lg">
                                <span className="text-[10px] text-blue-400 font-bold block uppercase mb-0.5">Key Equation / Recurrence:</span>
                                {note.formulaSection}
                              </div>
                            )}

                            {note.importantTips && (
                              <div className="p-3 bg-amber-500/5 border-l-2 border-amber-500 text-slate-300 text-xs rounded-r-lg">
                                <span className="text-[10px] text-amber-400 font-bold block uppercase mb-0.5">Important Implementation Tip:</span>
                                {note.importantTips}
                              </div>
                            )}

                            {note.references.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                <span className="text-[9px] font-mono text-slate-500 uppercase py-0.5">References:</span>
                                {note.references.map((ref, i) => (
                                  <span key={i} className="text-[9px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                    {ref}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TEMPLATES TAB */}
                {drilldownTab === 'templates' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">Reusable Code Repositories</h4>
                      <button
                        onClick={() => onQuickAction('template', selectedTopicId || undefined)}
                        className="flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Register Template</span>
                      </button>
                    </div>

                    {templates.length === 0 ? (
                      <div className="text-center py-12 bg-slate-900/20 border border-slate-800/80 border-dashed rounded-xl text-slate-500">
                        <Code size={36} className="mx-auto stroke-1 text-slate-600 mb-2" />
                        <p className="text-xs font-mono">No templates registered for this topic.</p>
                        <button
                          onClick={() => onQuickAction('template', selectedTopicId || undefined)}
                          className="text-xs text-blue-400 hover:underline mt-2 cursor-pointer font-mono font-medium"
                        >
                          Add first template code →
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {templates.map((temp) => (
                          <div key={temp.id} className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <h5 className="text-base font-bold text-slate-100">{temp.title}</h5>
                              <div className="flex gap-2 shrink-0">
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded">
                                  Time: {temp.complexityTime}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded">
                                  Space: {temp.complexitySpace}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-400 font-sans leading-relaxed">
                              {temp.explanation}
                            </p>

                            <div className="relative group">
                              <button
                                onClick={() => copyToClipboard(temp.code)}
                                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 bg-slate-900 border border-slate-800 p-1.5 text-slate-400 hover:text-white rounded transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-mono"
                              >
                                <Code size={12} />
                                <span>Copy Code Block</span>
                              </button>
                              <pre className="p-4 bg-[#090d16] border border-slate-800/80 rounded-lg text-xs font-mono text-green-300 overflow-x-auto max-h-96 scrollbar-thin">
                                <code>{temp.code}</code>
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. PROBLEMS TAB */}
                {drilldownTab === 'problems' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">Syllabus Problem Tracker</h4>
                      <button
                        onClick={() => onQuickAction('problem', selectedTopicId || undefined)}
                        className="flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Log Solved Problem</span>
                      </button>
                    </div>

                    {problems.length === 0 ? (
                      <div className="text-center py-12 bg-slate-900/20 border border-slate-800/80 border-dashed rounded-xl text-slate-500">
                        <Cpu size={36} className="mx-auto stroke-1 text-slate-600 mb-2" />
                        <p className="text-xs font-mono">No problems logged under this syllabus.</p>
                        <button
                          onClick={() => onQuickAction('problem', selectedTopicId || undefined)}
                          className="text-xs text-blue-400 hover:underline mt-2 cursor-pointer font-mono font-medium"
                        >
                          Log first solved problem →
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {problems.map((prob) => (
                          <div key={prob.id} className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-3 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded">
                                  {prob.platform}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  prob.status === 'Solved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                }`}>
                                  {prob.status}
                                </span>
                              </div>

                              <h5 className="text-sm font-bold text-white tracking-tight flex items-center justify-between">
                                <span className="line-clamp-1">{prob.name}</span>
                                <a href={prob.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1 shrink-0">
                                  <ExternalLink size={12} />
                                </a>
                              </h5>

                              <p className="text-xs text-slate-400 mt-2 line-clamp-2 font-sans">
                                {prob.explanation}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                              <span className="text-slate-500">Complexity: <span className="text-slate-300">{prob.timeComplexity}</span></span>
                              {prob.mistakes && (
                                <span className="text-red-400 flex items-center gap-1">
                                  <AlertTriangle size={10} />
                                  <span>Has Logged Bug</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. VIDEOS TAB */}
                {drilldownTab === 'videos' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">YouTube Video Catalog</h4>
                      <button
                        onClick={() => onQuickAction('video', selectedTopicId || undefined)}
                        className="flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Lecture Video</span>
                      </button>
                    </div>

                    {videos.length === 0 ? (
                      <div className="text-center py-12 bg-slate-900/20 border border-slate-800/80 border-dashed rounded-xl text-slate-500">
                        <Video size={36} className="mx-auto stroke-1 text-slate-600 mb-2" />
                        <p className="text-xs font-mono">No video lectures added for this topic.</p>
                        <button
                          onClick={() => onQuickAction('video', selectedTopicId || undefined)}
                          className="text-xs text-blue-400 hover:underline mt-2 cursor-pointer font-mono font-medium"
                        >
                          Link your first YouTube lecture →
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {videos.map((vid) => (
                          <div key={vid.id} className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl space-y-4">
                            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 relative">
                              <iframe
                                src={`https://www.youtube.com/embed/${vid.youtubeId}`}
                                title={vid.title}
                                className="w-full h-full"
                                allowFullScreen
                              ></iframe>
                            </div>

                            <div className="space-y-1.5">
                              <h5 className="text-sm font-bold text-slate-100 line-clamp-1">{vid.title}</h5>
                              <p className="text-xs text-slate-400 font-sans line-clamp-2">{vid.description}</p>
                            </div>

                            {vid.timestamps.length > 0 && (
                              <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                                <span className="text-[10px] font-mono text-slate-500 block uppercase">Bookmarks / Timestamps:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {vid.timestamps.map((t, idx) => (
                                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 rounded hover:text-blue-400 transition-colors">
                                      <span className="text-blue-500 mr-1">{t.time}</span>
                                      {t.label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
