import { useTodos } from "@/hooks/use-todos";
import { TodoCard } from "@/components/todo-card";
import { CreateTodoDialog } from "@/components/create-todo-dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function TasksPage() {
  const { todos, isLoading } = useTodos();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filteredTodos = todos.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ? true : t.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-serif font-bold">All Tasks</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-9 rounded-xl" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CreateTodoDialog />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "pending", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors
              ${filter === f 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"}
            `}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : filteredTodos.length > 0 ? (
          filteredTodos.map(todo => <TodoCard key={todo.id} todo={todo} />)
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No tasks found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
