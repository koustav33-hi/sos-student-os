
import React, { useState } from 'react';
import { UserState } from '../types';
import { generateMicroTask } from '../services/geminiService';

interface SkillProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
}

const SkillBuilder: React.FC<SkillProps> = ({ state, updateState }) => {
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState(state.selectedSkill);

  const setSkill = () => {
    if (skillInput) {
      updateState({ selectedSkill: skillInput, skillProgress: null });
    }
  };

  const getDailyTask = async () => {
    if (!state.selectedSkill) return;
    setLoading(true);
    const task = await generateMicroTask(state.selectedSkill);
    updateState({
      skillProgress: {
        name: state.selectedSkill,
        currentTask: task,
        generatedDate: new Date().toDateString()
      }
    });
    setLoading(false);
  };

  const hasTaskToday = state.skillProgress?.generatedDate === new Date().toDateString();

  return (
    <div className="p-6 space-y-8">
      <header>
        <h2 className="text-xl font-bold text-white mono uppercase italic">Skill Factory</h2>
        <p className="text-xs text-neutral-500 mt-1 uppercase">Select ONE. Mastering everything means mastering nothing.</p>
      </header>

      {!state.selectedSkill ? (
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Skill (e.g., Python, Piano, Boxing)..." 
            className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded text-white mono outline-none focus:border-green-800"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
          />
          <button 
            onClick={setSkill}
            className="w-full bg-green-600 text-black font-black uppercase tracking-widest p-4 rounded text-xs"
          >
            Lock In Choice
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center p-4 bg-neutral-900 border border-neutral-800 rounded">
            <span className="text-xs uppercase text-neutral-500 font-bold">Selected</span>
            <span className="text-sm font-black mono text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.2)]">{state.selectedSkill}</span>
          </div>

          <div className="p-8 border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-6">
            {!hasTaskToday ? (
              <>
                <p className="text-xs text-neutral-500 uppercase tracking-widest px-4">Generate your specific 30-min objective for today.</p>
                <button 
                  disabled={loading}
                  onClick={getDailyTask}
                  className="bg-green-600 text-black px-8 py-3 rounded text-xs font-black uppercase tracking-widest disabled:opacity-50 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                >
                  {loading ? 'CALCULATING...' : 'GENERATE TASK'}
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] bg-green-900/30 text-green-500 px-2 py-1 rounded uppercase font-bold tracking-tighter border border-green-800/30">Mission Active</span>
                <p className="text-lg font-bold text-white mono italic leading-tight">"{state.skillProgress?.currentTask}"</p>
                <p className="text-[10px] text-neutral-600 uppercase">NO PROGRESS BARS. NO CERTIFICATES. JUST WORK.</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => updateState({ selectedSkill: '', skillProgress: null })}
            className="text-[10px] text-neutral-700 uppercase font-bold hover:text-red-500 transition-colors"
          >
            Reset Skill Selection (Loss of focus)
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillBuilder;
