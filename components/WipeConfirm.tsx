
import React from 'react';
import { AppView } from '../types';

interface WipeProps {
  setView: (view: AppView) => void;
  handleBackup: () => void;
  onConfirmWipe: () => void;
}

const WipeConfirm: React.FC<WipeProps> = ({ setView, handleBackup, onConfirmWipe }) => {
  return (
    <div className="px-8 py-10 flex flex-col justify-center min-h-[80vh] space-y-12 animate-in slide-in-from-bottom-8 duration-500">
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-red-600 uppercase italic mono leading-none tracking-tighter">
          SURRENDER PROTOCOL
        </h2>
        <div className="w-full h-1 bg-red-950/30" />
      </div>

      <div className="space-y-6">
        <p className="text-lg font-bold text-white mono leading-tight">
          “This will erase everything. Your streak may become ZERO.”
        </p>
        
        <p className="text-sm text-neutral-500 leading-relaxed italic">
          If you plan to return later, export your data before wiping. 
          You can upload this file to continue from where you left off.
        </p>
      </div>

      <div className="space-y-3 flex flex-col pt-8">
        <button 
          onClick={handleBackup}
          className="w-full bg-neutral-900 border border-neutral-800 text-white py-4 font-black uppercase tracking-widest text-xs tap-active"
        >
          Export Data First
        </button>
        
        <button 
          onClick={onConfirmWipe}
          className="w-full bg-red-600 text-white py-5 font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(220,38,38,0.2)] tap-active"
        >
          Confirm Wipe
        </button>

        <button 
          onClick={() => setView('settings')}
          className="w-full text-neutral-600 py-4 font-bold uppercase tracking-widest text-[10px] tap-active"
        >
          Cancel
        </button>
      </div>

      <p className="text-[8px] text-neutral-800 uppercase tracking-[0.5em] text-center font-mono pt-12">
        FINALITY // IRREVERSIBLE
      </p>
    </div>
  );
};

export default WipeConfirm;
