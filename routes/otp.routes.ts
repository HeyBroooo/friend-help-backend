import { Elysia } from 'elysia';
import { whatsappController } from '../services/whatsapp.service';
import otp from '../models/otp';

const otpRoutes = new Elysia({ prefix: '/otp' })
   .post('/send', async ({ body }) => {
        const { phoneNumber } = body as { phoneNumber: string };
        
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return {
                success: false,
                message: 'Phone number is required and must be a string'
            };
        }

        return await whatsappController.sendWhatsAppOtp(phoneNumber, otp);
    })
    .post('/verify', async ({ body }) => {
        const { phoneNumber, otp } = body as { phoneNumber: string; otp: string };
        
        if (!phoneNumber || !otp) {
            throw new Error('Phone number and OTP are required');
        }

        return await whatsappController.verifyOtp(phoneNumber, otp);
    });

export default otpRoutes;