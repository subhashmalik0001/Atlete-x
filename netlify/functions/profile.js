const { createClient } = require('@supabase/supabase-js');

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

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/profile', '');
    const userId = path.split('/')[1];

    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, profile: null })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, profile: data })
      };
    }

    if (event.httpMethod === 'POST') {
      const profileData = JSON.parse(event.body);
      
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
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to save profile' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, profile: data })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};