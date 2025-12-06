const Stripe = require('stripe');

// Test script to verify Stripe configuration
async function testStripeConfig() {
  console.log('🔍 Testing Stripe Configuration...\n');

  // Check environment variables
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('Environment Variables:');
  console.log(`STRIPE_SECRET_KEY: ${stripeSecretKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`STRIPE_WEBHOOK_SECRET: ${stripeWebhookSecret ? '✅ Set' : '❌ Missing'}\n`);

  if (!stripeSecretKey) {
    console.log('❌ STRIPE_SECRET_KEY is missing. Please add it to your .env.local file.');
    return;
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-06-30.basil',
    });

    console.log('Testing Stripe Connection...');

    // Test API connection
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Stripe connection successful`);
    console.log(`Account: ${account.business_profile?.name || 'Test Account'}\n`);

    // Test price retrieval
    console.log('Testing Price Configuration...');
    const prices = await stripe.prices.list({ limit: 10 });
    
    const testPrices = prices.data.filter(price => 
      price.id === 'price_1RmQzPCd54QIP0qutag9E8vX' || 
      price.product_data?.name?.includes('WhisprPDF')
    );

    if (testPrices.length > 0) {
      console.log('✅ Found configured prices:');
      testPrices.forEach(price => {
        console.log(`  - ${price.id}: ${price.unit_amount / 100} ${price.currency} per ${price.recurring?.interval}`);
      });
    } else {
      console.log('⚠️  No matching prices found. Make sure your price ID is correct.');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Make sure your webhook URL is set up in Stripe Dashboard');
    console.log('2. Test the payment flow with card: 4242 4242 4242 4242');
    console.log('3. Check that webhook events are being received');

  } catch (error) {
    console.log('❌ Stripe connection failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('- Your STRIPE_SECRET_KEY is correct');
    console.log('- You have internet connection');
    console.log('- Your Stripe account is active');
  }
}

// Run the test
testStripeConfig().catch(console.error); 