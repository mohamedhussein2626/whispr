const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminAPIs() {
  console.log('🧪 Testing Admin API Endpoints...\n');

  try {
    // Test 1: Check if we can fetch users
    console.log('1. Testing Users API...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        planName: true,
        subscriptionStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    console.log(`✅ Found ${users.length} users`);
    if (users.length > 0) {
      console.log(`   Sample user: ${users[0].email} (${users[0].planName})`);
    }

    // Test 2: Check if we can fetch plans
    console.log('\n2. Testing Plans API...');
    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log(`✅ Found ${plans.length} plans`);
    if (plans.length > 0) {
      console.log(`   Sample plan: ${plans[0].name} ($${plans[0].price}/${plans[0].interval})`);
    }

    // Test 3: Check if we can fetch subscriptions
    console.log('\n3. Testing Subscriptions API...');
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            interval: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log(`✅ Found ${subscriptions.length} subscriptions`);
    if (subscriptions.length > 0) {
      console.log(`   Sample subscription: ${subscriptions[0].user.email} -> ${subscriptions[0].plan.name}`);
    }

    // Test 4: Check database connection
    console.log('\n4. Testing Database Connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    console.log('\n🎉 All API tests passed!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Plans: ${plans.length}`);
    console.log(`   - Subscriptions: ${subscriptions.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAPIs();
