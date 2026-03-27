import { Router } from 'express';
import { submitContactMessage, getAllMessages, updateMessageStatus, deleteMessage } from '../controllers/contactController';

const router = Router();

// Used by public Next.js frontend to post a new contact request
router.post('/', submitContactMessage);

// Used by Admin Dashboard to view and manage leads
router.get('/', getAllMessages);
router.patch('/:id/status', updateMessageStatus);
router.delete('/:id', deleteMessage);

export default router;
