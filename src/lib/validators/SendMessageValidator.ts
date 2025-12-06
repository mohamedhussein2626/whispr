import { z } from "zod";

export const SendMessageValidator = z.object({
  fileId: z.string(),
  message: z.string(),
  limit: z.number().optional().default(20), // Optional, default = 20
  skip: z.number().optional().default(0), // Optional, default = 0
});
