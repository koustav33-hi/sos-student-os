
import React, { useState, useRef } from 'react';
import { UserState, AppView, PenaltyRecord, calculateDisciplineScore, DailyTask, InboxMessage } from '../types';
import { getCoachGreeting } from '../constants';

interface DashboardProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
  onViewChange?: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, updateState, onViewChange }) => {
  const [secondaryInput, setSecondaryInput] = useState('');
  const [highlightPenalty, setHighlightPenalty] = useState(false);
  const penaltyRef = useRef<HTMLElement>(null);

  const today = new Date().toDateString();
  const todayRelapses = (state.dopamineRelapses[today] || []).length;
  const disciplineScore = calculateDisciplineScore(state);
  const greeting = getCoachGreeting(state.streak, 0, todayRelapses);

  const pendingPenalties = state.penaltyHistory.filter(p => p.status === 'pending');

  const toggleCoreObjective = () => {
    if (!state.mainFocus) return;
    updateState({ coreObjectiveCompleted: !state.coreObjectiveCompleted });
  };

  const addSecondary = () => {
    if (!secondaryInput.trim() || state.dailyTasks.length >= 3) return;
    const newTask: DailyTask = {
      id: Date.now().toString(),
      text: secondaryInput.trim(),
      completed: false
    };
    updateState({ dailyTasks: [...state.dailyTasks, newTask] });
    setSecondaryInput('');
  };

  const toggleSecondary = (id: string) => {
    const updated = state.dailyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    updateState({ dailyTasks: updated });
  };

  const deleteSecondary = (id: string) => {
    const updated = state.dailyTasks.filter(t => t.id !== id);
    updateState({ dailyTasks: updated });
  };

  const handlePenaltyResolve = (penalty: PenaltyRecord) => {
    const nextHistory = state.penaltyHistory.map(p => p.id === penalty.id ? { ...p, status: 'completed' as const, resolvedTimestamp: Date.now() } : p);
    
    const confirmationMsg: InboxMessage = {
      id: `sys-resolve-${Date.now()}`,
      text: `Penalty '${penalty.type}' resolved. Compliance verified.`,
      timestamp: Date.now(),
      type: 'System',
      read: false
    };

    updateState({ 
      penaltyHistory: nextHistory,
      inbox: [confirmationMsg, ...state.inbox]
    });
  };

  const scrollToPenalty = () => {
    if (penaltyRef.current) {
      penaltyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightPenalty(true);
      setTimeout(() => setHighlightPenalty(false), 2000);
    }
  };

  return (
    <div className="px-6 py-8 space-y-8 animate-in fade-in duration-700 pb-32">
      
      {/* Penalty Alert Notification */}
      {pendingPenalties.length > 0 && (
        <div className="bg-red-950/20 border border-red-900/50 p-5 rounded-2xl flex flex-col gap-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs font-black text-red-500 uppercase tracking-widest">Action Required</span>
            </div>
            <span className="text-[9px] font-mono text-red-400">{pendingPenalties.length} Active</span>
          </div>
          <p className="text-sm font-bold text-white leading-tight">
            {pendingPenalties[0].type}
          </p>
          <button 
            onClick={scrollToPenalty}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] mt-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-colors"
          >
            Resolve Breach
          </button>
        </div>
      )}

      {/* Greeting */}
      <div className="space-y-1 px-1">
        <h2 className="text-2xl font-light text-white leading-tight italic">"{greeting}"</h2>
        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Protocol Status: {state.streak > 0 ? 'Consistent' : 'Reset'}</p>
      </div>

      {/* Primary Task Card */}
      <section className="relative group">
        <div className={`p-6 rounded-3xl border transition-all duration-500 ${state.coreObjectiveCompleted ? 'bg-green-950/10 border-green-800/30' : 'bg-[#0f0f0f] border-neutral-800'}`}>
          <div className="flex justify-between items-start mb-5">
             <label className="text-[9px] uppercase text-neutral-500 font-black tracking-[0.2em]">Singular Objective</label>
             {state.coreObjectiveCompleted && (
               <div className="flex items-center space-x-1.5">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                 <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Complete</span>
               </div>
             )}
          </div>
          
          {state.mainFocus ? (
            <div className="space-y-6">
              <p className={`text-lg font-medium mono leading-relaxed transition-all ${state.coreObjectiveCompleted ? 'text-green-500/50 line-through' : 'text-white'}`}>
                {state.mainFocus}
              </p>
              <button 
                onClick={toggleCoreObjective}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${
                  state.coreObjectiveCompleted 
                  ? 'bg-neutral-900 text-neutral-600 border border-neutral-800 hover:text-white' 
                  : 'bg-green-600 text-black shadow-[0_0_20px_rgba(22,163,74,0.2)] hover:bg-green-500'
                }`}
              >
                {state.coreObjectiveCompleted ? 'Undo Status' : 'Mark Executed'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Define today's singular focus..." 
                className="w-full bg-black/50 border border-neutral-800 p-4 rounded-xl text-white placeholder:text-neutral-700 focus:border-green-600/50 outline-none transition-all text-sm font-medium mono" 
                value={state.mainFocus} 
                onChange={(e) => updateState({ mainFocus: e.target.value, coreObjectiveCompleted: false })} 
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
              <p className="text-[9px] text-neutral-600 uppercase tracking-wide px-1">Commit to one absolute task.</p>
            </div>
          )}
        </div>
      </section>

      {/* Secondary Tasks */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <label className="text-[9px] uppercase text-neutral-500 font-black tracking-[0.2em]">Secondary Objectives</label>
          <span className="text-[9px] font-mono text-neutral-600">{state.dailyTasks.length}/3</span>
        </div>
        
        <div className="space-y-3">
          {state.dailyTasks.map(task => (
            <div key={task.id} className="group flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-2xl transition-all hover:border-neutral-700">
              <button onClick={() => toggleSecondary(task.id)} className="flex items-center space-x-4 flex-1 text-left">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${task.completed ? 'bg-green-600 border-green-600' : 'bg-transparent border-neutral-700'}`}>
                  {task.completed && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className={`text-xs font-medium mono transition-colors ${task.completed ? 'text-neutral-600 line-through' : 'text-neutral-300'}`}>
                  {task.text}
                </span>
              </button>
              <button onClick={() => deleteSecondary(task.id)} className="text-neutral-700 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}

          {state.dailyTasks.length < 3 && (
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                placeholder="+ Add secondary task"
                className="flex-1 bg-transparent border-b border-neutral-800 p-3 text-xs text-white mono focus:border-green-600/50 outline-none transition-all placeholder:text-neutral-700"
                value={secondaryInput}
                onChange={(e) => setSecondaryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addSecondary();
                }}
              />
              <button 
                onClick={addSecondary}
                disabled={!secondaryInput.trim()}
                className="text-[9px] font-black uppercase text-neutral-500 disabled:opacity-30 hover:text-green-500 transition-colors px-3"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Active Penalties Section (Target for scroll) */}
      {pendingPenalties.length > 0 && (
        <section 
          ref={penaltyRef}
          className={`space-y-4 transition-all duration-500 ${highlightPenalty ? 'scale-[1.02]' : ''}`}
        >
          <div className="flex justify-between items-center px-2">
            <label className={`text-[9px] uppercase font-black tracking-[0.2em] transition-colors ${highlightPenalty ? 'text-red-500' : 'text-neutral-500'}`}>
              Breach Protocol
            </label>
          </div>
          
          <div className={`p-6 bg-[#0f0f0f] border rounded-3xl space-y-8 transition-all duration-500 ${highlightPenalty ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : 'border-neutral-800'}`}>
             {pendingPenalties.map(p => (
               <div key={p.id} className="space-y-6">
                  <div className="space-y-3">
                     <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Penalty Assigned</p>
                     <h3 className="text-xl font-black text-white italic mono leading-tight border-l-2 border-red-600 pl-4">{p.type}</h3>
                     <p className="text-xs text-neutral-500 font-medium">Reason: {p.reason || 'System Violation'}</p>
                  </div>
                  
                  <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-xl">
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wide leading-relaxed text-center">
                      "Discipline breaks the moment you fake progress. Verify execution honestly."
                    </p>
                  </div>

                  <button 
                    onClick={() => handlePenaltyResolve(p)}
                    className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-transform hover:bg-red-500"
                  >
                    I Have Completed This
                  </button>
               </div>
             ))}
          </div>
        </section>
      )}

      {/* Integrity & Actions */}
      <section className="grid grid-cols-1 gap-4 pt-4">
        <div className="p-5 bg-[#0f0f0f] rounded-3xl border border-neutral-800 space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-[9px] uppercase text-neutral-500 font-black tracking-[0.2em]">Integrity Index</label>
            <span className="text-2xl font-bold mono text-white">{disciplineScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-neutral-900">
            <div 
              className="h-full bg-green-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(22,163,74,0.4)]" 
              style={{ width: `${disciplineScore}%` }} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button onClick={() => onViewChange?.('skill')} className="p-5 bg-[#0f0f0f] border border-neutral-800 rounded-3xl flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all hover:border-neutral-700 group">
              <svg className="w-5 h-5 text-neutral-500 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="text-[9px] font-black uppercase text-neutral-400 group-hover:text-white transition-colors tracking-widest">Skill</span>
           </button>
           <button onClick={() => onViewChange?.('log')} className="p-5 bg-[#0f0f0f] border border-neutral-800 rounded-3xl flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all hover:border-neutral-700 group">
              <svg className="w-5 h-5 text-neutral-500 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <span className="text-[9px] font-black uppercase text-neutral-400 group-hover:text-white transition-colors tracking-widest">Proof</span>
           </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
