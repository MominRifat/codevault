import { 
  LayoutDashboard, 
  Layers, 
  FileText, 
  Code, 
  Terminal, 
  Cpu, 
  Video, 
  AlertTriangle, 
  Calendar, 
  Bookmark, 
  LogOut, 
  User, 
  X, 
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: { username: string; email: string } | null;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout,
  isOpen,
  setIsOpen
}: SidebarProps) {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'topics', label: 'Topics', icon: Layers },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'templates', label: 'Templates', icon: Code },
    { id: 'snippets', label: 'Snippets', icon: Terminal },
    { id: 'problems', label: 'Problems', icon: Cpu },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'mistakes', label: 'Mistake Journal', icon: AlertTriangle },
    { id: 'revisions', label: 'Revision Planner', icon: Calendar },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#090d16] border-r border-slate-800/80 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-[#0f1524]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cpu size={18} />
            </div>
            <span className="font-bold tracking-tight text-white font-sans text-lg">
              Code<span className="text-blue-500">Vault</span>
            </span>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-white lg:hidden cursor-pointer rounded hover:bg-slate-800/60"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Badge Profile */}
        {currentUser && (
          <div className="p-4 mx-3 my-4 bg-slate-900/60 border border-slate-800/60 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/35 flex items-center justify-center text-blue-400 font-bold text-sm uppercase">
              {currentUser.username.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate font-sans">{currentUser.username}</p>
              <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
            </div>
          </div>
        )}

        {/* Menu Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group ${
                  isActive 
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                }`}
              >
                <IconComponent 
                  size={18} 
                  className={`transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} 
                />
                <span className="font-sans">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Footer Section */}
        <div className="p-4 border-t border-slate-800/60 bg-[#090d16]">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to log out of CodeVault?')) {
                onLogout();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 transition-all cursor-pointer font-sans"
          >
            <LogOut size={14} />
            <span>Sign Out Session</span>
          </button>
          <div className="mt-3 text-center text-[10px] text-slate-500 font-mono tracking-wider">
            CODEVAULT v1.1.0
          </div>
        </div>
      </aside>
    </>
  );
}
