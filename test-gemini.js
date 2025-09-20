// Quick test for Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'UNDEFINED');

if (!apiKey) {
  console.error('GEMINI_API_KEY not found in environment');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function testAPI() {
  try {
    console.log('Testing Gemini API...');
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    console.log('✅ API working:', response.text());
  } catch (error) {
    console.error('❌ API failed:', error.message);
  }
}

testAPI();