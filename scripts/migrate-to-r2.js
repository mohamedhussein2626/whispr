const { PrismaClient } = require('@prisma/client');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// R2 Configuration
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

async function migrateFilesToR2() {
  try {
    console.log('🚀 Starting migration from Uploadthing to Cloudflare R2...');
    
    // Get all files from database
    const files = await prisma.file.findMany({
      where: {
        uploadStatus: 'SUCCESS',
        url: {
          contains: 'uploadthing'
        }
      }
    });

    console.log(`📁 Found ${files.length} files to migrate`);

    for (const file of files) {
      try {
        console.log(`\n📄 Processing file: ${file.name} (ID: ${file.id})`);
        console.log(`🔗 Current URL: ${file.url}`);

        // Download file from Uploadthing
        const response = await fetch(file.url);
        if (!response.ok) {
          console.error(`❌ Failed to download file: ${response.status} ${response.statusText}`);
          continue;
        }

        const fileBuffer = await response.arrayBuffer();
        console.log(`📦 Downloaded ${fileBuffer.byteLength} bytes`);

        // Generate new R2 key
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop();
        const newKey = `uploads/${file.userId}/${timestamp}-${randomId}.${extension}`;

        // Upload to R2
        const uploadCommand = new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: newKey,
          Body: Buffer.from(fileBuffer),
          ContentType: 'application/pdf',
        });

        await r2Client.send(uploadCommand);
        const newUrl = `${R2_PUBLIC_URL}/${newKey}`;
        console.log(`✅ Uploaded to R2: ${newUrl}`);

        // Update database with new URL and key
        await prisma.file.update({
          where: { id: file.id },
          data: {
            url: newUrl,
            key: newKey,
          },
        });

        console.log(`✅ Updated database record`);

      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error.message);
        continue;
      }
    }

    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateFilesToR2();
