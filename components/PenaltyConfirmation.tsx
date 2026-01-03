
import React, { useState, useEffect } from 'react';

interface PenaltyConfirmProps {
  penalty: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const STRICT_LINES = [
  "If you didn’t do this, you’re lying to yourself.",
  "This system can’t verify you. Your honesty does.",
  "Discipline breaks the moment you fake progress.",
  "Honor the code. If the work wasn't done, do not tap confirm.",
  "Lying to the system is lying to your future self."
];

const PenaltyConfirmation: React.FC<PenaltyConfirmProps> = ({ penalty, onConfirm, onCancel }) => {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((prev) => (prev + 1) % STRICT_LINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-8 py-12 flex flex-col items-center justify-center min-h-[80vh] space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black text-white uppercase italic mono leading-none tracking-tighter">Declare Execution</h2>
        <div className="p-6 bg-neutral-950 border border-red-900 rounded-xl">
          <p className="text-xl font-bold text-red-500 mono uppercase italic">“{penalty}”</p>
        </div>
      </div>

      <div className="text-center space-y-6">
        <div className="h-16 flex items-center justify-center">
          <p className="text-sm font-bold text-white mono uppercase italic leading-tight max-w-[280px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
            “{STRICT_LINES[lineIndex]}”
          </p>
        </div>
        <p className="text-[10px] text-neutral-600 uppercase font-black tracking-widest">Verify completion honestly.</p>
      </div>

      <div className="flex flex-col w-full max-w-xs space-y-3">
        <button 
          onClick={onConfirm}
          className="w-full bg-green-600 text-black py-4 rounded-xl font-black uppercase text-xs shadow-[0_0_30px_rgba(34,197,94,0.15)] active:scale-95 transition-all tap-active"
        >
          Confirm Resolved
        </button>
        <button 
          onClick={onCancel}
          className="w-full bg-neutral-900 text-neutral-500 py-4 rounded-xl font-black uppercase text-xs border border-neutral-800 tap-active"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default PenaltyConfirmation;
