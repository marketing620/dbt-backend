import express from 'express';
import { trackVisit, getDashboardAnalytics } from '../controllers/analyticsController';

const router = express.Router();

router.post('/visit', trackVisit);
router.get('/dashboard', getDashboardAnalytics);

export default router;
