import React from "react";
import { 
  BookOpen, 
  ExternalLink, 
  Download 
} from "lucide-react";
import { Button, Card, cn } from "../components/UI";

export const ResourcesView = () => (
  <div className="space-y-8">
     <div>
      <h2 className="text-2xl font-black">Knowledge Base</h2>
      <p className="text-white/40 text-sm">Curated tools and tutorials for the modern student.</p>
    </div>
    
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Categories Panel */}
      <div className="lg:col-span-1 space-y-2">
        <h3 className="text-xs uppercase tracking-widest text-white/30 font-bold mb-4">Categories</h3>
        {["All Resources", "Full-Stack Web", "Python & AI", "UI/UX Design", "Game Dev", "Cybersecurity"].map(cat => (
          <button key={cat} className={cn(
            "w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium",
            cat === "All Resources" ? "bg-white/10 text-cyan-primary" : "text-white/50 hover:bg-white/5 hover:text-white"
          )}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
        {[
          { title: "React Core Principles", type: "PDF Guide", icon: BookOpen, color: "text-blue-400" },
          { title: "Google Gemini Flash Tips", type: "Web Tutorial", icon: ExternalLink, color: "text-purple-400" },
          { title: "Tailwind v4 Cheat Sheet", type: "Cheat Sheet", icon: Download, color: "text-cyan-primary" },
          { title: "Supabase Row Level Security", type: "Video Lesson", icon: BookOpen, color: "text-orange-400" },
          { title: "Python for Data Bio", type: "E-Book", icon: BookOpen, color: "text-emerald-400" },
          { title: "Github Workflow Labs", type: "Lab Doc", icon: ExternalLink, color: "text-rose-400" },
        ].map((res, i) => (
          <Card key={i} className="flex flex-col justify-between group">
            <div>
              <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4", res.color)}>
                <res.icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold mb-1 group-hover:text-cyan-primary transition-colors">{res.title}</h4>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{res.type}</p>
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1">Details</Button>
              <Button variant="secondary" size="sm" className="flex-1">Open</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);
