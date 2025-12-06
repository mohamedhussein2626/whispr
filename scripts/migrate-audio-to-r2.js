const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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

async function migrateAudioFiles() {
  try {
    console.log('🎵 Starting audio files migration to R2...');
    
    // Get all podcast sections with local audio files
    const sections = await prisma.podcastSection.findMany({
      where: {
        audioUrl: {
          startsWith: '/api/audio/'
        }
      },
      include: {
        podcast: {
          include: {
            file: true
          }
        }
      }
    });

    console.log(`🎵 Found ${sections.length} audio files to migrate`);

    for (const section of sections) {
      try {
        console.log(`\n🎵 Processing audio: ${section.title}`);
        console.log(`🔗 Current URL: ${section.audioUrl}`);

        // Read local audio file
        const filename = section.audioUrl.replace('/api/audio/', '');
        const localPath = path.join(process.cwd(), 'public', 'uploads', 'audio', filename);
        
        if (!fs.existsSync(localPath)) {
          console.error(`❌ Local file not found: ${localPath}`);
          continue;
        }

        const fileBuffer = fs.readFileSync(localPath);
        console.log(`📦 Read ${fileBuffer.length} bytes from local file`);

        // Generate new R2 key
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const newKey = `uploads/audio/${section.podcast.file.userId}/${timestamp}-${randomId}.wav`;

        // Upload to R2
        const uploadCommand = new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: newKey,
          Body: fileBuffer,
          ContentType: 'audio/wav',
        });

        await r2Client.send(uploadCommand);
        const newUrl = `${R2_PUBLIC_URL}/${newKey}`;
        console.log(`✅ Uploaded to R2: ${newUrl}`);

        // Update database with new URL
        await prisma.podcastSection.update({
          where: { id: section.id },
          data: {
            audioUrl: newUrl,
          },
        });

        console.log(`✅ Updated database record`);

        // Optionally delete local file after successful upload
        // fs.unlinkSync(localPath);
        // console.log(`🗑️ Deleted local file: ${localPath}`);

      } catch (error) {
        console.error(`❌ Error processing audio ${section.title}:`, error.message);
        continue;
      }
    }

    console.log('\n🎉 Audio migration completed!');
    
  } catch (error) {
    console.error('❌ Audio migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateAudioFiles();
