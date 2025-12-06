#!/usr/bin/env node

/**
 * Enhanced Podcast Integration Test Script
 * 
 * This script tests the complete podcast integration flow:
 * 1. Database schema validation
 * 2. ElevenLabs API connectivity
 * 3. R2 storage configuration
 * 4. Audio generation and upload
 * 5. Cleanup functionality
 */

import { PrismaClient } from '@prisma/client';
import { podcastAudioGenerator } from './src/lib/elevenlabs-podcast';
import { podcastCleanupService } from './src/lib/podcast-cleanup';
import { r2AudioClient, R2_AUDIO_BUCKET_NAME } from './src/lib/r2-audio-config';

const prisma = new PrismaClient();

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

class PodcastIntegrationTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Enhanced Podcast Integration Tests...\n');

    await this.testDatabaseConnection();
    await this.testEnvironmentVariables();
    await this.testR2Configuration();
    await this.testElevenLabsAPI();
    await this.testAudioGeneration();
    await this.testCleanupService();
    await this.testDatabaseSchema();

    this.printResults();
  }

  private async testDatabaseConnection(): Promise<void> {
    const start = Date.now();
    try {
      await prisma.$connect();
      await prisma.podcast.count();
      this.addResult('Database Connection', 'PASS', 'Successfully connected to database', Date.now() - start);
    } catch (error) {
      this.addResult('Database Connection', 'FAIL', `Database connection failed: ${error}`, Date.now() - start);
    }
  }

  private async testEnvironmentVariables(): Promise<void> {
    const start = Date.now();
    const requiredVars = [
      'ELEVEN_LABS_API_KEY',
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
      'CLOUDFLARE_R2_BUCKET_NAME',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      this.addResult('Environment Variables', 'PASS', 'All required environment variables are set', Date.now() - start);
    } else {
      this.addResult('Environment Variables', 'FAIL', `Missing variables: ${missingVars.join(', ')}`, Date.now() - start);
    }
  }

  private async testR2Configuration(): Promise<void> {
    const start = Date.now();
    try {
      // Test R2 client configuration
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      const response = await r2AudioClient.send(new ListObjectsV2Command({
        Bucket: R2_AUDIO_BUCKET_NAME,
        MaxKeys: 1,
      }));
      
      this.addResult('R2 Configuration', 'PASS', `R2 bucket accessible: ${R2_AUDIO_BUCKET_NAME}`, Date.now() - start);
    } catch (error) {
      this.addResult('R2 Configuration', 'FAIL', `R2 configuration error: ${error}`, Date.now() - start);
    }
  }

  private async testElevenLabsAPI(): Promise<void> {
    const start = Date.now();
    try {
      // Test ElevenLabs API connectivity
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY!,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.addResult('ElevenLabs API', 'PASS', `API accessible, ${data.voices?.length || 0} voices available`, Date.now() - start);
      } else {
        this.addResult('ElevenLabs API', 'FAIL', `API error: ${response.status} ${response.statusText}`, Date.now() - start);
      }
    } catch (error) {
      this.addResult('ElevenLabs API', 'FAIL', `ElevenLabs API test failed: ${error}`, Date.now() - start);
    }
  }

  private async testAudioGeneration(): Promise<void> {
    const start = Date.now();
    try {
      // Test audio generation with small sample
      const testContent = "This is a test of the enhanced podcast integration system.";
      const testPodcastId = 'test-podcast-' + Date.now();
      const testUserId = 'test-user';

      const result = await podcastAudioGenerator.generatePodcastAudio(
        testContent,
        testPodcastId,
        testUserId
      );

      if (result.audioUrl && result.duration > 0) {
        this.addResult('Audio Generation', 'PASS', `Audio generated: ${result.duration}s, ${result.fileSize} bytes`, Date.now() - start);
        
        // Clean up test audio
        await podcastAudioGenerator.deleteOldAudio(result.audioUrl);
      } else {
        this.addResult('Audio Generation', 'FAIL', 'Audio generation returned invalid result', Date.now() - start);
      }
    } catch (error) {
      this.addResult('Audio Generation', 'FAIL', `Audio generation failed: ${error}`, Date.now() - start);
    }
  }

  private async testCleanupService(): Promise<void> {
    const start = Date.now();
    try {
      const stats = await podcastCleanupService.getCleanupStats();
      this.addResult('Cleanup Service', 'PASS', `Cleanup service accessible. Stats: ${stats.totalPodcasts} podcasts`, Date.now() - start);
    } catch (error) {
      this.addResult('Cleanup Service', 'FAIL', `Cleanup service error: ${error}`, Date.now() - start);
    }
  }

  private async testDatabaseSchema(): Promise<void> {
    const start = Date.now();
    try {
      // Test enhanced schema fields
      const testPodcast = await prisma.podcast.create({
        data: {
          fileId: 'test-file-' + Date.now(),
          title: 'Test Podcast',
          description: 'Test Description',
          totalDuration: '1:00',
          userId: 'test-user',
          autoDeleteAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isProcessed: true,
          generationMethod: 'text-to-dialogue',
          audioFileSize: 1024000,
          audioFormat: 'wav',
        },
      });

      // Test enhanced section schema
      await prisma.podcastSection.create({
        data: {
          podcastId: testPodcast.id,
          title: 'Test Section',
          description: 'Test Section Description',
          content: 'Test content',
          duration: '1:00',
          order: 0,
          isProcessed: true,
          generationMethod: 'text-to-dialogue',
          audioFileSize: 512000,
          audioFormat: 'wav',
        },
      });

      // Clean up test data
      await prisma.podcast.delete({
        where: { id: testPodcast.id },
      });

      this.addResult('Database Schema', 'PASS', 'Enhanced schema fields working correctly', Date.now() - start);
    } catch (error) {
      this.addResult('Database Schema', 'FAIL', `Schema test failed: ${error}`, Date.now() - start);
    }
  }

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, duration?: number): void {
    this.results.push({ test, status, message, duration });
  }

  private printResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.test}: ${result.message}${duration}`);
    });

    console.log('\n' + '=' .repeat(50));
    console.log(`📈 Total: ${this.results.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed} | ⏭️ Skipped: ${skipped}`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Enhanced podcast integration is ready to use.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the configuration and try again.');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new PodcastIntegrationTester();
  tester.runAllTests()
    .then(() => {
      console.log('\n🏁 Test execution completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { PodcastIntegrationTester };
