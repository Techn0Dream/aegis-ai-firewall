import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Database, RefreshCw, ShieldAlert, Shield, AlertTriangle, Fingerprint, ChevronDown, ChevronUp, SearchCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listenToLogs, hasFirebase } from '../firebase';

const API_URL = "/api/v1/logs";

export default function LogsPanel({ miniMode }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchLogsAPI = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL + "?limit=" + (miniMode ? "10" : "50"));
      setLogs(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFirebase) {
      const unsubscribe = listenToLogs((newLogs) => {
        setLogs(newLogs);
        setIsLoading(false);
      }, miniMode ? 10 : 50);
      
      return () => {
         if(unsubscribe) unsubscribe();
      };
    } else {
      fetchLogsAPI();
      if (miniMode) {
        const iv = setInterval(fetchLogsAPI, 10000);
        return () => clearInterval(iv);
      }
    }
  }, [miniMode]);

  const filteredLogs = logs.filter(log => 
    log.event_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.decision.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.threat_types.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="panel-card flex flex-col w-full h-full font-sans">
      <header className={`p-4 border-b border-[var(--border-color)] flex justify-between items-center ${miniMode ? 'bg-[var(--bg-main)]/30' : ''}`}>
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2 tracking-widest text-[var(--text-main)] uppercase">
            <Database className="w-4 h-4 text-[var(--brand-primary)]" />
            {miniMode ? 'Recent Ledger Preview' : 'Forensic Audit Ledger'}
          </h2>
        </div>
        <div className="flex gap-2">
          {!miniMode && (
            <div className="bg-[var(--bg-main)] px-2 rounded border border-[var(--border-color)] flex items-center gap-2">
              <Search className="w-3 h-3 text-[var(--text-muted)]" />
              <input 
                type="text"
                placeholder="Query Hash or Payload..."
                className="bg-transparent border-none outline-none w-48 text-[var(--text-main)] text-xs placeholder-[var(--text-muted)] focus:ring-0 py-1"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <button 
            onClick={fetchLogsAPI}
            className="flex items-center gap-1 bg-[var(--bg-main)] text-[var(--text-main)] hover:text-[var(--brand-primary)] px-2 py-1 rounded transition-all border border-[var(--border-color)] uppercase text-[10px] font-bold tracking-widest"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'SYNCING' : 'SYNC'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border-color)] text-[var(--text-muted)] text-[9px] font-bold uppercase tracking-widest">
              <th className="p-3">Timestamp (UTC)</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Action</th>
              <th className="p-3">SHA-256 Hash</th>
              <th className="p-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="text-xs text-[var(--text-main)]">
            {isLoading && logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[var(--text-muted)] text-xs"><RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> Syncing...</td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[var(--text-muted)] text-xs">No records available.</td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <React.Fragment key={log.id}>
                  <tr 
                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    className={`border-b border-[var(--border-color)] transition-colors cursor-pointer group hover:bg-[var(--bg-main)] ${expandedRow === log.id ? 'bg-[var(--bg-main)]' : ''}`}
                  >
                    <td className="p-3 font-mono text-[10px] text-[var(--text-muted)]">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3">
                      <div className={`text-[9px] uppercase tracking-widest font-bold ${log.severity_level === 'HIGH' || log.severity_level === 'CRITICAL' ? 'text-red-500' : log.severity_level==='MEDIUM'?'text-yellow-500':'text-green-500'}`}>
                        {log.severity_level}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className={`flex items-center gap-1 font-bold text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                        log.decision === 'BLOCK' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/40 dark:border-red-800' :
                        log.decision === 'SANITIZED' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/40 dark:border-orange-800' :
                        log.decision === 'WARN' ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/40 dark:border-yellow-800' :
                        'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/40 dark:border-green-800'
                      }`}>
                        {log.decision}
                      </div>
                    </td>
                    <td className="p-3 text-[var(--text-muted)] text-[10px] max-w-[200px] flex items-center gap-2 font-mono truncate">
                      <Fingerprint className="w-3 h-3 text-[var(--brand-primary)] shrink-0" />
                      {log.event_hash}
                    </td>
                    <td className="p-3 text-right text-[var(--text-muted)]">
                      {expandedRow === log.id ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
                    </td>
                  </tr>
                  
                  <AnimatePresence>
                    {expandedRow === log.id && (
                      <tr className="bg-[var(--bg-main)]/50">
                        <td colSpan="5" className="p-0 border-b border-[var(--border-color)]">
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-3">
                                <div>
                                  <div className="text-[var(--brand-primary)] uppercase tracking-widest text-[9px] mb-1 font-bold">Raw Payload Dump</div>
                                  <div className="bg-slate-900 text-green-400 p-2 rounded text-[10px] font-mono whitespace-pre-wrap break-all shadow-inner">
                                    {log.prompt}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[var(--brand-primary)] uppercase tracking-widest text-[9px] mb-1 font-bold">SHA-256 Hash</div>
                                  <div className="bg-slate-100 dark:bg-black/50 border border-[var(--border-color)] p-1.5 rounded text-[var(--text-muted)] text-[9px] font-mono break-all select-all">
                                    {log.event_hash}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-3">
                                <div>
                                  <div className="text-[var(--brand-primary)] uppercase tracking-widest text-[9px] mb-1 font-bold">Threat Diagnosis</div>
                                  <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-2 rounded text-[10px] shadow-sm">
                                    <span className="block mb-1 font-semibold text-[var(--text-main)]">Risk Trigger: <span className={log.risk_score >= 60 ? 'text-red-500' : 'text-orange-500'}>{log.risk_score}</span></span>
                                    <span className="block mb-2 text-[var(--text-muted)]">Signatures Matched: <span className="font-mono text-[var(--text-main)]">{log.threat_types}</span></span>
                                    <div className="text-[9px] text-[var(--text-muted)] italic py-1 border-t border-[var(--border-color)]">"{log.reason}"</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
