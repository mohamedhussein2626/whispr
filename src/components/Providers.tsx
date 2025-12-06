"use client";

import { absoluteUrl } from "@/lib/utils";
import { trpc } from "@/app/_trpc/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { PropsWithChildren, useState } from "react";

const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: absoluteUrl("/api/trpc"),
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include", // <-- Ensure cookies are sent
            } as RequestInit);
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default Providers;
