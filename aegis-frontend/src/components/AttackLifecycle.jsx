import React from 'react';
import { Network, Fingerprint, ShieldAlert, Crosshair, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttackLifecycle({ events }) {
  // Analyze events to find escalation pattern
  const recentBlocked = events.find(e => e.decision === 'BLOCK' || e.decision === 'SANITIZED');
  
  const stages = [
    { name: 'Reconnaissance', icon: <Network />, active: true, color: 'text-blue-500' },
    { name: 'Context Probe', icon: <Crosshair />, active: events.length > 5, color: 'text-yellow-500' },
    { name: 'Exploit Injection', icon: <ShieldAlert />, active: !!events.find(e => e.decision === 'WARN' || e.decision === 'SANITIZED'), color: 'text-orange-500' },
    { name: 'Exfiltration Attempt', icon: <AlertOctagon />, active: !!events.find(e => e.decision === 'BLOCK'), color: 'text-red-500' }
  ];

  return (
    <div className="panel-card p-4 flex flex-col mb-4">
      <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center justify-between">
        <span>Attack Lifecycle Monitor</span>
        <Fingerprint className="w-3 h-3" />
      </h3>
      
      <div className="flex items-center justify-between relative mt-2 px-4">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-8 right-8 h-px bg-[var(--border-color)] -z-10 translate-y-[-50%]"></div>
        {/* Active Connecting Line */}
        <div className="absolute top-1/2 left-8 h-px bg-[var(--brand-primary)] -z-10 translate-y-[-50%] transition-all duration-1000" 
             style={{ width: stages[3].active ? '100%' : stages[2].active ? '66%' : stages[1].active ? '33%' : '0%' }}></div>

        {stages.map((stage, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 bg-[var(--bg-panel)] relative p-1">
            <motion.div 
              animate={{ scale: stage.active ? 1 : 0.8, opacity: stage.active ? 1 : 0.3 }}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[var(--bg-main)] ${
                stage.active ? `border-current ${stage.color}` : 'border-[var(--border-color)] text-[var(--text-muted)]'
              }`}
            >
              {React.cloneElement(stage.icon, { className: "w-4 h-4" })}
            </motion.div>
            <div className={`text-[8px] font-bold uppercase tracking-wider text-center w-16 ${stage.active ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
              {stage.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
