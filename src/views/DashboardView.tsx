import React from "react";
import { 
  Send 
} from "lucide-react";
import { Button, Card, cn } from "../components/UI";
import { UserProfile } from "../types";

export const DashboardView = ({ user }: { user: UserProfile }) => (
  <div className="space-y-8">
    {/* Top Banner */}
    <div className="relative h-32 rounded-2xl bg-gradient-to-r from-cyan-600 to-[#0B1F3B] p-8 flex flex-col justify-center overflow-hidden">
      <div className="absolute right-0 top-0 w-64 h-full bg-white/5 skew-x-[-30deg] translate-x-20 transition-transform duration-1000 animate-pulse" />
      <h1 className="text-3xl font-bold mb-1 tracking-tight">Welcome to Stahiza ICT Hub</h1>
      <p className="text-cyan-100 opacity-80 text-sm">Explore, create, and collaborate with the next generation of tech leaders.</p>
    </div>

    {/* Quick Stats Grid */}
    <div className="grid grid-cols-12 gap-6">
      {[
        { label: "Members", value: "1,248", trend: "+12%", color: "text-green-400", col: "col-span-12 md:col-span-3" },
        { label: "Projects", value: "432", sub: "Active", color: "text-cyan-400", col: "col-span-12 md:col-span-3" },
        { label: "Events", value: "8", sub: "Upcoming", color: "text-orange-400", col: "col-span-12 md:col-span-3" },
        { label: "Hub Points", value: (user.points || 0).toLocaleString(), sub: `${user.displayName.split(' ')[0]} (You)`, color: "text-cyan-400", col: "col-span-12 md:col-span-3", special: true }
      ].map((stat, i) => (
        <Card key={i} className={cn(
          "h-28 flex flex-col justify-between transition-all hover:-translate-y-1",
          stat.col,
          stat.special && "bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/30"
        )}>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{stat.label}</span>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold tracking-tighter leading-none">{stat.value}</span>
            {stat.trend && <span className={cn("text-xs font-bold mb-1", stat.color)}>{stat.trend}</span>}
            {stat.sub && <span className={cn("text-[10px] uppercase font-bold mb-1 opacity-70", stat.color)}>{stat.sub}</span>}
          </div>
        </Card>
      ))}

      {/* Main Dashboard Layout Section */}
      <div className="col-span-12 lg:col-span-7 space-y-6">
        {/* Chat Preview Style Dashboard Card */}
        <div className="bg-[#0B1F3B]/40 backdrop-blur-lg rounded-2xl border border-white/10 flex flex-col h-[400px]">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              ISCCUG Main Community
            </h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">2,401 members</span>
          </div>
          <div className="flex-grow p-6 space-y-6 overflow-y-auto">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 shrink-0 shadow-lg shadow-indigo-500/20" />
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                <p className="text-[10px] font-bold text-indigo-400 mb-1 uppercase tracking-wider">Sarah Jenkins</p>
                <p className="text-xs leading-relaxed text-slate-200">Has anyone checked out the new Web Dev project guidelines? They look intense! 🚀</p>
              </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 shrink-0 shadow-lg shadow-cyan-600/20" />
              <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl rounded-tr-none p-4 max-w-[85%] shadow-[0_8px_20px_rgba(6,182,212,0.15)] border border-cyan-400/20">
                <p className="text-[10px] font-bold text-white/70 mb-1 uppercase tracking-wider">You ({user.role})</p>
                <p className="text-xs leading-relaxed">Just approved them. Don't worry, we'll have a workshop session on Friday to clear everything up.</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-white/5 flex gap-3">
            <div className="flex-grow h-11 bg-white/5 rounded-xl border border-white/10 px-4 flex items-center text-slate-500 text-sm italic group focus-within:border-cyan-500/50 transition-all">Type a message...</div>
            <button className="w-11 h-11 bg-cyan-500 rounded-xl flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column Grid */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        <Card className="p-5 border-white/10 bg-white/5">
          <h3 className="text-xs font-bold mb-5 flex items-center justify-between uppercase tracking-widest text-slate-400">
            Top Contributors
            <span className="text-[10px] text-cyan-400">This Month</span>
          </h3>
          <div className="space-y-3">
            {[
              { rank: "01", name: "Alex Rivers", pts: "12,450", role: "Legend", color: "text-yellow-500", border: "border-yellow-500/20", bg: "from-yellow-500/20" },
              { rank: "02", name: user.displayName, pts: "11,200", role: "Admin", color: "text-slate-400", border: "border-white/5" },
              { rank: "03", name: "Cynthia M.", pts: "9,840", role: "Pro", color: "text-orange-400", border: "border-white/5" }
            ].map((leader, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 p-3 border rounded-xl transition-all hover:bg-white/5 cursor-pointer",
                leader.border,
                leader.bg && `bg-gradient-to-r ${leader.bg} to-transparent`
              )}>
                <span className={cn("font-mono font-bold w-6", leader.color)}>{leader.rank}</span>
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.name}`} alt="p" />
                </div>
                <div className="flex-grow">
                  <p className="text-xs font-bold">{leader.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">{leader.role} • {leader.pts} pts</p>
                </div>
                {leader.rank === "01" && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />}
              </div>
            ))}
          </div>
        </Card>

        {/* Admin Alert Card (Persistent Geometric Style) */}
        <div className="bg-[#0B1F3B]/80 rounded-2xl border border-cyan-500/30 p-6 relative overflow-hidden group hover:border-cyan-500/60 transition-all">
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-cyan-400 mb-2 uppercase tracking-widest">Admin Alert</h3>
            <p className="text-xs text-slate-300 leading-relaxed">There are <span className="font-bold text-white">4 new users</span> awaiting registration approval in the hub queue.</p>
            <button className="mt-6 w-full py-3 bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Review Approvals
            </button>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all" />
        </div>
      </div>
    </div>
  </div>
);
