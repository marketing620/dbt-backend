import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import contactRoutes from './routes/contactRoutes';

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Dental Billing API is running!' });
});

// API Routes
app.use('/api/contact', contactRoutes);

// Start Server (Only locally, Vercel skips this)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

// Export for Vercel
export default app;
