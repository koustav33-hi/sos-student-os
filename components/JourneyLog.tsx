
import React, { useState } from 'react';
import { UserState, LogEntry } from '../types';

interface LogProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
}

const JourneyLog: React.FC<LogProps> = ({ state, updateState }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLog = () => {
    if (!content) return;
    const newEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content,
      imageUrl: image || undefined
    };
    updateState({ logs: [newEntry, ...state.logs] });
    setContent('');
    setImage(null);
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    updateState({
      logs: state.logs.filter(log => log.id !== deletingId)
    });
    setDeletingId(null);
  };

  return (
    <div className="p-6 space-y-8 pb-32">
      <header>
        <h2 className="text-xl font-bold text-white mono uppercase italic">Self Proof</h2>
        <p className="text-xs text-neutral-500 mt-1 uppercase">Evidence of the work. Not for them, for you.</p>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl space-y-4">
        <textarea 
          placeholder="Evidence of today's work..." 
          className="w-full bg-black border border-neutral-800 p-4 rounded text-sm text-white mono h-24 outline-none focus:border-green-600/50"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <div className="flex items-center justify-between">
          <label className="cursor-pointer text-xs font-bold text-neutral-500 hover:text-green-500 transition-colors">
            {image ? 'IMG ADDED ✓' : '+ ATTACH IMAGE'}
            <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
          </label>
          <button 
            onClick={addLog}
            className="bg-green-600 text-black px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          >
            Submit Entry
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {state.logs.map(log => (
          <div key={log.id} className="border-l-2 border-green-800/30 pl-4 space-y-3 relative group">
            <div className="flex justify-between items-start">
              <p className="text-[10px] text-neutral-600 font-bold mono">
                {new Date(log.timestamp).toLocaleString()}
              </p>
              {!log.isFollowUp && (
                <button 
                  onClick={() => setDeletingId(log.id)}
                  className="text-neutral-700 hover:text-red-500 transition-colors p-1"
                  aria-label="Delete entry"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            {log.imageUrl && (
              <img src={log.imageUrl} alt="Proof" className="w-full rounded h-32 object-cover border border-neutral-900" />
            )}
            <p className="text-sm text-neutral-300 mono leading-relaxed">{log.content}</p>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-300">
           <div className="text-center space-y-4">
              <h2 className="text-xl font-black text-white uppercase italic mono">Delete this entry?</h2>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">This evidence will be removed permanently.</p>
           </div>
           <div className="flex flex-col w-full max-w-xs space-y-3">
              <button 
                onClick={confirmDelete}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase text-xs shadow-[0_0_30px_rgba(220,38,38,0.2)]"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setDeletingId(null)}
                className="w-full bg-neutral-900 text-neutral-500 py-4 rounded-xl font-black uppercase text-xs border border-neutral-800"
              >
                Cancel
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default JourneyLog;
