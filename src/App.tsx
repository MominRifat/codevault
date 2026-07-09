import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from './api';
import { 
  Menu, 
  Search, 
  X, 
  LogOut, 
  User, 
  Bookmark, 
  Layers, 
  FileText, 
  Code, 
  Cpu, 
  Video, 
  AlertTriangle, 
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';

// Components
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TopicsView from './components/TopicsView';
import NotesView from './components/NotesView';
import TemplatesView from './components/TemplatesView';
import SnippetsView from './components/SnippetsView';
import ProblemsView from './components/ProblemsView';
import VideosView from './components/VideosView';
import MistakeJournalView from './components/MistakeJournalView';
import RevisionView from './components/RevisionView';
import BookmarksView from './components/BookmarksView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Global Search states
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<{
    topics: any[];
    notes: any[];
    templates: any[];
    problems: any[];
    videos: any[];
  } | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await api.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('Initial session check failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  // Trigger search everything
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      setGlobalSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await api.searchEverything(globalSearchQuery);
        setGlobalSearchResults(results);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Global search error', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [globalSearchQuery]);

  const handleSearchResultClick = (tab: string, itemId?: string) => {
    setActiveTab(tab);
    setGlobalSearchQuery('');
    setShowSearchResults(false);
    if (itemId) {
      localStorage.setItem('codevault_active_highlight_id', itemId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060a12]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-mono tracking-widest uppercase">Initializing CodeVault...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <AuthView 
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
        }} 
      />
    );
  }

  // Render content based on active navigation tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            currentUser={currentUser} 
            setActiveTab={setActiveTab} 
            onQuickAction={(action) => {
              // Map quick launcher clicks to proper tab names
              if (action === 'note') setActiveTab('notes');
              if (action === 'problem') setActiveTab('problems');
              if (action === 'mistake') setActiveTab('mistakes');
              if (action === 'revision') setActiveTab('revisions');
            }} 
          />
        );
      case 'topics':
        return (
          <TopicsView 
            onQuickAction={(action) => {
              if (action === 'note') setActiveTab('notes');
              if (action === 'problem') setActiveTab('problems');
              if (action === 'mistake') setActiveTab('mistakes');
              if (action === 'revision') setActiveTab('revisions');
            }}
          />
        );
      case 'notes':
        return <NotesView />;
      case 'templates':
        return <TemplatesView />;
      case 'snippets':
        return <SnippetsView />;
      case 'problems':
        return <ProblemsView />;
      case 'videos':
        return <VideosView />;
      case 'mistakes':
        return <MistakeJournalView />;
      case 'revisions':
        return <RevisionView />;
      case 'bookmarks':
        return <BookmarksView onNavigateToTab={setActiveTab} />;
      default:
        return <div className="text-slate-400 font-mono text-sm">Target panel not found.</div>;
    }
  };

  const hasSearchResults = globalSearchResults && (
    globalSearchResults.topics.length > 0 ||
    globalSearchResults.notes.length > 0 ||
    globalSearchResults.templates.length > 0 ||
    globalSearchResults.problems.length > 0 ||
    globalSearchResults.videos.length > 0
  );

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Panel Content viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto lg:pl-64">
        
        {/* Main top header */}
        <header className="h-16 border-b border-slate-800/60 bg-[#090d16]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-slate-400 hover:text-white lg:hidden cursor-pointer rounded hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb path mock */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-slate-600">WORKSPACE</span>
              <span className="text-slate-700">/</span>
              <span className="text-blue-500 uppercase font-semibold">{activeTab}</span>
            </div>
          </div>

          {/* Core Search engine & Actions */}
          <div className="flex items-center gap-4 flex-1 max-w-md justify-end sm:justify-start sm:ml-8 relative">
            <div className="relative w-full max-w-[260px] sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search everything globally..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-950/80 border border-slate-850 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
              />
              {globalSearchQuery && (
                <button 
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Global Search popup results overlay */}
            {showSearchResults && (
              <div className="absolute top-12 left-0 right-0 bg-[#0f1524] border border-slate-800 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Global Search results</span>
                  <button onClick={() => setShowSearchResults(false)} className="text-slate-500 hover:text-white cursor-pointer">
                    <X size={12} />
                  </button>
                </div>

                {searchLoading ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-mono">Searching everything...</div>
                ) : !hasSearchResults ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-mono">No matching records compiled.</div>
                ) : (
                  <div className="space-y-3.5 text-xs">
                    {/* Topics matched */}
                    {globalSearchResults?.topics && globalSearchResults.topics.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block">Matched Topics</span>
                        <div className="space-y-1">
                          {globalSearchResults.topics.map(t => (
                            <button
                              key={t.id}
                              onClick={() => handleSearchResultClick('topics', t.id)}
                              className="w-full text-left p-2 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 flex items-center gap-2 cursor-pointer"
                            >
                              <Layers size={12} className="text-cyan-400" />
                              <span className="text-slate-200">{t.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes matched */}
                    {globalSearchResults?.notes && globalSearchResults.notes.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block">Matched Notes</span>
                        <div className="space-y-1">
                          {globalSearchResults.notes.map(n => (
                            <button
                              key={n.id}
                              onClick={() => handleSearchResultClick('notes', n.id)}
                              className="w-full text-left p-2 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 flex items-center gap-2 cursor-pointer"
                            >
                              <FileText size={12} className="text-purple-400" />
                              <span className="text-slate-200">{n.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Templates matched */}
                    {globalSearchResults?.templates && globalSearchResults.templates.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block">Matched Templates</span>
                        <div className="space-y-1">
                          {globalSearchResults.templates.map(t => (
                            <button
                              key={t.id}
                              onClick={() => handleSearchResultClick('templates', t.id)}
                              className="w-full text-left p-2 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 flex items-center gap-2 cursor-pointer"
                            >
                              <Code size={12} className="text-blue-400" />
                              <span className="text-slate-200">{t.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Problems matched */}
                    {globalSearchResults?.problems && globalSearchResults.problems.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase block">Matched Problems</span>
                        <div className="space-y-1">
                          {globalSearchResults.problems.map(p => (
                            <button
                              key={p.id}
                              onClick={() => handleSearchResultClick('problems', p.id)}
                              className="w-full text-left p-2 hover:bg-slate-900 rounded border border-transparent hover:border-slate-800 flex items-center gap-2 cursor-pointer"
                            >
                              <Cpu size={12} className="text-green-400" />
                              <span className="text-slate-200">{p.platform}: {p.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Inner Tab view render */}
        <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
