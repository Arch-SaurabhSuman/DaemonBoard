import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Columns, 
  FileText, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Search, 
  Bell, 
  Plus, 
  Folder, 
  Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjectStore } from '../store/useProjectStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export const DashboardLayout: React.FC = () => {
  const { user, logout, isMockMode } = useAuth();
  const { 
    projects, 
    activeProject, 
    sidebarCollapsed, 
    searchModalOpen, 
    toggleSidebar, 
    setActiveProject, 
    toggleSearchModal,
    fetchProjects,
    createProject
  } = useProjectStore();
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Local UI State
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load Projects on Mount
  useEffect(() => {
    fetchProjects(isMockMode);
  }, [fetchProjects, isMockMode]);

  // Handle Search Modal shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearchModal]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Learning Roadmaps', path: '/roadmaps', icon: <Map size={20} /> },
    { name: 'Kanban Board', path: '/kanban', icon: <Columns size={20} /> },
    { name: 'Markdown Notes', path: '/notes', icon: <FileText size={20} /> },
    { name: 'System Monitor', path: '/monitor', icon: <Activity size={20} /> },
  ];

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    await createProject(newProjectName, newProjectDesc, isMockMode);
    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectModalOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In final phase we will direct fuzzy search to notes/kanban/roadmaps.
    // For now we close and search query logic
    toggleSearchModal();
  };

  return (
    <div className="flex min-h-screen bg-bg-cosmic text-zinc-100 bg-grid-dots">
      {/* 1. SIDEBAR */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-800/80">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                <Terminal className="text-white" size={20} />
              </div>
              <span className="font-bold text-lg tracking-wider text-white">
                DAEMON<span className="text-cyan-400">BOARD</span>
              </span>
            </div>
          ) : (
            <div className="flex h-9 w-9 mx-auto items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
              <Terminal className="text-white" size={20} />
            </div>
          )}
          
          <button 
            onClick={toggleSidebar} 
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Project Selector Dropdown */}
        <div className="p-4 border-b border-zinc-800/80 relative">
          {!sidebarCollapsed ? (
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
                Active Workspace
              </label>
              <button
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className="w-full flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-left text-zinc-200 transition duration-150 cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium truncate">
                  <Folder className="text-cyan-400" size={16} />
                  {activeProject ? activeProject.name : 'No workspace'}
                </span>
                <ChevronRight size={14} className={`text-zinc-500 transform transition-transform ${projectDropdownOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Project Dropdown Content */}
              {projectDropdownOpen && (
                <div className="absolute left-4 right-4 mt-2 z-50 rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="max-h-48 overflow-y-auto">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          setActiveProject(proj);
                          setProjectDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition duration-150 cursor-pointer ${
                          activeProject?.id === proj.id 
                            ? 'bg-zinc-800 text-cyan-400 border-l-2 border-cyan-400' 
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                        }`}
                      >
                        <Folder size={14} />
                        {proj.name}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-zinc-800/80 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setNewProjectModalOpen(true);
                        setProjectDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-bold text-cyan-400 hover:bg-zinc-900 transition duration-150 cursor-pointer"
                    >
                      <Plus size={14} />
                      New Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-cyan-400 hover:bg-zinc-800 cursor-pointer"
              title={activeProject ? activeProject.name : 'Select Project'}
            >
              <Folder size={20} />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-zinc-900 text-white border border-zinc-800/60 shadow-[inset_0_0_8px_rgba(0,240,255,0.05)]' 
                    : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-zinc-500'}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span className="ml-3 tracking-wide">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User section */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/20">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"} 
                  alt="Avatar" 
                  className="h-9 w-9 rounded-full border border-zinc-800 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-zinc-200 truncate">{user?.username}</span>
                  <span className="text-[10px] text-zinc-500 truncate">{user?.role || 'Developer'}</span>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-rose-400 text-zinc-400 transition cursor-pointer"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={logout} 
              className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-rose-400 text-zinc-400 transition cursor-pointer"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN LAYOUT SHELL */}
      <div 
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/45 backdrop-blur-md px-6">
          {/* Breadcrumb / Workspace Name */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-sm">Workspace</span>
            <span className="text-zinc-400 text-sm">/</span>
            <span className="text-white font-semibold text-sm">
              {activeProject ? activeProject.name : 'Loading...'}
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Search shortcut button */}
            <button
              onClick={toggleSearchModal}
              className="flex items-center gap-2 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 transition duration-150 cursor-pointer"
            >
              <Search size={14} />
              <span>Search Workspace</span>
              <kbd className="hidden sm:inline-block bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] font-mono">
                Ctrl K
              </kbd>
            </button>

            {/* Server Online Ping Status */}
            <div className="flex items-center gap-2 border border-zinc-800/60 bg-zinc-900/20 px-2.5 py-1 rounded-full text-[10px] font-semibold text-zinc-400">
              <span className={`h-1.5 w-1.5 rounded-full ${isMockMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="uppercase tracking-widest">
                {isMockMode ? 'Mock Server' : 'Telemetry Online'}
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition cursor-pointer">
              <Bell size={16} />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* 3. NEW WORKSPACE MODAL */}
      <Modal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        title="Create New Project Workspace"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNewProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProject}>
              Create Workspace
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
          <Input
            label="Workspace Name"
            placeholder="e.g. Kubernetes Study Notes"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Description
            </label>
            <textarea
              className="flex min-h-20 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-cyan-500/20 focus:ring-4 transition duration-200"
              placeholder="Provide a brief summary of the workspace goals..."
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* 4. CMD+K SEARCH MODAL */}
      <Modal
        isOpen={searchModalOpen}
        onClose={toggleSearchModal}
        title="Fuzzy Search Workspace"
        size="lg"
      >
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 transition"
              placeholder="Search cards, learning roadmaps, markdown notes, code snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Suggestions
            </span>
            <div className="flex flex-col gap-1.5">
              <button type="button" className="flex items-center justify-between text-left p-2.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 hover:text-cyan-400 transition text-xs cursor-pointer">
                <span className="flex items-center gap-2">
                  <FileText size={14} className="text-zinc-500" />
                  <span>Docker Cheat Sheet / commands.md</span>
                </span>
                <span className="text-zinc-600 text-[10px]">Notes</span>
              </button>
              <button type="button" className="flex items-center justify-between text-left p-2.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 hover:text-cyan-400 transition text-xs cursor-pointer">
                <span className="flex items-center gap-2">
                  <Map size={14} className="text-zinc-500" />
                  <span>Kubernetes Administration Paths</span>
                </span>
                <span className="text-zinc-600 text-[10px]">Roadmaps</span>
              </button>
              <button type="button" className="flex items-center justify-between text-left p-2.5 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 hover:text-cyan-400 transition text-xs cursor-pointer">
                <span className="flex items-center gap-2">
                  <Columns size={14} className="text-zinc-500" />
                  <span>Fix Docker Compose network configs</span>
                </span>
                <span className="text-zinc-600 text-[10px]">Kanban</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
