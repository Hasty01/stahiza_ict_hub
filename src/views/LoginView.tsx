import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Sun, 
  Moon, 
  ChevronRight 
} from "lucide-react";
import { Button, Card, Badge } from "../components/UI";
import { 
  loginWithCredentials, 
  registerUser 
} from "../services/supabase";

export const LoginView = ({ onLogin, darkMode, toggleDarkMode, onBack }: { onLogin: () => void, darkMode: boolean, toggleDarkMode: () => void, onBack?: () => void }) => {
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
        const user = await registerUser({
          email: formData.email,
          username: formData.username,
          vclass: formData.vclass,
          password: formData.password
        });
        console.log("Registration successful:", user);
      } else {
        const user = await loginWithCredentials(formData.email, formData.password);
        console.log("Login successful:", user);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      alert(err.message || "Authentication failed. Please check your credentials.");
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
