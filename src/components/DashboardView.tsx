import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { api } from '../api';
import { 
  Layers, 
  Cpu, 
  Code, 
  FileText, 
  Calendar, 
  PlusCircle, 
  ArrowRight, 
  Clock, 
  Flame, 
  Sparkles,
  BookOpen,
  Award,
  AlertTriangle
} from 'lucide-react';
import { DashboardStats, RecentActivity } from '../types';

interface DashboardViewProps {
  currentUser: { username: string } | null;
  setActiveTab: (tab: string) => void;
  onQuickAction: (actionType: string) => void;
}

export default function DashboardView({ currentUser, setActiveTab, onQuickAction }: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await api.getStats();
        const activityData = await api.getActivity();
        setStats(statsData);
        setActivities(activityData);
      } catch (e) {
        console.error('Error fetching dashboard stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    // System dynamic clock
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const statsCards = [
    { 
      label: 'Total Topics', 
      value: stats?.totalTopics || 24, 
      desc: 'Syllabus coverage', 
      icon: Layers, 
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      tab: 'topics'
    },
    { 
      label: 'Problems Solved', 
      value: stats?.solvedCount || 0, 
      desc: `${stats?.attemptedCount || 0} attempted, ${stats?.unsolvedCount || 0} unsolved`, 
      icon: Cpu, 
      color: 'text-green-400 bg-green-500/10 border-green-500/20',
      tab: 'problems'
    },
    { 
      label: 'Code Templates', 
      value: stats?.totalTemplates || 0, 
      desc: 'Web patterns & structures', 
      icon: Code, 
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      tab: 'templates'
    },
    { 
      label: 'Personal Notes', 
      value: stats?.totalNotes || 0, 
      desc: 'Guides, patterns & syntax', 
      icon: FileText, 
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      tab: 'notes'
    },
    { 
      label: 'Pending Revisions', 
      value: stats?.revisionCount || 0, 
      desc: 'Spaced repetition schedule', 
      icon: Calendar, 
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      tab: 'revisions'
    },
  ];

  const quickActions = [
    { title: 'New Note', desc: 'Log full-stack theory', icon: FileText, color: 'hover:border-purple-500/40 hover:bg-purple-500/5', action: 'note' },
    { title: 'Add Web Task', desc: 'Track task & implementation', icon: Cpu, color: 'hover:border-green-500/40 hover:bg-green-500/5', action: 'problem' },
    { title: 'Log Dev Bug', desc: 'Write wrong approach details', icon: AlertTriangle, color: 'hover:border-red-500/40 hover:bg-red-500/5', action: 'mistake' },
    { title: 'Schedule Revision', desc: 'Set spaced repetition date', icon: Calendar, color: 'hover:border-amber-500/40 hover:bg-amber-500/5', action: 'revision' },
  ];

  const getBadgeStyle = (type: RecentActivity['type']) => {
    switch (type) {
      case 'note': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'problem': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'template': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'snippet': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'mistake': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'revision': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getFriendlyTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">Compiling Dashboard stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-view" className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900/90 to-[#0e172a]/70 backdrop-blur-md border border-slate-800/60 rounded-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-md font-mono uppercase tracking-wider">Dev Brain Connected</span>
            <Sparkles size={14} className="text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
            Welcome back, <span className="text-blue-400">{currentUser?.username || 'Coder'}</span>.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your personal knowledge vault is fully operational. Log your templates, revise your core tasks, and review mistake journals to optimize your development speed and coding quality.
          </p>
        </div>

        {/* Real-time UTC/System Clock Widget */}
        <div className="flex items-center gap-4 px-4 py-3 bg-[#090d16]/80 border border-slate-800 rounded-xl shrink-0">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 font-mono tracking-wider">{formatTime(time)}</div>
            <div className="text-[11px] text-slate-400 font-mono tracking-tight">{formatDate(time)}</div>
          </div>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => setActiveTab(card.tab)}
              className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl hover:border-slate-700 hover:bg-slate-900/60 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-36 relative group overflow-hidden"
            >
              <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 text-white group-hover:scale-110 transition-transform">
                <Icon size={120} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium font-sans">{card.label}</span>
                <div className={`p-1.5 rounded-lg border ${card.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="space-y-1 mt-2">
                <h3 className="text-3xl font-bold text-white font-mono">{card.value}</h3>
                <p className="text-[11px] text-slate-500 leading-none truncate">{card.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid: Left Quick Actions & Continue, Right Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Quick Launcher & Continue Learning) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Launcher */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <PlusCircle size={18} className="text-blue-500" />
              <span>Quick Knowledge Launcher</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={() => onQuickAction(action.action)}
                    className={`p-4 bg-slate-900/30 border border-slate-800/80 rounded-xl text-left transition-all group cursor-pointer flex items-start gap-4 ${action.color}`}
                  >
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/20 group-hover:bg-blue-500/5 transition-all">
                      <Icon size={20} />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                        <span>{action.title}</span>
                        <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
                      </h4>
                      <p className="text-xs text-slate-500 font-sans truncate">{action.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continue Learning Recommendations */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen size={18} className="text-blue-500" />
              <span>Active Syllabi / Continue Learning</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Dynamic Programming', id: 'dp', difficulty: 'Hard', count: 'Memoization, Tabulation', progress: 'bg-red-500/80' },
                { title: 'Segment Tree', id: 'segment-tree', difficulty: 'Hard', count: 'Range updates, Lazy propagation', progress: 'bg-red-500/80' },
                { title: 'Disjoint Set Union', id: 'dsu', difficulty: 'Medium', count: 'Union find, path compression', progress: 'bg-yellow-500/80' }
              ].map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => {
                    localStorage.setItem('codevault_topic_drilldown', topic.id);
                    setActiveTab('topics');
                  }}
                  className="p-4 bg-[#0e1424]/40 border border-slate-800/80 hover:border-blue-500/30 rounded-xl transition-all cursor-pointer flex flex-col justify-between h-32 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono uppercase">{topic.difficulty}</span>
                      <Award size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{topic.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{topic.count}</p>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-blue-500 flex items-center gap-1 mt-2">
                    <span>Inspect Syllabus</span>
                    <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Recent Brain Activities logs) */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Flame size={18} className="text-red-500 animate-bounce" style={{ animationDuration: '3s' }} />
            <span>Recent Activity Log</span>
          </h3>

          <div className="p-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl min-h-[300px] flex flex-col justify-between">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <BookOpen size={40} className="stroke-1 mb-2.5 text-slate-600" />
                <p className="text-xs font-mono">No recent logs recorded.</p>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">Use the quick action buttons to begin.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50 space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="pt-4 first:pt-0 flex items-start gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border shrink-0 mt-0.5 ${getBadgeStyle(act.type)}`}>
                      {act.type}
                    </span>
                    <div className="overflow-hidden space-y-0.5">
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1 hover:text-white cursor-pointer" onClick={() => setActiveTab(act.type + 's' as any)}>
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-1">{act.detail}</p>
                      <p className="text-[10px] text-slate-600 font-mono">{getFriendlyTime(act.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setActiveTab('topics')}
              className="w-full text-center text-xs font-mono font-semibold text-blue-500 hover:text-blue-400 py-2.5 mt-4 bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer"
            >
              Examine Complete Syllabus →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
