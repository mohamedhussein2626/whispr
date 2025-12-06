import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/trpc";
import { createContext } from "@/trpc/context";

const handler = (req: Request) => {
  console.log("tRPC Request:", req.method, req.url);

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      console.error("tRPC Error:", error);
    },
  });
};

export { handler as GET, handler as POST };
