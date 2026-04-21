import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  UserCircle, 
  Camera, 
  ShieldCheck 
} from "lucide-react";
import { Button, Card, Badge, cn } from "../components/UI";
import { UserProfile } from "../types";
import { updateUserProfile } from "../services/supabase";

export const ProfileView = ({ user }: { user: UserProfile }) => {
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    bio: user.bio || '',
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
    password: '••••••••'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile({
        displayName: formData.displayName,
        bio: formData.bio,
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

      {user.role === 'admin' && (
        <Card className="p-8 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-4 mb-4 text-red-400">
            <ShieldCheck className="w-8 h-8" />
            <div>
              <h3 className="font-black uppercase tracking-tight text-lg">Administrative Clearance</h3>
              <p className="text-xs opacity-70">You have elevated permissions to modify core system parameters.</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed italic">
            "As an administrator, you are responsible for the integrity of user data. Any changes to profiles are logged for security audits."
          </p>
          <div className="flex gap-4">
             <Button variant="secondary" className="text-xs uppercase font-bold tracking-widest">View Security Logs</Button>
             <Button variant="danger" className="text-xs uppercase font-bold tracking-widest">Global Password Reset</Button>
          </div>
        </Card>
      )}
    </div>
  );
};
