export type AdminRole = "admin";

export interface Admin {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
  created_at?: string;
  updated_at?: string;
}