
import React, { useState, useEffect, useRef } from 'react';
import { CHOOSE_PHRASE, PENALTIES } from '../constants';
import { UserState, FocusReport, AppView, PenaltyRecord } from '../types';

interface FocusProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
  setView: (view: AppView) => void;
  setFocusLocked: (locked: boolean) => void;
  isLocked: boolean;
}

type FocusInternalState = 'IDLE' | 'ACTIVE' | 'QUIT_CONFIRM' | 'HISTORY';

const FocusMode: React.FC<FocusProps> = ({ state, updateState, setView, setFocusLocked, isLocked }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [internalState, setInternalState] = useState<FocusInternalState>('IDLE');
  const [phrase] = useState(CHOOSE_PHRASE());
  
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (internalState === 'ACTIVE') {
      setFocusLocked(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { 
            clearInterval(timerRef.current); 
            completeSession(); 
            return 0; 
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [internalState]);

  const completeSession = () => {
    setInternalState('IDLE');
    setFocusLocked(false);
    const report: FocusReport = { 
      id: Date.now().toString(), 
      duration: initialTime, 
      breaks: 0, 
      pauses: 0, 
      totalBreakSeconds: 0, 
      timestamp: Date.now(), 
      completed: true 
    };
    updateState({ 
      focusSessionsCompletedToday: (state.focusSessionsCompletedToday || 0) + 1, 
      focusReports: [report, ...state.focusReports].slice(0, 50) 
    });
  };

  const handlePenaltyQuit = () => {
    setFocusLocked(false);
    const p: PenaltyRecord = { 
      id: 'f-quit-' + Date.now(), 
      type: PENALTIES[Math.floor(Math.random() * PENALTIES.length)], 
      reason: "Deep Work Terminated Early.", 
      timestamp: Date.now(), 
      status: 'pending' 
    };
    updateState({ 
      penaltyHistory: [p, ...state.penaltyHistory].slice(0, 20), 
      inbox: [{ id: 'm-'+Date.now(), text: `Session abandoned. Penalty assigned.`, timestamp: Date.now(), type: 'Penalty', read: false }, ...state.inbox] 
    });
    setInternalState('IDLE');
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (internalState === 'HISTORY') {
    return (
      <div className="px-6 py-8 h-[80vh] flex flex-col space-y-8 animate-sos-entry">
        <header className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest italic">Logs</h2>
          <button onClick={() => setInternalState('IDLE')} className="text-[10px] font-bold uppercase text-neutral-500 hover:text-white transition-colors">[ Return ]</button>
        </header>
        <div className="space-y-3 overflow-y-auto pr-2 pb-20">
          {state.focusReports.length === 0 ? (
            <p className="text-[10px] text-neutral-800 uppercase italic tracking-widest text-center py-20">No data.</p>
          ) : (
            state.focusReports.map(report => (
              <div key={report.id} className="p-4 bg-[#0f0f0f] border border-neutral-900 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-400 mono">{Math.floor(report.duration / 60)} MIN</span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${report.completed ? 'text-green-500 bg-green-900/10' : 'text-red-500 bg-red-900/10'}`}>{report.completed ? 'COMPLETE' : 'FAILED'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 flex flex-col items-center justify-center min-h-[80vh] space-y-12 animate-in fade-in duration-700 pb-24">
      
      {/* Timer Display */}
      <div className="flex flex-col items-center space-y-2">
        <div className={`text-[6rem] font-light mono tabular-nums text-white leading-none tracking-tighter select-none transition-colors duration-1000 ${isLocked ? 'text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}`}>
          {formatTime(timeLeft)}
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-colors ${isLocked ? 'text-red-500 animate-pulse' : 'text-neutral-600'}`}>
           {isLocked ? 'SYSTEM LOCKED' : 'SYSTEM READY'}
        </p>
      </div>

      {/* Quote */}
      <div className="max-w-[260px] text-center h-12 flex items-center justify-center">
         <p className="text-xs italic text-neutral-500 leading-tight">"{phrase}"</p>
      </div>

      {/* Controls */}
      <div className="w-full max-w-[300px] space-y-6">
        {internalState === 'IDLE' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {[25, 45, 90].map(m => (
                <button 
                  key={m} 
                  onClick={() => { setInitialTime(m * 60); setTimeLeft(m * 60); }} 
                  className={`py-4 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all border ${
                    initialTime === m * 60 
                    ? 'bg-neutral-800 text-white border-neutral-700' 
                    : 'bg-transparent text-neutral-600 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
            <button 
              onClick={() => setInternalState('ACTIVE')} 
              className="w-full py-5 bg-green-600 text-black rounded-xl font-black uppercase tracking-[0.3em] text-xs shadow-[0_0_25px_rgba(22,163,74,0.3)] active:scale-95 transition-transform"
            >
              Initiate Deep Work
            </button>
            <div className="flex justify-center pt-4">
               <button onClick={() => setInternalState('HISTORY')} className="text-[9px] font-bold uppercase text-neutral-700 tracking-widest hover:text-neutral-500">View Logs</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="w-full bg-neutral-900 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-green-600 h-full transition-all duration-1000 linear" 
                  style={{ width: `${(timeLeft / initialTime) * 100}%` }} 
                />
             </div>
             
             {internalState !== 'QUIT_CONFIRM' && (
               <button 
                onClick={() => setInternalState('QUIT_CONFIRM')} 
                className="w-full py-4 border border-red-900/30 text-red-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-950/20 transition-colors"
              >
                Abort Session
              </button>
             )}
          </div>
        )}
      </div>

      {internalState === 'QUIT_CONFIRM' && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="w-full max-w-xs space-y-8 bg-[#0a0a0a] border border-neutral-900 p-8 rounded-3xl text-center shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase italic">Confirm Failure</h3>
            <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest leading-relaxed">
              To go there, finish your work or quit the session.
            </p>
            <div className="space-y-3">
              <button onClick={() => setInternalState('ACTIVE')} className="w-full py-4 bg-green-600 text-black rounded-xl font-black uppercase tracking-widest text-xs">Resume Work</button>
              <button onClick={handlePenaltyQuit} className="w-full py-4 bg-transparent border border-red-900/50 text-red-600 rounded-xl font-black uppercase tracking-widest text-[10px]">Quit Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;
