
import React from 'react';
import { UserState } from '../types';
import { DOPAMINE_CATEGORIES } from '../constants';

interface DopamineProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
}

const DopamineTracker: React.FC<DopamineProps> = ({ state, updateState }) => {
  const today = new Date().toDateString();
  const todayRelapses = state.dopamineRelapses[today] || [];

  const toggleCategory = (cat: string) => {
    const current = state.dopamineRelapses[today] || [];
    let next;
    if (current.includes(cat)) {
      next = current.filter(c => c !== cat);
    } else {
      next = [...current, cat];
    }
    updateState({
      dopamineRelapses: {
        ...state.dopamineRelapses,
        [today]: next
      }
    });
  };

  // Fixed unknown type inference by casting Object.values results to string[][]
  const totalRelapses = (Object.values(state.dopamineRelapses) as string[][]).reduce((acc, val) => acc + val.length, 0);
  
  // Fixed unknown type inference by casting Object.values results to string[][]
  const cleanDays = (Object.values(state.dopamineRelapses) as string[][]).filter(list => list.length === 0).length;

  return (
    <div className="p-6 space-y-8">
      <header>
        <h2 className="text-xl font-bold text-white mono uppercase italic">The Drain</h2>
        <p className="text-xs text-neutral-500 mt-1 uppercase">Identify your triggers. Eliminate them.</p>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {DOPAMINE_CATEGORIES.map(cat => {
          const isRelapsed = todayRelapses.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`p-5 rounded border text-left flex justify-between items-center transition-all ${
                isRelapsed 
                  ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              <span className="text-sm font-bold uppercase tracking-wider">{cat}</span>
              <div className={`w-3 h-3 rounded-full ${isRelapsed ? 'bg-red-500' : 'bg-neutral-800'}`} />
            </button>
          );
        })}
      </div>

      <section className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-6">
        <h3 className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Casualty Summary</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase text-neutral-500">Relapses</span>
            <p className="text-2xl font-black mono text-red-500">{totalRelapses}</p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] uppercase text-neutral-500">Clean Days</span>
            <p className="text-2xl font-black mono text-green-500">{cleanDays}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800">
          <p className="text-[10px] text-neutral-600 uppercase leading-relaxed italic text-center">
            "Your brain is a tool. Cheap dopamine is the rust."
          </p>
        </div>
      </section>
      
      {todayRelapses.length > 0 && (
        <div className="p-4 bg-red-900/10 border border-red-900/20 text-red-500 text-center rounded">
          <p className="text-[10px] font-bold uppercase tracking-widest">STATUS: SYSTEM COMPROMISED</p>
        </div>
      )}
    </div>
  );
};

export default DopamineTracker;
