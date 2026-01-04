
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, UserState, DailyTask, LogEntry, InboxMessage, PenaltyRecord, FocusReport } from './types';
import Dashboard from './components/Dashboard';
import Challenge90 from './components/Challenge90';
import FocusMode from './components/FocusMode';
import DopamineTracker from './components/DopamineTracker';
import SkillBuilder from './components/SkillBuilder';
import JourneyLog from './components/JourneyLog';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import Onboarding from './components/Onboarding';
import AdminPanel from './components/AdminPanel';
import WipeConfirm from './components/WipeConfirm';
import IntroWalkthrough from './components/IntroWalkthrough';
import Inbox from './components/Inbox';
import PenaltyLog from './components/PenaltyLog';

const STORAGE_KEY = 'sos_master_registry_v14';

const generate6DigitCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const createInitialState = (id: string = Date.now().toString()): UserState => ({
  id,
  loginCode: generate6DigitCode(),
  onboarded: false,
  userName: '',
  userAge: '',
  userSource: '',
  hasSeenIntro: false,
  introStep: 0,
  streak: 0,
  lastStreakDate: '',
  lastCheckIn: '',
  lastActiveTimestamp: Date.now(),
  lastDailyCoachMessageDate: '',
  selfScore: 0,
  mainFocus: '',
  coreObjectiveCompleted: false,
  focusSessionsCompletedToday: 0,
  dailyTasks: [],
  challengeDays: new Array(90).fill(false),
  penalty: '50 Pushups immediately',
  inbox: [],
  penaltyHistory: [],
  focusReports: [],
  lastPenaltyCheckDate: '',
  warningSentToday: false,
  selectedSkill: '',
  skillProgress: null,
  dopamineRelapses: {},
  logs: [],
  notifications: {
    focusAlerts: true,
    missedDayWarning: true,
    morningReminder: true
  },
  experimentalFeatures: {},
  systemLogs: [`System Initialized: ${new Date().toISOString()}`]
});

interface GlobalState {
  profiles: UserState[];
  activeProfileId: string | null;
}

