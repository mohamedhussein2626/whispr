export interface FileData {
  id: string;
  name: string;
  uploadStatus: "PENDING" | "PROCESSING" | "FAILED" | "SUCCESS";
  url: string;
  key: string;
  createdAt: string; // Prisma returns this as string
  updatedAt: string; // Prisma returns this as string
  userId: string | null; // Can be null from Prisma
  fileType: string | null;
  source: string | null;
}
