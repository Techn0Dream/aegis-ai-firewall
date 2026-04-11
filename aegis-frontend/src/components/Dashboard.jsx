import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, SearchCheck, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import { listenToUnknownPatterns, hasFirebase } from '../firebase';

export default function Dashboard({ stats, isRunning }) {
  const [history, setHistory] = useState([{ time: '0s', total: 0, blocked: 0 }]);
  const [unknownPatterns, setUnknownPatterns] = useState([]);

  useEffect(() => {
    if (hasFirebase) {
      const unsubscribe = listenToUnknownPatterns((data) => {
        setUnknownPatterns(data);
      });
      return () => { if (unsubscribe) unsubscribe(); };
    }
  }, []);  
  // Sample data over time for the line chart
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setHistory(prev => {
        const next = [...prev, { 
          time: new Date().toLocaleTimeString().split(' ')[0], 
          total: stats.total, 
          blocked: stats.blocked 
        }];
        if (next.length > 20) next.shift();
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isRunning, stats]);

  const pieData = [
    { name: 'Clean', value: stats.allowed || 1 },
    { name: 'Suspicious/Warn', value: stats.warning || 1 },
    { name: 'Sanitized', value: stats.sanitized || 0 },
    { name: 'Malicious/Blocked', value: stats.blocked || 0 },
  ];
  const pieColors = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

  const barData = [
    { name: 'ALLOW', count: stats.allowed },
    { name: 'WARN', count: stats.warning },
    { name: 'SANITIZED', count: stats.sanitized },
    { name: 'BLOCK', count: stats.blocked },
  ];

  return (
    <div className="flex flex-col gap-6 w-full h-full text-[var(--text-main)] overflow-y-auto custom-scrollbar pb-10">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Processed" value={stats.total} icon={<Activity className="text-blue-500" />} />
        <StatCard title="Clean Traffic" value={stats.allowed} icon={<CheckCircle className="text-green-500" />} />
        <StatCard title="Sanitized Intros" value={stats.sanitized} icon={<SearchCheck className="text-orange-500" />} />
        <StatCard title="Threats Blocked" value={stats.blocked} icon={<ShieldAlert className="text-red-500" />} isAlert={stats.blocked > 0} />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[300px]">
        {/* Line Chart: Volume */}
        <div className="lg:col-span-2 panel-card p-4 flex flex-col">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Traffic Volume & Mitigations</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--brand-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" isAnimationActive={false} />
                <Area type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Distribution */}
        <div className="panel-card p-4 flex flex-col items-center">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 w-full text-left">Traffic Distribution</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-[var(--text-muted)] mt-2 uppercase tracking-wide flex-wrap justify-center">
            <span className="text-green-500">Clean {stats.allowed}</span>
            <span className="text-yellow-500">Warn {stats.warning}</span>
            <span className="text-orange-500">San {stats.sanitized}</span>
            <span className="text-red-500">Block {stats.blocked}</span>
          </div>
        </div>
      </div>

      {/* Security Enforcement Bar Chart & Emerging Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[250px] shrink-0">
        <div className="panel-card p-4 flex flex-col h-full">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 w-full text-left">Enforcement Policy Decisions</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={10} width={80} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-main)' }}/>
                <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {barData.map((entry, index) => {
                    let color = '#22c55e';
                    if (entry.name === 'WARN') color = '#eab308';
                    if (entry.name === 'SANITIZED') color = '#f97316';
                    if (entry.name === 'BLOCK') color = '#ef4444';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-card p-4 flex flex-col h-full overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] pointer-events-none"></div>
          <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Zero-Day Emerging Patterns
          </h3>
          <p className="text-[9px] text-[var(--text-muted)] mb-3">Threats flagged by Local Semantic Similarity Engine representing novel attacks.</p>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 relative z-10">
            {!hasFirebase && (
              <div className="text-xs text-[var(--text-muted)] italic p-4 bg-orange-50 dark:bg-orange-950/20 border border-[var(--border-color)] rounded border-dashed text-center">
                🔴 DEMO MODE: No Firebase Connected.<br/>Zero-day pattern logs require live Firestore listeners.
              </div>
            )}
            {hasFirebase && unknownPatterns.length === 0 && (
              <div className="text-xs text-[var(--text-muted)] italic">No anomalous semantic patterns detected in this session.</div>
            )}
            {unknownPatterns.map((pat, idx) => (
              <div key={idx} className="p-2 border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 rounded text-xs flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">
                  <span>H-Score: {pat.heuristic_score}</span>
                  <span>Sim: {(pat.embedding_similarity * 100).toFixed(1)}%</span>
                </div>
                <div className="font-mono text-xs text-[var(--text-main)] truncate">{pat.prompt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, isAlert }) {
  return (
    <div className={`panel-card p-4 relative overflow-hidden transition-all ${isAlert ? 'ring-1 ring-red-500/50 bg-red-50 dark:bg-red-950/20' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[var(--text-muted)] font-bold tracking-widest uppercase text-[10px]">{title}</h4>
        {icon}
      </div>
      <div className="text-3xl font-black text-[var(--text-main)] font-mono">{value}</div>
    </div>
  );
}
