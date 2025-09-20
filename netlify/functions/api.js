import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Profile routes
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Profile fetch error:', error);
      return res.json({ success: true, profile: null });
    }
    
    res.json({ success: true, profile: data });
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/profile/:userId', async (req, res) => {
  try {
    console.log('Netlify function - Save profile request');
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });
    
    const { userId } = req.params;
    const profileData = req.body;
    console.log('Profile data:', profileData);
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: profileData.email,
        name: profileData.name,
        age: profileData.age,
        gender: profileData.gender,
        district: profileData.district,
        sport: profileData.sport,
        photo_url: profileData.photo_url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Profile save error:', error);
      return res.status(500).json({ error: 'Failed to save profile' });
    }
    
    res.json({ success: true, profile: data });
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Handle other routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export const handler = serverless(app);