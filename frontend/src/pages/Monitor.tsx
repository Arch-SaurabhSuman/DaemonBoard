import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

import { useMetricsStore } from '../store/useMetricsStore';
import { 
  Cpu, 
  Database, 
  HardDrive, 
  Clock, 
  Terminal,
  Play,
  Square,
  RefreshCw,
  Activity
} from 'lucide-react';

export const Monitor: React.FC = () => {
  const { 
    currentMetric, 
    processes, 
    startMonitoring, 
    stopMonitoring, 
    fetchInitialMetrics,
    controlProcess
  } = useMetricsStore();

  useEffect(() => {
    fetchInitialMetrics();
    startMonitoring();
    return () => stopMonitoring();
  }, [fetchInitialMetrics, startMonitoring, stopMonitoring]);

  const handleAction = async (pid: number, action: 'start' | 'stop' | 'restart') => {
    await controlProcess(pid, action);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            Local Server Monitor <Activity className="text-cyan-400" size={22} />
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Real-time local CPU telemetry and system process controls.</p>
        </div>
      </div>

      {/* Grid of Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* CPU Gauge */}
        <Card className="flex flex-col gap-2 p-5 border-cyan-500/10">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu size={18} />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">CPU Telemetry</span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {currentMetric ? `${currentMetric.cpu}%` : '0.0%'}
            </span>
            <span className="text-xs text-zinc-500 mb-1">Cores: 8</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1.5">
            <div 
              className="h-full bg-cyan-400 transition-all duration-500" 
              style={{ width: `${currentMetric ? currentMetric.cpu : 0}%` }}
            />
          </div>
        </Card>

        {/* Memory Gauge */}
        <Card className="flex flex-col gap-2 p-5 border-purple-500/10">
          <div className="flex items-center gap-2 text-purple-400">
            <Database size={18} />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Memory Allocation</span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {currentMetric ? `${currentMetric.memory}%` : '0.0%'}
            </span>
            <span className="text-xs text-zinc-500 mb-1">Capacity: 16 GB</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1.5">
            <div 
              className="h-full bg-purple-500 transition-all duration-500" 
              style={{ width: `${currentMetric ? currentMetric.memory : 0}%` }}
            />
          </div>
        </Card>

        {/* Disk Usage Gauge */}
        <Card className="flex flex-col gap-2 p-5 border-zinc-800/80">
          <div className="flex items-center gap-2 text-amber-400">
            <HardDrive size={18} />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Disk Volume</span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {currentMetric ? `${currentMetric.disk}%` : '0.0%'}
            </span>
            <span className="text-xs text-zinc-500 mb-1">Free: 120 GB</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1.5">
            <div 
              className="h-full bg-amber-500 transition-all duration-500" 
              style={{ width: `${currentMetric ? currentMetric.disk : 0}%` }}
            />
          </div>
        </Card>

        {/* System Uptime */}
        <Card className="flex flex-col gap-2 p-5 border-zinc-800/80">
          <div className="flex items-center gap-2 text-emerald-400">
            <Clock size={18} />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sys Uptime</span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-extrabold text-white tracking-tight truncate">
              {currentMetric ? currentMetric.uptime : '0h 0m 0s'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-2 block">Agent Port: 5000</span>
        </Card>

      </div>

      {/* Process Listing Table */}
      <Card className="border border-zinc-800/80 bg-zinc-950/40">
        <CardHeader className="border-b border-zinc-800/60 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Terminal size={16} className="text-cyan-400" /> running services processes list
          </CardTitle>
          <CardDescription>Inspect process resource footprints and toggle status triggers.</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4 p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800/60 text-zinc-500 uppercase font-bold tracking-wider">
                <th className="p-4 px-6">PID</th>
                <th className="p-4">Process Name</th>
                <th className="p-4">CPU Usage</th>
                <th className="p-4">Memory load</th>
                <th className="p-4">Status</th>
                <th className="p-4 px-6 text-right">Actions Controls</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((proc) => (
                <tr 
                  key={proc.pid} 
                  className="border-b border-zinc-900/60 hover:bg-zinc-900/10 transition"
                >
                  <td className="p-4 px-6 font-mono text-zinc-400">{proc.pid}</td>
                  <td className="p-4 font-semibold text-zinc-200">{proc.name}</td>
                  <td className="p-4 font-mono text-zinc-300">{proc.cpu}%</td>
                  <td className="p-4 font-mono text-zinc-300">{proc.memory} MB</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                      proc.status === 'running' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' :
                      proc.status === 'stopped' ? 'bg-rose-950/60 border-rose-850 text-rose-400' :
                      'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}>
                      <span className={`h-1 w-1 rounded-full ${proc.status === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                      {proc.status}
                    </span>
                  </td>
                  <td className="p-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {proc.status === 'running' ? (
                        <>
                          <button
                            onClick={() => handleAction(proc.pid, 'stop')}
                            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-rose-400 transition cursor-pointer"
                            title="Stop Process"
                          >
                            <Square size={12} fill="currentColor" />
                          </button>
                          <button
                            onClick={() => handleAction(proc.pid, 'restart')}
                            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 transition cursor-pointer"
                            title="Restart Process"
                          >
                            <RefreshCw size={12} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAction(proc.pid, 'start')}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 transition cursor-pointer"
                          title="Start Process"
                        >
                          <Play size={12} fill="currentColor" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
};
