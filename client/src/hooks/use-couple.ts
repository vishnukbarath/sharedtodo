import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCouple() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const coupleQuery = useQuery({
    queryKey: [api.couple.get.path],
    queryFn: async () => {
      const res = await fetch(api.couple.get.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch couple data");
      return api.couple.get.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const createCoupleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.couple.create.path, {
        method: api.couple.create.method,
      });
      if (!res.ok) throw new Error("Failed to create couple space");
      return api.couple.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.couple.get.path] });
      // Also invalidate user to update coupleId
      queryClient.invalidateQueries({ queryKey: [api.auth.user.path] });
      toast({ title: "Space created!", description: "Invite your partner to join." });
    },
  });

  const joinCoupleMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      const res = await fetch(api.couple.join.path, {
        method: api.couple.join.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      if (!res.ok) throw new Error("Failed to join couple space. Check the code.");
      return api.couple.join.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.couple.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.user.path] });
      toast({ title: "Joined!", description: "You are now connected with your partner." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return {
    couple: coupleQuery.data,
    isLoading: coupleQuery.isLoading,
    createCouple: createCoupleMutation,
    joinCouple: joinCoupleMutation,
  };
}
