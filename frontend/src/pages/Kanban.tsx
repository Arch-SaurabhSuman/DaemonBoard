import React, { useState } from 'react';

import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { KanbanTask, TaskStatus, TaskPriority } from '../types';
import { 
  Plus, 
  Trash, 
  ArrowLeft, 
  ArrowRight,
  CheckSquare,
  Square
} from 'lucide-react';

export const Kanban: React.FC = () => {
  const [tasks, setTasks] = useState<KanbanTask[]>([
    { id: 't-1', title: 'Install Docker & Docker Compose', description: 'Install runtime engines on local Linux workstation.', status: 'DONE', priority: 'HIGH', projectId: 'p-1', subtasks: [{ id: 's-1', title: 'Download binaries', completed: true }, { id: 's-2', title: 'Add user to docker group', completed: true }] },
    { id: 't-2', title: 'Configure Nginx Reverse Proxy', description: 'Redirect port 80 requests to API container.', status: 'IN_PROGRESS', priority: 'HIGH', projectId: 'p-1', subtasks: [{ id: 's-3', title: 'Write nginx.conf', completed: true }, { id: 's-4', title: 'Setup SSL certificates', completed: false }] },
    { id: 't-3', title: 'Write docker-compose.yml', description: 'Bundle backend, database, and redis instances.', status: 'TODO', priority: 'MEDIUM', projectId: 'p-1', subtasks: [{ id: 's-5', title: 'Write volumes maps', completed: false }] },
    { id: 't-4', title: 'Conduct E2E container tests', description: 'Write health checks for local endpoints.', status: 'REVIEW', priority: 'LOW', projectId: 'p-1', subtasks: [] },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('TODO');

  const columns: { label: string; status: TaskStatus; color: string }[] = [
    { label: 'To Do', status: 'TODO', color: 'border-zinc-800 bg-zinc-950/20' },
    { label: 'In Progress', status: 'IN_PROGRESS', color: 'border-cyan-500/20 bg-cyan-950/5' },
    { label: 'Under Review', status: 'REVIEW', color: 'border-purple-500/20 bg-purple-950/5' },
    { label: 'Done', status: 'DONE', color: 'border-emerald-500/20 bg-emerald-950/5' },
  ];

  const moveTask = (taskId: string, direction: 'forward' | 'backward') => {
    const statusOrder: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const currentIdx = statusOrder.indexOf(t.status);
        let newIdx = currentIdx;
        
        if (direction === 'forward' && currentIdx < statusOrder.length - 1) newIdx++;
        if (direction === 'backward' && currentIdx > 0) newIdx--;

        return { ...t, status: statusOrder[newIdx] };
      }
      return t;
    }));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: KanbanTask = {
      id: `t-${Math.random().toString(36).substr(2, 9)}`,
      title: newTaskTitle,
      description: newTaskDesc,
      status: newTaskStatus,
      priority: newTaskPriority,
      projectId: 'p-1',
      subtasks: []
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('MEDIUM');
    setIsModalOpen(false);
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(s => {
            if (s.id === subtaskId) {
              return { ...s, completed: !s.completed };
            }
            return s;
          })
        };
      }
      return t;
    }));
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
      
      {/* Board Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Kanban Workspace Board</h1>
          <p className="text-zinc-400 text-sm mt-1">Organize your infrastructure tasks and track configurations progress.</p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          Create Task
        </Button>
      </div>

      {/* Board Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start flex-1 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.status === col.status);
          
          return (
            <div 
              key={col.status} 
              className={`flex flex-col gap-4 rounded-xl border p-4 min-h-[500px] lg:h-[70vh] ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
                <span className="font-bold text-sm text-white tracking-wide">{col.label}</span>
                <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full px-2 py-0.5 font-bold font-mono">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-zinc-800/50 rounded-lg">
                    <span className="text-xs text-zinc-600">No tasks in column</span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="group relative flex flex-col gap-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4 shadow-md hover:border-zinc-700 transition duration-150"
                    >
                      {/* Priority Tag */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded ${
                          task.priority === 'HIGH' ? 'bg-rose-950/80 border border-rose-800 text-rose-300' :
                          task.priority === 'MEDIUM' ? 'bg-amber-950/80 border border-amber-800 text-amber-300' :
                          'bg-zinc-900 border border-zinc-800 text-zinc-400'
                        }`}>
                          {task.priority}
                        </span>
                        
                        {/* Delete button (visible on hover) */}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 transition cursor-pointer p-0.5 rounded"
                          title="Delete card"
                        >
                          <Trash size={13} />
                        </button>
                      </div>

                      {/* Title & description */}
                      <div className="flex flex-col gap-1">
                        <h4 className="font-semibold text-sm text-zinc-200 leading-tight">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Subtasks (if any) */}
                      {task.subtasks.length > 0 && (
                        <div className="flex flex-col gap-1 border-t border-zinc-900 pt-2">
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                            Subtasks Checklist ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
                          </span>
                          <div className="flex flex-col gap-1">
                            {task.subtasks.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => toggleSubtask(task.id, sub.id)}
                                className="flex items-center gap-1.5 text-left text-[11px] text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                              >
                                {sub.completed ? (
                                  <CheckSquare size={12} className="text-cyan-400 shrink-0" />
                                ) : (
                                  <Square size={12} className="text-zinc-600 shrink-0" />
                                )}
                                <span className={sub.completed ? 'line-through text-zinc-600' : ''}>
                                  {sub.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Direction Shift buttons */}
                      <div className="flex items-center justify-end gap-1.5 border-t border-zinc-900 pt-2.5">
                        {task.status !== 'TODO' && (
                          <button
                            onClick={() => moveTask(task.id, 'backward')}
                            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                            title="Move back"
                          >
                            <ArrowLeft size={11} />
                          </button>
                        )}
                        {task.status !== 'DONE' && (
                          <button
                            onClick={() => moveTask(task.id, 'forward')}
                            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                            title="Move forward"
                          >
                            <ArrowRight size={11} />
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task Card"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateTask}>
              Create Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
          <Input
            label="Task Title"
            placeholder="e.g. Configure healthchecks for API dockerfile"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Task Description
            </label>
            <textarea
              className="flex min-h-20 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 focus:ring-cyan-500/20 focus:ring-4 transition duration-200"
              placeholder="Provide context or command flags instructions for this task..."
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                Priority
              </label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-cyan-400 transition"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                Starting Column
              </label>
              <select
                className="flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-cyan-400 transition"
                value={newTaskStatus}
                onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Under Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
