import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Megaphone, 
  Plus, 
  AlertCircle, 
  Calendar, 
  Info, 
  Bell, 
  Trash2, 
  X 
} from "lucide-react";
import { format } from "date-fns";
import { Button, Card, Badge, cn } from "../components/UI";
import { UserProfile, Announcement } from "../types";
import { 
  useAnnouncements, 
  createAnnouncement, 
  deleteAnnouncement 
} from "../services/supabase";

export const AnnouncementsView = ({ user }: { user: UserProfile }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<'All' | Announcement['category']>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    content: '',
    category: 'General' as Announcement['category'],
    priority: 'low' as Announcement['priority']
  });

  useAnnouncements(setAnnouncements);

  const filtered = filter === 'All' 
    ? announcements 
    : announcements.filter(a => a.category === filter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAnnouncement({
      ...newAnn,
      authorId: user.uid
    });
    setNewAnn({ title: '', content: '', category: 'General', priority: 'low' });
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this announcement?")) {
      await deleteAnnouncement(id);
    }
  };

  const getIcon = (category: Announcement['category']) => {
    switch (category) {
      case 'System Update': return AlertCircle;
      case 'Event Reminder': return Calendar;
      case 'General': return Info;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-cyan-primary bg-cyan-primary/10 border-cyan-primary/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Hub News_</h2>
          <p className="text-white/40 text-sm italic">Official transmissions for the Stahiza ICT Community.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {['All', 'System Update', 'Event Reminder', 'General'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as any)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] uppercase font-black tracking-widest transition-all",
                  filter === cat ? "bg-cyan-primary text-black shadow-lg shadow-cyan-primary/20" : "text-white/40 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          {user.role === 'admin' && (
            <Button variant="cyan" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" /> Post
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl opacity-40">
            <Megaphone className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm">No announcements found in this category.</p>
          </div>
        ) : (
          filtered.map((ann) => {
            const Icon = getIcon(ann.category);
            return (
              <Card key={ann.id} className={cn(
                "group relative overflow-hidden transition-all hover:border-white/20",
                ann.priority === 'high' && "border-rose-500/30 bg-rose-500/[0.02]"
              )}>
                <div className="flex gap-6 items-start">
                  <div className={cn(
                    "w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                    getPriorityColor(ann.priority)
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                            getPriorityColor(ann.priority)
                          )}>
                            {ann.priority}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-primary">{ann.category}</span>
                        </div>
                        <h3 className="text-xl font-bold group-hover:text-cyan-primary transition-colors cursor-default">{ann.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-none">
                          {format(new Date(ann.createdAt.seconds * 1000), "dd MMM yyyy")}
                        </p>
                        {user.role === 'admin' && (
                          <button 
                            onClick={() => handleDelete(ann.id)}
                            className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-white/60 leading-relaxed text-sm">{ann.content}</p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0B1F3B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Megaphone className="w-6 h-6 text-cyan-primary" />
                  New Broadcast_
                </h3>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 opacity-40" /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Title</label>
                  <input 
                    required
                    maxLength={100}
                    type="text" 
                    value={newAnn.title}
                    onChange={e => setNewAnn({...newAnn, title: e.target.value})}
                    placeholder="Brief headline..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-cyan-primary/50 outline-none transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Category</label>
                    <select
                      value={newAnn.category}
                      onChange={e => setNewAnn({...newAnn, category: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-cyan-primary/50 outline-none transition-all font-bold text-xs appearance-none"
                    >
                      <option value="General">General</option>
                      <option value="System Update">System Update</option>
                      <option value="Event Reminder">Event Reminder</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Priority</label>
                    <select
                      value={newAnn.priority}
                      onChange={e => setNewAnn({...newAnn, priority: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-cyan-primary/50 outline-none transition-all font-bold text-xs appearance-none text-rose-400"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-white/40 ml-1">Content</label>
                  <textarea 
                    required
                    rows={4}
                    value={newAnn.content}
                    onChange={e => setNewAnn({...newAnn, content: e.target.value})}
                    placeholder="Full announcement body..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-cyan-primary/50 outline-none transition-all resize-none text-sm"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1 h-14">Cancel</Button>
                  <Button variant="cyan" type="submit" className="flex-1 h-14 uppercase tracking-widest">Broadcast Now</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
