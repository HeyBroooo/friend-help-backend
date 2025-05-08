import { Elysia } from 'elysia';
import otpRoutes from './routes/otp.routes';

const app = new Elysia()
  .use(otpRoutes)
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);