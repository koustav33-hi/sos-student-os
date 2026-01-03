
import React, { useState, useMemo } from 'react';
import { UserState } from '../types';

interface ChallengeProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
}

const Challenge90: React.FC<ChallengeProps> = ({ state, updateState }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];
  
  const allDays = useMemo(() => {
    const days = new Array(90).fill(false);
    for (let i = 0; i < state.streak && i < 90; i++) days[i] = true;
    return days;
  }, [state.streak]);

  const toggleDay = (idx: number) => {
    // Only allow clicking the next day in sequence
    if (idx === state.streak && state.lastStreakDate !== todayISO) {
      updateState({ streak: state.streak + 1, lastStreakDate: todayISO });
    }
  };

  return (
    <div className="px-6 py-8 space-y-8 animate-sos-entry pb-32">
      <div className="flex items-end justify-between px-1">
         <div className="space-y-1">
            <h2 className="text-2xl font-light text-white italic tracking-tighter">90 Days</h2>
            <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Consistency War</p>
         </div>
         <span className="text-4xl font-bold mono text-green-500 leading-none">{state.streak}</span>
      </div>

      <div className="bg-[#0f0f0f] border border-neutral-900 rounded-3xl p-6">
        <div className="grid grid-cols-7 gap-2">
           {allDays.map((completed, idx) => {
             const isCurrent = idx === state.streak;
             // Only show first 35 days unless expanded? Let's just show all but smaller, or scrollable.
             // Requirement says "Clean grid".
             if (!isExpanded && idx > 34) return null;

             return (
               <button
                 key={idx}
                 disabled={!isCurrent}
                 onClick={() => toggleDay(idx)}
                 className={`aspect-square rounded-md flex items-center justify-center transition-all duration-300 ${
                   completed 
                     ? 'bg-green-600 text-black shadow-[0_0_10px_rgba(22,163,74,0.3)]' 
                     : isCurrent 
                       ? 'bg-neutral-800 border-2 border-green-600 animate-pulse text-white' 
                       : 'bg-neutral-900/50 text-neutral-700'
                 }`}
               >
                 <span className="text-[9px] font-bold mono">{idx + 1}</span>
               </button>
             )
           })}
        </div>
        
        {allDays.length > 35 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-6 py-3 text-[9px] font-bold text-neutral-600 uppercase tracking-widest hover:text-white transition-colors border-t border-neutral-800"
          >
            {isExpanded ? 'Collapse Grid' : 'Expand Full Map'}
          </button>
        )}
      </div>

      <div className="px-2 space-y-4 text-center">
         <p className="text-xs text-neutral-400 font-medium leading-relaxed italic max-w-xs mx-auto">
           "Do not break the chain. 90 days of execution creates a new identity."
         </p>
         <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
            <div className="bg-green-600 h-full" style={{ width: `${(state.streak / 90) * 100}%` }} />
         </div>
         <p className="text-[9px] text-neutral-600 uppercase font-black tracking-widest">{Math.round((state.streak / 90) * 100)}% Complete</p>
      </div>
    </div>
  );
};

export default Challenge90;
