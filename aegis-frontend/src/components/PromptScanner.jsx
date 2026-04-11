import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Shield, AlertTriangle, Send, Loader2, Fingerprint, Crosshair, Network } from 'lucide-react';
import axios from 'axios';

const API_URL = "http://localhost:8000/api/v1/scan";

export default function PromptScanner() {
  const [prompt, setPrompt] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionId] = useState(() => "sess_soc_" + Math.random().toString(36).substr(2, 9));

  const handleScan = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsScanning(true);
    setResult(null);

    try {
      const response = await axios.post(API_URL, {
        prompt,
        session_id: sessionId,
        user_id: "soc_analyst_01"
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setResult({
        decision: "ERROR",
        risk_score: 0,
        reason: "Connection to Aegis SOC Firewall lost.",
        threats: []
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getBorderColor = () => {
    if (!result) return 'border-cyan-500/20';
    if (result.decision === 'BLOCK') return 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]';
    if (result.decision === 'WARN') return 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]';
    return 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.15)]';
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto h-full w-full font-mono">
      <header className="border-b border-cyan-500/20 pb-4">
        <h2 className="text-2xl font-bold mb-2 tracking-widest uppercase">Live Interception Proxy</h2>
        <p className="text-gray-400 text-sm">Deploy adversarial prompts to test the zero-trust SOC policies in real-time.</p>
      </header>

      {/* Input Section */}
      <div className={`bg-[#0c0c14] rounded p-6 border transition-all duration-500 ${getBorderColor()}`}>
        <form onSubmit={handleScan} className="flex flex-col gap-4">
          <label className="text-xs font-bold tracking-widest text-cyan-500 uppercase flex items-center gap-2">
            <Crosshair className="w-4 h-4" /> Target Payload
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="[AWAITING_INPUT] Inject adversarial prompt here... Try 'Ignore all instructions' or 'AKIA0123456789ABCDEF'"
              className="w-full bg-[#050508] border border-gray-800 rounded p-4 min-h-[120px] text-green-400 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-y placeholder-gray-700"
              disabled={isScanning}
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={isScanning || !prompt.trim()}
              className="absolute bottom-4 right-4 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50 font-bold p-2 px-4 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center uppercase text-xs tracking-widest"
            >
              {isScanning ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {isScanning ? 'Executing DPI...' : 'Transmit Payload'}
            </button>
          </div>
        </form>
      </div>

      {/* Scanning Animation */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 text-cyan-400 px-2 py-4 border-l-2 border-cyan-500 pl-4 bg-cyan-500/5"
          >
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
              <Network className="w-4 h-4 animate-pulse" />
              <span>Analyzing Heuristics...</span>
            </div>
            <div className="text-[10px] text-cyan-500/70 font-mono">
              [SYSTEM] Running semantic NLP classifiers...<br/>
              [SYSTEM] Correlating with Threat Intelligence DB...<br/>
              [SYSTEM] Checking Data Exfiltration signatures...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {result && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#0c0c14] p-6 border ${
              result.decision === 'BLOCK' ? 'border-red-500/50 relative overflow-hidden' :
              result.decision === 'WARN' ? 'border-yellow-500/50' : 'border-green-500/50'
            }`}
          >
            {result.decision === 'BLOCK' && <div className="absolute top-0 right-0 w-full h-full bg-red-500/5 pointer-events-none animate-pulse"></div>}
            
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b border-white/10 pb-6 relative z-10 gap-6">
              <div className="flex items-center gap-4 w-full">
                <div className={`p-4 rounded-full bg-black border ${
                  result.decision === 'BLOCK' ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                  result.decision === 'WARN' ? 'border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                }`}>
                  {result.decision === 'BLOCK' && <ShieldAlert className="w-8 h-8" />}
                  {result.decision === 'WARN' && <AlertTriangle className="w-8 h-8" />}
                  {result.decision === 'ALLOW' && <Shield className="w-8 h-8" />}
                </div>
                
                <div>
                  <h3 className="text-3xl font-black tracking-widest uppercase flex items-center gap-3">
                    <span className={
                      result.decision === 'BLOCK' ? 'text-red-500' :
                      result.decision === 'WARN' ? 'text-yellow-500' : 'text-green-500'
                    }>
                      ACTION: {result.decision}
                    </span>
                  </h3>
                  <p className="text-gray-400 mt-1 text-sm">{result.reason}</p>
                </div>
              </div>
              
              <div className="text-right w-full md:w-auto flex flex-col items-end shrink-0">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Fingerprint className="w-3 h-3" /> Event Hash
                </div>
                <div className="text-[10px] text-gray-600 font-mono mb-3 bg-black p-1 px-2 rounded border border-gray-800">
                  {result.event_id || "hash_pending..."}
                </div>
                
                <div className="flex gap-4 text-right">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Severity</div>
                    <div className={`font-bold ${result.severity_level === 'HIGH' || result.severity_level === 'CRITICAL' ? 'text-red-500' : result.severity_level==='MEDIUM'?'text-yellow-500':'text-green-500'}`}>
                      {result.severity_level || "LOW"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Risk Score</div>
                    <div className={`text-xl font-black ${
                      result.risk_score >= 60 ? 'text-red-500' :
                      result.risk_score >= 30 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {result.risk_score.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detected Threats - SOC Threat Intel View */}
            {result.threats && result.threats.length > 0 ? (
              <div className="space-y-4 relative z-10 w-full overflow-x-auto">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">Threat Intelligence Signatures</h4>
                <div className="grid gap-3 min-w-[600px]">
                  {result.threats.map((threat, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-black border border-white/5 p-3 flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-red-500/10 text-red-500 px-2 py-1 border border-red-500/30 text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">
                           <ShieldAlert w={10} h={10} /> {threat.intelligence?.signature_id || 'UNKNOWN-SIG'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-300 uppercase tracking-wider">{threat.threat_type}</div>
                          <div className="text-xs text-gray-500">{threat.description}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-6 text-right items-center">
                        <div className="text-left w-32 hidden lg:block">
                          <div className="text-[9px] text-gray-600 uppercase tracking-widest">Class</div>
                          <div className="text-cyan-600 text-xs truncate">{threat.intelligence?.attack_class || "Heuristic"}</div>
                        </div>
                        <div className="text-red-500 font-mono font-bold bg-red-500/5 px-2 py-1 rounded">
                          +{threat.score.toFixed(0)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-green-500 bg-green-500/5 p-4 border border-green-500/20 text-sm tracking-wide">
                <Shield className="w-5 h-5" />
                <span>Payload Clean. Zero-trust checks passed seamlessly.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
