import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RoadmapNode } from '../types';
import { 
  CheckCircle, 
  Circle, 
  PlayCircle,
  Copy,
  Terminal,
  BookOpen,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const Roadmaps: React.FC = () => {
  const [nodes, setNodes] = useState<RoadmapNode[]>([
    { id: 'rn-1', title: '1. Linux Shell basics', description: 'Master filesystems navigation, basic commands (ls, cd, pwd, cat, nano), and file permissions.', status: 'COMPLETED', order: 1, commands: ['ls -la', 'chmod +x script.sh'], resources: ['Linux Documentation'] },
    { id: 'rn-2', title: '2. Docker Engine Architecture', description: 'Understand Docker Daemon, REST API, CLI client, Containers vs virtual machines, and storage volumes.', status: 'IN_PROGRESS', order: 2, commands: ['docker version', 'docker info'], resources: ['Docker Get Started docs'] },
    { id: 'rn-3', title: '3. Image Packaging & Dockerfiles', description: 'Create custom images, write Dockerfiles, configure layers, cache utilization, and multi-stage builds.', status: 'NOT_STARTED', order: 3, commands: ['docker build -t app:latest .', 'docker images'], resources: ['Best practices for Dockerfile'] },
    { id: 'rn-4', title: '4. Networking & Compose', description: 'Setup custom networks, expose ports, configure bridges, link multiple containers using docker-compose.yml files.', status: 'NOT_STARTED', order: 4, commands: ['docker compose up -d', 'docker network ls'] },
  ]);

  const [activeNode, setActiveNode] = useState<RoadmapNode>(nodes[1]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleStatus = (id: string) => {
    setNodes(nodes.map(n => {
      if (n.id === id) {
        let newStatus: RoadmapNode['status'] = 'NOT_STARTED';
        if (n.status === 'NOT_STARTED') newStatus = 'IN_PROGRESS';
        else if (n.status === 'IN_PROGRESS') newStatus = 'COMPLETED';
        
        const updated = { ...n, status: newStatus };
        if (activeNode.id === id) {
          setActiveNode(updated);
        }
        return updated;
      }
      return n;
    }));
  };

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">Interactive Learning Roadmaps</h1>
        <p className="text-zinc-400 text-sm mt-1">Select roadmap nodes to review command cheat sheets and update progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Nodes Navigation list */}
        <Card className="lg:col-span-1 border border-zinc-800/80 bg-zinc-950/40">
          <CardHeader>
            <CardTitle className="text-base font-bold">Docker Containerization Path</CardTitle>
            <CardDescription>Track nodes step-by-step</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {nodes.map((node) => {
              const isActive = activeNode.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(node)}
                  className={`flex items-start justify-between rounded-lg p-3 border transition duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-zinc-900 border-cyan-500/40 text-cyan-400 shadow-[inset_0_0_8px_rgba(0,240,255,0.05)]' 
                      : 'bg-zinc-950/20 border-zinc-900 text-zinc-300 hover:bg-zinc-900/50 hover:text-zinc-100 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col gap-1 pr-2">
                    <span className="text-sm font-semibold leading-tight">{node.title}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${
                      node.status === 'COMPLETED' ? 'text-emerald-400' :
                      node.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-zinc-500'
                    }`}>
                      {node.status.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(node.id);
                    }}
                    className="p-1 rounded bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                    title="Toggle node status"
                  >
                    {node.status === 'COMPLETED' ? <CheckCircle size={15} className="text-emerald-400" /> :
                     node.status === 'IN_PROGRESS' ? <PlayCircle size={15} className="text-amber-400 animate-pulse" /> :
                     <Circle size={15} />}
                  </button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Detailed Study Panel */}
        <Card className="lg:col-span-2 border border-zinc-800/80 bg-zinc-950/40 flex flex-col justify-between">
          <div>
            <CardHeader className="border-b border-zinc-800/60 pb-4">
              <div className="flex justify-between items-center gap-4">
                <CardTitle className="text-lg font-bold text-white">{activeNode.title}</CardTitle>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-950 font-bold uppercase tracking-wider ${
                  activeNode.status === 'COMPLETED' ? 'text-emerald-400' :
                  activeNode.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-zinc-500'
                }`}>
                  {activeNode.status.replace('_', ' ')}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-5 flex flex-col gap-6">
              
              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Node Overview</span>
                <p className="text-sm text-zinc-300 leading-relaxed">{activeNode.description}</p>
              </div>

              {/* Commands Cheat Sheet */}
              {activeNode.commands && activeNode.commands.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Terminal size={14} className="text-cyan-400" /> Command Cheat Sheet
                  </span>
                  <div className="flex flex-col gap-2">
                    {activeNode.commands.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-2 px-3 font-mono text-xs text-zinc-300">
                        <span>$ {cmd}</span>
                        <button
                          onClick={() => copyCommand(cmd, idx)}
                          className="text-zinc-500 hover:text-cyan-400 transition cursor-pointer"
                          title="Copy command"
                        >
                          {copiedIndex === idx ? (
                            <span className="text-[10px] text-cyan-400 font-semibold font-sans">Copied!</span>
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {activeNode.resources && activeNode.resources.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen size={14} className="text-purple-400" /> Recommended Study Material
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {activeNode.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href="#"
                        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-cyan-400 transition"
                      >
                        <ExternalLink size={12} />
                        {res}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </div>

          <CardFooter className="justify-end border-t border-zinc-800/60 pt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toggleStatus(activeNode.id)}
            >
              Mark Node as {
                activeNode.status === 'NOT_STARTED' ? 'In Progress' :
                activeNode.status === 'IN_PROGRESS' ? 'Completed' : 'Not Started'
              }
              <ArrowRight size={14} />
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
};
