import { format } from "date-fns";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  MessageSquare, 
  Trash2, 
  User, 
  Users 
} from "lucide-react";
import type { Todo, Comment } from "@shared/schema";
import { useTodos } from "@/hooks/use-todos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface TodoCardProps {
  todo: Todo & { comments: Comment[] };
}

export function TodoCard({ todo }: TodoCardProps) {
  const { updateTodo, deleteTodo, addComment } = useTodos();
  const [commentText, setCommentText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isCompleted = todo.status === "completed";

  const handleToggle = () => {
    updateTodo.mutate({ 
      id: todo.id, 
      status: isCompleted ? "pending" : "completed" 
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment.mutate(
      { todoId: todo.id, content: commentText }, 
      { onSuccess: () => setCommentText("") }
    );
  };

  const priorityColor = {
    low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    high: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  }[todo.priority] || "bg-gray-100 text-gray-700";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`
        group relative rounded-2xl border border-border bg-card p-4 md:p-5 
        transition-all duration-300 hover:shadow-lg hover:border-primary/20
        ${isCompleted ? "opacity-75 bg-muted/30" : "bg-card"}
      `}
    >
      <div className="flex items-start gap-4">
        <button 
          onClick={handleToggle}
          className="mt-1 text-muted-foreground hover:text-primary transition-colors"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-primary fill-primary/10" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
            <h3 className={`font-semibold text-lg leading-tight ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
              {todo.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={`text-xs font-normal ${priorityColor} border-0`}>
                {todo.priority}
              </Badge>
              {todo.dueDate && (
                <Badge variant="outline" className="text-xs font-normal border-border text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(todo.dueDate), "MMM d")}
                </Badge>
              )}
            </div>
          </div>

          {todo.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {todo.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1" title={`Assigned to ${todo.assignedTo}`}>
                {todo.assignedTo === 'both' ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                <span className="capitalize">{todo.assignedTo}</span>
              </div>
              
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{todo.comments.length} comments</span>
                  </button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteTodo.mutate(todo.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="mt-4 pl-10 space-y-3 border-t border-border/50 pt-3">
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {todo.comments.map((comment) => (
                <div key={comment.id} className="bg-muted/50 p-2.5 rounded-lg text-sm">
                  <p>{comment.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">
                    {format(new Date(comment.createdAt!), "MMM d, h:mm a")}
                  </p>
                </div>
              ))}
              {todo.comments.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No comments yet. Start the conversation!</p>
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="h-9 text-sm"
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!commentText.trim() || addComment.isPending}
                className="h-9"
              >
                Send
              </Button>
            </form>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
