import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  ChevronRight, 
  Clock, 
  Code2, 
  Lightbulb, 
  Send, 
  CheckCircle2,
  AlertCircle,
  X,
  Plus
} from "lucide-react";
import { Button, Card, Badge, cn } from "../components/UI";
import { UserProfile, Challenge, ChallengeSubmission } from "../types";
import { useChallenges, submitChallengeSolution, useSubmissions } from "../services/supabase";

export const ChallengesView = ({ user }: { user: UserProfile }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [solutionLink, setSolutionLink] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useChallenges(setChallenges);
  useSubmissions(setSubmissions);

  const handleOpenSubmission = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setSolutionLink("");
    setComment("");
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge || !solutionLink) return;

    setIsSubmitting(true);
    try {
      await submitChallengeSolution({
        challengeId: selectedChallenge.id,
        userId: user.uid,
        solutionLink,
        comment
      });
      setSuccessMessage("Solution submitted successfully! It is now pending review.");
      setTimeout(() => setSelectedChallenge(null), 3000);
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserSubmission = (challengeId: string) => {
    return submissions.find(s => s.challengeId === challengeId && s.userId === user.uid);
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black">Challenges</h2>
          <p className="text-white/40">Complete tasks, build skills, and climb the leaderboard.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl">
          <div className="p-2 bg-yellow-500/20 rounded-xl">
             <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none mb-1">Your Points</p>
            <p className="text-xl font-black text-white">{user.points.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {challenges.map((challenge) => {
            const userSub = getUserSubmission(challenge.id);
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={cn(
                  "p-6 transition-all border border-white/10 group hover:border-cyan-500/30",
                  userSub?.status === 'accepted' && "border-emerald-500/30 bg-emerald-500/5"
                )}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={
                          challenge.difficulty === 'Easy' ? 'success' : 
                          challenge.difficulty === 'Medium' ? 'warning' : 'danger'
                        }>
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="cyan">+{challenge.points} XP</Badge>
                        {userSub && (
                          <Badge variant={userSub.status === 'accepted' ? 'success' : userSub.status === 'pending' ? 'warning' : 'danger'}>
                            {userSub.status}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold">{challenge.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{challenge.description}</p>
                    </div>
                    
                    <div className="flex md:flex-col items-center gap-2 lg:min-w-[140px]">
                      {userSub?.status === 'accepted' ? (
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-xl w-full justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </div>
                      ) : (
                        <Button 
                          variant={userSub ? "ghost" : "cyan"} 
                          className="w-full"
                          onClick={() => handleOpenSubmission(challenge)}
                          disabled={userSub?.status === 'pending'}
                        >
                          {userSub?.status === 'pending' ? "Under Review" : "Solve Challenge"}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {challenge.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">#{tag}</span>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/10 border-cyan-500/20">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
              Pro Tips
            </h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                Read the requirements carefully before starting.
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                Host your code on GitHub and provide the link.
              </li>
              <li className="flex gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                Higher difficulty challenges give more Hub points!
              </li>
            </ul>
          </Card>

          <Card>
            <h4 className="font-bold text-lg mb-4">Your Progress</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-1">
                <p className="text-xs text-white/40 uppercase font-black tracking-widest">Challenges Won</p>
                <p className="font-bold">{submissions.filter(s => s.userId === user.uid && s.status === 'accepted').length}</p>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (submissions.filter(s => s.userId === user.uid && s.status === 'accepted').length / Math.max(1, challenges.length)) * 100)}%` }} 
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedChallenge(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-navy-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-transparent border-b border-white/10 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold line-clamp-1">{selectedChallenge.title}</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-black">Submit Solution</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedChallenge(null)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-8">
                {successMessage ? (
                  <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h4 className="text-xl font-bold">Awesome!</h4>
                    <p className="text-white/60">{successMessage}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Code2 className="w-3 h-3" /> Solution Link (GitHub/Drive)
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/your-username/my-solution"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                        value={solutionLink}
                        onChange={(e) => setSolutionLink(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest">Additional Comments</label>
                      <textarea
                        placeholder="Describe your approach, tools used..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-32 focus:outline-none focus:border-cyan-500 transition-all resize-none"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 text-xs text-yellow-500/80 leading-relaxed">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      Solutions are manually verified by admins. Plagiarism will result in immediate suspension from the Hub.
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-cyan-primary text-black font-black uppercase tracking-widest text-sm shadow-xl shadow-cyan-500/20">
                      {isSubmitting ? "Submitting..." : "Send Solution"}
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
