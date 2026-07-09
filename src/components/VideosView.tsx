import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { 
  Video, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Play, 
  Clock, 
  X, 
  Save, 
  Bookmark,
  BookOpen
} from 'lucide-react';
import { Video as VideoType, Topic } from '../types';

export default function VideosView() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Editor Modal states
  const [showEditor, setShowEditor] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoType | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formTopicId, setFormTopicId] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formTimestampsStr, setFormTimestampsStr] = useState('');

  // Active playing video (for focusing/playing inline)
  const [activePlayId, setActivePlayId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const videosList = await api.getVideos();
      const topicsList = await api.getTopics();
      setVideos(videosList);
      setTopics(topicsList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateVideo = () => {
    setEditingVideo(null);
    setFormTitle('');
    setFormTopicId(topics[0]?.id || 'intro');
    setFormYoutubeUrl('');
    setFormDescription('');
    setFormNotes('');
    setFormTimestampsStr('');
    setShowEditor(true);
  };

  const openEditVideo = (vid: VideoType) => {
    setEditingVideo(vid);
    setFormTitle(vid.title);
    setFormTopicId(vid.topicId);
    setFormYoutubeUrl(vid.youtubeUrl);
    setFormDescription(vid.description);
    setFormNotes(vid.notes || '');
    setFormTimestampsStr(
      vid.timestamps.map(t => `${t.time} - ${t.label}`).join('\n')
    );
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video lecture resource?')) return;
    try {
      await api.deleteVideo(id);
      setVideos(prev => prev.filter(v => v.id !== id));
      if (activePlayId === id) setActivePlayId(null);
    } catch (e) {
      alert('Delete failed: ' + e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formYoutubeUrl.trim()) {
      alert('Video Title and YouTube URL/ID are required.');
      return;
    }

    // Parse timestamps list
    const timestampsList = formTimestampsStr
      .split('\n')
      .map(line => {
        const parts = line.split('-');
        if (parts.length >= 2) {
          return {
            time: parts[0].trim(),
            label: parts.slice(1).join('-').trim()
          };
        }
        return null;
      })
      .filter((t): t is { time: string; label: string } => t !== null && !!t.time && !!t.label);

    const payload = {
      title: formTitle.trim(),
      topicId: formTopicId,
      youtubeUrl: formYoutubeUrl.trim(),
      description: formDescription.trim(),
      notes: formNotes.trim(),
      timestamps: timestampsList
    };

    try {
      if (editingVideo) {
        const updated = await api.updateVideo(editingVideo.id, payload);
        setVideos(prev => prev.map(v => v.id === editingVideo.id ? updated : v));
      } else {
        const created = await api.createVideo(payload);
        setVideos(prev => [created, ...prev]);
      }
      setShowEditor(false);
    } catch (err) {
      alert('Save failed: ' + err);
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopicId === 'All' || v.topicId === selectedTopicId;
    return matchesSearch && matchesTopic;
  });

  return (
    <div id="videos-view" className="space-y-6">
      {/* Header controls layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Video className="text-blue-500" size={20} />
            <span>YouTube Lectures Catalog</span>
          </h2>
          <p className="text-slate-400 text-xs font-mono mt-0.5">Reference linked video tutorials, lectures, and playlist annotations</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures..."
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 w-full sm:w-52 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Topic filter */}
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

          {/* Add video button */}
          <button
            onClick={openCreateVideo}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>Link Video Course</span>
          </button>
        </div>
      </div>

      {/* Loading bar */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        /* Video cards list */
        <>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/10 border border-slate-800/80 border-dashed rounded-2xl text-slate-500 max-w-xl mx-auto">
              <Video size={44} className="mx-auto stroke-1 text-slate-600 mb-3" />
              <p className="text-sm font-mono uppercase tracking-wider">No lectures cataloged yet.</p>
              <p className="text-xs text-slate-600 mt-1">Catalog top YouTube tutorials like Errichto\'s DP lectures or Luv\'s graph theory guides with custom timestamps.</p>
              <button
                onClick={openCreateVideo}
                className="mt-4 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
              >
                Catalog a lecture video →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVideos.map((vid) => {
                const topicObj = topics.find(t => t.id === vid.topicId);
                const isPlaying = activePlayId === vid.id;
                return (
                  <motion.div
                    key={vid.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Embedded player card */}
                      <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative group flex items-center justify-center">
                        {isPlaying ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${vid.youtubeId}?autoplay=1`}
                            title={vid.title}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <>
                            {/* Static banner thumbnail mimic */}
                            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                              <Video size={40} className="text-slate-700 mb-2 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300" />
                              <span className="text-[10px] font-mono text-slate-600 tracking-widest uppercase">YouTube Video Frame</span>
                              <p className="text-slate-400 text-xs mt-1.5 px-6 line-clamp-1 font-semibold">{vid.title}</p>
                            </div>
                            <button
                              onClick={() => setActivePlayId(vid.id)}
                              className="w-12 h-12 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform scale-90 group-hover:scale-100 cursor-pointer z-10"
                            >
                              <Play size={20} className="ml-1" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Header title */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 font-mono uppercase">
                            {topicObj?.title || 'General'}
                          </span>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => openEditVideo(vid)}
                              className="p-1 text-slate-500 hover:text-white rounded transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(vid.id)}
                              className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between gap-1.5">
                          <span className="line-clamp-1">{vid.title}</span>
                          <a href={vid.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                            <ExternalLink size={12} />
                          </a>
                        </h3>

                        <p className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                          {vid.description}
                        </p>
                      </div>

                      {/* Video Notes */}
                      {vid.notes && (
                        <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg text-xs text-slate-300 font-sans">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold mb-1 flex items-center gap-1">
                            <BookOpen size={10} />
                            <span>Theory Notes Summary:</span>
                          </span>
                          <p className="whitespace-pre-line leading-relaxed">{vid.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Bookmarked Timestamp list */}
                    {vid.timestamps.length > 0 && (
                      <div className="pt-3 border-t border-slate-800/60 space-y-2">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase">Bookmarks / Timestamps:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {vid.timestamps.map((t, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                // Forces video reload starting at timestamp seconds (optional helper representation)
                                alert(`Simulating jumping YouTube timeline to: ${t.time}`);
                                setActivePlayId(vid.id);
                              }}
                              className="text-[10px] font-mono px-2 py-1 bg-slate-950 border border-slate-850 text-slate-300 rounded hover:text-blue-400 hover:border-blue-500/20 hover:bg-blue-500/5 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Clock size={10} className="text-blue-500" />
                              <span>{t.time}</span>
                              <span className="text-slate-500 font-sans border-l border-slate-800 pl-1">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
            className="bg-[#0f1524] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#090d16]/50">
              <div className="flex items-center gap-2">
                <Video className="text-blue-500" size={18} />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  {editingVideo ? 'Modify Video Record' : 'Catalog Video Lecture'}
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
                {/* Topic associated */}
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

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Video Lecture Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                    placeholder="e.g., LCA Tree Binary Lifting Tutorial"
                  />
                </div>
              </div>

              {/* YouTube URL */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">YouTube URL or Video ID</label>
                <input
                  type="text"
                  required
                  value={formYoutubeUrl}
                  onChange={(e) => setFormYoutubeUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="https://www.youtube.com/watch?v=09_LlHjoEiY or 09_LlHjoEiY"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Short Description / Summary</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-100 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
                  placeholder="e.g., Detailed explanation of precomputing jumps for O(log N) LCA tree operations"
                />
              </div>

              {/* Detailed notes */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider">Theory & Key Takeaways Notes</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090d16] border border-slate-800 text-slate-200 rounded-lg text-xs placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans resize-none"
                  placeholder="Summarize the core takeaways or write coordinate formulas learned here..."
                />
              </div>

              {/* Timestamps helper */}
              <div>
                <label className="block text-slate-400 text-[10px] font-mono mb-1 uppercase tracking-wider flex justify-between">
                  <span>Custom Timestamps Bookmarks</span>
                  <span className="text-slate-600 text-[9px] lowercase">One per line, formatted as `time - label`</span>
                </label>
                <textarea
                  rows={3}
                  value={formTimestampsStr}
                  onChange={(e) => setFormTimestampsStr(e.target.value)}
                  className="w-full p-3 bg-[#090d16] border border-slate-800 text-slate-200 rounded-lg text-xs font-mono placeholder-slate-700 focus:outline-none focus:border-blue-500"
                  placeholder={`05:30 - Explanation of up[i][j]\n15:45 - Answering tree queries`}
                />
              </div>

              {/* Modal controls footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-[#0f1524]">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Cancel Cataloging
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
