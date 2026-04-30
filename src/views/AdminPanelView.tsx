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
  PlusCircle,
  Edit2,
  Search,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button, Card, Badge, cn } from "../components/UI";
import { UserProfile, UserStatus, Role, Challenge, ChallengeSubmission, Project, UserProfile as UserType } from "../types";
import { 
  getAllUsers, 
  updateUserByAdmin, 
  deleteUserByAdmin,
  ADMIN_EMAIL,
  useChallenges,
  useSubmissions,
  useUsers,
  useProjects,
  createChallenge,
  deleteChallenge,
  updateChallenge,
  updateSubmissionStatus,
  updateProjectStatus,
  deleteProject
} from "../services/supabase";

export const AdminPanelView = ({ user }: { user?: UserProfile }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [successFeedbackId, setSuccessFeedbackId] = useState<string | null>(null);
  
  // Mentors start on challenges. Admins start on members.
  const [activeAdminTab, setActiveAdminTab] = useState<'members' | 'challenges' | 'submissions' | 'leaderboard' | 'projects'>(
    user?.role === 'mentor' ? 'challenges' : 'members'
  );
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'suspended' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  // Challenge Form State
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    difficulty: "Easy" as Challenge['difficulty'],
    points: 500,
    tags: [] as string[],
    tagInput: ""
  });

  useEffect(() => {
    const unsubscribe = useUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useChallenges(setChallenges);
  useSubmissions(setSubmissions);
  useProjects(setProjects);

  const handleUpdateStatus = async (uid: string, status: UserStatus) => {
    setUpdatingUserId(uid);
    try {
      await updateUserByAdmin(uid, { status });
      setSuccessFeedbackId(uid);
      setTimeout(() => setSuccessFeedbackId(null), 2000);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUpdateRole = async (uid: string, role: Role) => {
    setUpdatingUserId(uid);
    try {
      await updateUserByAdmin(uid, { role });
      setSuccessFeedbackId(uid);
      setTimeout(() => setSuccessFeedbackId(null), 2000);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (window.confirm("Are you sure you want to permanently delete this user's profile?")) {
      setUpdatingUserId(uid);
      try {
        await deleteUserByAdmin(uid);
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  const handleSaveChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChallengeId) {
      await updateChallenge(editingChallengeId, {
        title: newChallenge.title,
        description: newChallenge.description,
        difficulty: newChallenge.difficulty,
        points: newChallenge.points,
        tags: newChallenge.tags
      });
    } else {
      await createChallenge({
        title: newChallenge.title,
        description: newChallenge.description,
        difficulty: newChallenge.difficulty,
        points: newChallenge.points,
        tags: newChallenge.tags
      });
    }
    closeChallengeForm();
  };

  const closeChallengeForm = () => {
    setShowChallengeForm(false);
    setEditingChallengeId(null);
    setNewChallenge({ title: "", description: "", difficulty: "Easy", points: 500, tags: [], tagInput: "" });
  };

  const openEditChallengeForm = (c: Challenge) => {
    setNewChallenge({
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      points: c.points,
      tags: c.tags,
      tagInput: ""
    });
    setEditingChallengeId(c.id);
    setShowChallengeForm(true);
  };

  const openNewChallengeForm = () => {
    setNewChallenge({ title: "", description: "", difficulty: "Easy", points: 500, tags: [], tagInput: "" });
    setEditingChallengeId(null);
    setShowChallengeForm(true);
  };

  const handleAddTag = () => {
    if (newChallenge.tagInput && !newChallenge.tags.includes(newChallenge.tagInput)) {
      setNewChallenge({ ...newChallenge, tags: [...newChallenge.tags, newChallenge.tagInput], tagInput: "" });
    }
  };

  const getUserName = (uid: string) => users.find(u => u.uid === uid)?.displayName || "Unknown User";

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'all' || u.status === filter;
    const matchesSearch = 
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const pendingCount = users.filter(u => u.status === 'pending').length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black">Command Center</h2>
          <p className="text-white/40 text-sm italic">"With great power comes great responsibility." — Uncle Ben</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 overflow-hidden overflow-x-auto whitespace-nowrap">
          {(['members', 'projects', 'challenges', 'submissions', 'leaderboard'] as const).filter(tab => user?.role === 'admin' || tab !== 'members').map(tab => (
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

      {(activeAdminTab === 'members' && user?.role === 'admin') && (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button variant={filter === 'all' ? 'cyan' : 'secondary'} size="sm" onClick={() => setFilter('all')} className="text-[10px] uppercase font-black">All</Button>
              <Button variant={filter === 'pending' ? 'cyan' : 'secondary'} size="sm" onClick={() => setFilter('pending')} className="text-[10px] uppercase font-black relative">
                Pending {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] animate-bounce">{pendingCount}</span>}
              </Button>
              <Button variant={filter === 'approved' ? 'cyan' : 'secondary'} size="sm" onClick={() => setFilter('approved')} className="text-[10px] uppercase font-black">Approved</Button>
              <Button variant={filter === 'suspended' ? 'cyan' : 'secondary'} size="sm" onClick={() => setFilter('suspended')} className="text-[10px] uppercase font-black">Suspended</Button>
              <Button variant={filter === 'rejected' ? 'cyan' : 'secondary'} size="sm" onClick={() => setFilter('rejected')} className="text-[10px] uppercase font-black">Rejected</Button>
            </div>

            <div className="w-full md:w-80 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2 text-xs font-mono outline-none focus:border-cyan-primary group-hover:border-white/20 transition-all placeholder:text-white/20"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              {!searchQuery && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 items-center pointer-events-none opacity-20">
                  <span className="text-[10px] font-black border border-white/20 rounded px-1 group-focus-within:border-cyan-primary group-focus-within:text-cyan-primary transition-colors">/</span>
                </div>
              )}
            </div>
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
                    <tr 
                      key={u.uid} 
                      className={cn(
                        "hover:bg-white/5 transition-colors group relative",
                        updatingUserId === u.uid && "animate-pulse bg-white/10 opacity-70 cursor-wait",
                        successFeedbackId === u.uid && "bg-emerald-500/10 border-l-2 border-emerald-500"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={u.photoURL} alt="p" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" referrerPolicy="no-referrer" />
                            {updatingUserId === u.uid && (
                              <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-cyan-primary border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold">{u.displayName}</p>
                              {successFeedbackId === u.uid && (
                                <motion.span 
                                  initial={{ opacity: 0, scale: 0 }} 
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="text-[8px] bg-emerald-500 text-white px-1 rounded font-black uppercase tracking-widest"
                                >
                                  Synced
                                </motion.span>
                              )}
                            </div>
                            <p className="text-[10px] text-white/30">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={u.role} 
                          onChange={(e) => handleUpdateRole(u.uid, e.target.value as Role)} 
                          disabled={u.email === ADMIN_EMAIL || updatingUserId === u.uid} 
                          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] uppercase text-cyan-primary outline-none disabled:opacity-50"
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.status === 'approved' ? 'success' : u.status === 'pending' ? 'warning' : u.status === 'rejected' ? 'danger' : 'default'}>
                          {updatingUserId === u.uid ? "Syncing..." : u.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-nowrap">
                          {u.status === 'pending' && (
                            <>
                              <Button disabled={updatingUserId === u.uid} variant="cyan" size="sm" onClick={() => handleUpdateStatus(u.uid, 'approved')} className="h-7 px-2 text-[8px] font-black uppercase">Approve</Button>
                              <Button disabled={updatingUserId === u.uid} variant="danger" size="sm" onClick={() => handleUpdateStatus(u.uid, 'rejected')} className="h-7 px-2 text-[8px] font-black uppercase bg-red-600 border-red-600/50">Reject</Button>
                            </>
                          )}
                          {u.status === 'rejected' && <Button disabled={updatingUserId === u.uid} variant="secondary" size="sm" onClick={() => handleUpdateStatus(u.uid, 'pending')} className="h-7 px-2 text-[8px] font-black uppercase">Re-evaluate</Button>}
                          {u.status !== 'suspended' && u.email !== ADMIN_EMAIL && u.status !== 'pending' && u.status !== 'rejected' && <Button disabled={updatingUserId === u.uid} variant="secondary" size="sm" onClick={() => handleUpdateStatus(u.uid, 'suspended')} className="h-7 px-2 text-[8px] font-black uppercase text-yellow-500">Suspend</Button>}
                          {u.status === 'suspended' && <Button disabled={updatingUserId === u.uid} variant="secondary" size="sm" onClick={() => handleUpdateStatus(u.uid, 'approved')} className="h-7 px-2 text-[8px] font-black uppercase">Revoke</Button>}
                          {u.email !== ADMIN_EMAIL && (
                            <Button disabled={updatingUserId === u.uid} variant="danger" size="sm" onClick={() => handleDeleteUser(u.uid)} className="h-7 px-2" title="Delete User">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-white/20 uppercase font-black tracking-widest">
                        No members found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
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
            <Button variant="cyan" onClick={openNewChallengeForm}>
              <PlusCircle className="w-4 h-4" /> Create New
            </Button>
          </div>

          <AnimatePresence>
            {showChallengeForm && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <Card className="bg-white/5 border-cyan-primary/20">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-cyan-400">{editingChallengeId ? 'Edit Challenge' : 'Deploy New Challenge'}</h4>
                  </div>
                  <form onSubmit={handleSaveChallenge} className="space-y-4">
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
                      <Button variant="ghost" type="button" onClick={closeChallengeForm}>Cancel</Button>
                      <Button variant="cyan" type="submit">{editingChallengeId ? 'Update Challenge' : 'Deploy Challenge'}</Button>
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
                    <Badge variant="secondary" className="px-1.5">{c.points} XP</Badge>
                  </div>
                  <p className="text-xs text-white/40 line-clamp-1">{c.description}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                   <Button variant="secondary" size="sm" onClick={() => openEditChallengeForm(c)} className="w-8 h-8 p-0" title="Edit Challenge"><Edit2 className="w-4 h-4" /></Button>
                   <Button variant="danger" size="sm" onClick={() => deleteChallenge(c.id)} className="w-8 h-8 p-0" title="Delete Challenge"><Trash2 className="w-4 h-4" /></Button>
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
      {activeAdminTab === 'projects' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Innovation Portfolio Management</h3>
          <div className="grid gap-4">
            {projects.map(p => (
              <Card key={p.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h4 className="font-bold">{p.title}</h4>
                   <p className="text-xs text-white/40 mb-2 font-mono uppercase tracking-tighter">Contributor: {p.studentName || 'Unknown Student'}</p>
                  <p className="text-xs text-white/60 max-w-xl">{p.description}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant={p.status === 'approved' ? 'success' : 'warning'}>{p.status}</Badge>
                    {p.repoLink && <a href={p.repoLink} className="text-[10px] text-cyan-primary flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" /> Source Code</a>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.status === 'pending' && (
                    <Button variant="cyan" size="sm" onClick={() => updateProjectStatus(p.id, 'approved')}>Approve</Button>
                  )}
                  {p.status === 'approved' && (
                    <Button variant="secondary" size="sm" onClick={() => updateProjectStatus(p.id, 'pending')}>Mark Pending</Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => deleteProject(p.id)} className="w-8 h-8 p-0"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            ))}
            {projects.length === 0 && <Card className="py-20 text-center text-white/20 uppercase font-black tracking-widest">No projects submitted yet</Card>}
          </div>
        </div>
      )}
      {activeAdminTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Top 3 Contributors</h3>
            <Badge variant="cyan">Real-time Data</Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {users
              .filter(u => u.role !== 'admin' && u.status === 'approved')
              .sort((a, b) => (b.points || 0) - (a.points || 0))
              .slice(0, 3)
              .map((u, index) => (
                <Card key={u.uid} className={cn(
                  "relative flex flex-col items-center p-8 text-center",
                  index === 0 && "border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 to-transparent",
                  index === 1 && "border-slate-400/30 bg-gradient-to-b from-slate-400/10 to-transparent",
                  index === 2 && "border-orange-500/30 bg-gradient-to-b from-orange-500/10 to-transparent"
                )}>
                  {index === 0 && <div className="absolute top-0 right-0 p-4"><div className="w-4 h-4 text-yellow-500 font-bold text-xl leading-none">#1</div></div>}
                  {index === 1 && <div className="absolute top-0 right-0 p-4"><div className="w-4 h-4 text-slate-400 font-bold text-xl leading-none">#2</div></div>}
                  {index === 2 && <div className="absolute top-0 right-0 p-4"><div className="w-4 h-4 text-orange-500 font-bold text-xl leading-none">#3</div></div>}
                  <img src={u.photoURL} alt={u.displayName} className="w-20 h-20 rounded-full border-4 border-white/5 mb-4" referrerPolicy="no-referrer" />
                  <h4 className="font-black text-lg mb-1">{u.displayName}</h4>
                  <p className="text-sm font-mono text-cyan-primary mb-4">{u.points.toLocaleString()} XP</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">{u.email}</p>
                </Card>
              ))
            }
            {users.filter(u => u.role !== 'admin' && u.status === 'approved').length === 0 && (
              <p className="text-white/40 col-span-3 text-center py-10">No students are on the leaderboard yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
