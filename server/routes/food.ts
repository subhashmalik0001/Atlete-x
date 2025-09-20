import { Request, Response } from 'express';
import multer from 'multer';
import { foodAnalysisService } from '../services/foodAnalysisService.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

export const uploadFoodImage = upload.single('foodImage');

export const analyzeFoodImage = async (req: Request, res: Response) => {
  try {
    const imageFile = req.file;
    
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Analyzing food image...');
    const analysis = await foodAnalysisService.analyzeFood(imageFile.buffer);
    console.log('Food analysis completed:', analysis.foodName);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Food analysis error:', error);
    res.status(500).json({ error: 'Food analysis failed' });
  }
};