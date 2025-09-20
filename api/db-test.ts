import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../server/lib/database.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test database connection by trying to get user stats
    const testUserId = 'test-user-123';
    const stats = await db.getUserStats(testUserId);
    
    res.status(200).json({
      success: true,
      message: "Database connection successful",
      testStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
