import nodemailer from 'nodemailer';

// Email configuration - supports multiple providers
const getEmailConfig = () => {
  // If custom SMTP settings are provided, use them
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
    return {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };
  }

  // Otherwise, use service-based configuration
  return {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
};

// Create transporter
const transporter = nodemailer.createTransport(getEmailConfig());

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to NotebookLama! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 10px;">Welcome to NotebookLama!</h1>
          <p style="color: #666; font-size: 16px;">Your AI-Powered Knowledge Companion</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 30px; border-radius: 15px; color: white; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 24px;">Hello ${name}! 👋</h2>
          <p style="margin: 0; font-size: 16px; line-height: 1.6;">
            Thank you for joining NotebookLama! We're excited to help you transform your notebooks into intelligent conversations.
          </p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; font-size: 20px; margin-bottom: 15px;">What you can do with NotebookLama:</h3>
          <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
            <li>📝 Upload PDFs, documents, and notes in any format</li>
            <li>💬 Chat naturally with your notebooks using advanced AI</li>
            <li>🧠 Get smart summaries and contextual answers</li>
            <li>⚡ Find any information across all your notebooks instantly</li>
            <li>🎯 Generate flashcards, quizzes, and podcasts from your content</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard" 
             style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
            Get Started Now
          </a>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
          <h4 style="color: #333; margin: 0 0 10px 0;">Need help getting started?</h4>
          <p style="color: #666; margin: 0; font-size: 14px;">
            Check out our <a href="${process.env.BASE_URL || 'http://localhost:3000'}/about" style="color: #7c3aed;">getting started guide</a> or 
            <a href="${process.env.BASE_URL || 'http://localhost:3000'}/contact" style="color: #7c3aed;">contact our support team</a>.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>This email was sent to you because you created an account with NotebookLama.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  forgotPassword: (name: string, password: string) => ({
    subject: 'Your NotebookLama Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 10px;">Password Reset</h1>
          <p style="color: #666; font-size: 16px;">Your NotebookLama Account</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 15px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 24px; color: #333;">Hello ${name}! 👋</h2>
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #666;">
            You requested a password reset for your NotebookLama account. Here are your login credentials:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; border: 2px solid #7c3aed; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">Your Login Information:</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> Your registered email address</p>
            <p style="margin: 5px 0; color: #666;"><strong>Password:</strong> <code style="background: #f1f5f9; padding: 5px 10px; border-radius: 5px; font-family: monospace;">${password}</code></p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 10px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Security Note:</strong> For your security, we recommend changing this password after logging in.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.BASE_URL || 'http://localhost:3000'}/auth" 
             style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
          <h4 style="color: #333; margin: 0 0 10px 0;">Need help?</h4>
          <p style="color: #666; margin: 0; font-size: 14px;">
            If you didn't request this password reset or need assistance, please 
            <a href="${process.env.BASE_URL || 'http://localhost:3000'}/contact" style="color: #7c3aed;">contact our support team</a>.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>This email was sent because you requested a password reset for your NotebookLama account.</p>
          <p>If you didn't make this request, please ignore this email and your account remains secure.</p>
        </div>
      </div>
    `,
  }),

  paymentConfirmation: (name: string, planName: string, amount: number, subscriptionId?: string) => ({
    subject: `Payment Confirmed - ${planName} Plan`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 10px;">Payment Confirmed! 🎉</h1>
          <p style="color: #666; font-size: 16px;">Your NotebookLama Subscription</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 15px; color: white; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 24px;">Thank you, ${name}! 💳</h2>
          <p style="margin: 0; font-size: 16px; line-height: 1.6;">
            Your payment has been successfully processed and your subscription is now active.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 15px; margin-bottom: 30px;">
          <h3 style="color: #333; font-size: 20px; margin-bottom: 20px;">Subscription Details:</h3>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Plan:</span>
              <span style="color: #333; font-weight: bold;">${planName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Amount:</span>
              <span style="color: #333; font-weight: bold;">$${amount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Status:</span>
              <span style="color: #10b981; font-weight: bold;">✅ Active</span>
            </div>
            ${subscriptionId ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #666;">Subscription ID:</span>
              <span style="color: #333; font-family: monospace; font-size: 12px;">${subscriptionId}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="background: #ecfdf5; padding: 15px; border-radius: 10px; border-left: 4px solid #10b981;">
            <h4 style="margin: 0 0 10px 0; color: #065f46;">🎯 What's Next?</h4>
            <ul style="margin: 0; color: #047857; font-size: 14px; line-height: 1.6;">
              <li>Access all premium features immediately</li>
              <li>Upload unlimited documents and notes</li>
              <li>Generate advanced AI content (flashcards, quizzes, podcasts)</li>
              <li>Priority customer support</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard" 
             style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
            Access Your Dashboard
          </a>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
          <h4 style="color: #333; margin: 0 0 10px 0;">Manage Your Subscription</h4>
          <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
            You can manage your subscription, update payment methods, or cancel anytime from your dashboard.
          </p>
          <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard/billing" 
             style="color: #7c3aed; text-decoration: none; font-size: 14px;">Manage Subscription →</a>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>This is a payment confirmation email for your NotebookLama subscription.</p>
          <p>If you have any questions about your subscription, please contact our support team.</p>
        </div>
      </div>
    `,
  }),
};

// Email sending functions
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const template = emailTemplates.welcome(name);
    
    const mailOptions = {
      from: `"NotebookLama" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendForgotPasswordEmail(email: string, name: string, password: string) {
  try {
    const template = emailTemplates.forgotPassword(name, password);
    
    const mailOptions = {
      from: `"NotebookLama" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Forgot password email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending forgot password email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendPaymentConfirmationEmail(
  email: string, 
  name: string, 
  planName: string, 
  amount: number, 
  subscriptionId?: string
) {
  try {
    const template = emailTemplates.paymentConfirmation(name, planName, amount, subscriptionId);
    
    const mailOptions = {
      from: `"NotebookLama" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test email function
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('Email server connection verified successfully');
    return { success: true };
  } catch (error) {
    console.error('Email server connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
