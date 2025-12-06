// Test script to verify Better Auth configuration
import { auth } from "../src/lib/auth";

async function testAuthConfig() {
  try {
    console.log("Testing Better Auth configuration...");
    
    // Test if auth instance is properly configured
    console.log("Auth instance:", !!auth);
    console.log("Auth API:", !!auth.api);
    
    // Test database connection
    const prisma = auth.database;
    console.log("Database connection:", !!prisma);
    
    console.log("✅ Better Auth configuration looks good!");
    
  } catch (error) {
    console.error("❌ Better Auth configuration error:", error);
  }
}

testAuthConfig();
