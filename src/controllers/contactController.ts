import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        if (!name || !email || !subject) {
            res.status(400).json({ error: 'Name, email, and subject are required.' });
            return;
        }

        const newDoc = {
            name,
            email,
            phone: phone || '',
            subject,
            message: message || '',
            status: 'Unread',
            createdAt: new Date(), // using JavaScript Date, will be converted to Firestore Timestamp
        };

        const docRef = await db.collection('contactMessages').add(newDoc);
        res.status(201).json({ id: docRef.id, message: 'Message sent successfully', data: newDoc });
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ error: 'Failed to submit message' });
    }
};

export const getAllMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const snapshot = await db.collection('contactMessages').orderBy('createdAt', 'desc').get();
        const messages = snapshot.docs.map((doc: any) => {
            const data = doc.data();
            
            // Convert Firestore Timestamp into readable string for Frontend
            let dateStr = "";
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                const d = data.createdAt.toDate();
                // Format e.g., "Oct 24, 10:15 AM"
                dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            }

            return {
                id: doc.id,
                ...data,
                date: dateStr // map the timestamp to the `date` key that your UI expects
            };
        });
        
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
};

export const updateMessageStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ error: 'Status is required.' });
            return;
        }
        
        await db.collection('contactMessages').doc(id).update({ status });
        res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await db.collection('contactMessages').doc(id).delete();
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};
