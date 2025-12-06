import { TRPCError } from "@trpc/server";
import { privateProcedure, router } from "./trpc";
import { db } from "@/db";
import z from "zod";
import { INFINITE_QUERY_LIMIT } from "@/app/config/infinite-query";

export const appRouter = router({
  // Get current user info using Better Auth
  me: privateProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const user = await db.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        name: true,
        email: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
    }

    return user;
  }),

  // Check if user is authenticated
  isAuthenticated: privateProcedure.query(() => {
    return { isAuthenticated: true };
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    //const userId = ctx.userId;
    const { userId } = ctx;

    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    return await db.file.findMany({
      where: {
        userId: ctx.userId,
        // Exclude essay-only files from main dashboard
        source: {
          notIn: ["essay_writer", "essay_grader"],
        },
      },
    });
  }),

  // delete files for users //

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      // Delete all related records in the correct order
      try {
        // 1. Delete podcast sections first (they reference podcasts)
        await db.podcastSection.deleteMany({
          where: {
            podcast: {
              fileId: input.id,
            },
          },
        });

        // 2. Delete podcasts
        await db.podcast.deleteMany({
          where: {
            fileId: input.id,
          },
        });

        // 3. Delete quiz questions first (they reference quizzes)
        await db.quizQuestion.deleteMany({
          where: {
            quiz: {
              fileId: input.id,
            },
          },
        });

        // 4. Delete quizzes
        await db.quiz.deleteMany({
          where: {
            fileId: input.id,
          },
        });

        // 5. Delete flashcards
        await db.flashcard.deleteMany({
          where: {
            flashcards: {
              fileId: input.id,
            },
          },
        });

        // 6. Delete flashcards sets
        await db.flashcards.deleteMany({
          where: {
            fileId: input.id,
          },
        });

        // 7. Messages and Chunks will be deleted automatically due to onDelete: Cascade

        // 8. Finally delete the file
        await db.file.delete({
          where: {
            id: input.id,
          },
        });

        console.log(
          `✅ Successfully deleted file ${input.id} and all related records`,
        );
        return file;
      } catch (error) {
        console.error("❌ Error deleting file and related records:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete file and related records",
        });
      }
    }),

  // lets get a single file //

  getFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    }),

  // lets get fileMessages //

  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages,
        nextCursor,
      };
    }),

  

  

  // let get a status of the file we gonna upload it //
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });

      if (!file) return { status: "PENDING" as const };

      return { status: file.uploadStatus };
    }),
});

export type AppRouter = typeof appRouter;
