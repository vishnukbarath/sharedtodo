import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: [api.auth.user.path],
    queryFn: async () => {
      const res = await fetch(api.auth.user.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      return api.auth.user.responses[200].parse(data);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.login.input>) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid credentials");
        throw new Error("Login failed");
      }
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.user.path], user);
      toast({ title: "Welcome back!", description: `Happy to see you again, ${user.name}` });
    },
    onError: (error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = await res.json();
          throw new Error(err.message || "Registration failed");
        }
        throw new Error("Registration failed");
      }
      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Account created", description: "Please log in with your new account" });
    },
    onError: (error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: api.auth.logout.method });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.user.path], null);
      queryClient.clear();
      window.location.href = "/";
    },
  });

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
