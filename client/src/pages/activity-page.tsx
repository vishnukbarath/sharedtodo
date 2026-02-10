import { useActivity } from "@/hooks/use-activity";
import { format } from "date-fns";
import { CheckCircle2, PlusCircle, UserPlus, Calendar } from "lucide-react";

export default function ActivityPage() {
  const { data: logs, isLoading } = useActivity();

  return (
    <div className="space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-serif font-bold">Our Story</h1>
        <p className="text-muted-foreground mt-2">A timeline of your shared accomplishments.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 bg-muted rounded-xl animate-pulse" />
          <div className="h-12 bg-muted rounded-xl animate-pulse" />
          <div className="h-12 bg-muted rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="relative border-l-2 border-muted ml-4 space-y-8 py-4">
          {logs?.map((log) => {
            const Icon = {
              create_todo: PlusCircle,
              complete_todo: CheckCircle2,
              join_couple: UserPlus,
            }[log.action] || Calendar;

            return (
              <div key={log.id} className="relative pl-8">
                <div className="absolute -left-[9px] top-1 bg-background p-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    {format(new Date(log.createdAt!), "MMM d, yyyy")}
                  </span>
                  <div className="h-px bg-border flex-1 hidden sm:block" />
                </div>

                <div className="bg-card p-4 rounded-xl border shadow-sm flex items-start gap-4">
                  <div className="bg-muted p-2 rounded-full shrink-0">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {log.details || formatAction(log.action)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {format(new Date(log.createdAt!), "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {logs?.length === 0 && (
            <p className="pl-8 text-muted-foreground italic">No activity yet. Start creating memories!</p>
          )}
        </div>
      )}
    </div>
  );
}

function formatAction(action: string) {
  switch (action) {
    case 'create_todo': return 'Created a new task';
    case 'complete_todo': return 'Completed a task';
    case 'join_couple': return 'Joined the workspace';
    default: return 'Activity';
  }
}
