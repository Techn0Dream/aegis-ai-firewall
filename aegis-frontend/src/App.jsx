import React, { useState } from 'react';
import { Shield, Activity, List, Moon, Sun, Play, Square, FastForward, Zap } from 'lucide-react';
import Dashboard from './components/Dashboard';
import LogsPanel from './components/LogsPanel';
import LiveFeedPanel from './components/LiveFeedPanel';
import AttackLifecycle from './components/AttackLifecycle';
import { useSimulationEngine } from './hooks/useSimulationEngine';

function App() {
  const [activeTab, setActiveTab] = useState('sim');
  const [theme, setTheme] = useState('light'); // default light
  
  const { toggleSimulation, mode, isRunning, events, stats } = useSimulationEngine();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if(newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans tracking-wide overflow-hidden flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      
      {/* SaaS Top Header Navigation */}
      <header className="h-16 bg-[var(--bg-panel)] border-b border-[var(--border-color)] flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[var(--brand-primary)]" />
          <h1 className="text-xl font-bold tracking-widest text-[var(--text-main)]">AEGIS <span className="font-light text-[var(--text-muted)]">Firewall</span></h1>
          <div className="ml-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200 dark:border-sky-800">SOC EDITION</div>
        </div>
        
        {/* Simulation Controls Sidebar/Header */}
        <div className="flex items-center gap-2 bg-[var(--bg-main)] p-1 rounded-lg border border-[var(--border-color)]">
          <SimButton icon={<Square />} label="Off" active={mode === 'Off'} onClick={() => toggleSimulation('Off')} />
          <SimButton icon={<Play />} label="Normal" active={mode === 'Normal'} onClick={() => toggleSimulation('Normal')} />
          <SimButton icon={<FastForward />} label="Attack" active={mode === 'Attack'} onClick={() => toggleSimulation('Attack')} />
          <SimButton icon={<Zap />} label="Stress" active={mode === 'Stress'} onClick={() => toggleSimulation('Stress')} />
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex gap-4 font-semibold text-sm">
            <TabLink label="Simulation Engine" active={activeTab === 'sim'} onClick={() => setActiveTab('sim')} />
            <TabLink label="Platform Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          </nav>
          <div className="h-6 w-px bg-[var(--border-color)]"></div>
          <button onClick={toggleTheme} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content Workspace Layout */}
      <main className="flex-1 flex overflow-hidden bg-[var(--bg-main)]">
        {activeTab === 'sim' && (
          <div className="flex w-full h-full p-4 gap-4 max-w-[1600px] mx-auto">
            {/* Left Column: Live Traffic Engine & Attack Lifecycle */}
            <div className="w-[30%] min-w-[350px] h-full overflow-hidden shrink-0 flex flex-col">
              <AttackLifecycle events={events} />
              <LiveFeedPanel events={events} isRunning={isRunning} mode={mode} />
            </div>
            
            {/* Right Column: Analytics & Bottom Logs Preview */}
            <div className="flex-1 h-full overflow-hidden flex flex-col gap-4">
              <div className="flex-none">
                <Dashboard stats={stats} isRunning={isRunning} />
              </div>
              <div className="flex-1 overflow-hidden min-h-[300px]">
                <LogsPanel miniMode={true} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="w-full h-full p-6 max-w-[1600px] mx-auto overflow-y-auto custom-scrollbar">
            <LogsPanel />
          </div>
        )}
      </main>
    </div>
  );
}

function SimButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${
        active 
          ? 'bg-[var(--bg-panel)] text-[var(--brand-primary)] shadow-sm ring-1 ring-[var(--border-color)]' 
          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5'
      }`}
    >
      {React.cloneElement(icon, { size: 14 })}
      {label}
    </button>
  );
}

function TabLink({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`transition-colors uppercase tracking-wider text-xs ${
        active ? 'text-[var(--brand-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
      }`}
    >
      {label}
    </button>
  );
}

export default App;
