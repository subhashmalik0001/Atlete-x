import { Request, Response } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { geminiService } from '../services/geminiService.js';
import { db, TestAttempt } from '../lib/database.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files allowed'));
    }
  }
});

export const uploadVideo = upload.single('video');

export const analyzeTest = async (req: Request, res: Response) => {
  try {
    console.log('Analyze test request received');
    const { testType, userId } = req.body;
    const videoFile = req.file;
    
    console.log('Request data:', { testType, userId, hasVideo: !!videoFile });

    if (!videoFile) {
      console.log('No video file provided');
      return res.status(400).json({ error: 'No video file provided' });
    }

    if (!testType || !userId) {
      console.log('Missing testType or userId');
      return res.status(400).json({ error: 'Missing testType or userId' });
    }
    
    // Validate UUID format
    const userUUID = userId;
    console.log('Processing request for user:', userUUID);

    // Analyze video with Gemini
    console.log('Calling Gemini service for:', testType);
    console.log('Video buffer size:', videoFile.buffer.length, 'bytes');
    console.log('Gemini API key exists:', !!process.env.GEMINI_API_KEY);
    
    const analysis = await geminiService.analyzeVideo(videoFile.buffer, testType);
    console.log('Gemini analysis completed:', analysis.testType);

    // Store test attempt in database
    const attempt: TestAttempt = {
      id: randomUUID(),
      userId: userUUID,
      testType,
      videoUrl: null, // Will be set after upload to storage
      analysisResult: analysis,
      metrics: analysis.metrics,
      formScore: analysis.formScore,
      badge: analysis.badge,
      recommendations: analysis.recommendations,
      createdAt: new Date().toISOString()
    };

    // Save to database
    console.log('Attempting to save to database:', attempt);
    const savedAttempt = await db.saveTestAttempt(attempt);
    console.log('Successfully saved to database:', savedAttempt.id);

    res.json({
      success: true,
      attempt: savedAttempt,
      analysis
    });

  } catch (error) {
    console.error('Test analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

export const getTestHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { testType, limit = 20 } = req.query;

    const attempts = await db.getTestHistory(userId, testType as string, Number(limit));
    res.json({ success: true, attempts });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const getTestStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await db.getUserStats(userId);
    res.json({ success: true, stats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
};

