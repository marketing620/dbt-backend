import { Router } from 'express';
import { submitContactMessage, getAllMessages, updateMessageStatus, deleteMessage, addNoteToMessage, deleteNoteFromMessage } from '../controllers/contactController';

const router = Router();

// Used by public Next.js frontend to post a new contact request
router.post('/', submitContactMessage);

// Used by Admin Dashboard to view and manage leads
router.get('/', getAllMessages);
router.patch('/:id/status', updateMessageStatus);
router.post('/:id/notes', addNoteToMessage);
router.delete('/:id/notes/:noteId', deleteNoteFromMessage);
router.delete('/:id', deleteMessage);

export default router;
