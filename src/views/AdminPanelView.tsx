import React, { useState, useEffect } from "react";
import { 
  Users, 
  Megaphone, 
  ShieldCheck,
  Target,
  Plus,
  Trash2,
  ExternalLink,
  Check,
  X,
  PlusCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button, Card, Badge, cn } from "../components/UI";
import { UserProfile, UserStatus, Role, Challenge, ChallengeSubmission, UserProfile as UserType } from "../types";
import { 
  getAllUsers, 
  updateUserByAdmin, 
  ADMIN_EMAIL,
  useChallenges,
  useSubmissions,
  createChallenge,
  deleteChallenge,
  updateSubmissionStatus
} from "../services/supabase";

export const AdminPanelView = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState<'members' | 'challenges' | 'submissions'>('members');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');

  // Challenge Form State
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    difficulty: "Easy" as Challenge['difficulty'],
    points: 500,
    tags: [] as string[],
    tagInput: ""
  });

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers().then(() => setLoading(false));
  }, []);

  useChallenges(setChallenges);
  useSubmissions(setSubmissions);

  const handleUpdateStatus = async (uid: string, status: UserStatus) => {
    await updateUserByAdmin(uid, { status });
    fetchUsers();
  };

  const handleUpdateRole = async (uid: string, role: Role) => {
    await updateUserByAdmin(uid, { role });
    fetchUsers();
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    await createChallenge({
      title: newChallenge.title,
      description: newChallenge.description,
      difficulty: newChallenge.difficulty,
      points: newChallenge.points,
      tags: newChallenge.tags
    });
    setShowChallengeForm(false);
    setNewChallenge({ title: "", description: "", difficulty: "Easy", points: 500, tags: [], tagInput: "" });
  };

  const handleAddTag = () => {
    if (newChallenge.tagInput && !newChallenge.tags.includes(newChallenge.tagInput)) {
      setNewChallenge({ ...newChallenge, tags: [...newChallenge.tags, newChallenge.tagInput], tagInput: "" });
    }
  };

  const getUserName = (uid: string) => users.find(u => u.uid === uid)?.displayName || "Unknown User";

  const filteredUsers = users.filter(u => filter === 'all' || u.status === filter);
  const pendingCount = users.filter(u => u.status === 'pending').length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black">Command Center</h2>
          <p className="text-white/40 text-sm italic">"With great power comes great responsibility." — Uncle Ben</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 overflow-hidden">
          {(['members', 'challenges', 'submissions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveAdminTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative",
                activeAdminTab === tab ? "bg-cyan-primary text-black" : "text-white/40 hover:text-white"
              )}
            >
              {tab}
              {tab === 'submissions' && pendingSubmissions.length > 0 && (
                <span className="ml-2 bg-red-500 text-white px-1.5 rounded-full text-[8px] animate-pulse">
                  {pendingSubmissions.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeAdminTab === 'members' && (
        <>
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'cyan' : 'secondary'} size="sm" onClick={() => setFilter('all')} className="text-[10px] uppercase font-black">All</Button>
            <Button variant={filter === 'pending' ? 'cyan' : 'secondary'} size="sm" onClick={() => setFilter('pending')} className="text-[10px] uppercase font-black relative">
              Pending {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] animate-bounce">{pendingCount}</span>}
            </Button>
            <Button variant={filter === 'suspended' ? 'cyan' : 'secondary'} size="sm" onClick={() => setFilter('suspended')} className="text-[10px] uppercase font-black">Suspended</Button>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2"><Users className="w-4 h-4 text-cyan-primary" /> Member Registry</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead className="bg-white/5 text-[9px] uppercase font-bold tracking-widest text-white/40">
                  <tr>
                    <th className="px-6 py-4">Identity</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.photoURL} alt="p" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" referrerPolicy="no-referrer" />
                          <div><p className="font-bold">{u.displayName}</p><p className="text-[10px] text-white/30">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select value={u.role} onChange={(e) => handleUpdateRole(u.uid, e.target.value as Role)} disabled={u.email === ADMIN_EMAIL} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] uppercase text-cyan-primary outline-none">
                          <option value="student">Student</option><option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.status === 'approved' ? 'success' : u.status === 'pending' ? 'warning' : 'default'}>{u.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {u.status === 'pending' && <Button variant="cyan" size="sm" onClick={() => handleUpdateStatus(u.uid, 'approved')} className="h-7 px-2 text-[8px] font-black uppercase">Approve</Button>}
                          {u.status !== 'suspended' && u.email !== ADMIN_EMAIL && <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(u.uid, 'suspended')} className="h-7 px-2 text-[8px] font-black uppercase">Suspend</Button>}
                          {u.status === 'suspended' && <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(u.uid, 'approved')} className="h-7 px-2 text-[8px] font-black uppercase">Revoke</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {activeAdminTab === 'challenges' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Challenge Repository</h3>
            <Button variant="cyan" onClick={() => setShowChallengeForm(true)}>
              <PlusCircle className="w-4 h-4" /> Create New
            </Button>
          </div>

          <AnimatePresence>
            {showChallengeForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <Card className="bg-white/5 border-cyan-primary/20">
                  <form onSubmit={handleCreateChallenge} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-white/40">Title</label>
                        <input required value={newChallenge.title} onChange={e => setNewChallenge({...newChallenge, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-cyan-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-white/40">Difficulty</label>
                        <select value={newChallenge.difficulty} onChange={e => setNewChallenge({...newChallenge, difficulty: e.target.value as any})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none">
                          <option>Easy</option><option>Medium</option><option>Hard</option><option>Extreme</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-white/40">Description</label>
                      <textarea required value={newChallenge.description} onChange={e => setNewChallenge({...newChallenge, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 h-24 outline-none focus:border-cyan-primary" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-white/40">XP Reward</label>
                        <input type="number" required value={newChallenge.points} onChange={e => setNewChallenge({...newChallenge, points: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-white/40">Tags (Press Enter)</label>
                        <div className="flex gap-2">
                          <input value={newChallenge.tagInput} onChange={e => setNewChallenge({...newChallenge, tagInput: e.target.value})} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none" />
                          <Button type="button" variant="secondary" onClick={handleAddTag}>Add</Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newChallenge.tags.map(t => <Badge key={t} variant="cyan" className="cursor-pointer" onClick={() => setNewChallenge({...newChallenge, tags: newChallenge.tags.filter(tag => tag !== t)})}>{t} ×</Badge>)}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <Button variant="ghost" type="button" onClick={() => setShowChallengeForm(false)}>Cancel</Button>
                      <Button variant="cyan" type="submit">Deploy Challenge</Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-4">
            {challenges.map(c => (
              <Card key={c.id} className="flex items-center justify-between group">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold">{c.title}</h4>
                    <Badge variant={c.difficulty === 'Extreme' ? 'danger' : 'cyan'}>{c.difficulty}</Badge>
                  </div>
                  <p className="text-xs text-white/40 line-clamp-1">{c.description}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                   <Button variant="danger" size="sm" onClick={() => deleteChallenge(c.id)} className="w-8 h-8 p-0"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'submissions' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Review Pipeline</h3>
          {submissions.filter(s => s.status === 'pending').length === 0 ? (
            <Card className="py-20 text-center uppercase font-black tracking-widest text-white/20">All Submissions Reviewed</Card>
          ) : (
            <div className="grid gap-4">
              {submissions.filter(s => s.status === 'pending').map(s => {
                const challenge = challenges.find(c => c.id === s.challengeId);
                return (
                  <Card key={s.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-cyan-primary/40 transition-all">
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-3">
                         <span className="text-cyan-primary font-black text-xs uppercase underline">@{getUserName(s.userId)}</span>
                         <span className="text-white/20">→</span>
                         <span className="text-white/60 font-bold text-sm">{challenge?.title}</span>
                       </div>
                       <p className="text-xs text-white/40 italic">"{s.comment || 'No comment provided'}"</p>
                       <a href={s.solutionLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                         <ExternalLink className="w-3 h-3" /> View Solution Artifact
                       </a>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Button variant="secondary" onClick={() => updateSubmissionStatus(s.id, 'rejected')} className="h-10 px-4 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30">
                        <X className="w-4 h-4" /> Reject
                      </Button>
                      <Button variant="cyan" onClick={() => updateSubmissionStatus(s.id, 'accepted', challenge?.points)} className="h-10 px-4">
                        <Check className="w-4 h-4" /> Approve & Award {challenge?.points} XP
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {submissions.filter(s => s.status !== 'pending').length > 0 && (
             <div className="pt-10">
                <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-4">Historical Archive</h4>
                <div className="overflow-x-auto">
                   <table className="w-full text-[10px] font-mono">
                      <thead className="text-white/20 border-b border-white/5">
                        <tr>
                          <th className="text-left py-2">User</th>
                          <th className="text-left py-2">Challenge</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-right py-2">XP Awarded</th>
                        </tr>
                      </thead>
                      <tbody className="text-white/40 divide-y divide-white/5">
                        {submissions.filter(s => s.status !== 'pending').slice(0, 10).map(s => (
                          <tr key={s.id}>
                            <td className="py-2">@{getUserName(s.userId)}</td>
                            <td className="py-2 truncate max-w-[150px]">{challenges.find(c => c.id === s.challengeId)?.title}</td>
                            <td className="py-2"><Badge variant={s.status === 'accepted' ? 'success' : 'danger'}>{s.status}</Badge></td>
                            <td className="py-2 text-right">+{s.pointsAwarded || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
};
