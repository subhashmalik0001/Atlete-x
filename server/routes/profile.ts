import { Request, Response } from 'express';
import { db } from '../lib/database.js';

export const getProfile = async (req: Request, res: Response) => {
  try {
    console.log('GET Profile request for user:', req.params.userId);
    const { userId } = req.params;
    const profile = await db.getProfile(userId);
    console.log('Profile fetched:', profile);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const saveProfile = async (req: Request, res: Response) => {
  try {
    console.log('SAVE Profile request for user:', req.params.userId);
    console.log('Profile data received:', JSON.stringify(req.body, null, 2));
    console.log('Email in request:', req.body.email);
    const { userId } = req.params;
    const profileData = req.body;
    
    const profile = await db.saveProfile({
      id: userId,
      ...profileData
    });
    
    console.log('Profile saved:', profile);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
};