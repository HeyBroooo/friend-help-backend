import { serve } from 'bun';
import { sendOTP, verifyOTP } from './services/whatsapp-otp';

serve({
    port: 3000,
    async fetch(request) {
        const url = new URL(request.url);
        
        if (url.pathname === '/send-otp' && request.method === 'POST') {
            try {
                const { phoneNo } = await request.json() as { phoneNo: string };
                const result = await sendOTP(phoneNo);
                return new Response(JSON.stringify(result), { status: 200 });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
            }
        }
        
        if (url.pathname === '/verify-otp' && request.method === 'POST') {
            try {
                const { phoneNo, otp } = await request.json() as { phoneNo: string; otp: string };
                const result = await verifyOTP(phoneNo, otp);
                return new Response(JSON.stringify(result), { status: 200 });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
            }
        }
        
        return new Response('Not Found', { status: 404 });
    }
});



console.log('Server running at http://localhost:3000');