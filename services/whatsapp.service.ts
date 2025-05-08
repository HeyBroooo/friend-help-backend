import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { userService } from './user.service'; // Assuming you have this service

// WhatsApp Client Setup
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./session" }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// WhatsApp Client Events
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR code generated for WhatsApp");
});

client.on("ready", () => {
  console.log("WhatsApp client is ready!");
});

client.on("disconnected", (reason) => {
  console.log("WhatsApp disconnected:", reason);
  console.log("Reconnecting...");
  client.initialize();
});

client.initialize().catch(err => {
  console.error('Initialization error:', err);
});

// Helper Functions
function sendDynamicOtpMessage(otp: string, userName: string): string {
  const currentHour = new Date().getHours();
  let greeting;

  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good Afternoon";
  } else if (currentHour >= 17 && currentHour < 21) {
    greeting = "Good Evening";
  } else {
    greeting = "Hello"; 
  }

  return `${greeting}, Your verification code is ${otp}.\nPlease use this code to complete your verification process.`;
}

// OTP Controller
export const whatsappController = {
  sendWhatsAppOtp: async (req: any, res: any) => {
    try {
      const { phoneNo } = req.body;

      if (!phoneNo) {
        return res.status(400).json({ message: "Phone number is required." });
      }

      // Validate Indian number format
      const cleanedPhoneNo = phoneNo.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanedPhoneNo)) {
        return res.status(400).json({ message: "Invalid Indian phone number format." });
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const message = sendDynamicOtpMessage(otp, "User");

      await userService.createUserWithNo({ phoneNo: cleanedPhoneNo, otp });
      console.log(`User created with OTP: ${otp}, PhoneNo: ${cleanedPhoneNo}`);

      const formattedNumber = `91${cleanedPhoneNo}@c.us`;
      await client.sendMessage(formattedNumber, message);

      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending WhatsApp OTP:", error);
      return res.status(500).json({ message: "Failed to send WhatsApp OTP." });
    }
  },

  verifyOtp: async (req: any, res: any) => {
    try {
      const { phoneNo, otp } = req.body;

      if (!phoneNo || !otp) {
        return res.status(400).json({ message: "Phone number and OTP are required." });
      }

      // Verify OTP with your user service
      const isVerified = await userService.verifyOtp(phoneNo, otp);
      
      if (isVerified) {
        return res.status(200).json({ message: "OTP verified successfully" });
      } else {
        return res.status(400).json({ message: "Invalid OTP" });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({ message: "Failed to verify OTP." });
    }
  }
};