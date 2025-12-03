/**
 * Email Service for Welcome Messages
 * In production, integrate with:
 * - SendGrid (npm install @sendgrid/mail)
 * - Mailgun (npm install mailgun-js)
 * - Nodemailer (npm install nodemailer)
 * - AWS SES
 */

interface WelcomeEmailData {
  email: string;
  firstName: string;
  lastName: string;
  role: "collector" | "vendor" | "factory" | "admin";
  username: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  try {
    const { email, firstName, lastName, role, username } = data;
    
    // Get role-specific welcome message
    const welcomeMessage = getWelcomeMessage(role, firstName, username);
    
    // In production, send actual email here
    // For now, log to console
    console.log("\n" + "=".repeat(80));
    console.log("📧 WELCOME EMAIL SENT");
    console.log("=".repeat(80));
    console.log(`To: ${email}`);
    console.log(`Name: ${firstName} ${lastName}`);
    console.log(`Role: ${role.toUpperCase()}`);
    console.log(`Username: ${username}`);
    console.log("-".repeat(80));
    console.log(welcomeMessage);
    console.log("=".repeat(80) + "\n");
    
    // Simulate email sending
    // In production, use one of these:
    /*
    // SendGrid example:
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: email,
      from: 'noreply@waste2wealth.ng',
      subject: getEmailSubject(role),
      html: welcomeMessage,
    });
    */
    
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

function getEmailSubject(role: string): string {
  switch (role) {
    case "collector":
      return "🎉 Welcome to Waste2Wealth - Start Collecting Today!";
    case "vendor":
      return "🎉 Welcome to Waste2Wealth - Manage Your Waste Operations";
    case "factory":
      return "🎉 Welcome to Waste2Wealth - Source Quality Recycled Materials";
    default:
      return "🎉 Welcome to Waste2Wealth Platform";
  }
}

function getWelcomeMessage(role: string, firstName: string, username: string): string {
  const baseUrl = "http://localhost:4000"; // Change to production URL
  
  if (role === "collector") {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .feature { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 5px; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Waste2Wealth!</h1>
      <p>Start Your Journey as a Waste Collector</p>
    </div>
    
    <div class="content">
      <h2>Hi ${firstName}! 👋</h2>
      
      <p>Congratulations on joining <strong>Waste2Wealth</strong>! We're excited to have you as part of our community that's transforming waste into wealth while building a sustainable future for Nigeria.</p>
      
      <p><strong>Your Account Details:</strong></p>
      <ul>
        <li>Username: <strong>${username}</strong></li>
        <li>Role: <strong>Waste Collector</strong></li>
      </ul>
      
      <a href="${baseUrl}" class="button">Go to Dashboard</a>
      
      <h3>🚀 Get Started in 5 Easy Steps:</h3>
      
      <div class="feature">
        <strong>1. Complete Your Profile</strong><br>
        Add your personal details, emergency contact, and service area to build trust with vendors.
      </div>
      
      <div class="feature">
        <strong>2. Upload Your Photo</strong><br>
        Add a clear profile photo so vendors can easily identify you during waste drops.
      </div>
      
      <div class="feature">
        <strong>3. Verify Your Identity (KYC)</strong><br>
        Upload your Voter's Card to get verified and unlock all platform features.
      </div>
      
      <div class="feature">
        <strong>4. Get Your Barcode</strong><br>
        Download/print your unique QR code to use for quick waste drop verification.
      </div>
      
      <div class="feature">
        <strong>5. Start Collecting!</strong><br>
        Find vendors, drop your waste, scan your barcode, and get paid instantly!
      </div>
      
      <h3>💰 Earning Potential:</h3>
      <ul>
        <li>Plastic: ₦50 per kg</li>
        <li>Metal: ₦80 per kg</li>
        <li>Organic: ₦30 per kg</li>
        <li>Paper: ₦25 per kg</li>
        <li>Glass: ₦40 per kg</li>
        <li>Electronics: ₦100 per kg</li>
      </ul>
      
      <h3>📱 Need Help?</h3>
      <p>Our AI chatbot is available 24/7 to answer your questions. You can also:</p>
      <ul>
        <li>Check our FAQ section in the dashboard</li>
        <li>Contact support at <a href="mailto:support@waste2wealth.ng">support@waste2wealth.ng</a></li>
        <li>Call us at +234 XXX XXX XXXX</li>
      </ul>
      
      <p><strong>Ready to make a difference?</strong><br>
      Log in to your dashboard and start your journey towards a cleaner, wealthier Nigeria!</p>
      
      <a href="${baseUrl}" class="button">Access Dashboard</a>
    </div>
    
    <div class="footer">
      <p>Waste2Wealth - Transforming Waste into Wealth</p>
      <p>Empowering Jobless Youth | Building Sustainable Communities</p>
      <p>&copy; 2025 Waste2Wealth. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
  } else if (role === "vendor") {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .feature { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #f5576c; border-radius: 5px; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Waste2Wealth!</h1>
      <p>Streamline Your Waste Management Operations</p>
    </div>
    
    <div class="content">
      <h2>Hi ${firstName}! 👋</h2>
      
      <p>Welcome to <strong>Waste2Wealth</strong>! As a registered vendor, you're now part of Nigeria's leading waste management ecosystem connecting collectors, vendors, and factories.</p>
      
      <p><strong>Your Account Details:</strong></p>
      <ul>
        <li>Username: <strong>${username}</strong></li>
        <li>Role: <strong>Vendor</strong></li>
      </ul>
      
      <a href="${baseUrl}" class="button">Go to Dashboard</a>
      
      <h3>🚀 Get Started:</h3>
      
      <div class="feature">
        <strong>1. Complete Your Business Profile</strong><br>
        Add your business details, operating hours, and services to attract more collectors.
      </div>
      
      <div class="feature">
        <strong>2. Link Your Bank Account</strong><br>
        Connect your business bank account for seamless transactions.
      </div>
      
      <div class="feature">
        <strong>3. Start Accepting Drops</strong><br>
        Use the barcode scanner in your dashboard to verify collectors and log waste drops.
      </div>
      
      <div class="feature">
        <strong>4. Manage Inventory</strong><br>
        Track all waste collected, confirmed, and sold to factories in real-time.
      </div>
      
      <h3>📊 Vendor Features:</h3>
      <ul>
        <li><strong>Barcode Scanner:</strong> Quickly verify collectors and log drops</li>
        <li><strong>KYC Verification:</strong> See collector verification status before accepting drops</li>
        <li><strong>Payment Automation:</strong> Collectors paid instantly upon confirmation</li>
        <li><strong>Transaction History:</strong> Complete records of all operations</li>
        <li><strong>Factory Connections:</strong> Connect with recycling factories</li>
        <li><strong>Analytics Dashboard:</strong> Track business performance</li>
      </ul>
      
      <h3>💡 Pro Tips:</h3>
      <ul>
        <li>Always verify collector barcodes before accepting waste</li>
        <li>Check KYC status for high-value transactions</li>
        <li>Keep your operating hours updated</li>
        <li>Respond quickly to collector inquiries</li>
        <li>Maintain accurate weight measurements</li>
      </ul>
      
      <h3>📱 Need Help?</h3>
      <p>Contact us anytime:</p>
      <ul>
        <li>Email: <a href="mailto:vendors@waste2wealth.ng">vendors@waste2wealth.ng</a></li>
        <li>Phone: +234 XXX XXX XXXX</li>
        <li>Live Chat: Available in your dashboard</li>
      </ul>
      
      <p><strong>Ready to optimize your operations?</strong><br>
      Log in to your dashboard and start managing your waste efficiently!</p>
      
      <a href="${baseUrl}" class="button">Access Dashboard</a>
    </div>
    
    <div class="footer">
      <p>Waste2Wealth - Transforming Waste into Wealth</p>
      <p>Empowering Businesses | Building Sustainable Operations</p>
      <p>&copy; 2025 Waste2Wealth. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
  } else if (role === "factory") {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #00f2fe; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .feature { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #00f2fe; border-radius: 5px; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Waste2Wealth!</h1>
      <p>Source Quality Recycled Materials</p>
    </div>
    
    <div class="content">
      <h2>Hi ${firstName}! 👋</h2>
      
      <p>Welcome to <strong>Waste2Wealth</strong>! As a registered recycling factory, you now have direct access to a reliable supply chain of quality recycled materials from verified vendors across Nigeria.</p>
      
      <p><strong>Your Account Details:</strong></p>
      <ul>
        <li>Username: <strong>${username}</strong></li>
        <li>Role: <strong>Recycling Factory</strong></li>
      </ul>
      
      <a href="${baseUrl}" class="button">Go to Dashboard</a>
      
      <h3>🚀 Get Started:</h3>
      
      <div class="feature">
        <strong>1. Complete Your Factory Profile</strong><br>
        Add your facility details, accepted waste types, and processing capacity.
      </div>
      
      <div class="feature">
        <strong>2. Set Your Material Requirements</strong><br>
        Specify the types and quantities of materials you need.
      </div>
      
      <div class="feature">
        <strong>3. Connect with Vendors</strong><br>
        Browse and connect with verified vendors in your region.
      </div>
      
      <div class="feature">
        <strong>4. Place Orders</strong><br>
        Request materials and track deliveries in real-time.
      </div>
      
      <h3>📊 Factory Features:</h3>
      <ul>
        <li><strong>Vendor Network:</strong> Access to verified waste vendors</li>
        <li><strong>Material Tracking:</strong> Monitor material quality and quantities</li>
        <li><strong>Order Management:</strong> Streamlined procurement process</li>
        <li><strong>Quality Control:</strong> Rate vendors and materials</li>
        <li><strong>Analytics:</strong> Track sourcing costs and efficiency</li>
        <li><strong>Payment Integration:</strong> Secure transactions</li>
      </ul>
      
      <h3>🏭 Material Types Available:</h3>
      <ul>
        <li><strong>Plastic:</strong> PET, HDPE, PVC, LDPE, PP, PS</li>
        <li><strong>Metal:</strong> Aluminum, Steel, Copper, Brass</li>
        <li><strong>Organic:</strong> Food waste, Agricultural waste</li>
        <li><strong>Paper:</strong> Cardboard, Newspaper, Office paper</li>
        <li><strong>Glass:</strong> Clear, Green, Brown bottles</li>
        <li><strong>Electronics:</strong> E-waste components</li>
      </ul>
      
      <h3>💡 Best Practices:</h3>
      <ul>
        <li>Clearly communicate your quality requirements</li>
        <li>Maintain consistent pickup schedules</li>
        <li>Provide feedback to vendors for improvement</li>
        <li>Update your material needs regularly</li>
        <li>Build long-term vendor relationships</li>
      </ul>
      
      <h3>📱 Need Help?</h3>
      <p>Our team is here to support you:</p>
      <ul>
        <li>Email: <a href="mailto:factories@waste2wealth.ng">factories@waste2wealth.ng</a></li>
        <li>Phone: +234 XXX XXX XXXX</li>
        <li>Account Manager: Available upon request</li>
      </ul>
      
      <p><strong>Ready to secure your supply chain?</strong><br>
      Log in to your dashboard and start sourcing quality recycled materials!</p>
      
      <a href="${baseUrl}" class="button">Access Dashboard</a>
    </div>
    
    <div class="footer">
      <p>Waste2Wealth - Transforming Waste into Wealth</p>
      <p>Powering Sustainable Manufacturing | Building Circular Economy</p>
      <p>&copy; 2025 Waste2Wealth. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
  }
  
  // Default/admin message
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Waste2Wealth!</h1>
    </div>
    
    <div class="content">
      <h2>Hi ${firstName}!</h2>
      
      <p>Welcome to <strong>Waste2Wealth</strong>! Your account has been successfully created.</p>
      
      <p><strong>Username:</strong> ${username}</p>
      
      <a href="${baseUrl}" class="button">Access Dashboard</a>
      
      <p>If you need any assistance, feel free to reach out to our support team.</p>
    </div>
    
    <div class="footer">
      <p>Waste2Wealth - Transforming Waste into Wealth</p>
      <p>&copy; 2025 Waste2Wealth. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
}
