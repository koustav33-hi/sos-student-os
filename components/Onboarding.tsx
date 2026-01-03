
import React, { useState, useRef, useEffect } from 'react';
import { UserState, AppView } from '../types';

interface OnboardingProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
  setView: (view: AppView) => void;
  handleLoginByCode: (code: string) => boolean;
  handleRestore: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRegister?: (userData: Partial<UserState>) => void;
  initialIsLogin?: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ state, updateState, setView, handleLoginByCode, handleRestore, onRegister, initialIsLogin }) => {
  const [step, setStep] = useState(1);
  const [isLoginView, setIsLoginView] = useState(initialIsLogin || false);
  const [loginCode, setLoginCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    if (initialIsLogin) setIsLoginView(true);
  }, [initialIsLogin]);

  const nextStep = () => {
    if (step === 1) {
      if (!name || !age || !source) return alert("Fill all fields.");
      if (onRegister) {
        onRegister({ 
          userName: name, 
          userAge: age, 
          userSource: source,
          onboarded: true,
          hasSeenIntro: false,
          introStep: 0
        });
        setView('home');
        return;
      }
      updateState({ userName: name, userAge: age, userSource: source, onboarded: true });
      setView('home');
    } else {
      updateState({ onboarded: true });
      setView('home');
    }
  };

  const attemptLogin = () => {
    if (!loginCode) return;
    const success = handleLoginByCode(loginCode);
    if (!success) alert("Invalid code. Check and try again.");
  };

  if (isLoginView) {
    return (
      <div className="px-8 py-10 flex flex-col justify-center min-h-[70vh] space-y-12 animate-in fade-in duration-500">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white uppercase italic mono leading-none tracking-tighter">Recover Access</h2>
          <div className="w-12 h-1 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
        </div>

        {/* Option 1: Login with Code */}
        <section className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Option 01: 6-Digit System Code</p>
            <input 
              autoFocus
              type="text" 
              placeholder="000000" 
              maxLength={6}
              className="w-full bg-neutral-900 border border-neutral-800 p-6 rounded text-center text-4xl text-white mono outline-none focus:border-green-500 tracking-[0.5em]"
              value={loginCode} 
              onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button 
            onClick={attemptLogin}
            className="w-full bg-green-600 text-black py-4 font-black uppercase tracking-widest text-xs rounded tap-active"
          >
            Authorize Access
          </button>
        </section>

        <div className="flex items-center space-x-4">
          <div className="flex-1 h-[1px] bg-neutral-900" />
          <span className="text-[8px] text-neutral-700 font-bold uppercase tracking-widest">OR</span>
          <div className="flex-1 h-[1px] bg-neutral-900" />
        </div>

        {/* Option 2: Restore from Exported Data */}
        <section className="space-y-4">
          <div className="space-y-1 text-center">
            <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Option 02: Legacy Restore</p>
            <p className="text-[8px] text-neutral-700 uppercase italic">Upload your .json export file</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-neutral-950 border border-neutral-900 text-white py-4 font-black uppercase tracking-widest text-xs rounded hover:bg-neutral-900 transition-colors tap-active"
          >
            Import Exported Data
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleRestore} 
            accept=".json" 
            className="hidden" 
          />
        </section>

        <div className="pt-8 text-center">
          <button 
            onClick={() => setIsLoginView(false)}
            className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest hover:text-white transition-colors"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 flex flex-col justify-center min-h-[70vh] space-y-10 animate-in fade-in duration-500">
      <div className="space-y-8">
        <h2 className="text-3xl font-black text-white uppercase italic mono leading-none tracking-tighter">Initialize System</h2>
        <div className="space-y-4">
          <input 
            type="text" placeholder="NAME" 
            className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded text-white mono outline-none focus:border-green-500"
            value={name} onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="number" placeholder="AGE" 
            className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded text-white mono outline-none focus:border-green-500"
            value={age} onChange={(e) => setAge(e.target.value)}
          />
          <select 
            className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded text-white mono outline-none focus:border-green-500"
            value={source} onChange={(e) => setSource(e.target.value)}
          >
            <option value="">HOW DID YOU HEAR ABOUT SOS?</option>
            <option value="friend">FRIEND</option>
            <option value="social">SOCIAL MEDIA</option>
            <option value="search">SEARCH</option>
            <option value="other">OTHER</option>
          </select>
        </div>
        <div className="pt-4 text-center">
          <button 
            onClick={() => setIsLoginView(true)}
            className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest hover:text-white transition-colors"
          >
            Already a subject? Login
          </button>
        </div>
      </div>

      <button 
        onClick={nextStep}
        className="w-full bg-green-600 text-black py-4 font-black uppercase tracking-widest text-xs tap-active shadow-[0_0_20px_rgba(34,197,94,0.15)]"
      >
        ENTER SYSTEM
      </button>
    </div>
  );
};

export default Onboarding;
