import { GoogleGenerativeAI } from '@google/generative-ai';

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  healthScore: number;
  recommendations: string[];
}

export class FoodAnalysisService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeFood(imageBuffer: Buffer): Promise<FoodAnalysisResult> {
    const prompt = `Analyze this food image and provide detailed nutritional information. 
    
    Identify the food items and estimate:
    - Food name/description
    - Calories per serving
    - Protein (grams)
    - Carbohydrates (grams)
    - Fat (grams)
    - Fiber (grams)
    - Sugar (grams)
    - Sodium (milligrams)
    - Health score (0-100, where 100 is very healthy)
    - 3 specific health recommendations
    
    Return ONLY valid JSON:
    {
      "foodName": "food description",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number,
      "sugar": number,
      "sodium": number,
      "healthScore": number,
      "recommendations": ["tip1", "tip2", "tip3"]
    }`;

    try {
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const responseText = response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        foodName: parsed.foodName || 'Unknown food',
        calories: parsed.calories || 0,
        protein: parsed.protein || 0,
        carbs: parsed.carbs || 0,
        fat: parsed.fat || 0,
        fiber: parsed.fiber || 0,
        sugar: parsed.sugar || 0,
        sodium: parsed.sodium || 0,
        healthScore: parsed.healthScore || 50,
        recommendations: parsed.recommendations || ['Eat in moderation']
      };
    } catch (error) {
      console.error('Food analysis failed:', error);
      throw new Error(`Food analysis failed: ${error.message}`);
    }
  }
}

export const foodAnalysisService = new FoodAnalysisService();