import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create(); // ✅ initializes tRPC with typed context

// ✅ Middleware to ensure user is authenticated using Better Auth
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId || !ctx.user || !ctx.session) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED",
      message: "Authentication required" 
    });
  }

  return next({
    ctx: {
      userId: ctx.userId, // ✅ this narrows userId to non-null downstream
      user: ctx.user,     // ✅ this narrows user to non-null downstream
      session: ctx.session, // ✅ this narrows session to non-null downstream
    },
  });
});

// ✅ Export helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuthed);
