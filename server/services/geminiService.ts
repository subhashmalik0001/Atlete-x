import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VideoAnalysisResult {
  testType: string;
  metrics: Record<string, number>;
  formScore: number;
  recommendations: string[];
  badge: string;
  errors: string[];
  isRealAI?: boolean;
}

export class GeminiAnalysisService {
  private genAI: GoogleGenerativeAI;
  public model: any; // Make public for training plans

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Initializing Gemini service with API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'UNDEFINED');
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found, will use fallback analysis');
      this.genAI = new GoogleGenerativeAI('');
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async analyzeVideo(videoBuffer: Buffer, testType: string): Promise<VideoAnalysisResult> {
    console.log(`=== GEMINI AI ANALYSIS START ===`);
    console.log(`Test type: ${testType}`);
    console.log(`Video buffer size: ${videoBuffer.length} bytes`);
    console.log(`API Key available: ${!!process.env.GEMINI_API_KEY}`);
    
    // Force real AI - throw error if no API key
    if (!this.model || !process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Real AI analysis requires valid API key.');
    }
    
    try {
      const prompt = this.getAnalysisPrompt(testType);
      const mimeType = this.detectMimeType(videoBuffer);
      console.log(`MIME type: ${mimeType}`);
      
      // Limit video size for Gemini (max 20MB)
      if (videoBuffer.length > 20 * 1024 * 1024) {
        throw new Error(`Video too large: ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB. Maximum 20MB allowed.`);
      }
      
      console.log('Calling Gemini API...');
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: videoBuffer.toString('base64'),
            mimeType
          }
        }
      ]);

      const response = await result.response;
      const responseText = response.text();
      console.log('=== GEMINI SUCCESS ===');
      console.log('Raw response:', responseText.substring(0, 200) + '...');
      
      const analysis = this.parseGeminiResponse(responseText, testType);
      analysis.isRealAI = true; // Mark as real AI
      console.log('Final analysis:', analysis);
      
      return analysis;
    } catch (error) {
      console.error('=== GEMINI FAILED ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('API Response:', error.response);
      }
      
      // Don't use fallback - throw the error to force real AI
      throw new Error(`Gemini AI analysis failed: ${error.message}`);
    }
  }

  private detectMimeType(buffer: Buffer): string {
    // Check file signature to determine type
    const signature = buffer.toString('hex', 0, 4).toUpperCase();
    
    if (signature.startsWith('1A45DFA3')) return 'video/webm';
    if (signature.startsWith('00000018') || signature.startsWith('00000020')) return 'video/mp4';
    if (signature.startsWith('464C5601')) return 'video/x-flv';
    
    // Default fallback
    return 'video/mp4';
  }

  private getAnalysisPrompt(testType: string): string {
    const prompts = {
      verticalJump: `You are an expert fitness trainer analyzing a vertical jump video. Watch carefully and measure:
        1. EXACT jump height in centimeters by tracking the person's highest point
        2. Takeoff form (0-100): knee bend, arm swing, body position
        3. Landing technique (0-100): balance, knee absorption
        
        Count frame by frame if needed. Be precise with measurements.
        Return ONLY valid JSON: {"jumpHeight": <exact_cm>, "formScore": <0-100>, "recommendations": ["specific tip 1", "specific tip 2"], "errors": []}`,
      
      sitUps: `You are an expert fitness trainer counting sit-ups. Watch the ENTIRE video carefully:
        1. COUNT EVERY VALID REP: Full range from lying down to sitting up, elbows to knees
        2. REJECT invalid reps: partial range, improper form, not touching knees
        3. Rate form quality (0-100) based on technique consistency
        
        Count slowly and accurately. Each rep must be complete.
        Return ONLY valid JSON: {"reps": <exact_count>, "formScore": <0-100>, "recommendations": ["specific form tip 1", "specific form tip 2"], "errors": []}`,
      
      pushUps: `You are an expert fitness trainer counting push-ups. Analyze the COMPLETE video:
        1. COUNT VALID REPS ONLY: Chest must nearly touch ground, full arm extension up
        2. REJECT partial reps: not going down enough, not pushing up fully
        3. Check body alignment: straight line from head to heels
        
        Be strict with counting. Quality over quantity.
        Return ONLY valid JSON: {"reps": <exact_count>, "formScore": <0-100>, "recommendations": ["specific technique tip 1", "specific technique tip 2"], "errors": []}`,
      
      pullUps: `You are an expert fitness trainer counting pull-ups. Watch every movement:
        1. COUNT COMPLETE REPS: Chin must clear the bar, full arm extension down
        2. REJECT incomplete reps: not reaching chin over bar, not fully extending
        3. Rate grip and control technique
        
        Count precisely. Each rep must be full range of motion.
        Return ONLY valid JSON: {"reps": <exact_count>, "formScore": <0-100>, "recommendations": ["specific pull-up tip 1", "specific pull-up tip 2"], "errors": []}`,
      
      shuttleRun: `You are a track coach timing shuttle runs. Analyze the complete performance:
        1. COUNT exact number of laps/shuttles completed
        2. ESTIMATE total time in seconds by watching start to finish
        3. Rate agility and direction changes
        
        Time accurately from start to complete stop.
        Return ONLY valid JSON: {"laps": <exact_count>, "time": <seconds>, "agility": <0-100>, "recommendations": ["speed tip 1", "agility tip 2"], "errors": []}`,
      
      flexibilityTest: `You are a flexibility expert measuring reach distance:
        1. MEASURE maximum reach in centimeters from starting position
        2. Rate flexibility level based on range of motion
        3. Assess form and technique
        
        Measure precisely using visual reference points.
        Return ONLY valid JSON: {"reach": <cm_distance>, "flexibility": <0-100>, "recommendations": ["flexibility tip 1", "stretch tip 2"], "errors": []}`,
      
      agilityLadder: `You are an agility coach timing ladder drills:
        1. TIME the complete drill from start to finish in seconds
        2. COUNT foot faults or mistakes
        3. Rate footwork speed and accuracy
        
        Time precisely and note any errors.
        Return ONLY valid JSON: {"time": <seconds>, "footwork": <0-100>, "recommendations": ["footwork tip 1", "speed tip 2"], "errors": []}`,
      
      enduranceRun: `You are a running coach analyzing endurance performance:
        1. ESTIMATE distance covered by counting laps or tracking movement
        2. CALCULATE average pace in minutes per kilometer
        3. Rate running form and consistency
        
        Analyze the complete running session.
        Return ONLY valid JSON: {"distance": <km>, "pace": <min_per_km>, "endurance": <0-100>, "recommendations": ["running tip 1", "endurance tip 2"], "errors": []}`,
      
      heightWeight: `You are a health professional taking measurements:
        1. ESTIMATE height in centimeters from visual reference
        2. ESTIMATE weight in kilograms from body composition
        3. CALCULATE BMI from height and weight
        
        Make reasonable estimates based on visual assessment.
        Return ONLY valid JSON: {"height": <cm>, "weight": <kg>, "bmi": <calculated>, "recommendations": ["health tip 1", "fitness tip 2"], "errors": []}`
    };

    return prompts[testType as keyof typeof prompts] || prompts.sitUps;
  }

  private parseGeminiResponse(response: string, testType: string): VideoAnalysisResult {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        testType,
        metrics: this.extractMetrics(parsed, testType),
        formScore: parsed.formScore || 0,
        recommendations: parsed.recommendations || [],
        badge: this.calculateBadge(parsed, testType),
        errors: []
      };
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  private extractMetrics(parsed: any, testType: string): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    switch (testType) {
      case 'verticalJump':
        metrics.jumpHeightCm = parsed.jumpHeight || 0;
        break;
      case 'sitUps':
      case 'pushUps':
      case 'pullUps':
        metrics.reps = parsed.reps || 0;
        break;
      case 'shuttleRun':
        metrics.laps = parsed.laps || 0;
        metrics.timeSec = parsed.time || 0;
        break;
      case 'flexibilityTest':
        metrics.reachCm = parsed.reach || 0;
        metrics.flexibilityScore = parsed.flexibility || 0;
        break;
      case 'agilityLadder':
        metrics.completionTime = parsed.time || 0;
        metrics.footworkScore = parsed.footwork || 0;
        break;
      case 'enduranceRun':
        metrics.distanceKm = parsed.distance || 0;
        metrics.pace = parsed.pace || 0;
        break;
      case 'heightWeight':
        metrics.heightCm = parsed.height || 0;
        metrics.weightKg = parsed.weight || 0;
        metrics.bmi = parsed.bmi || 0;
        break;
    }
    
    return metrics;
  }

  private calculateBadge(parsed: any, testType: string): string {
    const score = parsed.formScore || 0;
    if (score >= 90) return 'National Standard';
    if (score >= 80) return 'State Level';
    if (score >= 70) return 'District Elite';
    if (score >= 50) return 'Good';
    return 'Needs Improvement';
  }


}

export const geminiService = new GeminiAnalysisService();