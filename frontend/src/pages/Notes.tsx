import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Note } from '../types';
import { 
  Plus, 
  FileText, 
  Eye, 
  Edit3, 
  Save, 
  Trash,
  Tag
} from 'lucide-react';

export const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    { id: 'n-1', title: 'docker-compose-guide.md', content: '# Docker Compose Orchestration Guide\n\nUse this document to track local container stacks configurations.\n\n### Core Stack Configuration\n\n```yaml\nversion: "3.8"\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - "80:80"\n    networks:\n      - proxy-net\n```\n\n### Verification command\n\nRun the following commands to confirm network links:\n`docker compose exec web nslookup backend`', tags: ['Docker', 'Guide'], projectId: 'p-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'n-2', title: 'kubernetes-ingress-notes.md', content: '# Kubernetes Ingress Controllers\n\nConfigure custom entrypoints routing for microservices.\n\n- Uses Nginx Ingress resource definitions\n- Path-based routing configured on `/api` path mapping.', tags: ['K8s', 'Study'], projectId: 'p-1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]);

  const [activeNote, setActiveNote] = useState<Note>(notes[0]);
  const [editorMode, setEditorMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [noteTitle, setNoteTitle] = useState(activeNote.title);
  const [noteContent, setNoteContent] = useState(activeNote.content);
  const [noteTags, setNoteTags] = useState(activeNote.tags.join(', '));

  const selectNote = (note: Note) => {
    setActiveNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags(note.tags.join(', '));
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `n-${Math.random().toString(36).substr(2, 9)}`,
      title: 'untitled.md',
      content: '# New Document\n\nStart writing markdown here...',
      tags: ['General'],
      projectId: 'p-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes([...notes, newNote]);
    selectNote(newNote);
  };

  const handleSave = () => {
    const tagsArray = noteTags.split(',').map(t => t.trim()).filter(Boolean);
    const updatedNote = {
      ...activeNote,
      title: noteTitle,
      content: noteContent,
      tags: tagsArray,
      updatedAt: new Date().toISOString()
    };

    setNotes(notes.map(n => n.id === activeNote.id ? updatedNote : n));
    setActiveNote(updatedNote);
  };

  const handleDelete = (id: string) => {
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (remaining.length > 0) {
      selectNote(remaining[0]);
    }
  };

  // Basic client-side HTML renderer for markdown mock parsing
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    
    // Very basic parsing for mock view: header, list, code block, backticks
    let html = text
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold border-b border-zinc-800 pb-2 mb-3 text-white">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold border-b border-zinc-900 pb-1 mb-2 mt-4 text-white">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold mt-4 mb-1.5 text-zinc-100">$1</h3>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-zinc-300 py-0.5">$1</li>')
      .replace(/`(.*?)`/g, '<code class="bg-zinc-900 text-cyan-400 px-1 rounded font-mono text-[11px]">$1</code>');

    // Code blocks parser
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    html = html.replace(codeBlockRegex, (_, lang, code) => {
      return `<pre class="bg-zinc-950/80 border border-zinc-900/60 p-3 rounded-lg font-mono text-xs text-zinc-300 overflow-x-auto my-3"><div class="text-[9px] uppercase font-bold text-zinc-600 mb-1">${lang || 'code'}</div><code>${code.trim()}</code></pre>`;
    });

    // Paragraph parser (split by double enters, wrapped in p tags except block tags)
    return html.split('\n\n').map(p => {
      if (p.trim().startsWith('<h') || p.trim().startsWith('<pre') || p.trim().startsWith('<li')) {
        return p;
      }
      return `<p class="leading-relaxed text-zinc-300 mb-2.5">${p}</p>`;
    }).join('\n');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Markdown Notes Workspace</h1>
          <p className="text-zinc-400 text-sm mt-1">Take rich study notes, save config files, and copy script snippets.</p>
        </div>
        <Button size="sm" onClick={handleCreateNote}>
          <Plus size={16} />
          New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Notes list */}
        <Card className="lg:col-span-1 border border-zinc-800/80 bg-zinc-950/40 p-4">
          <CardHeader className="px-0 pt-0 pb-3">
            <CardTitle className="text-sm font-bold">Workspace Notes</CardTitle>
          </CardHeader>
          <CardContent className="px-0 flex flex-col gap-1.5">
            {notes.length === 0 ? (
              <span className="text-xs text-zinc-600 text-center py-6 block">No documents found</span>
            ) : (
              notes.map((note) => {
                const isActive = activeNote.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`flex items-center justify-between rounded-lg p-2.5 transition cursor-pointer border ${
                      isActive 
                        ? 'bg-zinc-900 border-cyan-500/40 text-cyan-400 shadow-[inset_0_0_8px_rgba(0,240,255,0.05)]' 
                        : 'bg-zinc-950/20 border-transparent text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xs font-semibold truncate flex items-center gap-2">
                      <FileText size={14} className={isActive ? 'text-cyan-400' : 'text-zinc-500'} />
                      {note.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      className="text-zinc-600 hover:text-rose-400 transition cursor-pointer p-0.5"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Editor Main Card */}
        <Card className="lg:col-span-3 border border-zinc-800/80 bg-zinc-950/40 flex flex-col min-h-[500px]">
          
          {/* Note Metadata configuration */}
          <div className="flex flex-col md:flex-row gap-4 justify-between border-b border-zinc-800/60 pb-4 mb-4">
            <div className="flex-1 flex flex-col gap-2">
              <Input
                label="Note Filename"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                glowColor="cyan"
                className="h-8 text-xs font-bold font-mono"
              />
              <div className="flex items-center gap-2">
                <Tag size={12} className="text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tags (comma separated e.g. Docker, Setup)"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  className="bg-transparent border-0 text-[10px] font-semibold text-zinc-400 placeholder:text-zinc-600 focus:outline-none flex-1"
                />
              </div>
            </div>
            
            {/* Editor Action buttons */}
            <div className="flex items-center gap-2 self-end md:self-center">
              {/* Layout options */}
              <div className="flex border border-zinc-800 bg-zinc-950 rounded-lg p-0.5">
                <button
                  onClick={() => setEditorMode('edit')}
                  className={`p-1.5 rounded-md text-xs transition cursor-pointer ${editorMode === 'edit' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Editor only"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setEditorMode('split')}
                  className={`p-1.5 rounded-md text-xs transition cursor-pointer hidden md:block ${editorMode === 'split' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Split view"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => setEditorMode('preview')}
                  className={`p-1.5 rounded-md text-xs transition cursor-pointer ${editorMode === 'preview' ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Preview only"
                >
                  <Eye size={14} />
                </button>
              </div>

              <Button size="sm" onClick={handleSave}>
                <Save size={14} />
                Save Note
              </Button>
            </div>
          </div>

          {/* Split Pane Editor area */}
          <CardContent className="flex-1 flex flex-col md:flex-row gap-4 p-0">
            {/* Text Editor textarea */}
            {(editorMode === 'edit' || editorMode === 'split') && (
              <textarea
                className={`flex-1 min-h-[350px] p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl font-mono text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400/40 resize-none ${
                  editorMode === 'edit' ? 'w-full' : 'w-full md:w-1/2'
                }`}
                placeholder="Write markdown here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            )}

            {/* Markdown HTML Render Preview */}
            {(editorMode === 'preview' || editorMode === 'split') && (
              <div 
                className={`flex-1 min-h-[350px] p-4 px-5 bg-zinc-950/20 border border-zinc-800/80 rounded-xl overflow-y-auto text-xs ${
                  editorMode === 'preview' ? 'w-full' : 'w-full md:w-1/2'
                }`}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(noteContent) }}
              />
            )}
          </CardContent>

        </Card>

      </div>
    </div>
  );
};
