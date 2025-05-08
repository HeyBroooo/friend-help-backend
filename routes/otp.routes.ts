import { Elysia } from 'elysia';
import { sendOTP, verifyOTP } from '../services/whatsapp.otp.service';

const otpRoutes = new Elysia({ prefix: '/otp' })
   .post('/send', async ({ body }) => {
        const { phoneNumber } = body as { phoneNumber: string };
        
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return {
                success: false,
                message: 'Phone number is required and must be a string'
            };
        }

        try {
            const result = await sendOTP(phoneNumber);
            return {
                success: true,
                message: 'OTP sent successfully',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    })
    .post('/verify', async ({ body }) => {
        const { phoneNumber, otp } = body as { phoneNumber: string; otp: string };
        
        if (!phoneNumber || !otp) {
            throw new Error('Phone number and OTP are required');
        }

        try {
            const result = await verifyOTP(phoneNumber, otp);
            return {
                success: true,
                message: 'OTP verified successfully',
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

export default otpRoutes;


