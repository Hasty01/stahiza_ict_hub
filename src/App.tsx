import React, { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
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
  Plus, 
  Send, 
  Paperclip, 
  Smile,
  ShieldCheck,
  UserCheck,
  Search,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Clock,
  ExternalLink,
  Download,
  Rocket,
  UserCircle,
  Camera,
  Sparkles,
  Bot,
  MapPin,
  CalendarPlus,
  ChevronLeft,
  Bell,
  Info,
  AlertCircle,
  Filter,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from "date-fns";

// Types (re-defined locally briefly to ensure no cyclic deps)
import { 
  UserProfile, 
  Role,
  UserStatus,
  Project, 
  Chat, 
  ChatMessage, 
  LeaderboardEntry, 
  AppEvent, 
  Resource, 
  Announcement 
} from "./types";

// Mock Services (will be connected to Firebase if available)
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  useAuthProfile, 
  ADMIN_EMAIL, 
  loginWithCredentials, 
  registerUser, 
  updateUserProfile, 
  getAllUsers, 
  updateUserByAdmin,
  useProjects,
  submitProject,
  updateProjectStatus,
  useEvents,
  rsvpToEvent,
  createEvent,
  useAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} from "./services/firebase";

import { evaluateProjectWithAI } from "./services/geminiService";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'cyan',
  size?: 'sm' | 'md' | 'lg'
}) => {
  const variants = {
    primary: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    secondary: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md",
    ghost: "bg-transparent hover:bg-white/5 text-white",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30",
    cyan: "bg-cyan-primary text-black font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)]"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button 
      className={cn("rounded-lg transition-all flex items-center justify-center gap-2", variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className }: React.PropsWithChildren<{ className?: string, key?: React.Key }>) => (
  <div className={cn("glass rounded-xl p-4 transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-primary/5", className)}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: React.PropsWithChildren<{ variant?: 'default' | 'cyan' | 'warning' | 'success', key?: React.Key }>) => {
  const variants = {
    default: "bg-white/10 text-white/70",
    cyan: "bg-cyan-primary/20 text-cyan-primary border border-cyan-primary/30",
    warning: "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
    success: "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", variants[variant])}>
      {children}
    </span>
  );
};

