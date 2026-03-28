import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

// Registration Route
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use Firebase Admin SDK to securely create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    res.status(201).json({ 
      message: 'Admin successfully registered', 
      uid: userRecord.uid 
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Error registering admin' });
  }
};

// Login Route
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Firebase Admin SDK cannot "Sign In" with a password. 
    // We must leverage the official Firebase Auth REST API for backend login.
    const apiKey = process.env.FIREBASE_API_KEY; 
    
    if (!apiKey) {
      return res.status(500).json({ error: 'FIREBASE_API_KEY is missing in backend environment variables' });
    }

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({ error: data.error.message || 'Invalid credentials' });
    }

    // Success: Return the token to the frontend
    res.status(200).json({
      message: 'Login successful',
      token: data.idToken,
      uid: data.localId,
      expiresIn: data.expiresIn
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Server error during login' });
  }
};
