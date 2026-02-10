import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { Redirect } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Sparkles, Users } from "lucide-react";

export default function OnboardingPage() {
  const { user } = useAuth();
  const { couple, createCouple, joinCouple } = useCouple();
  const [inviteCode, setInviteCode] = useState("");
  const [mode, setMode] = useState<"select" | "create" | "join">("select");

  if (!user) return <Redirect to="/auth" />;
  if (user.coupleId || couple) return <Redirect to="/" />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg border-0 shadow-2xl bg-card">
        <div className="h-2 w-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-t-xl" />
        
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif mb-2">Welcome, {user.name}!</CardTitle>
          <CardDescription>
            You're just one step away from your shared space.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {mode === "select" && (
            <div className="grid md:grid-cols-2 gap-4">
              <button 
                onClick={() => createCouple.mutate()}
                className="group relative flex flex-col items-center p-6 border-2 border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Create New Space</h3>
                <p className="text-sm text-muted-foreground">Start a fresh workspace and invite your partner.</p>
              </button>

              <button 
                onClick={() => setMode("join")}
                className="group relative flex flex-col items-center p-6 border-2 border-border rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Join Partner</h3>
                <p className="text-sm text-muted-foreground">Enter an invite code from your partner.</p>
              </button>
            </div>
          )}

          {mode === "join" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Enter Invite Code</h3>
                <p className="text-sm text-muted-foreground mb-4">Ask your partner for the code from their dashboard.</p>
              </div>
              <div className="flex gap-2">
                <Input 
                  value={inviteCode} 
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="e.g. LOVE-123" 
                  className="text-center uppercase tracking-widest text-lg h-12"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setMode("select")}>Back</Button>
                <Button 
                  className="flex-1" 
                  onClick={() => joinCouple.mutate(inviteCode)}
                  disabled={!inviteCode || joinCouple.isPending}
                >
                  {joinCouple.isPending ? "Joining..." : "Join Space"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
