import React, { useState, useEffect, useRef } from "react";
import { 
  Send 
} from "lucide-react";
import { Button, Card, cn } from "../components/UI";
import { UserProfile, ChatMessage } from "../types";
import { useUsers, useMessages, sendMessage } from "../services/supabase";

export const DashboardView = ({ user, setView }: { user: UserProfile, setView?: (v: string) => void }) => {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeUsers = useUsers((data) => {
      // Filter out admins and mentors, and sort by points descending
      const filtered = data.filter(u => u.role !== 'admin' && u.role !== 'mentor');
      const sorted = [...filtered].sort((a, b) => (b.points || 0) - (a.points || 0));
      setTopUsers(sorted.slice(0, 3)); // Only top 3

      // Count pending
      const pending = data.filter(u => u.status === 'pending').length;
      setPendingCount(pending);
    });

    const unsubscribeMessages = useMessages(setMessages);

    return () => {
      unsubscribeUsers();
      unsubscribeMessages();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await sendMessage(newMessage.trim(), user);
      setNewMessage("");
    } catch {
      alert("Failed to send message.");
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return "";
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
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
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold cursor-pointer hover:text-white" onClick={() => setView && setView('Chats')}>Go to Chats Room →</span>
            </div>
            <div ref={scrollRef} className="flex-grow p-6 space-y-6 overflow-y-auto scrollbar-hide">
              {messages.slice(-15).map((msg, idx) => {
                const isMe = msg.senderId === user.uid;
                return (
                  <div key={msg.id || idx} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
                    <img src={msg.senderAvatar} alt="av" className="w-8 h-8 rounded-lg bg-white/5 shrink-0 shadow-lg" referrerPolicy="no-referrer" />
                    <div className={cn("max-w-[85%]", isMe ? "text-right" : "text-left")}>
                      <p className={cn("text-[10px] font-bold mb-1 uppercase tracking-wider", isMe ? "text-white/70" : "text-indigo-400")}>
                        {msg.senderName} <span className="opacity-50 lowercase ml-1">{formatTime(msg.timestamp)}</span>
                      </p>
                      <div className={cn(
                        "rounded-2xl p-4 inline-block shadow-lg text-left",
                        isMe 
                          ? "bg-gradient-to-br from-cyan-600 to-blue-700 rounded-tr-none shadow-cyan-600/20 border border-cyan-400/20" 
                          : "bg-white/5 border border-white/5 rounded-tl-none shadow-black/20"
                      )}>
                        <p className={cn("text-xs leading-relaxed", isMe ? "text-white" : "text-slate-200")}>{msg.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && <p className="text-xs text-white/30 text-center uppercase tracking-widest pt-10">No messages yet.</p>}
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-3 bg-white/2">
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow h-11 bg-white/5 rounded-xl border border-white/10 px-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 transition-all outline-none" 
              />
              <button disabled={!newMessage.trim()} type="submit" className="w-11 h-11 bg-cyan-500 rounded-xl flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </form>
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
              {topUsers.map((leader, i) => {
                const isFirst = i === 0;
                return (
                  <div key={leader.uid} className={cn(
                    "flex items-center gap-3 p-3 border rounded-xl transition-all hover:bg-white/5 cursor-pointer",
                    isFirst ? "border-yellow-500/20 bg-gradient-to-r from-yellow-500/20 to-transparent" : "border-white/5"
                  )}>
                    <span className={cn("font-mono font-bold w-6", isFirst ? "text-yellow-500" : "text-slate-400")}>
                      0{i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 overflow-hidden">
                      <img src={leader.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.displayName}`} alt="p" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-bold">{leader.displayName}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">{leader.points > 40000 ? "Legend" : leader.points > 30000 ? "Pro" : "Coder"} • {leader.points.toLocaleString()} pts</p>
                    </div>
                    {isFirst && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />}
                  </div>
                );
              })}
              {topUsers.length === 0 && (
                 <p className="text-xs text-slate-500 italic">Loading top contributors...</p>
              )}
          </div>
        </Card>

        {/* Admin Alert Card (Persistent Geometric Style) */}
        {((user.role === 'admin' || user.role === 'mentor')) && (
          <div className="bg-[#0B1F3B]/80 rounded-2xl border border-cyan-500/30 p-6 relative overflow-hidden group hover:border-cyan-500/60 transition-all">
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-cyan-400 mb-2 uppercase tracking-widest">{user.role} Alert</h3>
              {user.role === 'admin' ? (
                <p className="text-xs text-slate-300 leading-relaxed">
                  There {pendingCount === 1 ? 'is' : 'are'} <span className="font-bold text-white">{pendingCount} {pendingCount === 1 ? 'user' : 'users'}</span> awaiting registration approval in the hub queue.
                </p>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed">
                  There are <span className="font-bold text-white">active pending submissions</span> currently awaiting review in your portal pipeline.
                </p>
              )}
              <button 
                onClick={() => setView && setView(user.role === 'mentor' ? 'Mentor Portal' : 'Admin Panel')}
                className="mt-6 w-full py-3 bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                {user.role === 'admin' ? "Review Approvals" : "Review Submissions"}
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all" />
          </div>
        )}
      </div>
    </div>
  </div>
  );
};
