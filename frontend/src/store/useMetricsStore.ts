import { create } from 'zustand';
import { SystemMetric, SystemProcess } from '../types';

interface MetricsState {
  metricsHistory: SystemMetric[];
  currentMetric: SystemMetric | null;
  processes: SystemProcess[];
  isMonitoring: boolean;
  isLoadingMetrics: boolean;

  // Actions
  addMetric: (metric: SystemMetric) => void;
  setProcesses: (processes: SystemProcess[]) => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  fetchInitialMetrics: () => Promise<void>;
  controlProcess: (pid: number, action: 'start' | 'stop' | 'restart') => Promise<boolean>;
}

const mockProcesses: SystemProcess[] = [
  { pid: 1024, name: 'nginx-router', cpu: 0.2, memory: 12.5, status: 'running' },
  { pid: 2048, name: 'postgres-db', cpu: 1.4, memory: 98.2, status: 'running' },
  { pid: 3096, name: 'redis-cache', cpu: 0.1, memory: 8.4, status: 'running' },
  { pid: 4012, name: 'daemonboard-api', cpu: 0.8, memory: 42.1, status: 'running' },
  { pid: 5120, name: 'vite-dev-server', cpu: 2.1, memory: 112.6, status: 'running' },
  { pid: 6001, name: 'node-exporter', cpu: 0.0, memory: 4.1, status: 'sleeping' },
];

export const useMetricsStore = create<MetricsState>((set, get) => {
  let intervalId: any = null;

  return {
    metricsHistory: [],
    currentMetric: null,
    processes: mockProcesses,
    isMonitoring: false,
    isLoadingMetrics: false,

    addMetric: (metric) => set((state) => {
      const history = [...state.metricsHistory, metric];
      // Keep only last 20 metrics points
      if (history.length > 20) {
        history.shift();
      }
      return { metricsHistory: history, currentMetric: metric };
    }),

    setProcesses: (processes) => set({ processes }),

    startMonitoring: () => {
      if (get().isMonitoring) return;
      
      set({ isMonitoring: true });
      
      // Simulate real-time metrics streaming
      intervalId = setInterval(() => {
        const cpu = +(Math.random() * 15 + 5).toFixed(1); // 5% to 20%
        const memory = +(Math.random() * 5 + 40).toFixed(1); // 40% to 45%
        const disk = 62.4;
        const uptime = '2h 45m 12s';
        const timestamp = new Date().toLocaleTimeString();

        get().addMetric({ cpu, memory, disk, uptime, timestamp });
        
        // Randomly tweak process metrics slightly
        const updatedProcs = get().processes.map(p => {
          if (p.status === 'running') {
            return {
              ...p,
              cpu: +(p.cpu + (Math.random() * 0.4 - 0.2)).toFixed(1),
              memory: +(p.memory + (Math.random() * 2 - 1)).toFixed(1),
            };
          }
          return p;
        });
        set({ processes: updatedProcs });

      }, 2000);
    },

    stopMonitoring: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      set({ isMonitoring: false });
    },

    fetchInitialMetrics: async () => {
      set({ isLoadingMetrics: true });
      // Simulate fetch delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Seed some history
      const initialHistory: SystemMetric[] = [];
      const now = new Date();
      for (let i = 19; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 2000);
        initialHistory.push({
          cpu: +(Math.random() * 15 + 5).toFixed(1),
          memory: +(Math.random() * 5 + 40).toFixed(1),
          disk: 62.4,
          uptime: '2h 45m 12s',
          timestamp: time.toLocaleTimeString()
        });
      }

      set({
        metricsHistory: initialHistory,
        currentMetric: initialHistory[initialHistory.length - 1],
        processes: mockProcesses,
        isLoadingMetrics: false
      });
    },

    controlProcess: async (pid, action) => {
      // Simulate process control
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set((state) => {
        const updated = state.processes.map(p => {
          if (p.pid === pid) {
            let status = p.status;
            if (action === 'stop') status = 'stopped';
            if (action === 'start' || action === 'restart') status = 'running';
            return {
              ...p,
              status,
              cpu: action === 'stop' ? 0 : p.cpu,
              memory: action === 'stop' ? 0 : p.memory
            };
          }
          return p;
        });
        return { processes: updated };
      });

      return true;
    }
  };
});
