import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjectStore } from '../store/useProjectStore';
import { useMetricsStore } from '../store/useMetricsStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Cpu, 
  Database, 
  CheckSquare, 
  FileText, 
  ArrowUpRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeProject } = useProjectStore();
  const { currentMetric, metricsHistory, startMonitoring, stopMonitoring, fetchInitialMetrics } = useMetricsStore();

  useEffect(() => {
    fetchInitialMetrics();
    startMonitoring();
    return () => stopMonitoring();
  }, [fetchInitialMetrics, startMonitoring, stopMonitoring]);

  const recentNotes = [
    { id: '1', title: 'docker-compose-guide.md', tags: ['Docker', 'Guide'], date: '2 hours ago' },
    { id: '2', title: 'kubernetes-ingress-notes.md', tags: ['K8s', 'Study'], date: 'Yesterday' },
  ];

  const pendingTasks = [
    { id: 't-1', title: 'Configure Nginx Reverse Proxy', priority: 'HIGH', status: 'IN_PROGRESS' },
    { id: 't-2', title: 'Set up docker-compose file', priority: 'MEDIUM', status: 'TODO' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* 1. Welcome Banner */}
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-30 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Welcome back, {user?.username || 'Developer'}! <Sparkles className="text-cyan-400 animate-pulse" size={20} />
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Currently working in <span className="text-cyan-400 font-semibold">{activeProject?.name || 'Loading Project...'}</span> workspace.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/roadmaps">
              <Button size="sm" variant="outline">
                <BookOpen size={16} />
                Study Roadmaps
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CPU */}
        <Card className="flex items-center gap-4 py-4">
          <div className="p-3 rounded-lg bg-cyan-950/50 border border-cyan-800/40 text-cyan-400">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">CPU Load</span>
            <span className="text-2xl font-bold text-white">{currentMetric ? `${currentMetric.cpu}%` : '0.0%'}</span>
          </div>
        </Card>

        {/* Memory */}
        <Card className="flex items-center gap-4 py-4">
          <div className="p-3 rounded-lg bg-purple-950/50 border border-purple-800/40 text-purple-400">
            <Database size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Memory</span>
            <span className="text-2xl font-bold text-white">{currentMetric ? `${currentMetric.memory}%` : '0.0%'}</span>
          </div>
        </Card>

        {/* Pending Tasks */}
        <Card className="flex items-center gap-4 py-4">
          <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-800/40 text-amber-400">
            <CheckSquare size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Tasks</span>
            <span className="text-2xl font-bold text-white">4 Pending</span>
          </div>
        </Card>

        {/* Notes Saved */}
        <Card className="flex items-center gap-4 py-4">
          <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400">
            <FileText size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Saved Notes</span>
            <span className="text-2xl font-bold text-white">12 Documents</span>
          </div>
        </Card>

      </div>

      {/* 3. Metrics Charts & Action Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Telemetry Load Visual */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <div>
              <CardTitle>System Performance Telemetry</CardTitle>
              <CardDescription>Live streaming CPU resource usage percentage</CardDescription>
            </div>
            <Link to="/monitor" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              Full Telemetry <ArrowUpRight size={14} />
            </Link>
          </CardHeader>
          <CardContent className="h-48 flex items-end gap-1.5 pt-6 pb-2">
            {metricsHistory.map((pt, i) => (
              <div 
                key={i} 
                className="flex-1 bg-zinc-800 hover:bg-cyan-500 rounded-t transition-all cursor-pointer relative group"
                style={{ height: `${Math.max(pt.cpu * 3, 10)}%` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-zinc-950 text-cyan-400 border border-zinc-800 text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap mb-1">
                  CPU: {pt.cpu}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Learning Roadmap Widget */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Milestone Progress</CardTitle>
            <CardDescription>Current learning path completion rates</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium text-zinc-300">
                <span>Docker Containerization</span>
                <span className="text-cyan-400">75% Done</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: '75%' }} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium text-zinc-300">
                <span>Kubernetes Fundamentals</span>
                <span className="text-purple-400">20% Done</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '20%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 4. Notes & Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notes & Snippets</CardTitle>
            <CardDescription>Quick access to documents you updated recently</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentNotes.map((note) => (
              <div key={note.id} className="flex items-center justify-between border-b border-zinc-800/40 pb-2.5 last:border-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-200 hover:text-cyan-400 transition cursor-pointer">{note.title}</span>
                  <div className="flex gap-1.5 mt-1">
                    {note.tags.map(t => (
                      <span key={t} className="text-[9px] bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-500 font-medium">{t}</span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-zinc-500">{note.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Core Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Kanban Tasks</CardTitle>
            <CardDescription>Your current in-progress work cards</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between border-b border-zinc-800/40 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${task.priority === 'HIGH' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                  <span className="text-sm font-semibold text-zinc-200">{task.title}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-500 bg-zinc-900 font-medium font-mono">
                  {task.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