// --- App Screens ---

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
      <div className="h-screen w-full bg-navy-950 flex flex-col items-center justify-center gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-primary border-t-transparent rounded-full"
        />
        <p className="text-cyan-primary font-mono tracking-widest animate-pulse">STAHIZA ICT HUB_</p>
      </div>
    );
  }

  if (!currentUser && view === 'landing') {
    return <LandingView onJoin={() => setView('auth')} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  if (!currentUser && view === 'auth') {
    return <LoginScreen onLogin={loginWithGoogle} darkMode={darkMode} toggleDarkMode={toggleDarkMode} onBack={() => setView('landing')} />;
  }

  if (currentUser.status === 'pending') {
    return (
      <div className="h-screen w-full bg-navy-950 flex flex-col items-center justify-center p-6 text-center">
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

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: MessageSquare, label: "Chats" },
    { icon: UserCircle, label: "Profile" },
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
              <span className="text-[8px] font-black uppercase tracking-tighter text-emerald-500">Production Ready</span>
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
            <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                <span className="text-black font-black text-sm">{currentUser.displayName[0]}</span>
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
                  <h1 className="font-bold">STAHIZA ICT HUB</h1>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-6 h-6" />
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

// --- Views Implementation ---

const LandingView = ({ onJoin, darkMode, toggleDarkMode }: { onJoin: () => void, darkMode: boolean, toggleDarkMode: () => void }) => {
  return (
    <div className={cn("min-h-screen transition-colors duration-500", darkMode ? "bg-navy-950 text-white" : "bg-white text-navy-950")}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#070F1F]/50 backdrop-blur-md border-b border-white/5 py-4 px-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-primary flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-primary/20">S</div>
          <span className="font-black tracking-tighter text-xl">STAHIZA <span className="text-cyan-primary">HUB</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] uppercase font-black tracking-widest">
          <a href="#about" className="hover:text-cyan-primary transition-colors">About Us</a>
          <a href="#gallery" className="hover:text-cyan-primary transition-colors">Gallery</a>
          <a href="#contact" className="hover:text-cyan-primary transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="cyan" size="sm" onClick={onJoin} className="px-6">JOIN HUB</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 overflow-hidden min-h-screen flex items-center">
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-cyan-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full" />
        
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="cyan" className="mb-6">v1.2.0-STABLE</Badge>
            <h1 className="text-6xl lg:text-8xl font-black leading-[0.85] tracking-tighter mb-8 italic uppercase">
              Build the <br/> <span className="text-cyan-primary text-glow">Future_</span> <br/> Together.
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
              Uganda's premier secondary school ICT community. We empower student innovators with the tools, mentorship, and network to turn ideas into reality.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="cyan" size="lg" onClick={onJoin} className="px-10 h-16 text-lg uppercase tracking-widest">Get Started</Button>
              <Button variant="secondary" size="lg" className="px-10 h-16 text-lg uppercase tracking-widest">Learn More</Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-cyan-500/20 blur-3xl animate-pulse rounded-[3rem]" />
              <img 
                src="https://picsum.photos/seed/stahiza-hero/1000/1000" 
                className="rounded-[3rem] border border-white/10 shadow-2xl skew-x-[-2deg] skew-y-[1deg]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -right-8 bg-[#0B1F3B] border border-white/10 p-6 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hub Activity Live</span>
                </div>
                <div className="mt-2 text-2xl font-black">1.2K+ Lines</div>
                <div className="text-[10px] text-cyan-400 font-bold">Committed Today</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Us section */}
      <section id="about" className="py-24 px-6 lg:px-12 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <Card className="aspect-square flex flex-col justify-center items-center text-center p-8 border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all">
                  <LayoutDashboard className="w-10 h-10 text-cyan-primary mb-4" />
                  <h3 className="font-bold text-lg mb-1">Collaboration</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase">Work across teams and schools seamlessly.</p>
                </Card>
                <div className="space-y-4 pt-8">
                  <Card className="aspect-square flex flex-col justify-center items-center text-center p-8 bg-white/5 border-white/5">
                    <Code2 className="w-10 h-10 text-blue-400 mb-4" />
                    <h3 className="font-bold text-lg mb-1">Code</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed uppercase">Master modern tech stacks and AI tools.</p>
                  </Card>
                </div>
                <Card className="aspect-square flex flex-col justify-center items-center text-center p-8 bg-white/5 border-white/5 -mt-8">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
                  <h3 className="font-bold text-lg mb-1">Impact</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase">Build solutions for real school challenges.</p>
                </Card>
                <Card className="aspect-square flex flex-col justify-center items-center text-center p-8 border-yellow-500/20 bg-yellow-500/5 transition-all">
                   <Trophy className="w-10 h-10 text-yellow-500 mb-4" />
                  <h3 className="font-bold text-lg mb-1">Growth</h3>
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase">Earn recognition and certification points.</p>
                </Card>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge variant="cyan" className="mb-6 italic">Discover our mission</Badge>
              <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-none tracking-tighter uppercase">We are More than just a <br/> <span className="text-cyan-primary">Coding group.</span></h2>
              <div className="space-y-6 text-slate-400 leading-relaxed">
                <p>Founded at Stahiza, the ICT Hub was born from a simple observation: student genius is a terrible thing to waste. We created a space where the next generation of engineers, designers, and innovators could flourish.</p>
                <p>Our platform isn't just a dashboard—it's an operating system for innovation. We provide the mentorship, projects, and community engagement necessary for secondary school students to bridge the gap between classroom theory and real-world execution.</p>
              </div>
              <div className="mt-10 flex border-t border-white/10 pt-8 gap-12">
                <div>
                  <div className="text-3xl font-black text-white">842+</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Members</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">45+</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Schools</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">120+</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-6 lg:px-12 bg-[#070F1F]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <Badge variant="cyan" className="mb-4">Visual Hub</Badge>
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">ICT Hub Gallery</h2>
            </div>
            <p className="text-slate-400 max-w-sm text-sm">Snapshots of innovation, collaboration, and community events across the region.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { src: "https://picsum.photos/seed/hub-1/800/800", title: "Hackathon 2026", size: "md:col-span-2 md:row-span-2" },
              { src: "https://picsum.photos/seed/hub-2/600/800", title: "Design Workshop" },
              { src: "https://picsum.photos/seed/hub-3/800/600", title: "AI Meetup" },
              { src: "https://picsum.photos/seed/hub-4/800/800", title: "Lab Sessions", size: "md:col-span-2" },
              { src: "https://picsum.photos/seed/hub-5/800/1200", title: "Network Day" },
              { src: "https://picsum.photos/seed/hub-6/1200/800", title: "Project Launch" },
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn("group relative overflow-hidden rounded-[2rem] border border-white/5", img.size)}
              >
                <img 
                  src={img.src} 
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-primary mb-1">Event Snapshot</p>
                  <h4 className="text-xl font-bold">{img.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 lg:px-12 bg-black/40 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
           <div>
            <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-primary flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-primary/20">S</div>
              <span className="font-black tracking-tighter text-xl">STAHIZA <span className="text-cyan-primary">HUB</span></span>
            </div>
            <p className="text-slate-500 max-w-sm text-xs leading-relaxed uppercase tracking-widest">Bridging the technology gap in secondary schools through code, community, and collaboration.</p>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" className="text-slate-500 hover:text-white uppercase text-[10px] tracking-widest font-bold">Twitter</Button>
            <Button variant="ghost" className="text-slate-500 hover:text-white uppercase text-[10px] tracking-widest font-bold">GitHub</Button>
            <Button variant="ghost" className="text-slate-500 hover:text-white uppercase text-[10px] tracking-widest font-bold">Discord</Button>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">&copy; 2026 Stahiza ICT Hub Community</p>
            <p className="text-cyan-primary/40 text-[10px] uppercase font-black tracking-widest mt-1">Built with passion by members</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const LoginScreen = ({ onLogin, darkMode, toggleDarkMode, onBack }: { onLogin: () => void, darkMode: boolean, toggleDarkMode: () => void, onBack?: () => void }) => {
  const [formMode, setFormMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    vclass: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formMode === 'register') {
        await registerUser({
          email: formData.email,
          username: formData.username,
          vclass: formData.vclass
        });
      } else {
        await loginWithCredentials(formData.email);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-navy-950 flex relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-cyan-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="flex items-center justify-between mb-8">
             {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="text-white/40 hover:text-white">
                <ChevronRight className="w-5 h-5 rotate-180" /> Back
              </Button>
            )}
            <button onClick={toggleDarkMode} className="text-white/40">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-16 h-16 bg-cyan-primary rounded-2xl flex items-center justify-center text-black text-3xl font-black mb-4 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
            >
              S
            </motion.div>
            <h1 className="text-2xl font-black tracking-tight mb-1">STAHIZA ICT HUB</h1>
            <p className="text-white/40 font-mono tracking-widest text-[9px] uppercase">
              {formMode === 'login' ? 'Authentication Required' : 'Portal Registration'}
            </p>
          </div>

          <Card className="border-cyan-primary/10 bg-[#0B1F3B]/60 backdrop-blur-xl p-8 mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-slate-400 ml-1">Gmail Address</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="name@gmail.com"
                  className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs focus:border-cyan-500 transition-all outline-none"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {formMode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-slate-400 ml-1">Username</label>
                      <input 
                        type="text" 
                        name="username"
                        required
                        placeholder="stahiza_dev"
                        className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs focus:border-cyan-500 transition-all outline-none"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-slate-400 ml-1">Class</label>
                      <input 
                        type="text" 
                        name="vclass"
                        required
                        placeholder="S.4 Sci"
                        className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs focus:border-cyan-500 transition-all outline-none"
                        value={formData.vclass}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-slate-400 ml-1">Password</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs focus:border-cyan-500 transition-all outline-none"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <Button 
                variant="cyan" 
                type="submit"
                disabled={loading}
                className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] mt-2 shadow-[0_5px_15px_rgba(6,182,212,0.2)]"
              >
                {loading ? 'Verifying...' : (formMode === 'login' ? 'Login to Hub' : 'Create Profile')}
              </Button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-bold">
                {formMode === 'login' ? "Not a member yet?" : "Already have access?"}
              </p>
              <button 
                onClick={() => setFormMode(formMode === 'login' ? 'register' : 'login')}
                className="text-cyan-primary text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
              >
                {formMode === 'login' ? 'Access Request / Sign Up' : 'Back to Login Portal'}
              </button>
            </div>
          </Card>

          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <span className="relative px-3 bg-[#070F1F] text-[8px] text-white/20 uppercase font-bold tracking-widest">Advanced Auth Option</span>
            </div>
            
            <Button variant="ghost" onClick={onLogin} className="w-full border border-white/5 bg-white/5 h-11 hover:bg-white/10">
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-3.5 h-3.5 mr-2 opacity-50" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Secure Google Login</span>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Login Page Side Design */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0B1F3B] to-black relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#06B6D4_0.5px,transparent_0.5px)] [background-size:20px_20px]" />
        <div className="relative z-10 max-w-sm">
          <Badge variant="cyan" className="mb-6">System Status: Online</Badge>
          <h2 className="text-6xl font-black tracking-tighter leading-none mb-6 animate-pulse">HUB <br/> SHIELD_</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest leading-relaxed border-l border-cyan-500 pl-4">
            Secure multi-factor authentication is required for all hub operations. Your biometric and session data is encrypted.
          </p>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ user }: { user: UserProfile }) => {
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

const DashboardView = ({ user }: { user: UserProfile }) => (
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
        { label: "Leaderboard", value: "#1", sub: `${user.displayName.split(' ')[0]} (You)`, color: "text-cyan-400", col: "col-span-12 md:col-span-3", special: true }
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

const ChatsView = ({ user }: { user: UserProfile }) => {
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

const ProjectsView = ({ user }: { user: UserProfile }) => {
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
                      placeholder="React, Firebase"
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

const LeaderboardView = () => (
  <div className="space-y-8">
    <div className="text-center">
      <h2 className="text-3xl font-black mb-2">Hall of Fame</h2>
      <p className="text-white/40">The top contributors of the Stahiza ICT Community.</p>
    </div>

    {/* Top 3 Highlighed */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
      {/* Silver #2 */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.1 }}
        className="order-2 md:order-1"
      >
        <Card className="bg-gradient-to-t from-gray-400/10 to-transparent border-gray-400/20 text-center relative pt-12 pb-8">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 rounded-3xl bg-white/10 p-0.5 border-2 border-gray-400 rotate-45 overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah" alt="v2" className="-rotate-45" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-400 text-black font-bold flex items-center justify-center text-xs">2</div>
          </div>
          <h3 className="font-bold text-xl">Sarah Johnson</h3>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">Pro Coder</p>
          <div className="text-3xl font-black">38.4K</div>
          <p className="text-[10px] text-white/30 uppercase tracking-tighter">Points</p>
        </Card>
      </motion.div>

      {/* Gold #1 */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="order-1 md:order-2"
      >
        <Card className="bg-gradient-to-t from-yellow-500/20 to-transparent border-yellow-500/40 text-center relative pt-16 pb-12 shadow-2xl shadow-yellow-500/10">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <div className="w-24 h-24 rounded-[2.5rem] bg-navy-900 p-1 border-4 border-yellow-500 overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=joel" alt="v1" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-yellow-500 text-black font-black flex items-center justify-center text-xl shadow-lg">1</div>
          </div>
          <h3 className="font-black text-3xl mb-1">Joel Hasty</h3>
          <p className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-6">Legend of Stahiza</p>
          <div className="text-5xl font-black text-yellow-500 text-glow">42.5K</div>
          <p className="text-xs text-white/40 uppercase tracking-tighter mt-2">Global Hub Points</p>
        </Card>
      </motion.div>

      {/* Bronze #3 */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.2 }}
        className="order-3"
      >
        <Card className="bg-gradient-to-t from-orange-800/10 to-transparent border-orange-800/20 text-center relative pt-12 pb-8">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 rounded-3xl bg-white/10 p-0.5 border-2 border-orange-800 -rotate-12 overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=leo" alt="v3" className="rotate-12" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-800 text-white font-bold flex items-center justify-center text-xs">3</div>
          </div>
          <h3 className="font-bold text-xl">Leo K.</h3>
          <p className="text-orange-800 font-bold uppercase tracking-widest text-[10px] mb-4">Hard Coder</p>
          <div className="text-3xl font-black">29.1K</div>
          <p className="text-[10px] text-white/30 uppercase tracking-tighter">Points</p>
        </Card>
      </motion.div>
    </div>

    {/* Leaderboard Table List */}
    <Card className="p-0 overflow-hidden">
      <div className="divide-y divide-white/5">
        {[4, 5, 6, 7, 8].map((rank) => (
          <div key={rank} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
            <span className="w-6 font-mono text-white/30 font-bold">{rank}</span>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=u${rank}`} className="w-10 h-10 rounded-lg bg-white/5" alt="user" />
            <div className="flex-1">
              <p className="font-bold">Student {rank}</p>
              <Badge>Advanced</Badge>
            </div>
            <div className="text-right">
              <p className="font-bold">{25 - rank}K</p>
              <p className="text-[10px] text-white/30 uppercase tracking-tight">Points</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const EventsView = ({ user }: { user: UserProfile }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  useEvents(setEvents);

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayEvents = (day: Date) => {
    return events.filter(e => isSameDay(new Date(e.date.seconds * 1000), day));
  };

  const activeDayEvents = getDayEvents(selectedDate);

  const toggleRSVP = async (eventId: string) => {
    await rsvpToEvent(eventId, user.uid);
  };

  const addToCalendar = (event: AppEvent) => {
    const startTime = new Date(event.date.seconds * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endTime = new Date(event.date.seconds * 1000 + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, ""); // +1 hour
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location || "")}`;
    window.open(url, "_blank");
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Calendar Grid */}
      <Card className="col-span-12 lg:col-span-7 bg-[#0B1F3B]/40 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-white">{format(currentMonth, "MMMM yyyy")}</h2>
            <div className="flex gap-1">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-white/40" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-white/40" />
              </button>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center text-[10px] uppercase font-black tracking-widest text-white/20 pb-4">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dayEvents = getDayEvents(day);
            const isTodayDate = isToday(day);

            return (
              <button
                key={i}
                onClick={() => onDateClick(day)}
                className={cn(
                  "relative aspect-square p-2 border transition-all flex flex-col items-start gap-1 group",
                  !isCurrentMonth ? "bg-transparent border-transparent opacity-10" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]",
                  isSelected && "border-cyan-primary/50 bg-cyan-primary/5",
                  isTodayDate && !isSelected && "border-emerald-500/30"
                )}
              >
                <span className={cn(
                  "text-xs font-bold",
                  isSelected ? "text-cyan-primary" : "text-white/40",
                  isTodayDate && !isSelected && "text-emerald-500"
                )}>
                  {format(day, "d")}
                </span>
                
                <div className="flex flex-wrap gap-0.5 mt-auto">
                  {dayEvents.slice(0, 3).map((e, idx) => (
                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-cyan-primary shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                  ))}
                </div>

                {isTodayDate && (
                  <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Events List for Selected Day */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-tight text-white/60">
            Hub Events_ <span className="text-white/20 font-normal">/ {format(selectedDate, "dd MMM")}</span>
          </h3>
          {user.role === 'admin' && (
             <Button variant="cyan" size="sm" onClick={() => setIsEventModalOpen(true)}>
                <Plus className="w-3 h-3" /> New
             </Button>
          )}
        </div>

        <div className="space-y-4 h-[600px] overflow-y-auto pr-2 scrollbar-hide">
          {activeDayEvents.length === 0 ? (
            <div className="p-8 border border-white/5 rounded-2xl bg-white/[0.02] text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <CalendarPlus className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-xs text-white/40 italic">Nothing scheduled for this day.</p>
            </div>
          ) : (
            activeDayEvents.map(event => (
              <Card key={event.id} className="p-0 overflow-hidden group">
                <div className="h-32 relative">
                  <img src={event.image || "https://picsum.photos/seed/event/600/400"} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3B] to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <Badge variant="cyan">{format(new Date(event.date.seconds * 1000), "HH:mm")}</Badge>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-lg mb-1">{event.title}</h4>
                    <p className="text-xs text-white/60 line-clamp-2">{event.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-black tracking-widest">
                      <MapPin className="w-3 h-3 text-cyan-primary" /> {event.location || "Online / TBD"}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-2">
                    <Button 
                      variant={event.participants.includes(user.uid) ? "secondary" : "cyan"} 
                      size="sm" 
                      onClick={() => toggleRSVP(event.id)}
                      className="flex-1 text-[10px] uppercase font-black tracking-widest"
                    >
                      {event.participants.includes(user.uid) ? "Interested" : "RSVP Now"}
                    </Button>
                    <button 
                      onClick={() => addToCalendar(event)}
                      className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                    >
                      <CalendarPlus className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ResourcesView = () => (
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
          { title: "Firebase Secure Rules", type: "Video Lesson", icon: BookOpen, color: "text-orange-400" },
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

const AnnouncementsView = ({ user }: { user: UserProfile }) => {
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

const AdminPanelView = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (uid: string, status: UserStatus) => {
    await updateUserByAdmin(uid, { status });
    fetchUsers();
  };

  const handleUpdateRole = async (uid: string, role: Role) => {
    await updateUserByAdmin(uid, { role });
    fetchUsers();
  };

  const filteredUsers = users.filter(u => filter === 'all' || u.status === filter);
  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Command Center</h2>
          <p className="text-white/40 text-sm">Real-time system administration and member moderation.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'cyan' : 'secondary'} 
            size="sm" 
            onClick={() => setFilter('all')}
            className="text-[10px] uppercase font-black"
          >
            All
          </Button>
          <Button 
            variant={filter === 'pending' ? 'cyan' : 'secondary'} 
            size="sm" 
            onClick={() => setFilter('pending')}
            className="text-[10px] uppercase font-black relative"
          >
            Pending
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] animate-bounce">
                {pendingCount}
              </span>
            )}
          </Button>
          <Button 
            variant={filter === 'suspended' ? 'cyan' : 'secondary'} 
            size="sm" 
            onClick={() => setFilter('suspended')}
            className="text-[10px] uppercase font-black"
          >
            Suspended
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-cyan-primary/5 border-cyan-primary/20">
          <p className="text-[10px] uppercase font-bold text-cyan-primary tracking-widest mb-1">Total Members</p>
          <h3 className="text-3xl font-black leading-none">{users.length}</h3>
        </Card>
        <Card className="p-6 bg-yellow-500/5 border-yellow-500/20">
          <p className="text-[10px] uppercase font-bold text-yellow-500 tracking-widest mb-1">Pending Approval</p>
          <h3 className="text-3xl font-black leading-none">{pendingCount}</h3>
        </Card>
        <Card className="p-6 bg-emerald-500/5 border-emerald-500/20">
          <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest mb-1">Active Now</p>
          <h3 className="text-3xl font-black leading-none">12</h3>
        </Card>
        <Card className="p-6 bg-red-500/5 border-red-500/20">
          <p className="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-1">Suspended</p>
          <h3 className="text-3xl font-black leading-none">{users.filter(u => u.status === 'suspended').length}</h3>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-primary" />
                Member Registry
              </h3>
              <span className="text-[10px] text-white/30 uppercase font-black">Syncing Live...</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[9px] uppercase font-bold tracking-widest text-white/40">
                  <tr>
                    <th className="px-6 py-4">Identity</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-white/20 uppercase font-black tracking-widest">
                        Initializing Registry Access...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-white/20 uppercase font-black tracking-widest">
                        No members matching filter criteria.
                      </td>
                    </tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.photoURL} alt="p" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold">{u.displayName}</p>
                            <p className="text-[10px] text-white/30 truncate max-w-[120px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.uid, e.target.value as Role)}
                          disabled={u.email === ADMIN_EMAIL}
                          className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] font-bold uppercase text-cyan-primary focus:border-cyan-primary outline-none"
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          u.status === 'approved' ? 'success' : 
                          u.status === 'pending' ? 'warning' : 'default'
                        }>
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-white/40">
                        <div className="flex justify-end gap-2">
                          {u.status === 'pending' && (
                            <Button 
                              variant="cyan" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(u.uid, 'approved')}
                              className="h-7 px-2 text-[8px] font-black uppercase"
                            >
                              Approve
                            </Button>
                          )}
                          {u.status !== 'suspended' && u.email !== ADMIN_EMAIL && (
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(u.uid, 'suspended')}
                              className="h-7 px-2 text-[8px] font-black uppercase"
                            >
                              Suspend
                            </Button>
                          )}
                          {u.status === 'suspended' && (
                             <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(u.uid, 'approved')}
                              className="h-7 px-2 text-[8px] font-black uppercase"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/30 border-l-2 border-cyan-primary pl-3">System Actions</h3>
          <div className="grid gap-3">
            <Button variant="secondary" className="justify-start py-4 h-auto group text-left">
              <Megaphone className="w-5 h-5 mr-3 text-cyan-primary group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-bold text-sm">Post Announcement</p>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">Emergency broadcast to all</p>
              </div>
            </Button>
            <Button variant="secondary" className="justify-start py-4 h-auto group text-left">
              <ShieldCheck className="w-5 h-5 mr-3 text-cyan-primary group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-bold text-sm">Security Logs</p>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter">View login & access attempts</p>
              </div>
            </Button>
            <Card className="bg-red-500/10 border-red-500/20 p-5 mt-4">
              <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <X className="w-4 h-4" /> Danger Zone
              </h4>
              <p className="text-[10px] text-white/40 leading-relaxed mb-4">
                Operations here affect the entire Hub infrastructure. Proceed with administrative caution.
              </p>
              <Button variant="danger" className="w-full text-[10px] font-black uppercase tracking-widest py-3">
                Emergency Lockdown
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
