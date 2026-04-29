import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  UserCircle, 
  Camera, 
  ShieldCheck,
  Github,
  Linkedin,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Button, Card, Badge, cn } from "../components/UI";
import { UserProfile, ChallengeSubmission, Challenge } from "../types";
import { updateUserProfile, useSubmissions, useChallenges } from "../services/supabase";

export const ProfileView = ({ user }: { user: UserProfile }) => {
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    bio: user.bio || '',
    github: user.github || '',
    linkedin: user.linkedin || '',
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
    password: '••••••••'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Activity tracking
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useSubmissions(setSubmissions);
  useChallenges(setChallenges);

  // Get user's recent activity (completed challenges)
  const recentActivity = submissions
    .filter(s => s.userId === user.uid && s.status === 'accepted')
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
    .slice(0, 3); // last 3

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile({
        displayName: formData.displayName,
        bio: formData.bio,
        github: formData.github,
        linkedin: formData.linkedin,
        photoURL: formData.photoURL
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const avatarSeeds = ["Felix", "Anya", "Jack", "Riley", "Zoey", "Shadow", "Stahiza", "Coder"];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="w-full md:w-80 p-8 flex flex-col items-center gap-6 text-center bg-[#0B1F3B]/40 backdrop-blur-xl border-white/10">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-cyan-primary/20 shadow-2xl shadow-cyan-primary/10 bg-black/20">
              <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Camera className="w-8 h-8 text-cyan-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Upload New</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <div>
            <h2 className="text-2xl font-black">{user.displayName}</h2>
            <p className="text-cyan-primary font-mono text-[10px] uppercase tracking-[0.2em] mt-1">{user.role} Member</p>
          </div>
          <div className="w-full space-y-2 pt-4 border-t border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Quick Select Avatar</p>
            <div className="grid grid-cols-4 gap-2">
              {avatarSeeds.map(seed => (
                <button 
                  key={seed}
                  type="button"
                  onClick={() => setFormData({ ...formData, photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` })}
                  className={cn(
                    "w-10 h-10 rounded-lg overflow-hidden border transition-all active:scale-90",
                    formData.photoURL.includes(seed) ? "border-cyan-primary p-0.5 bg-cyan-primary/20" : "border-white/10 hover:border-white/30"
                  )}
                >
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seed} className="w-full h-full object-cover rounded" />
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex-1 p-8 bg-[#0B1F3B]/40 backdrop-blur-xl border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <UserCircle className="w-6 h-6 text-cyan-primary" />
              Profile Configuration
            </h3>
            {success && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Badge variant="success">Sync Complete</Badge>
              </motion.div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Public Display Name</label>
              <input 
                name="displayName"
                required
                value={formData.displayName}
                onChange={handleChange}
                placeholder="How should we call you?"
                className="w-full h-12 bg-black/30 border border-white/5 rounded-xl px-4 text-sm focus:border-cyan-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Professional Bio / Tech Stack</label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell the community about your technical journey, interests, or what you're building..."
                className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-sm focus:border-cyan-500 transition-all outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2"><Github className="w-3 h-3" /> GitHub Profile</label>
                <input 
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full h-12 bg-black/30 border border-white/5 rounded-xl px-4 text-sm focus:border-cyan-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2"><Linkedin className="w-3 h-3" /> LinkedIn Profile</label>
                <input 
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full h-12 bg-black/30 border border-white/5 rounded-xl px-4 text-sm focus:border-cyan-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Portal Security Key</label>
              <div className="relative">
                <input 
                  type="password"
                  name="password"
                  disabled
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 bg-black/30 border border-white/5 rounded-xl px-4 text-sm focus:border-white/10 transition-all outline-none opacity-50 cursor-not-allowed"
                />
                <Button variant="ghost" size="sm" type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 text-[10px] uppercase tracking-widest opacity-50">Locked</Button>
              </div>
              <p className="text-[9px] text-white/20 italic">Password changes are currently restricted to secure admin terminals.</p>
            </div>

            <div className="pt-6 flex gap-4">
              <Button 
                variant="cyan" 
                type="submit" 
                className="flex-1 py-4 uppercase text-xs font-black tracking-widest shadow-xl shadow-cyan-primary/20"
                disabled={loading}
              >
                {loading ? 'Processing Sync...' : 'Commit Changes to Hub'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Card className="p-8 bg-[#0B1F3B]/40 backdrop-blur-xl border-white/10">
        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-6">
          <Activity className="w-6 h-6 text-cyan-primary" />
          Recent Activity Tape
        </h3>
        {recentActivity.length === 0 ? (
          <div className="py-10 text-center text-white/40 italic text-sm">
            No logged activities yet. Complete a challenge or submit a project to start building your tape!
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => {
              const matchedChallenge = challenges.find(c => c.id === activity.challengeId);
              return (
                <div key={idx} className="flex gap-4 items-start relative pb-4 custom-timeline">
                  {idx !== recentActivity.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-white/10" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1 bg-black/20 rounded-xl p-4 border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-sm tracking-tight text-white">Finished a Challenge</h4>
                       <span className="text-[10px] text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
                         {new Date(activity.createdAt.seconds * 1000).toLocaleDateString()}
                       </span>
                    </div>
                    <p className="text-xs text-white/60 mb-2">Code solution approved: <span className="text-cyan-400">{matchedChallenge?.title || 'Unknown Challenge'}</span></p>
                    {activity.pointsAwarded && (
                      <Badge variant="cyan">+{activity.pointsAwarded} XP</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {(user.role === 'admin' || user.role === 'mentor') && (
        <Card className={cn(
          "p-8",
          user.role === 'admin' ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"
        )}>
          <div className={cn(
            "flex items-center gap-4 mb-4",
            user.role === 'admin' ? "text-red-400" : "text-emerald-400"
          )}>
            <ShieldCheck className="w-8 h-8" />
            <div>
              <h3 className="font-black uppercase tracking-tight text-lg">
                {user.role === 'admin' ? "Administrative Clearance" : "Mentor Clearance"}
              </h3>
              <p className="text-xs opacity-70">
                {user.role === 'admin' 
                  ? "You have elevated permissions to modify core system parameters."
                  : "You have elevated permissions to review code and manage challenges."}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed italic">
            {user.role === 'admin' 
              ? "\"As an administrator, you are responsible for the integrity of user data. Any changes to profiles are logged for security audits.\""
              : "\"As a mentor, your duty is to guide students and maintain the quality of the challenge repository.\""
            }
          </p>
          <div className="flex flex-wrap gap-4">
             <Button variant="secondary" className="text-xs uppercase font-bold tracking-widest">
               {user.role === 'admin' ? "View Security Logs" : "View Feedback History"}
             </Button>
             {user.role === 'admin' && (
               <Button variant="danger" className="text-xs uppercase font-bold tracking-widest">Global Password Reset</Button>
             )}
          </div>
        </Card>
      )}
    </div>
  );
};
