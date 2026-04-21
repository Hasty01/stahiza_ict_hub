import React, { useState } from "react";
import { 
  MessageSquare, 
  Search, 
  ChevronRight, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Send 
} from "lucide-react";
import { Button, Card, cn } from "../components/UI";
import { UserProfile } from "../types";

export const ChatsView = ({ user }: { user: UserProfile }) => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-4 overflow-hidden">
      {/* Search & List Panel */}
      <div className={cn(
        "w-full lg:w-80 flex flex-col flex-shrink-0 gap-4 transition-all duration-300",
        selectedChat !== null && "hidden lg:flex"
      )}>
        <div className="flex items-center bg-white/5 rounded-xl px-4 py-3 border border-white/5 focus-within:border-cyan-primary/40">
          <Search className="w-4 h-4 text-white/30" />
          <input type="text" placeholder="Search chats..." className="bg-transparent border-none focus:ring-0 text-sm flex-1 px-3" />
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {[
            { id: 1, name: "Joel Hasty", msg: "Hey, check out my new project!", time: "12:30", unread: 2, online: true },
            { id: 2, name: "Sarah Johnson", msg: "Did the admin approve the repo?", time: "10:15", unread: 0, online: false },
            { id: 3, name: "David M.", msg: "Let's meet at the lab tomorrow", time: "Yesterday", unread: 0, online: true },
            { id: 4, name: "Mary L.", msg: "Sent you the PDF", time: "Monday", unread: 0, online: false },
          ].map((chat) => (
            <button 
              key={chat.id} 
              onClick={() => setSelectedChat(chat.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-2xl transition-all border border-transparent",
                selectedChat === chat.id ? "bg-white/10 border-white/10" : "hover:bg-white/5"
              )}
            >
              <div className="relative">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} className="w-12 h-12 rounded-2xl bg-white/10" referrerPolicy="no-referrer" />
                {chat.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-navy-900" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-bold text-sm truncate">{chat.name}</h4>
                  <span className="text-[10px] text-white/30">{chat.time}</span>
                </div>
                <p className="text-xs text-white/40 truncate">{chat.msg}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-cyan-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Panel */}
      <Card className="flex-1 p-0 flex flex-col overflow-hidden">
        {selectedChat ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSelectedChat(null)}>
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
                <div className="w-10 h-10 rounded-xl bg-white/10 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedChat}`} alt="Chat" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Joel Hasty</h4>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm"><Search className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
              <div className="flex flex-col gap-5">
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none px-5">
                    <p className="text-[10px] mb-1 font-bold text-indigo-400 uppercase tracking-widest">Joel Hasty</p>
                    <p className="text-sm leading-relaxed">Hey everyone! The new AI integration is ready for testing. Check it out on the projects page. 🚀</p>
                    <p className="text-right text-[10px] text-white/30 mt-2 font-mono italic">12:30 PM</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-gradient-to-br from-cyan-600 to-blue-700 border border-cyan-400/20 p-4 rounded-2xl rounded-tr-none px-5 shadow-[0_8px_20px_rgba(6,182,212,0.15)]">
                    <p className="text-sm leading-relaxed">Awesome work! I'll take a look right now. Did you use the Gemini API for the suggestions?</p>
                    <p className="text-right text-[10px] text-white/60 mt-2 font-mono italic">12:32 PM</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none px-5">
                     <p className="text-[10px] mb-1 font-bold text-indigo-400 uppercase tracking-widest">Joel Hasty</p>
                    <p className="text-sm leading-relaxed">Yep! Exactly. It's surprisingly fast.</p>
                    <p className="text-right text-[10px] text-white/30 mt-2 font-mono italic">12:33 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-2 border border-white/5 focus-within:border-cyan-primary/30 transition-all">
                <Button variant="ghost" size="sm"><Smile className="w-5 h-5 text-white/40" /></Button>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2"
                />
                <Button variant="ghost" size="sm"><Paperclip className="w-5 h-5 text-white/40" /></Button>
                <Button variant="cyan" size="sm" className="rounded-xl w-10 h-10 p-0">
                  <Send className="w-5 h-5 " />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-[2rem] bg-navy-900 border border-white/5 flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-cyan-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Private Messaging</h2>
            <p className="text-white/40 max-w-xs text-sm">Select a conversation from the left to start chatting securely with ICT hub members.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
