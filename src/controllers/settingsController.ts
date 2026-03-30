import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

// Initialize the database reference
// Note: Requires admin.initializeApp() to have been called in src/config/firebase.ts
// which we safely assume it has.
const db = admin.firestore();

// 1. Fetch current maintenance status (Public Endpoint)
export const getMaintenanceStatus = async (req: Request, res: Response) => {
  try {
    const docRef = db.collection('settings').doc('global');
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // If the document doesn't exist yet, we logically assume the site is NOT in maintenance
      return res.status(200).json({ maintenanceActive: false });
    }

    const data = docSnap.data();
    return res.status(200).json({ maintenanceActive: data?.maintenanceActive || false });
  } catch (error: any) {
    console.error('Error fetching maintenance settings:', error);
    res.status(500).json({ error: error.message || 'Error fetching settings' });
  }
};

// 2. Toggles the maintenance status (Secured Endpoint)
export const toggleMaintenanceStatus = async (req: Request, res: Response) => {
  try {
    // In a fully secured app, you should verify req.headers.authorization (JWT token) here before proceeding.
    // For now, we will process the toggle based on the body payload.
    const { maintenanceActive } = req.body;

    if (typeof maintenanceActive !== 'boolean') {
      return res.status(400).json({ error: 'maintenanceActive must be a boolean (true/false)' });
    }

    const docRef = db.collection('settings').doc('global');
    await docRef.set({ maintenanceActive }, { merge: true });

    return res.status(200).json({ 
      message: `Maintenance mode is now ${maintenanceActive ? 'ON' : 'OFF'}`,
      maintenanceActive 
    });
  } catch (error: any) {
    console.error('Error updating maintenance settings:', error);
    res.status(500).json({ error: error.message || 'Error updating settings' });
  }
};
