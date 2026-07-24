import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { toast } from "sonner";

export const getRouter = () => {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(`Action failed: ${error.message}`);
      },
      onSuccess: (data, variables, context, mutation) => {
        if (mutation.meta?.successMessage) {
          toast.success(mutation.meta.successMessage as string);
        }
      },
    }),
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
