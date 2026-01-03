
import React from 'react';
import { AppView, UserState } from '../types';

interface IntroProps {
  step: number;
  setView: (view: AppView) => void;
  updateState: (updates: Partial<UserState>) => void;
}

const IntroWalkthrough: React.FC<IntroProps> = ({ step, setView, updateState }) => {
  const steps = [
    { view: 'home' as AppView, title: "Home Base", text: "This is your Home. Everything starts here." },
    { view: 'focus' as AppView, title: "Deep Work", text: "This is where real work happens." },
    { view: 'challenge' as AppView, title: "Long-Term", text: "This is your long-term discipline." },
    { view: 'settings' as AppView, title: "Control", text: "You control the rules here." }
  ];

  const current = steps[step];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (step < steps.length - 1) {
      const nextStep = step + 1;
      setView(steps[nextStep].view);
      updateState({ introStep: nextStep });
    } else {
      updateState({ hasSeenIntro: true, introStep: 0 });
      setView('home');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 pointer-events-none overflow-hidden">
      {/* Visual Masking: This is just a simple way to highlight the center areas */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-auto" onClick={handleNext}>
        <div className="w-full max-w-xs bg-neutral-900 border-2 border-green-600 rounded-2xl p-8 shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-sos-entry space-y-6 text-center">
          <div className="space-y-2">
            <h3 className="text-[10px] text-green-500 font-black uppercase tracking-[0.3em]">{current.title}</h3>
            <p className="text-lg font-bold text-white italic mono leading-tight">
              “{current.text}”
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <button 
              onClick={handleNext}
              className="bg-white text-black px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
            >
              {step === steps.length - 1 ? 'Begin Mission' : 'Next Protocol'}
            </button>
            <div className="flex space-x-1.5">
              {steps.map((_, idx) => (
                <div key={idx} className={`h-1 w-3 rounded-full transition-all duration-300 ${idx === step ? 'bg-green-600 w-6' : 'bg-neutral-800'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroWalkthrough;
