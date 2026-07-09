import { create } from 'zustand';
import { Project } from '../types';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  sidebarCollapsed: boolean;
  searchModalOpen: boolean;
  isLoadingProjects: boolean;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setActiveProject: (project: Project | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSearchModal: () => void;
  setSearchModalOpen: (open: boolean) => void;
  fetchProjects: (isMock?: boolean) => Promise<void>;
  createProject: (name: string, description?: string, isMock?: boolean) => Promise<Project>;
}

const mockProjects: Project[] = [
  { id: 'p-1', name: 'Docker Fundamentals', description: 'Interactive learning for basic containerization concepts.', createdAt: new Date().toISOString() },
  { id: 'p-2', name: 'Kubernetes study', description: 'Advanced cluster administration and helm notes.', createdAt: new Date().toISOString() },
  { id: 'p-3', name: 'Local Environment Mon', description: 'Monitoring dashboards for local system services.', createdAt: new Date().toISOString() },
];

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  sidebarCollapsed: false,
  searchModalOpen: false,
  isLoadingProjects: false,

  setProjects: (projects) => set({ projects }),
  setActiveProject: (activeProject) => set({ activeProject }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSearchModal: () => set((state) => ({ searchModalOpen: !state.searchModalOpen })),
  setSearchModalOpen: (searchModalOpen) => set({ searchModalOpen }),

  fetchProjects: async (isMock = true) => {
    set({ isLoadingProjects: true });
    try {
      if (isMock) {
        // Simulate delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const saved = localStorage.getItem('db_projects');
        const list = saved ? JSON.parse(saved) : mockProjects;
        
        // Save back if empty
        if (!saved) {
          localStorage.setItem('db_projects', JSON.stringify(mockProjects));
        }

        set({ projects: list, isLoadingProjects: false });
        
        // Set first project as active if none is active
        if (!get().activeProject && list.length > 0) {
          set({ activeProject: list[0] });
        }
      } else {
        // Real API call (Fallback to mock if network fails)
        // Since we are setting up foundations, we wrap it securely
        const response = await fetch('/api/projects');
        if (response.ok) {
          const list = await response.json();
          set({ projects: list, isLoadingProjects: false });
          if (!get().activeProject && list.length > 0) {
            set({ activeProject: list[0] });
          }
        } else {
          throw new Error('Failed to fetch projects');
        }
      }
    } catch (error) {
      console.warn('Failed to fetch projects, using mock database', error);
      // Fallback
      const saved = localStorage.getItem('db_projects');
      const list = saved ? JSON.parse(saved) : mockProjects;
      set({ projects: list, isLoadingProjects: false });
      if (!get().activeProject && list.length > 0) {
        set({ activeProject: list[0] });
      }
    }
  },

  createProject: async (name: string, description?: string, isMock = true) => {
    const newProj: Project = {
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdAt: new Date().toISOString()
    };

    if (isMock) {
      const currentProjects = get().projects;
      const updated = [...currentProjects, newProj];
      localStorage.setItem('db_projects', JSON.stringify(updated));
      set({ projects: updated, activeProject: newProj });
      return newProj;
    } else {
      // In real backend, we'll hit API
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        });
        if (response.ok) {
          const created = await response.json();
          set((state) => ({ projects: [...state.projects, created], activeProject: created }));
          return created;
        }
      } catch (error) {
        console.error('Could not create project, falling back to mock', error);
      }
      
      // Fallback
      const currentProjects = get().projects;
      const updated = [...currentProjects, newProj];
      localStorage.setItem('db_projects', JSON.stringify(updated));
      set({ projects: updated, activeProject: newProj });
      return newProj;
    }
  }
}));
