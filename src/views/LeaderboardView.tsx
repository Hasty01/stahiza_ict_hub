import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button, Card, Badge, cn } from "../components/UI";
import { UserProfile } from "../types";
import { useUsers } from "../services/supabase";

export const LeaderboardView = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = useUsers((data) => {
      // Filter out admins and mentors, and sort by points descending
      const filtered = data.filter(u => u.role !== 'admin' && u.role !== 'mentor');
      const sorted = [...filtered].sort((a, b) => (b.points || 0) - (a.points || 0));
      setUsers(sorted);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-primary"></div>
    </div>
  );

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  const getBadgeType = (points: number) => {
    if (points > 40000) return "Legend";
    if (points > 30000) return "Pro";
    if (points > 10000) return "Advanced";
    return "Beginner";
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-black mb-2">Hall of Fame</h2>
        <p className="text-white/40">The top contributors of the Stahiza ICT Community.</p>
      </div>

      {/* Top 3 Highlighed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Silver #2 */}
        {topThree[1] && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.1 }}
            className="order-2 md:order-1"
          >
            <Card className="bg-gradient-to-t from-gray-400/10 to-transparent border-gray-400/20 text-center relative pt-12 pb-8">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-16 h-16 rounded-3xl bg-white/10 p-0.5 border-2 border-gray-400 rotate-45 overflow-hidden">
                   <img src={topThree[1].photoURL} alt="v2" className="-rotate-45" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-400 text-black font-bold flex items-center justify-center text-xs">2</div>
              </div>
              <h3 className="font-bold text-xl line-clamp-1 px-4">{topThree[1].displayName}</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">{getBadgeType(topThree[1].points)} Coder</p>
              <div className="text-3xl font-black">{(topThree[1].points / 1000).toFixed(1)}K</div>
              <p className="text-[10px] text-white/30 uppercase tracking-tighter">Points</p>
            </Card>
          </motion.div>
        )}

        {/* Gold #1 */}
        {topThree[0] && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="order-1 md:order-2"
          >
            <Card className="bg-gradient-to-t from-yellow-500/20 to-transparent border-yellow-500/40 text-center relative pt-16 pb-12 shadow-2xl shadow-yellow-500/10">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 rounded-[2.5rem] bg-navy-900 p-1 border-4 border-yellow-500 overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                   <img src={topThree[0].photoURL} alt="v1" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-yellow-500 text-black font-black flex items-center justify-center text-xl shadow-lg">1</div>
              </div>
              <h3 className="font-black text-3xl mb-1 line-clamp-1 px-4">{topThree[0].displayName}</h3>
              <p className="text-yellow-500 font-bold uppercase tracking-widest text-xs mb-6 truncate px-4">
                {topThree[0].points > 40000 ? "Legend of Stahiza" : "Top Achiever"}
              </p>
              <div className="text-5xl font-black text-yellow-500 text-glow">{(topThree[0].points / 1000).toFixed(1)}K</div>
              <p className="text-xs text-white/40 uppercase tracking-tighter mt-2">Global Hub Points</p>
            </Card>
          </motion.div>
        )}

        {/* Bronze #3 */}
        {topThree[2] && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="order-3"
          >
            <Card className="bg-gradient-to-t from-orange-800/10 to-transparent border-orange-800/20 text-center relative pt-12 pb-8">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-16 h-16 rounded-3xl bg-white/10 p-0.5 border-2 border-orange-800 -rotate-12 overflow-hidden">
                   <img src={topThree[2].photoURL} alt="v3" className="rotate-12" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-800 text-white font-bold flex items-center justify-center text-xs">3</div>
              </div>
              <h3 className="font-bold text-xl line-clamp-1 px-4">{topThree[2].displayName}</h3>
              <p className="text-orange-800 font-bold uppercase tracking-widest text-[10px] mb-4">{getBadgeType(topThree[2].points)} Coder</p>
              <div className="text-3xl font-black">{(topThree[2].points / 1000).toFixed(1)}K</div>
              <p className="text-[10px] text-white/30 uppercase tracking-tighter">Points</p>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Leaderboard Table List */}
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-white/5">
          {rest.length > 0 ? (
            rest.map((student, index) => (
              <div key={student.uid} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-all">
                <span className="w-6 font-mono text-white/30 font-bold">{index + 4}</span>
                <img src={student.photoURL} className="w-10 h-10 rounded-lg bg-white/5 border border-white/10" alt="user" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <p className="font-bold">{student.displayName}</p>
                  <Badge variant={student.points > 10000 ? 'cyan' : 'default'}>{getBadgeType(student.points)}</Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold">{(student.points / 1000).toFixed(1)}K</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-tight">Points</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-white/20 uppercase font-black tracking-widest text-sm">
              Climb the ranks by solving challenges!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
