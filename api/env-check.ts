import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check environment variables
  const envCheck = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  // Don't expose actual values, just check if they exist
  const missingVars = Object.entries(envCheck)
    .filter(([key, value]) => key !== 'NODE_ENV' && !value)
    .map(([key]) => key);

  res.status(200).json({
    success: true,
    message: "Environment check completed",
    environment: envCheck,
    missingVariables: missingVars,
    allConfigured: missingVars.length === 0,
    timestamp: new Date().toISOString()
  });
}
