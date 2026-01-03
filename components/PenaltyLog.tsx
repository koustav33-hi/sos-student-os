
import React from 'react';
import { UserState, AppView } from '../types';

interface PenaltyLogProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
  setView: (view: AppView) => void;
}

const PenaltyLog: React.FC<PenaltyLogProps> = ({ state, setView }) => {
  const pending = state.penaltyHistory.filter(p => p.status === 'pending');
  const completed = state.penaltyHistory.filter(p => p.status === 'completed');

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 min-h-screen pb-32">
      <header className="border-b border-neutral-900 pb-4">
        <h2 className="text-xl font-bold text-white mono uppercase italic">Discipline Audit</h2>
        <p className="text-xs text-neutral-500 mt-1 uppercase">Penalty Registry</p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 text-center">
          <span className="text-[8px] text-neutral-500 uppercase font-black">Total</span>
          <p className="text-xl font-black text-white mono">{state.penaltyHistory.length}</p>
        </div>
        <div className="bg-neutral-950 p-4 rounded-xl border border-red-900/30 text-center">
          <span className="text-[8px] text-red-500 uppercase font-black">Pending</span>
          <p className="text-xl font-black text-red-600 mono">{pending.length}</p>
        </div>
        <div className="bg-neutral-950 p-4 rounded-xl border border-green-900/30 text-center">
          <span className="text-[8px] text-green-500 uppercase font-black">Done</span>
          <p className="text-xl font-black text-green-600 mono">{completed.length}</p>
        </div>
      </div>

      <section className="space-y-4">
        <label className="text-[10px] uppercase font-black text-neutral-600 tracking-widest">Active Violations</label>
        {pending.length === 0 ? (
          <p className="text-[10px] text-neutral-800 italic uppercase">No pending penalties. Subject compliant.</p>
        ) : (
          pending.map(p => (
            <div key={p.id} className="p-5 bg-red-950/10 border border-red-900/30 rounded-2xl flex justify-between items-center group">
              <div className="space-y-1">
                <p className="text-sm font-black text-white mono uppercase italic">{p.type}</p>
                <p className="text-[8px] text-neutral-500 uppercase">{p.reason}</p>
              </div>
              <button 
                onClick={() => setView('home')} 
                className="text-[10px] font-black text-green-500 border border-green-500/30 px-3 py-1 rounded"
              >
                Resolve
              </button>
            </div>
          ))
        )}
      </section>

      <section className="space-y-4">
        <label className="text-[10px] uppercase font-black text-neutral-600 tracking-widest">History</label>
        <div className="space-y-2 opacity-60">
          {completed.map(p => (
            <div key={p.id} className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl flex justify-between items-center grayscale">
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-400 mono uppercase italic line-through">{p.type}</p>
                <p className="text-[8px] text-neutral-600 uppercase">Cleared on {new Date(p.resolvedTimestamp || p.timestamp).toLocaleDateString()}</p>
              </div>
              <span className="text-[8px] text-green-700 font-black uppercase">Cleared</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PenaltyLog;
