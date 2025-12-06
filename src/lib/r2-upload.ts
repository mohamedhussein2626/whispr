import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "./r2-config";

export interface UploadResult {
  key: string;
  url: string;
  name: string;
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(
  file: File | Buffer,
  key: string,
  contentType?: string
): Promise<UploadResult> {
  try {
    const buffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer());
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType ?? (file instanceof File ? file.type : "application/octet-stream"),
    });

    await r2Client.send(command);

    // Return the public URL
    const url = `${R2_PUBLIC_URL}/${key}`;
    
    return {
      key,
      url,
      name: file instanceof File ? file.name : key,
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error("Failed to upload file to R2");
  }
}

/**
 * Generate a presigned URL for direct uploads (for large files)
 */
export async function generatePresignedUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for file access
 */
export async function generateAccessUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a unique key for file uploads
 */
export function generateFileKey(filename: string, userId: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = filename.split('.').pop();
  return `uploads/${userId}/${timestamp}-${randomId}.${extension}`;
}
