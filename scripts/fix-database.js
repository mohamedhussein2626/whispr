// Fix database schema for Better Auth compatibility
// Run this script to make the password field optional

const { PrismaClient } = require('@prisma/client');

async function fixDatabaseSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing database schema...');
    
    // Make password field optional
    await prisma.$executeRaw`
      ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;
    `;
    
    console.log('✅ Password field is now optional');
    
    // Add a comment to explain the change
    await prisma.$executeRaw`
      COMMENT ON COLUMN "user"."password" IS 'Optional password field - required for email/password auth, null for social logins';
    `;
    
    console.log('✅ Database schema fixed successfully!');
    console.log('🎉 You can now sign up and sign in with email/password and Google OAuth');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    
    if (error.message.includes('column "password" is already nullable')) {
      console.log('✅ Password field is already optional - no changes needed');
    } else {
      console.log('💡 Try running this command manually in your database:');
      console.log('   ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL;');
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseSchema();