const App: React.FC = () => {
  const [globalState, setGlobalState] = useState<GlobalState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profiles && Array.isArray(parsed.profiles)) return parsed;
      } catch (e) {
        console.error("Data restoration failure.", e);
      }
    }
    return { profiles: [], activeProfileId: null };
  });

  const [view, setView] = useState<AppView>('onboarding');
  const [isFocusLocked, setIsFocusLocked] = useState(false);
  const [showFocusBlocker, setShowFocusBlocker] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  }, [globalState]);

  // Daily Reset Check
  useEffect(() => {
    if (globalState.activeProfileId) {
      const today = new Date().toDateString();
      setGlobalState(prev => {
        const userIndex = prev.profiles.findIndex(p => p.id === prev.activeProfileId);
        if (userIndex === -1) return prev;
        
        const user = prev.profiles[userIndex];
        if (user.lastCheckIn !== today) {
          // Reset daily stats
          const updatedUser: UserState = {
            ...user,
            lastCheckIn: today,
            mainFocus: '',
            coreObjectiveCompleted: false,
            focusSessionsCompletedToday: 0,
            warningSentToday: false,
            // Keep daily tasks text but reset completion? Or clear? 
            // "Objective should reset next day" implies mainFocus.
            // Resetting task completion status for consistency.
            dailyTasks: user.dailyTasks.map(t => ({ ...t, completed: false })),
          };
          
          const newProfiles = [...prev.profiles];
          newProfiles[userIndex] = updatedUser;
          return { ...prev, profiles: newProfiles };
        }
        return prev;
      });
    }
  }, [globalState.activeProfileId]); // Only check when active profile changes or on mount

  const activeUser = useMemo(() => {
    if (!globalState.activeProfileId) return createInitialState("guest");
    const found = globalState.profiles.find(p => p.id === globalState.activeProfileId);
    return found || createInitialState("guest");
  }, [globalState.profiles, globalState.activeProfileId]);

  useEffect(() => {
    if (globalState.activeProfileId) {
      const user = globalState.profiles.find(p => p.id === globalState.activeProfileId);
      if (user?.onboarded) {
        if (!isFocusLocked) setView('home');
      } else {
        setView('onboarding');
      }
    } else {
      setView('onboarding');
    }
  }, [globalState.activeProfileId]); 

  const updateActiveUser = useCallback((updates: Partial<UserState>) => {
    if (!globalState.activeProfileId) return;
    setGlobalState(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === prev.activeProfileId ? { ...p, ...updates, lastActiveTimestamp: Date.now() } : p)
    }));
  }, [globalState.activeProfileId]);

  // Admin function to update ANY user
  const adminUpdateUser = (userId: string, updates: Partial<UserState>) => {
    setGlobalState(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === userId ? { ...p, ...updates } : p)
    }));
  };

  const adminBroadcast = (message: InboxMessage) => {
    setGlobalState(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => ({
        ...p,
        inbox: [message, ...p.inbox]
      }))
    }));
  };

  const onRegisterNewUser = (userData: Partial<UserState>) => {
    const newUser = { ...createInitialState(), ...userData, onboarded: true };
    newUser.inbox = [{
      id: `welcome-${Date.now()}`,
      text: `Protocol established. Discipline starts now.`,
      timestamp: Date.now(),
      type: 'System',
      read: false
    }];

    setGlobalState(prev => ({
      ...prev,
      profiles: [...prev.profiles, newUser],
      activeProfileId: newUser.id
    }));
    setView('home');
  };

  const handleLogout = () => {
    if (isFocusLocked) return;
    setGlobalState(prev => ({ ...prev, activeProfileId: null }));
    setView('onboarding');
  };

  const handleDeepWorkLock = (locked: boolean) => {
    setIsFocusLocked(locked);
    if (locked) setView('focus');
  };

  const handleBlockedInteraction = () => {
    if (isFocusLocked) {
      setShowFocusBlocker(true);
    }
  };

  const isOnboarding = view === 'onboarding' || view === 'wipe_confirm';
  const showHeader = activeUser.onboarded && !isOnboarding && view !== 'admin';
  const showNav = activeUser.onboarded && !isOnboarding && view !== 'admin';

  return (
    <div className="min-h-screen bg-[#050505] text-[#737373] font-sans antialiased overflow-hidden relative">
      <div className="max-w-md mx-auto h-screen flex flex-col relative bg-[#050505] shadow-2xl overflow-hidden">
        
        {/* Focus Lock Blockers */}
        {isFocusLocked && (
          <>
            {/* Header Blocker */}
            <div 
              className="absolute top-0 left-0 w-full h-20 z-[60] cursor-not-allowed" 
              onClick={handleBlockedInteraction} 
            />
            {/* Nav Blocker */}
            <div 
              className="absolute bottom-0 left-0 w-full h-24 z-[110] cursor-not-allowed" 
              onClick={handleBlockedInteraction} 
            />
          </>
        )}

        {/* Blocking Popup */}
        {showFocusBlocker && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-red-900/50 p-8 rounded-2xl w-full max-w-xs space-y-6 text-center shadow-2xl">
              <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                 <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-black text-white uppercase italic">Access Denied</h3>
              <p className="text-sm text-neutral-400 font-medium leading-relaxed">
                To go there, finish your work or quit the session.
              </p>
              <div className="grid grid-cols-1 gap-3 pt-2">
                <button 
                  onClick={() => setShowFocusBlocker(false)} 
                  className="w-full py-4 bg-green-600 text-black rounded-xl font-black uppercase tracking-widest text-xs"
                >
                  Finish Work
                </button>
                <button 
                  onClick={() => setShowFocusBlocker(false)} 
                  className="w-full py-4 bg-transparent border border-red-900/40 text-red-600 rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  Close Popup
                </button>
              </div>
            </div>
          </div>
        )}

        {showHeader && (
          <header className={`flex-none bg-[#050505]/80 backdrop-blur-md px-6 py-5 flex justify-between items-center z-40 border-b border-neutral-900/50 ${isFocusLocked ? 'opacity-30 grayscale' : ''}`}>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-[0.2em] text-white mono uppercase no-select leading-none">SOS</h1>
              <p className="text-[7px] font-bold text-neutral-600 tracking-[0.3em] uppercase no-select mt-1.5">Student Operating System</p>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => !isFocusLocked && setView('inbox')} className="relative p-1.5 text-neutral-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {activeUser.inbox.some(m => !m.read) && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#050505]" />}
              </button>
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-green-500 mono leading-none">{activeUser.streak}D</span>
                <span className="text-[7px] uppercase font-bold text-neutral-600 tracking-widest">Streak</span>
              </div>
            </div>
          </header>
        )}

        {activeUser.onboarded && !activeUser.hasSeenIntro && (
          <IntroWalkthrough step={activeUser.introStep} setView={setView} updateState={updateActiveUser} />
        )}

        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {view === 'onboarding' && (
            <Onboarding 
              state={activeUser} 
              updateState={updateActiveUser} 
              setView={setView} 
              handleLoginByCode={(code) => {
                const found = globalState.profiles.find(p => p.loginCode === code);
                if (found) { setGlobalState(prev => ({ ...prev, activeProfileId: found.id })); return true; }
                return false;
              }}
              handleRestore={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (re) => {
                  try {
                    const parsed = JSON.parse(re.target?.result as string);
                    if (parsed.profiles) setGlobalState(parsed);
                  } catch (err) { console.error(err); }
                };
                reader.readAsText(file);
              }}
              onRegister={onRegisterNewUser}
            />
          )}
          
          {view === 'home' && <Dashboard state={activeUser} updateState={updateActiveUser} onViewChange={setView} />}
          {view === 'challenge' && <Challenge90 state={activeUser} updateState={updateActiveUser} />}
          {view === 'focus' && <FocusMode state={activeUser} updateState={updateActiveUser} setView={setView} setFocusLocked={handleDeepWorkLock} isLocked={isFocusLocked} />}
          {view === 'skill' && <SkillBuilder state={activeUser} updateState={updateActiveUser} />}
          {view === 'log' && <JourneyLog state={activeUser} updateState={updateActiveUser} />}
          {view === 'inbox' && <Inbox state={activeUser} updateState={updateActiveUser} setView={setView} />}
          {view === 'penalties' && <PenaltyLog state={activeUser} updateState={updateActiveUser} setView={setView} />}
          {view === 'settings' && (
            <Settings 
              state={activeUser} 
              updateState={updateActiveUser} 
              setView={setView}
              handleWipe={() => setView('wipe_confirm')}
              handleBackup={() => {
                const link = document.createElement('a');
                link.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeUser)));
                link.setAttribute('download', 'sos_data.json');
                link.click();
              }}
              handleRestore={() => {}}
              handleLogout={handleLogout}
            />
          )}

          {view === 'admin' && (
            <AdminPanel 
              profiles={globalState.profiles} 
              updateUser={adminUpdateUser} 
              setView={setView} 
              onExport={() => {
                const link = document.createElement('a');
                link.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(globalState)));
                link.setAttribute('download', `sos_MASTER_EXPORT_${Date.now()}.json`);
                link.click();
              }} 
              onSendNotification={adminBroadcast} 
            />
          )}

          {view === 'wipe_confirm' && (
            <WipeConfirm setView={setView} handleBackup={() => {}} onConfirmWipe={() => {
                const remaining = globalState.profiles.filter(p => p.id !== activeUser.id);
                setGlobalState({ profiles: remaining, activeProfileId: null });
                setView('onboarding');
              }} />
          )}
        </main>

        {showNav && (
          <div className={isFocusLocked ? 'opacity-30 grayscale pointer-events-none' : ''}>
            <Navigation currentView={view} setView={setView} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
