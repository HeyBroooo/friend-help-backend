import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

// Simple in-memory storage for OTPs
const otpStore = new Map<string, { otp: string; timestamp: number }>();

// WhatsApp client setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// QR code generation
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Client ready
client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

// Initialize client
client.initialize();

// Helper function to format Indian numbers
function formatIndianNumber(phoneNo: string): string {
    const cleaned = phoneNo.replace(/\D/g, '');
    if (cleaned.length === 10) return `91${cleaned}@c.us`;
    if (cleaned.length === 12 && cleaned.startsWith('91')) return `${cleaned}@c.us`;
    return phoneNo; // fallback
}

// Send OTP function
export async function sendOTP(phoneNo: string) {
    if (!phoneNo) throw new Error('Phone number is required');
    
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const formattedNumber = formatIndianNumber(phoneNo);
    
    // Store OTP with timestamp
    otpStore.set(phoneNo, {
        otp,
        timestamp: Date.now()
    });
    
    // Send message
    await client.sendMessage(formattedNumber, `Your OTP is: ${otp}\nThis OTP is valid for 5 minutes.`);
    
    return { success: true, message: 'OTP sent successfully' };
}

// Verify OTP function
export async function verifyOTP(phoneNo: string, userOTP: string) {
    if (!phoneNo || !userOTP) throw new Error('Phone number and OTP are required');
    
    const storedOTP = otpStore.get(phoneNo);
    
    // Check if OTP exists
    if (!storedOTP) throw new Error('OTP not found or expired');
    
    // Check if OTP is expired (5 minutes)
    const isExpired = Date.now() - storedOTP.timestamp > 5 * 60 * 1000;
    if (isExpired) {
        otpStore.delete(phoneNo);
        throw new Error('OTP expired');
    }
    
    // Verify OTP
    if (storedOTP.otp !== userOTP) throw new Error('Invalid OTP');
    
    // Clear OTP after successful verification
    otpStore.delete(phoneNo);
    
    return { success: true, message: 'OTP verified successfully' };
}