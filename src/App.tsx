import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Megaphone, 
  Code2, 
  Trophy, 
  Calendar, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  Clock,
  UserCircle,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { UserProfile } from "./types";
import { 
  loginWithGoogle, 
  logout, 
  useAuthProfile
} from "./services/supabase";

import { Button, Card, cn } from "./components/UI";

// Extracted views
import { LandingView } from "./views/LandingView";
import { LoginView } from "./views/LoginView";
import { ProfileView } from "./views/ProfileView";
import { DashboardView } from "./views/DashboardView";
import { ChatsView } from "./views/ChatsView";
import { ProjectsView } from "./views/ProjectsView";
import { LeaderboardView } from "./views/LeaderboardView";
import { EventsView } from "./views/EventsView";
import { ResourcesView } from "./views/ResourcesView";
import { AnnouncementsView } from "./views/AnnouncementsView";
import { AdminPanelView } from "./views/AdminPanelView";
import { ChallengesView } from "./views/ChallengesView";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [view, setView] = useState<'landing' | 'auth'>('landing');

  useEffect(() => {
    // Initial loading simulation
    const timer = setTimeout(() => setLoading(false), 1500);
    // Real auth listener
    const unsubscribe = useAuthProfile((user) => {
      setCurrentUser(user);
      if (user) setView('auth');
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('light');
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-navy-950 flex flex-col items-center justify-center gap-4 text-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-primary border-t-transparent rounded-full"
        />
        <p className="text-cyan-primary font-mono tracking-widest animate-pulse uppercase">Stahiza ICT HUB_</p>
      </div>
    );
  }

  if (!currentUser && view === 'landing') {
    return <LandingView onJoin={() => setView('auth')} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  if (!currentUser && view === 'auth') {
    return <LoginView onLogin={loginWithGoogle} darkMode={darkMode} toggleDarkMode={toggleDarkMode} onBack={() => setView('landing')} />;
  }

  if (currentUser && currentUser.status === 'pending') {
    return (
      <div className="h-screen w-full bg-navy-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <Card className="max-w-md p-8 flex flex-col items-center gap-6 border-cyan-primary/30">
          <Clock className="w-16 h-16 text-cyan-primary animate-bounce" />
          <h1 className="text-2xl font-bold">Registration Pending</h1>
          <p className="text-white/60">
            Welcome, <span className="text-white font-medium">{currentUser.displayName}</span>! 
            Your account is currently being reviewed by our administrators. 
            Once approved, you'll have full access to the ICT community hub.
          </p>
          <Button variant="secondary" onClick={() => logout()}>Log Out</Button>
        </Card>
      </div>
    );
  }

  if (!currentUser) return null;

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: MessageSquare, label: "Chats" },
    { icon: UserCircle, label: "Profile" },
    { icon: Target, label: "Challenges" },
    { icon: Megaphone, label: "Announcements" },
    { icon: Code2, label: "Projects" },
    { icon: Trophy, label: "Leaderboard" },
    { icon: Calendar, label: "Events" },
    { icon: BookOpen, label: "Resources" },
    ...(currentUser.role === 'admin' ? [{ icon: Settings, label: "Admin Panel" }] : [])
  ];

  return (
    <div className={cn("min-h-screen flex transition-colors duration-300", darkMode ? "bg-navy-950 text-white" : "bg-white text-navy-950")}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40 border-r border-white/10",
        darkMode ? "bg-gradient-to-b from-[#0B1F3B] to-[#070F1F]" : "bg-gray-50 bg-white border-gray-200"
      )}>
        <div className="p-6 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-primary flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-transform hover:rotate-12">
            S
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-none uppercase">Stahiza</h1>
            <p className="text-[10px] text-cyan-primary font-bold tracking-widest mt-0.5">ICT HUB</p>
          </div>
        </div>

        <div className="px-6 mb-2">
           <div className="flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-tighter text-emerald-500 text-nowrap">Production Ready</span>
           </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative",
                activeTab === item.label 
                  ? "bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-500 rounded-none" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.label ? "text-cyan-400" : "group-hover:scale-110 transition-transform")} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.label === 'Chats' && <span className="ml-auto bg-cyan-500 text-black text-[10px] font-bold px-1.5 rounded-full">12</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl group transition-all hover:bg-white/10">
            <div className="relative">
              <img 
                src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-cyan-500/50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-navy-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{currentUser.displayName}</p>
              <p className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">{currentUser.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="w-full text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest ml-2 text-nowrap">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        {/* Header / Top Bar */}
        <header className="sticky top-0 bg-[#0B1F3B]/50 backdrop-blur-sm z-30 border-b border-white/10 h-16 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{activeTab}</h2>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded border border-green-500/30 font-mono font-bold tracking-wider animate-pulse">v1.2.0-LIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-black/30 rounded-full px-4 py-1.5 border border-white/5 group transition-all hover:border-cyan-500/30">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">142 Members Online</span>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleDarkMode}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-300"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
                <span className="text-black font-black text-sm uppercase">{currentUser.displayName[0]}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Port */}
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "Dashboard" && <DashboardView user={currentUser} />}
              {activeTab === "Chats" && <ChatsView user={currentUser} />}
              {activeTab === "Profile" && <ProfileView user={currentUser} />}
              {activeTab === "Projects" && <ProjectsView user={currentUser} />}
              {activeTab === "Leaderboard" && <LeaderboardView />}
              {activeTab === "Events" && <EventsView user={currentUser} />}
              {activeTab === "Resources" && <ResourcesView />}
              {activeTab === "Announcements" && <AnnouncementsView user={currentUser} />}
              {activeTab === "Challenges" && <ChallengesView user={currentUser} />}
              {activeTab === "Admin Panel" && currentUser.role === 'admin' && <AdminPanelView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-navy-950/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center p-3 z-40">
        {[
          { icon: LayoutDashboard, label: "Dashboard" },
          { icon: MessageSquare, label: "Chats" },
          { icon: Code2, label: "Projects" },
          { icon: Trophy, label: "Leaderboard" },
          { icon: Settings, label: "More" }
        ].map((item) => (
          <button 
            key={item.label}
            onClick={() => setActiveTab(item.label === 'More' ? 'Admin Panel' : item.label)}
            className={cn("flex flex-col items-center gap-1", activeTab === item.label ? "text-cyan-primary" : "text-white/40")}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-navy-900 z-[60] p-6 lg:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-primary flex items-center justify-center text-black font-bold">S</div>
                  <h1 className="font-bold text-white uppercase tracking-tight">Stahiza ICT HUB</h1>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-6 h-6 text-white" />
                </Button>
              </div>
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { setActiveTab(item.label); setIsSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all",
                      activeTab === item.label ? "bg-cyan-primary/10 text-cyan-primary" : "text-white/50 hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium text-lg">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
