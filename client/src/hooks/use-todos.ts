import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertTodo } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Helper to remove date coercion issues if any
type CreateTodoInput = Omit<InsertTodo, "id" | "createdAt" | "coupleId" | "createdBy">;

export function useTodos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: [api.todos.list.path],
    queryFn: async () => {
      const res = await fetch(api.todos.list.path);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return api.todos.list.responses[200].parse(await res.json());
    },
  });

  const createTodoMutation = useMutation({
    mutationFn: async (todo: CreateTodoInput) => {
      const res = await fetch(api.todos.create.path, {
        method: api.todos.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return api.todos.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.activity.list.path] });
      toast({ title: "Task added", description: "Let's get things done together!" });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<CreateTodoInput>) => {
      const url = buildUrl(api.todos.update.path, { id });
      const res = await fetch(url, {
        method: api.todos.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return api.todos.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.activity.list.path] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.todos.delete.path, { id });
      const res = await fetch(url, {
        method: api.todos.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
      toast({ title: "Task removed" });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ todoId, content }: { todoId: number; content: string }) => {
      const url = buildUrl(api.comments.create.path, { id: todoId });
      const res = await fetch(url, {
        method: api.comments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return api.comments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
    },
  });

  return {
    todos: todosQuery.data ?? [],
    isLoading: todosQuery.isLoading,
    createTodo: createTodoMutation,
    updateTodo: updateTodoMutation,
    deleteTodo: deleteTodoMutation,
    addComment: addCommentMutation,
  };
}
