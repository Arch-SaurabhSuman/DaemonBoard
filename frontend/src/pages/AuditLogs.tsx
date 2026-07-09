import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Search, Terminal, ClipboardList, Info, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  createdAt: string;
}

export const AuditLogs: React.FC = () => {
  const { user, getAuditLogs } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    if (user?.role !== 'Administrator') {
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getAuditLogs();
        setLogs(data);
        setFilteredLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, getAuditLogs]);

  useEffect(() => {
    const results = logs.filter((log) => 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLogs(results);
  }, [searchTerm, logs]);

  if (user?.role !== 'Administrator') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="border border-rose-500/20 bg-zinc-950/40 backdrop-blur-xl w-full max-w-md">
          <div className="flex flex-col items-center text-center p-6 gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-semibold text-base text-zinc-100">Access Restricted</h3>
              <p className="text-xs text-zinc-400 px-4 leading-relaxed">
                You do not have administrative privileges. System audit logs are strictly reserved for Administrator accounts.
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full mt-2">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getActionBadgeClass = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login_success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'login_failed':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      case 'register':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25';
      case 'email_verified':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/25';
      case 'password_reset_request':
      case 'password_reset_success':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/25';
      case 'token_refresh':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25';
    }
  };

  const formatActionName = (action: string) => {
    return action.toUpperCase().replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="text-cyan-400" size={24} />
            System Audit Logs
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time tracking of registration, authentication activity, and security changes
          </p>
        </div>
      </div>

      {/* Logs Table Card */}
      <Card className="border border-zinc-800 bg-zinc-950/45 backdrop-blur-xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-900">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Security Telemetry Logs</CardTitle>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 transition"
              placeholder="Search actions, IPs, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-purple-500 animate-spin" />
              </div>
              <span className="text-xs text-zinc-500">Querying security records...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <HelpCircle className="text-zinc-600" size={32} />
              <span className="text-sm font-semibold text-zinc-400">No Security Logs Found</span>
              <span className="text-xs text-zinc-500 px-4">Try clearing the search or perform authentication changes to trigger records.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/10 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Details Summary</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-xs">
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-zinc-900/20 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border uppercase ${getActionBadgeClass(log.action)}`}>
                          {formatActionName(log.action)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-300">
                        {log.ipAddress}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-cyan-400 transition cursor-pointer"
                        >
                          <Info size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="border border-zinc-800 bg-zinc-950 max-w-lg w-full shadow-2xl">
            <CardHeader className="border-b border-zinc-900 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="text-cyan-400" size={18} />
                  Log Entry Details
                </CardTitle>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border uppercase ${getActionBadgeClass(selectedLog.action)}`}>
                  {formatActionName(selectedLog.action)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Event Timestamp</span>
                  <span className="font-mono text-zinc-300">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">IP Address</span>
                  <span className="font-mono text-zinc-300">{selectedLog.ipAddress}</span>
                </div>
              </div>

              {selectedLog.userId && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Associated User ID</span>
                  <span className="font-mono text-zinc-300">{selectedLog.userId}</span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">User Agent Metadata</span>
                <span className="bg-zinc-900/50 p-2.5 rounded border border-zinc-800 text-zinc-400 font-mono text-[10px] break-all leading-normal">
                  {selectedLog.userAgent}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Description Details</span>
                <span className="bg-zinc-900/50 p-2.5 rounded border border-zinc-800 text-zinc-300 leading-relaxed font-sans">
                  {selectedLog.details}
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setSelectedLog(null)}>
                  Dismiss Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
