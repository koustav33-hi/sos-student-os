
import React, { useState, useMemo } from 'react';
import { UserState, AppView, calculateDisciplineScore, InboxMessage } from '../types';

interface AdminPanelProps {
  profiles: UserState[];
  updateUser: (userId: string, updates: Partial<UserState>) => void;
  setView: (view: AppView) => void;
  onExport: () => void;
  onSendNotification: (message: InboxMessage) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ profiles, setView, onExport, updateUser, onSendNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserState | null>(null);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => 
      p.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.loginCode.includes(searchTerm)
    );
  }, [profiles, searchTerm]);

  const handleSaveUser = () => {
    if (editingUser) {
      updateUser(editingUser.id, editingUser);
      setEditingUser(null);
    }
  };

  const handleBroadcast = () => {
    if (!broadcastText.trim()) return;
    const msg: InboxMessage = {
      id: `admin-bc-${Date.now()}`,
      text: broadcastText,
      timestamp: Date.now(),
      type: 'Admin Broadcast',
      read: false
    };
    onSendNotification(msg);
    setBroadcastText('');
    setShowBroadcast(false);
    alert(`Broadcast sent to ${profiles.length} units.`);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] text-neutral-500 overflow-y-auto animate-in fade-in duration-300">
      <div className="px-6 py-8 space-y-8 min-h-screen">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-neutral-900 pb-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-red-600 mono uppercase tracking-tight">Admin Console</h2>
            <p className="text-[9px] text-neutral-600 uppercase font-bold tracking-[0.2em]">Secure Environment</p>
          </div>
          <button 
            onClick={() => setView('settings')} 
            className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest border border-neutral-800 px-3 py-1.5 rounded hover:text-white hover:border-white transition-all"
          >
            Exit
          </button>
        </header>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setShowBroadcast(true)}
            className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-left hover:border-green-800 transition-colors"
          >
            <p className="text-[9px] font-black uppercase text-green-600 tracking-widest mb-1">Broadcast</p>
            <p className="text-[9px] text-neutral-500">Msg All Users</p>
          </button>
          <button 
            onClick={onExport}
            className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl text-left hover:border-blue-800 transition-colors"
          >
            <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest mb-1">Dump Data</p>
            <p className="text-[9px] text-neutral-500">JSON Export</p>
          </button>
        </div>

        {/* User List */}
        <div className="space-y-6">
          <input 
            placeholder="Search Units (Name/ID)..."
            className="w-full bg-[#0a0a0a] border border-neutral-900 p-4 rounded-xl text-xs text-white mono outline-none focus:border-neutral-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="space-y-3">
            {filteredProfiles.map(user => {
              const score = calculateDisciplineScore(user);
              return (
                <div key={user.id} className="p-5 bg-[#0a0a0a] border border-neutral-900 rounded-2xl flex justify-between items-center group hover:border-neutral-800 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                       <h4 className="text-xs font-bold text-white uppercase tracking-tight">{user.userName || 'Unknown'}</h4>
                       <span className="text-[8px] bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-500 mono">{user.loginCode}</span>
                    </div>
                    <div className="flex space-x-3 text-[9px] text-neutral-600 mono font-medium">
                       <span>Age: {user.userAge}</span>
                       <span>Streak: {user.streak}</span>
                       <span>Score: {score}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingUser(user)}
                    className="bg-neutral-900 text-neutral-400 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                 <h3 className="text-sm font-black text-white uppercase italic">Modify Subject</h3>
                 <span className="text-[9px] text-neutral-600 mono">{editingUser.id}</span>
              </div>
              
              <div className="space-y-3">
                 <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-neutral-500">Name</label>
                    <input 
                      value={editingUser.userName} 
                      onChange={e => setEditingUser({...editingUser, userName: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded text-white text-xs mono"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-neutral-500">Streak Count</label>
                    <input 
                      type="number"
                      value={editingUser.streak} 
                      onChange={e => setEditingUser({...editingUser, streak: parseInt(e.target.value) || 0})}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded text-white text-xs mono"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-neutral-500">Age</label>
                    <input 
                      value={editingUser.userAge} 
                      onChange={e => setEditingUser({...editingUser, userAge: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded text-white text-xs mono"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={handleSaveUser}
                    className="bg-green-600 text-black py-3 rounded font-black uppercase text-[10px] tracking-widest"
                 >
                    Save Changes
                 </button>
                 <button 
                    onClick={() => setEditingUser(null)}
                    className="bg-neutral-900 text-neutral-500 py-3 rounded font-black uppercase text-[10px] tracking-widest"
                 >
                    Cancel
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* Broadcast Modal */}
        {showBroadcast && (
          <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-2xl">
              <h3 className="text-sm font-black text-white uppercase italic">System Broadcast</h3>
              <textarea 
                className="w-full h-32 bg-neutral-900 border border-neutral-800 p-4 rounded text-xs text-white mono outline-none"
                placeholder="Enter message to all units..."
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={handleBroadcast}
                    className="bg-white text-black py-3 rounded font-black uppercase text-[10px] tracking-widest"
                 >
                    Send All
                 </button>
                 <button 
                    onClick={() => setShowBroadcast(false)}
                    className="bg-neutral-900 text-neutral-500 py-3 rounded font-black uppercase text-[10px] tracking-widest"
                 >
                    Cancel
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
