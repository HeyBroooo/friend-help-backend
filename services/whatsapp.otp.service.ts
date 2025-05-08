

import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

const otpStore = new Map<string, { otp: string; timestamp: number }>();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

client.initialize();

function formatIndianNumber(phoneNo: string): string {
    const cleaned = phoneNo.replace(/\D/g, '');
    if (cleaned.length === 10) return `91${cleaned}@c.us`;
    if (cleaned.length === 12 && cleaned.startsWith('91')) return `${cleaned}@c.us`;
    return phoneNo;
}

export async function sendOTP(phoneNo: string) {
    if (!phoneNo) throw new Error('Phone number is required');
    
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const formattedNumber = formatIndianNumber(phoneNo);
    
    otpStore.set(phoneNo, {
        otp,
        timestamp: Date.now()
    });
    
    await client.sendMessage(formattedNumber, `Your OTP is: ${otp}\nThis OTP is valid for 5 minutes.`);
    
    return { success: true, message: 'OTP sent successfully' };
}

export async function verifyOTP(phoneNo: string, userOTP: string) {
    if (!phoneNo || !userOTP) throw new Error('Phone number and OTP are required');
    
    const storedOTP = otpStore.get(phoneNo);
    
    if (!storedOTP) throw new Error('OTP not found or expired');
    
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
