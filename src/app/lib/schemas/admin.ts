import { z } from "zod";

const roleEnum = z.enum(["admin"]);

export const AdminRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(3),
  role: roleEnum.default("admin"),
});

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type AdminRegisterInput = z.infer<typeof AdminRegisterSchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;