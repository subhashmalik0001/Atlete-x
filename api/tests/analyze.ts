import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { geminiService } from "../../server/services/geminiService.js";
import { db, TestAttempt } from "../../server/lib/database.js";

// Configure multer for memory storage
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

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    console.log('Analyze test request received');
    
    // Use multer to handle file upload
    upload.single('video')(req as any, res as any, async (err: any) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: err.message });
      }

      const { testType, userId } = req.body;
      const videoFile = (req as any).file;
      
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

      // Check if Gemini API key exists
      if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY not found');
        return res.status(500).json({ error: 'AI service not configured' });
      }

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
    });

  } catch (error) {
    console.error('Test analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
}
