import { useAuth } from "@/hooks/use-auth";
import { useCouple } from "@/hooks/use-couple";
import { useTodos } from "@/hooks/use-todos";
import { Redirect } from "wouter";
import { TodoCard } from "@/components/todo-card";
import { CreateTodoDialog } from "@/components/create-todo-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { couple, isLoading: coupleLoading } = useCouple();
  const { todos, isLoading: todosLoading } = useTodos();
  const { toast } = useToast();

  if (authLoading || coupleLoading) return <DashboardSkeleton />;
  if (!user) return <Redirect to="/auth" />;
  if (!couple && !user.coupleId) return <Redirect to="/onboarding" />;

  const partner = couple?.members.find(m => m.id !== user.id);
  const myTasks = todos.filter(t => t.assignedTo === 'both' || t.assignedTo === 'her'); // Simplified logic, ideally check against user ID
  const pendingTasks = todos.filter(t => t.status === "pending");
  const completedTasks = todos.filter(t => t.status === "completed");

  const copyInviteCode = () => {
    if (couple?.inviteCode) {
      navigator.clipboard.writeText(couple.inviteCode);
      toast({ title: "Copied!", description: "Invite code copied to clipboard." });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 to-rose-400 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Heart size={120} fill="currentColor" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
            Good morning, {user.name.split(' ')[0]} {partner ? `& ${partner.name.split(' ')[0]} ❤️` : ""}
          </h1>
          <p className="text-pink-100 text-lg mb-6">
            You have {pendingTasks.length} pending tasks together.
          </p>
          
          {!partner && (
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 inline-flex flex-col sm:flex-row items-center gap-3">
              <span className="text-sm font-medium">Waiting for partner? Share this code:</span>
              <div className="flex items-center gap-2">
                <code className="bg-black/20 px-3 py-1 rounded-lg font-mono font-bold">{couple?.inviteCode}</code>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/20 text-white" onClick={copyInviteCode}>
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Task List Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-foreground">Tasks</h2>
          <div className="hidden md:block">
            <CreateTodoDialog />
          </div>
        </div>

        {todosLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        ) : pendingTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-3xl border border-dashed border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No tasks yet</h3>
            <p className="text-muted-foreground mb-6">Start planning your life together!</p>
            <CreateTodoDialog />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
             <div className="space-y-4">
               <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pl-1">To Do</h3>
               {pendingTasks.length === 0 ? (
                 <p className="text-sm text-muted-foreground pl-1">All caught up! 🎉</p>
               ) : (
                 pendingTasks.map(todo => <TodoCard key={todo.id} todo={todo} />)
               )}
             </div>

             <div className="space-y-4">
               <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pl-1">Completed</h3>
               {completedTasks.length === 0 ? (
                 <p className="text-sm text-muted-foreground pl-1">No completed tasks yet.</p>
               ) : (
                 completedTasks.map(todo => <TodoCard key={todo.id} todo={todo} />)
               )}
             </div>
          </div>
        )}
      </section>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <CreateTodoDialog />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}
