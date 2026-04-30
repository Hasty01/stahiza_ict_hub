import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Smile, 
  Paperclip, 
  Send 
} from "lucide-react";
import { Button, Card, cn } from "../components/UI";
import { UserProfile, ChatMessage } from "../types";
import { useMessages, sendMessage, deleteMessage } from "../services/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Trash2 } from "lucide-react";

export const ChatsView = ({ user }: { user: UserProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Purge this message from hub?")) {
      try {
        await deleteMessage(id);
      } catch (err) {
        alert("Failed to delete message");
      }
    }
  };

  useEffect(() => {
    return useMessages(setMessages);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage.trim(), user);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return "";
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-6 overflow-hidden">
      {/* Community Info Panel */}
      <div className="hidden lg:flex w-72 flex-col gap-6">
        <Card className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-primary/10 flex items-center justify-center border border-cyan-primary/20">
            <MessageSquare className="w-6 h-6 text-cyan-primary" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight">Main Hub</h3>
            <p className="text-xs text-white/40">The heart of Stahiza ICT. Share ideas, ask for help, and collaborate.</p>
          </div>
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/20">
              <span>Channel Stability</span>
              <span className="text-emerald-500">99.9%</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[99.9%]" />
            </div>
          </div>
        </Card>
        
        <Card className="flex-1 p-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-primary mb-4">Active Protocol</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-white/60">Community standards active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-xs font-medium text-white/60">Low latency uplink</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="flex-1 p-0 flex flex-col overflow-hidden border-cyan-primary/10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-primary flex items-center justify-center text-black font-black italic">SH</div>
            <div>
              <h4 className="font-bold text-sm">Community Terminal</h4>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] text-white/40 font-mono tracking-tight uppercase">Live Connection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Space */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#070F1F]/50"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === user.uid;
              return (
                <motion.div 
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex gap-3",
                    isMe ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <img 
                    src={msg.senderAvatar} 
                    alt="P" 
                    className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 shrink-0 self-end"
                    referrerPolicy="no-referrer"
                  />
                  <div className={cn(
                    "max-w-[75%] space-y-1",
                    isMe ? "items-end" : "items-start"
                  )}>
                    {!isMe && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-primary ml-1">
                        {msg.senderName}
                      </span>
                    )}
                    <div className={cn(
                      "group relative px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      isMe 
                        ? "bg-cyan-primary text-black rounded-br-none font-medium shadow-[0_8px_20px_rgba(6,182,212,0.2)]" 
                        : "bg-white/5 border border-white/5 rounded-bl-none text-white/80"
                    )}>
                      {msg.text}
                      
                      {user.role === 'admin' && (
                        <button 
                          onClick={() => handleDelete(msg.id)}
                          className={cn(
                            "absolute -top-2 opacity-0 group-hover:opacity-100 transition-all p-1 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-lg",
                            isMe ? "-left-2" : "-right-2"
                          )}
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                    <p className={cn(
                      "text-[9px] font-mono text-white/20 italic mt-1",
                      isMe ? "text-right mr-1" : "ml-1"
                    )}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Input Field */}
        <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-white/2">
          <div className="flex items-center gap-3 bg-navy-950/50 rounded-2xl p-2 border border-white/5 focus-within:border-cyan-primary/40 transition-all shadow-inner">
            <Button variant="ghost" type="button" size="sm" className="hidden sm:flex hover:bg-white/5 text-white/30">
              <Smile className="w-5 h-5 " />
            </Button>
            <input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              type="text" 
              placeholder="Inject message into hub..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 placeholder:text-white/10"
            />
            <Button variant="ghost" type="button" size="sm" className="hidden sm:flex hover:bg-white/5 text-white/30">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button 
              type="submit"
              disabled={!newMessage.trim() || sending}
              variant="cyan" 
              size="sm" 
              className="rounded-xl px-5 h-10 font-black uppercase tracking-widest disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
          <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/10">
            End-to-End Encrypted via Stahiza Sec-Link
          </p>
        </form>
      </Card>
    </div>
  );
};
