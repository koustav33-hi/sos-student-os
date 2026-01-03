
import React, { useRef, useState, useEffect } from 'react';
import { UserState, NotificationSettings, AppView } from '../types';
import { PENALTIES } from '../constants';

interface SettingsProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
  setView: (view: AppView) => void;
  handleWipe: () => void;
  handleBackup: () => void;
  handleRestore: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ state, updateState, setView, handleWipe, handleBackup, handleRestore, handleLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  
  // Admin Trigger State
  const [tapCount, setTapCount] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCommand, setAdminCommand] = useState('');
  const versionRef = useRef<HTMLParagraphElement>(null);

  // Handle outside clicks to reset tap counter
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (versionRef.current && !versionRef.current.contains(e.target as Node)) {
        setTapCount(0);
        setStartTime(0);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const toggleNotification = (key: keyof NotificationSettings) => {
    updateState({
      notifications: {
        ...state.notifications,
        [key]: !state.notifications[key]
      }
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(state.loginCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerTap = () => {
    const now = Date.now();
    
    // Check timeout (6 seconds)
    if (startTime > 0 && now - startTime > 6000) {
      setTapCount(1);
      setStartTime(now);
      return;
    }

    if (tapCount === 0) {
      setTapCount(1);
      setStartTime(now);
    } else {
      const nextCount = tapCount + 1;
      setTapCount(nextCount);
      
      if (nextCount === 12) {
        if (now - startTime <= 6000) {
          setShowAdminModal(true);
        }
        setTapCount(0);
        setStartTime(0);
      }
    }
  };

  const submitCommand = () => {
    if (adminCommand === 'SOS://ADMIN.UNLOCK') {
      setView('admin');
    }
    // Always close and clear without feedback
    setShowAdminModal(false);
    setAdminCommand('');
  };

  return (
    <div className="px-6 py-8 space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="space-y-1 px-1">
        <h2 className="text-2xl font-light text-white italic tracking-tighter">System</h2>
        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Configuration & Control</p>
      </div>

      {/* ID Card */}
      <section className="bg-[#0f0f0f] p-6 rounded-3xl border border-neutral-800 space-y-4">
         <div className="flex justify-between items-start">
            <div className="space-y-1">
               <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">Unit ID</p>
               <p className="text-white font-mono text-lg">{state.userName}</p>
            </div>
            <div onClick={copyCode} className="text-right cursor-pointer active:opacity-50">
               <p className="text-[9px] text-neutral-500 uppercase font-black tracking-widest">Access Code</p>
               <p className="text-green-500 font-mono text-xl font-bold tracking-wider">{state.loginCode}</p>
               <p className="text-[8px] text-neutral-600 mt-1">{copied ? 'COPIED' : 'TAP TO COPY'}</p>
            </div>
         </div>
      </section>

      {/* Toggles */}
      <section className="space-y-3">
        <h3 className="text-[10px] text-neutral-600 uppercase font-black tracking-widest px-2">Notifications</h3>
        <div className="bg-[#0f0f0f] rounded-3xl border border-neutral-800 overflow-hidden">
          {(Object.keys(state.notifications) as Array<keyof NotificationSettings>).map((key, idx) => (
            <div 
              key={key}
              onClick={() => toggleNotification(key as keyof NotificationSettings)}
              className={`p-5 flex justify-between items-center cursor-pointer active:bg-neutral-900 ${idx !== 2 ? 'border-b border-neutral-900' : ''}`}
            >
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wide">{String(key).replace(/([A-Z])/g, ' $1')}</span>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${state.notifications[key] ? 'bg-green-600' : 'bg-neutral-800'}`}>
                 <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${state.notifications[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Control */}
      <section className="space-y-3">
         <h3 className="text-[10px] text-neutral-600 uppercase font-black tracking-widest px-2">Data Management</h3>
         <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleBackup}
              className="p-5 bg-[#0f0f0f] rounded-2xl border border-neutral-800 text-left space-y-2 active:scale-95 transition-transform"
            >
               <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               <p className="text-[10px] font-black uppercase text-white tracking-widest">Export JSON</p>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-5 bg-[#0f0f0f] rounded-2xl border border-neutral-800 text-left space-y-2 active:scale-95 transition-transform"
            >
               <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
               <p className="text-[10px] font-black uppercase text-white tracking-widest">Import JSON</p>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden" />
         </div>
      </section>

      {/* Penalty Selection */}
      <section className="space-y-3">
        <h3 className="text-[10px] text-neutral-600 uppercase font-black tracking-widest px-2">Penalty Protocol</h3>
        <div className="bg-[#0f0f0f] rounded-3xl border border-neutral-800 p-2 space-y-1">
          {PENALTIES.map(p => (
            <button
              key={p}
              onClick={() => updateState({ penalty: p })}
              className={`w-full p-4 rounded-xl text-left text-[10px] font-bold uppercase tracking-wide transition-all ${
                state.penalty === p ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {p} {state.penalty === p && '✓'}
            </button>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <div className="pt-8 space-y-4">
        <button 
          onClick={handleLogout}
          className="w-full py-4 rounded-xl border border-neutral-800 text-neutral-400 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-900 transition-colors"
        >
          Disconnect Session
        </button>
        <button 
          onClick={handleWipe}
          className="w-full py-4 text-red-800 text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors"
        >
          Factory Reset (Wipe All)
        </button>
      </div>

      <div className="text-center pt-8">
        <p 
          ref={versionRef}
          onClick={handleTriggerTap}
          className="text-[8px] text-neutral-700 uppercase tracking-widest font-mono cursor-pointer select-none active:text-neutral-600 transition-colors inline-block"
        >
          v2.4.0 // STABLE // HIGH CONTRAST
        </p>
      </div>

      {/* Secure Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200">
           <div className="w-full max-w-xs bg-[#0a0a0a] border border-neutral-800 p-8 rounded-3xl space-y-6 shadow-2xl">
              <div className="space-y-2 text-center">
                <div className="w-8 h-8 bg-neutral-900 rounded-full mx-auto flex items-center justify-center mb-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Admin Access</h3>
                <p className="text-[8px] text-neutral-600 uppercase font-bold tracking-widest">Authorized Personnel Only</p>
              </div>
              
              <div className="space-y-4">
                <input 
                  autoFocus
                  type="text" 
                  value={adminCommand}
                  onChange={(e) => setAdminCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitCommand()}
                  className="w-full bg-neutral-950 border border-neutral-900 p-4 rounded-xl text-center text-xs text-white mono outline-none focus:border-red-900/50 uppercase placeholder:text-neutral-800 tracking-wider transition-colors"
                  placeholder="ENTER COMMAND STRING"
                />
                <button 
                  onClick={submitCommand}
                  className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  Verify Credentials
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
