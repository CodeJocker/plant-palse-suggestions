import axios from 'axios';
import config from '../config/config.js';

/**
 * Service for interacting with Google Gemini AI API
 */
class GeminiService {
  constructor() {
    this.apiKey = config.geminiApiKey;
    this.baseUrl = config.geminiBaseUrl;
    
    if (!this.apiKey) {
      console.warn('⚠️  Gemini API key not provided. AI-powered advice will not be available.');
    }
  }
  
  /**
   * Generate farming advice using Gemini AI
   * @param {Object} forecastSummary - Weather forecast summary
   * @param {string} season - Current agricultural season
   * @param {string} cropType - Type of crop
   * @param {Object} additionalData - Additional data (soil pH, growth state, variety)
   * @returns {Promise<Object>} AI-generated farming advice
   */
  async generateAdvice(forecastSummary, season, cropType, additionalData = {}) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    try {
      // Create a well-designed prompt for the AI
      const prompt = this.createAdvicePrompt(forecastSummary, season, cropType, additionalData);
      
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout for AI processing
        }
      );
      
      // Extract the AI response
      const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('Invalid response format from Gemini API');
      }
      
      // Parse the AI response to extract structured advice
      return this.parseAIResponse(aiResponse, forecastSummary, season, cropType, additionalData);
      
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || 'Unknown error';
        
        switch (status) {
          case 400:
            throw new Error(`Gemini API request error: ${message}`);
          case 401:
            throw new Error('Invalid Gemini API key');
          case 403:
            throw new Error('Gemini API access denied');
          case 429:
            throw new Error('Gemini API rate limit exceeded');
          case 500:
            throw new Error('Gemini API server error');
          default:
            throw new Error(`Gemini API error: ${message}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Gemini API request timeout');
      } else {
        throw new Error(`Gemini service error: ${error.message}`);
      }
    }
  }
  
  /**
   * Create a well-designed prompt for the AI
   * @param {Object} forecastSummary - Weather forecast summary
   * @param {string} season - Current agricultural season
   * @param {string} cropType - Type of crop
   * @param {Object} additionalData - Additional data (soil pH, growth state, variety)
   * @returns {string} Formatted prompt for the AI
   */
  createAdvicePrompt(forecastSummary, season, cropType, additionalData = {}) {
    const { soilPh, growthState, variety } = additionalData;
    
    let additionalInfo = '';
    
    if (soilPh !== undefined && soilPh !== null) {
      additionalInfo += `\nSOIL pH: ${soilPh}`;
    }
    
    if (growthState) {
      additionalInfo += `\nGROWTH STAGE: ${growthState}`;
    }
    
    if (variety) {
      additionalInfo += `\nVARIETY: ${variety}`;
    }
    
    return `You are an expert agricultural advisor specializing in Rwanda's farming conditions. 

Based on the following information, provide specific, actionable farming advice:

LOCATION: ${forecastSummary.location.name} (${forecastSummary.location.lat}, ${forecastSummary.location.lon})
CURRENT SEASON: ${season}
CROP: ${cropType}${additionalInfo}

WEATHER FORECAST (Next 48 hours):
- Total Rainfall: ${forecastSummary.totalRainfall}mm
- Temperature Range: ${forecastSummary.minTemperature}°C to ${forecastSummary.maxTemperature}°C
- Maximum Wind Speed: ${forecastSummary.maxWindSpeed} km/h
- Rain Periods: ${forecastSummary.rainHours} hours
- Heavy Rain Periods: ${forecastSummary.heavyRainHours} hours
- Windy Periods: ${forecastSummary.windHours} hours

Please provide farming advice in the following JSON format ONLY (no other text):

{
  "forecast_summary": "Brief summary of weather conditions and their impact on farming",
  "season": "${season}",
  "crop": "${cropType}",
  "soil_ph_analysis": "Analysis of soil pH suitability and recommendations",
  "growth_stage_advice": "Specific advice for the current growth stage",
  "variety_specific_tips": "Tips specific to the selected variety",
  "actions": [
    "Action 1: Specific, actionable step the farmer should take",
    "Action 2: Another specific step",
    "Action 3: Third specific step"
  ],
  "resources_needed": [
    {
      "resource": "Resource name",
      "purpose": "What it's used for",
      "quantity": "Recommended amount",
      "cost_estimate": "Approximate cost in Rwandan Francs",
      "where_to_get": "Where to purchase or obtain"
    }
  ],
  "possible_diseases": [
    {
      "disease_name": "Common disease name",
      "symptoms": "What to look for",
      "risk_factors": "Conditions that increase risk",
      "prevention": "How to prevent it",
      "treatment": "How to treat if detected",
      "seasonal_risk": "High/Medium/Low risk during current season"
    }
  ],
  "warnings": [
    "Warning 1: Specific risk or thing to avoid",
    "Warning 2: Another specific risk"
  ],
  "productivity_tips": [
    "Tip 1: Specific way to boost yield or productivity",
    "Tip 2: Another productivity tip"
  ]
}

IMPORTANT GUIDELINES:
1. Focus on practical, implementable advice for small-scale farmers in Rwanda
2. Consider the specific weather conditions and season
3. Provide crop-specific recommendations
4. Include safety warnings for extreme weather
5. Suggest productivity improvements based on current conditions
6. Keep all advice realistic and achievable
7. Consider water management, pest control, and crop protection
8. If soil pH is provided, analyze its suitability for the crop and provide specific recommendations
9. If growth stage is specified, provide stage-specific care instructions
10. If variety is specified, consider variety-specific characteristics and needs
11. For resources needed, include common farming tools, fertilizers, pesticides, and materials
12. For diseases, focus on common diseases in Rwanda that affect the specific crop
13. Consider seasonal disease risks (e.g., fungal diseases during rainy seasons)
14. Include cost estimates in Rwandan Francs (RWF) for resources
15. Suggest local sources for obtaining resources
16. Return ONLY valid JSON, no additional text or explanations`;
  }
  
  /**
   * Parse the AI response and extract structured advice
   * @param {string} aiResponse - Raw response from Gemini AI
   * @param {Object} forecastSummary - Weather forecast summary
   * @param {string} season - Current agricultural season
   * @param {string} cropType - Type of crop
   * @param {Object} additionalData - Additional data used in the request
   * @returns {Object} Parsed and validated farming advice
   */
  parseAIResponse(aiResponse, forecastSummary, season, cropType, additionalData = {}) {
    try {
      // Try to extract JSON from the response
      let jsonStart = aiResponse.indexOf('{');
      let jsonEnd = aiResponse.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No JSON found in AI response');
      }
      
      const jsonString = aiResponse.substring(jsonStart, jsonEnd + 1);
      const advice = JSON.parse(jsonString);
      
      // Validate the structure
      const requiredFields = ['forecast_summary', 'season', 'crop', 'actions', 'warnings', 'productivity_tips'];
      const missingFields = requiredFields.filter(field => !advice[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields in AI response: ${missingFields.join(', ')}`);
      }
      
      // Ensure arrays are actually arrays
      if (!Array.isArray(advice.actions)) advice.actions = [];
      if (!Array.isArray(advice.warnings)) advice.warnings = [];
      if (!Array.isArray(advice.productivity_tips)) advice.productivity_tips = [];
      
      // Add metadata
      advice.metadata = {
        generated_at: new Date().toISOString(),
        source: 'gemini_ai',
        weather_data: forecastSummary,
        additional_data: additionalData,
        prompt_version: '2.0'
      };
      
      return advice;
      
    } catch (parseError) {
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }
  }
  
  /**
   * Check if the Gemini service is available
   * @returns {boolean} True if API key is configured
   */
  isAvailable() {
    return !!this.apiKey;
  }
  
  /**
   * Get service status information
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey
    };
  }
}

export default new GeminiService();
