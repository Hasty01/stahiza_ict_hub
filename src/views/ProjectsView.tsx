import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Sparkles, 
  Clock, 
  Users, 
  UserCheck, 
  Bot, 
  X, 
  Code2, 
  ExternalLink, 
  ChevronRight 
} from "lucide-react";
import { Button, Card, Badge, cn } from "../components/UI";
import { UserProfile, Project } from "../types";
import { 
  useProjects, 
  submitProject, 
  updateProjectStatus 
} from "../services/supabase";
import { evaluateProjectWithAI } from "../services/geminiService";

export const ProjectsView = ({ user }: { user: UserProfile }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isJudging, setIsJudging] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    tags: "" as string,
    repoLink: "",
    dependencies: "" as string
  });

  useProjects(setProjects);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) return;

    const projectData = {
      title: newProject.title,
      description: newProject.description,
      studentName: user.displayName,
      studentId: user.uid,
      tags: newProject.tags.split(",").map(t => t.trim()).filter(t => t),
      dependencies: newProject.dependencies.split(",").map(d => d.trim()).filter(d => d),
      repoLink: newProject.repoLink,
      progress: 0
    };

    setIsSubmitModalOpen(false);
    const proj = await submitProject(projectData);
    
    // Start AI Judging
    setIsJudging(proj.id);
    const result = await evaluateProjectWithAI(proj);
    
    if (result.approved) {
      await updateProjectStatus(proj.id, "approved");
    } else {
      // In a real app we might leave it as pending for manual review or reject it
      console.log("AI Rejected project:", result.reason);
    }
    
    setIsJudging(null);
    setNewProject({ title: "", description: "", tags: "", repoLink: "", dependencies: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Student Projects</h2>
          <p className="text-white/40 text-sm">Showcasing the technical brilliance of our hub.</p>
        </div>
        <Button variant="cyan" onClick={() => setIsSubmitModalOpen(true)} className="shadow-cyan-primary/20">
          <Plus className="w-4 h-4" /> Submit Project
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p, i) => {
          const isPending = p.status === "pending";
          const isUserProject = p.studentId === user.uid;
          const isAdmin = user.role === "admin";

          // Only show approved projects to everyone, pending projects to authors and admins
          if (isPending && !isUserProject && !isAdmin) return null;

          return (
            <Card key={p.id} className={cn(
              "p-0 overflow-hidden flex flex-col group relative",
              isPending && "border-white/5 opacity-80"
            )}>
              {isPending && (
                <div className="absolute top-0 right-0 z-10 p-2">
                  <Badge variant="default" className="bg-amber-500/20 text-amber-500 border-amber-500/30 flex items-center gap-1">
                    {isJudging === p.id ? (
                      <>
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        AI Judging...
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Pending Approval
                      </>
                    )}
                  </Badge>
                </div>
              )}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${p.id}/600/400`} 
                  alt={p.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 pr-20">
                  {p.tags.map(t => <Badge key={t} variant="cyan">{t}</Badge>)}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                  <div 
                    className="h-full bg-cyan-primary shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                    style={{ width: `${p.progress || 0}%` }} 
                  />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-primary transition-colors">{p.title}</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {p.studentName}
                </p>
                <p className="text-xs text-white/60 line-clamp-2 mb-4">{p.description}</p>
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  {isAdmin && isPending && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-emerald-400 hover:text-emerald-300"
                      onClick={() => updateProjectStatus(p.id, "approved")}
                    >
                      <UserCheck className="w-4 h-4" /> Approve
                    </Button>
                  )}
                  <div className="flex-1" />
                  <Button variant="secondary" size="sm" onClick={() => setSelectedProject(p)}>
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#0B1F3B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-primary" />
                  Submit New Project
                </h3>
                <button onClick={() => setIsSubmitModalOpen(false)}><X className="w-5 h-5 opacity-40" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Project Title</label>
                  <input 
                    required
                    type="text" 
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                    placeholder="e.g. Smart School Attendance"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-primary/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe what your project does..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-primary/50 outline-none transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={newProject.tags}
                      onChange={e => setNewProject({...newProject, tags: e.target.value})}
                      placeholder="React, Supabase"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-primary/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Dependencies</label>
                    <input 
                      type="text" 
                      value={newProject.dependencies}
                      onChange={e => setNewProject({...newProject, dependencies: e.target.value})}
                      placeholder="lucide-react, motion"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-primary/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Repository Link</label>
                  <input 
                    type="url" 
                    value={newProject.repoLink}
                    onChange={e => setNewProject({...newProject, repoLink: e.target.value})}
                    placeholder="https://github.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-primary/50 outline-none transition-all"
                  />
                </div>

                <div className="p-4 bg-cyan-primary/5 border border-cyan-primary/20 rounded-xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-cyan-primary shrink-0" />
                  <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                    Your project will be automatically analyzed by the **Stahiza AI Core**. Quality submissions are approved instantly.
                  </p>
                </div>

                <Button type="submit" variant="cyan" className="w-full py-4 mt-2">
                  Submit for AI Review
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0B1F3B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="relative h-64">
                <img src={`https://picsum.photos/seed/${selectedProject.id}/600/400`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3B] to-transparent" />
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition-all border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 -mt-12 relative z-10 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((t: string) => <Badge key={t} variant="cyan">{t}</Badge>)}
                  </div>
                  <h3 className="text-3xl font-black">{selectedProject.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-cyan-primary font-bold uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4 h-4" /> Built by {selectedProject.studentName}
                    </p>
                    {selectedProject.status === "pending" && (
                       <Badge variant="default" className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                          Pending AI Approval
                       </Badge>
                    )}
                  </div>
                </div>

                <p className="text-white/70 leading-relaxed italic border-l-2 border-white/10 pl-4">
                  {selectedProject.description}
                </p>

                {/* Vast Progress Engine */}
                <Card className="bg-white/5 border-white/5 p-6 space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                       <p className="text-[10px] uppercase font-black text-cyan-primary tracking-widest">Development Milestone</p>
                       <h4 className="text-sm font-bold">System Completion Status</h4>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black text-white leading-none">{selectedProject.progress || 0}%</p>
                       <p className="text-[8px] uppercase font-bold text-white/20">Operational</p>
                    </div>
                  </div>
                  <div className="relative h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 p-1">
                    <motion.div 
                      key={selectedProject.id}
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedProject.progress || 0}%` }}
                      className="h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] relative"
                    >
                       <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_2s_linear_infinite]" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-[8px] uppercase font-black text-white/20 tracking-tighter">
                     <span>Deployment Core</span>
                     <span>Full Release</span>
                  </div>
                </Card>

                {/* Technology Stack & Dependencies */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/60 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-primary/10 flex items-center justify-center text-cyan-primary">
                        <Code2 className="w-4 h-4" />
                      </div>
                      Dependencies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.dependencies?.map((dep: string) => (
                        <span key={dep} className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold border border-white/10 text-white/80 hover:bg-white/10 hover:border-cyan-primary/30 transition-all cursor-default">
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/60 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                      Repository
                    </h4>
                    {selectedProject.repoLink ? (
                      <a 
                        href={selectedProject.repoLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group block p-4 bg-black/40 border border-white/10 rounded-xl hover:border-cyan-primary/50 transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Source Code</p>
                            <p className="text-xs font-bold text-white group-hover:text-cyan-primary transition-colors truncate">
                              {selectedProject.repoLink.replace('https://github.com/', '')}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-cyan-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </a>
                    ) : (
                      <div className="p-4 bg-black/20 border border-dashed border-white/5 rounded-xl text-center">
                        <p className="text-[10px] text-white/20 italic uppercase font-black">No Repository Indexed</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <Button variant="cyan" className="flex-1 py-6 text-sm">Launch Live Demo</Button>
                  <Button variant="secondary" className="flex-1 py-6 text-sm">Download Assets</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
