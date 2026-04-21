import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sun, 
  Moon, 
  LayoutDashboard, 
  Code2, 
  ShieldCheck, 
  Trophy 
} from "lucide-react";
import { Button, Card, Badge, cn } from "../components/UI";

export const LandingView = ({ onJoin, darkMode, toggleDarkMode }: { onJoin: () => void, darkMode: boolean, toggleDarkMode: () => void }) => {
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
