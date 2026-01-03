
import React from 'react';
import { UserState, InboxMessage, AppView } from '../types';

interface InboxProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
  setView: (view: AppView) => void;
}

const Inbox: React.FC<InboxProps> = ({ state, updateState, setView }) => {
  const markAsRead = (id: string) => {
    updateState({ inbox: state.inbox.map(m => m.id === id ? { ...m, read: true } : m) });
  };

  return (
    <div className="px-8 py-10 space-y-12 animate-sos-entry pb-32">
      <header className="flex justify-between items-end border-b border-neutral-900/50 pb-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-neutral-200 mono uppercase italic">The Inbox</h2>
          <p className="text-[9px] text-neutral-600 uppercase font-black tracking-widest">Command Center</p>
        </div>
        {state.inbox.length > 0 && (
          <button onClick={() => updateState({ inbox: [] })} className="text-[10px] text-neutral-800 uppercase font-black tracking-widest hover:text-neutral-500 transition-colors">[ Clear All ]</button>
        )}
      </header>

      <div className="space-y-5">
        {state.inbox.length === 0 ? (
          <div className="text-center py-24 opacity-20">
            <p className="text-[10px] text-neutral-700 uppercase font-black tracking-[0.5em] italic">No active data streams.</p>
          </div>
        ) : (
          state.inbox.map((msg) => (
            <div 
              key={msg.id}
              onClick={() => markAsRead(msg.id)}
              className={`p-6 rounded-xl border transition-all ${
                msg.read ? 'bg-transparent border-neutral-900/40' : 'bg-[#0a0a0a] border-neutral-800 shadow-xl'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`text-[8px] px-3 py-1 rounded-full border uppercase font-black tracking-widest ${msg.type === 'Penalty' ? 'text-red-500 border-red-900/30 bg-red-950/10' : 'text-neutral-700 border-neutral-900'}`}>
                    {msg.type}
                  </span>
                  <span className="text-[9px] text-neutral-800 font-bold mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed font-medium mono ${msg.read ? 'text-neutral-700 italic' : 'text-neutral-300'}`}>
                  {msg.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inbox;