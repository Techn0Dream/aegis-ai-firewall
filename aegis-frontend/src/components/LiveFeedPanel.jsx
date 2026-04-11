import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, AlertTriangle, Fingerprint, SearchCheck } from 'lucide-react';

export default function LiveFeedPanel({ events, isRunning, mode }) {
  return (
    <div className="panel-card flex flex-col h-full overflow-hidden">
      <header className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-main)]/50 rounded-t-xl">
        <h2 className="font-bold uppercase tracking-widest text-[var(--text-main)] text-sm">Action Stream Feed</h2>
        <div className="flex items-center gap-2">
          {isRunning && <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse"></span>}
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">
            {isRunning ? `${mode} SIMULATION` : 'ENGINE IDLE'}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 relative">
        {!isRunning && events.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-sm tracking-wide">
            Awaiting Simulation Start...
          </div>
        )}
        
        <AnimatePresence>
          {events.map((ev, i) => (
            <motion.div
              key={ev.event_id || i}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg border text-sm flex flex-col gap-2 ${
                ev.decision === 'BLOCK' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' :
                ev.decision === 'SANITIZED' ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50' :
                ev.decision === 'WARN' ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50' :
                'bg-slate-50 dark:bg-slate-900/50 border-[var(--border-color)]'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
                <span className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded border ${
                  ev.decision === 'BLOCK' ? 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/50 dark:border-red-800' :
                  ev.decision === 'SANITIZED' ? 'text-orange-700 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-900/50 dark:border-orange-800' :
                  ev.decision === 'WARN' ? 'text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-800' :
                  'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/50 dark:border-green-800'
                }`}>
                  {ev.decision}
                </span>
              </div>
              
              <div className="font-mono text-xs text-[var(--text-main)] truncate opacity-80" title={ev.prompt}>
                {ev.prompt}
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1.5 text-[10px]">
                  {ev.decision === 'BLOCK' ? <ShieldAlert className="w-3 h-3 text-red-500" /> :
                   ev.decision === 'WARN' ? <AlertTriangle className="w-3 h-3 text-yellow-500" /> :
                   ev.decision === 'SANITIZED' ? <SearchCheck className="w-3 h-3 text-orange-500" /> :
                   <Shield className="w-3 h-3 text-green-500" />}
                  
                  <span className="font-semibold text-[var(--text-main)]">
                    {ev.threats && ev.threats.length > 0 ? ev.threats[0].threat_type : 'Verified Clean'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono">
                  <Fingerprint className="w-3 h-3" /> SCORE: {ev.risk_score}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
