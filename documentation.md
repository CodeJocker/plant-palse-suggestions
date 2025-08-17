# 📚 Season-Aware Farming Advisor API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Reference](#api-reference)
4. [Authentication & Security](#authentication--security)
5. [Error Handling](#error-handling)
6. [Configuration](#configuration)
7. [Deployment](#deployment)
8. [Development Guide](#development-guide)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🌾 Overview

The Season-Aware Farming Advisor API is an intelligent agricultural advisory system designed specifically for Rwanda's farming conditions. It combines weather data, seasonal analysis, soil conditions, growth stages, variety characteristics, and AI-powered recommendations to provide farmers with comprehensive, actionable farming advice.

### Key Features
- **Weather Integration**: Real-time 48-hour weather forecasts
- **Season Detection**: Automatic Rwanda agricultural season identification
- **Soil Analysis**: Soil pH suitability assessment and recommendations
- **Growth Stage Tracking**: Stage-specific care instructions (germination, vegetative, flowering, fruiting)
- **Variety Selection**: Crop variety-specific characteristics and advice
- **AI-Powered Advice**: Google Gemini AI integration for personalized recommendations
- **Comprehensive Resources**: Detailed resource requirements with costs and local sources
- **Disease Management**: Disease identification, prevention, and treatment strategies
- **Fallback System**: Basic seasonal advice when external services are unavailable
- **Crop-Specific Guidance**: Support for maize, beans, potatoes, and bananas
- **Location Awareness**: GPS-based or default Kigali location support

### What Farmers Receive
The API provides farmers with a complete farming advisory package:

1. **What to Do** - Specific, actionable farming steps
2. **What They Need** - Required resources, tools, and materials with cost estimates
3. **What to Watch For** - Potential diseases and their prevention strategies
4. **How to Do It Better** - Productivity tips and best practices
5. **When to Act** - Season and weather-based timing recommendations
6. **Where to Get Help** - Local sources for resources and supplies

### Supported Crops
| Crop | Water Needs | Optimal Season | Growth Period | Soil pH Range | Varieties |
|------|-------------|----------------|---------------|---------------|-----------|
| Maize | High | Long Rains (Mar-May) | 90-120 days | 5.5-7.5 | Hybrid, Local, Sweet Corn |
| Beans | Moderate | Short Rains (Oct-Dec) | 60-90 days | 6.0-7.5 | Climbing, Bush, Kidney |
| Potatoes | Moderate | Long Rains (Mar-May) | 90-120 days | 5.0-6.5 | Irish, Sweet, New |
| Bananas | High | All Seasons | 9-12 months | 5.5-7.0 | Cavendish, Plantain, Lady Finger |

### Growth Stages
| Stage | Description | Duration | Care Focus |
|-------|-------------|----------|------------|
| Germination | Seed germination and early seedling | 7-14 days | Moisture, protection |
| Vegetative | Active growth of leaves and stems | 30-60 days | Nitrogen, weed control |
| Flowering | Flower development and pollination | 7-21 days | Water, pollinator protection |
| Fruiting | Fruit development and maturation | 30-90 days | Balanced nutrition, support |

### Agricultural Seasons
| Season | Period | Description |
|--------|--------|-------------|
| Short Dry | Jan-Feb | Minimal rainfall, irrigation needed |
| Long Rains | Mar-May | Heavy rainfall, planting season |
| Long Dry | Jun-Sep | Extended dry period, water conservation |
| Short Rains | Oct-Dec | Moderate rainfall, secondary planting |

---

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App   │    │   Web Browser   │    │   Mobile App   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   Express.js Server      │
                    │   (Port 3000)           │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│   Routes Layer   │  │  Middleware Layer │  │  Controller Layer │
└─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Service Layer         │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼─────────┐  ┌─────────▼─────────┐  ┌─────────▼─────────┐
│ Weather Service   │  │ Gemini AI Service│  │ Advice Service   │
│ (OpenWeather)     │  │ (Google Gemini)  │  │ (Orchestrator)   │
└─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Utility Layer         │
                    │ (Weather, Crop, Config) │
                    └───────────────────────────┘
```

### Directory Structure
```
src/
├── config/          # Configuration management
│   └── config.js    # Environment variables & constants
├── controllers/     # HTTP request handlers
│   ├── adviceController.js    # Farming advice endpoints
│   └── healthController.js    # Health check endpoints
├── middlewares/     # Request processing
│   ├── validationMiddleware.js # Input validation
│   └── errorMiddleware.js     # Error handling
├── routes/          # API endpoint definitions
│   ├── adviceRoutes.js        # Advice API routes
│   └── healthRoutes.js        # Health check routes
├── services/        # Business logic
│   ├── weatherService.js      # OpenWeather API integration
│   ├── geminiService.js       # Google Gemini AI integration
│   └── adviceService.js       # Main advice orchestration
└── utils/           # Utility functions
    ├── weatherUtils.js        # Weather data processing
    └── cropUtils.js           # Crop-specific logic
```

---

## 🔌 API Reference

### Base URL
```
http://localhost:3000
```

### Authentication
Currently, the API is public and doesn't require authentication. However, you need valid API keys for:
- OpenWeather API (for weather data)
- Google Gemini API (for AI-powered advice)

### Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "error": string (if applicable),
  "timestamp": string (ISO 8601)
}
```

### Enhanced Response Fields

The farming advice endpoints now return comprehensive information including:

#### 1. **Resources Needed** (`resources_needed`)
Array of objects containing farming resources, tools, and materials:

```json
{
  "resource": "Resource name",
  "purpose": "What it's used for",
  "quantity": "Recommended amount",
  "cost_estimate": "Approximate cost in Rwandan Francs (RWF)",
  "where_to_get": "Where to purchase or obtain"
}
```

**Examples:**
- **Fertilizers**: NPK, organic compost, micronutrients
- **Tools**: Planting equipment, harvesting tools, irrigation systems
- **Protection**: Pesticides, fungicides, shade nets, wind barriers
- **Monitoring**: Soil moisture meters, pH testers

#### 2. **Possible Diseases** (`possible_diseases`)
Array of objects containing crop disease information:

```json
{
  "disease_name": "Common disease name",
  "symptoms": "What to look for",
  "risk_factors": "Conditions that increase risk",
  "prevention": "How to prevent it",
  "treatment": "How to treat if detected",
  "seasonal_risk": "High/Medium/Low risk during current season"
}
```

**Disease Categories:**
- **Fungal Diseases**: Common during rainy seasons
- **Viral Diseases**: Often spread by insects
- **Bacterial Diseases**: Can affect multiple crops
- **Nutrient Deficiencies**: Related to soil conditions

#### 3. **Enhanced Analysis Fields**
- **`soil_ph_analysis`**: Detailed soil pH suitability assessment
- **`growth_stage_advice`**: Stage-specific care instructions
- **`variety_specific_tips`**: Variety-specific characteristics and needs

### Endpoints

#### 1. Health Check Endpoints

##### GET /health
Basic health check for the API service.

**Response:**
```json
{
  "success": true,
  "service": "Season-Aware Farming Advisor API",
  "status": "healthy",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 123.456
}
```

##### GET /health/detailed
Comprehensive health check including service status.

**Response:**
```json
{
  "success": true,
  "service": "Season-Aware Farming Advisor API",
  "status": "healthy",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "uptime": 123.456,
  "services": {
    "weather": {
      "available": true,
      "baseUrl": "https://api.openweathermap.org/data/2.5",
      "hasApiKey": true
    },
    "gemini": {
      "available": true,
      "baseUrl": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      "hasApiKey": true
    }
  },
  "system": {
    "node_version": "v18.17.0",
    "platform": "win32",
    "memory_usage": {...},
    "cpu_usage": {...}
  }
}
```

##### GET /health/config
Configuration health check.

**Response:**
```json
{
  "success": true,
  "service": "Season-Aware Farming Advisor API",
  "status": "healthy",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "config": {
    "environment": "development",
    "port": 3000,
    "hasOpenWeatherKey": true,
    "hasGeminiKey": true,
    "defaultLocation": {
      "lat": -1.9441,
      "lon": 30.0619
    },
    "rateLimiting": {
      "windowMs": 900000,
      "maxRequests": 100
    }
  }
}
```

#### 2. Advice API Endpoints

##### GET /api/advice/crops
Get list of supported crop types.

**Response:**
```json
{
  "success": true,
  "data": {
    "crops": ["maize", "beans", "potatoes", "bananas"],
    "count": 4,
    "description": "Supported crop types for farming advice"
  }
}
```

##### GET /api/advice/varieties/:crop
Get available varieties for a specific crop.

**Parameters:**
- `crop` (path parameter): Crop type (maize, beans, potatoes, bananas)

**Response:**
```json
{
  "success": true,
  "data": {
    "crop": "maize",
    "varieties": {
      "hybrid_maize": {
        "description": "High-yield hybrid varieties",
        "droughtResistance": "moderate"
      },
      "local_maize": {
        "description": "Traditional local varieties",
        "droughtResistance": "high"
      },
      "sweet_corn": {
        "description": "Sweet corn varieties",
        "droughtResistance": "low"
      }
    },
    "count": 3,
    "description": "Available varieties for maize"
  }
}
```

##### GET /api/advice/growth-states
Get available growth states.

**Response:**
```json
{
  "success": true,
  "data": {
    "growthStates": ["germination", "vegetative", "flowering", "fruiting"],
    "count": 4,
    "description": "Available growth states for crops"
  }
}
```

##### GET /api/advice/season
Get current agricultural season information.

**Response:**
```json
{
  "success": true,
  "data": {
    "season": "longDry",
    "description": "Long dry season",
    "currentMonth": 8,
    "start": "June",
    "end": "September"
  },
  "message": "Current season information retrieved successfully"
}
```

##### GET /api/advice/status
Get service status information.

**Response:**
```json
{
  "success": true,
  "data": {
    "weather": {
      "available": true,
      "baseUrl": "https://api.openweathermap.org/data/2.5",
      "hasApiKey": true
    },
    "gemini": {
      "available": true,
      "baseUrl": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      "hasApiKey": true
    },
    "advice": {
      "available": true,
      "version": "1.0.0"
    }
  },
  "message": "Service status retrieved successfully"
}
```

##### GET /api/advice/basic/:crop
Get basic farming advice without external API calls (for testing/fallback).

**Parameters:**
- `crop` (path parameter): Crop type (maize, beans, potatoes, bananas)
- `soilPh` (query parameter, optional): Soil pH value (4.0-8.5)
- `growthState` (query parameter, optional): Growth stage
- `variety` (query parameter, optional): Crop variety

**Response:**
```json
{
  "success": true,
  "data": {
    "forecast_summary": "Weather forecast for next 48 hours: 0mm rainfall, 15°C to 25°C, wind up to 10 km/h",
    "season": "longDry",
    "crop": "maize",
    "soil_ph_analysis": "Soil pH 6.2 analysis: Soil pH 6.2 is suitable for maize",
    "growth_stage_advice": "Growth stage vegetative: Active growth of leaves and stems",
    "variety_specific_tips": "Variety hybrid_maize: High-yield hybrid varieties with moderate drought resistance",
    "actions": [
      "Implement water conservation techniques",
      "Use shade nets for sensitive crops",
      "Focus on drought-tolerant crops",
      "Provide adequate nitrogen for leaf and stem development",
      "Control weeds to reduce competition for nutrients"
    ],
    "resources_needed": [
      {
        "resource": "Shade nets",
        "purpose": "Protect crops from excessive sun",
        "quantity": "Cover entire field area",
        "cost_estimate": "30,000-80,000 RWF per hectare",
        "where_to_get": "Agricultural supply stores"
      },
      {
        "resource": "Nitrogen fertilizer (NPK)",
        "purpose": "Provide essential nutrients for growth",
        "quantity": "200-300 kg per hectare",
        "cost_estimate": "80,000-120,000 RWF per hectare",
        "where_to_get": "Agricultural cooperatives, fertilizer suppliers"
      },
      {
        "resource": "Weed control herbicides",
        "purpose": "Control competing weeds",
        "quantity": "2-3 applications per season",
        "cost_estimate": "15,000-25,000 RWF per application",
        "where_to_get": "Agricultural chemical suppliers"
      }
    ],
    "possible_diseases": [
      {
        "disease_name": "Maize Lethal Necrosis",
        "symptoms": "Yellowing leaves, stunted growth, poor grain development",
        "risk_factors": "High humidity, poor drainage, infected seeds",
        "prevention": "Use certified seeds, maintain field hygiene, proper spacing",
        "treatment": "Remove infected plants, apply fungicides if early detected",
        "seasonal_risk": "Medium"
      },
      {
        "disease_name": "Common Rust",
        "symptoms": "Reddish-brown pustules on leaves, reduced photosynthesis",
        "risk_factors": "High humidity, dense planting, poor air circulation",
        "prevention": "Plant resistant varieties, maintain proper spacing",
        "treatment": "Apply fungicides, remove infected plant debris",
        "seasonal_risk": "Low"
      }
    ],
    "warnings": [
      "No rainfall expected in the next 48 hours. Consider irrigation for water-dependent crops."
    ],
    "productivity_tips": [
      "Plant in rows with proper spacing (75cm between rows)",
      "Apply nitrogen fertilizer in split applications",
      "Control weeds early in the growing season",
      "Soil pH 6.2 is optimal for maize growth",
      "Current growth stage: Active growth of leaves and stems (30-60 days)"
    ]
  },
  "message": "Basic farming advice generated successfully",
  "note": "This advice is generated without external API calls and may be less accurate"
}
```

##### POST /api/advice
Generate comprehensive farming advice based on location, crop, weather, soil pH, growth stage, and variety.

**Request Body:**
```json
{
  "crop": "maize",
  "lat": -1.9441,
  "lon": 30.0619,
  "soilPh": 6.2,
  "growthState": "vegetative",
  "variety": "hybrid_maize",
  "useAI": true
}
```

**Parameters:**
- `crop` (required): Crop type (maize, beans, potatoes, bananas)
- `lat` (optional): Latitude (-90 to 90, defaults to Kigali)
- `lon` (optional): Longitude (-180 to 180, defaults to Kigali)
- `soilPh` (optional): Soil pH value (4.0 to 8.5)
- `growthState` (optional): Growth stage (germination, vegetative, flowering, fruiting)
- `variety` (optional): Crop variety (see varieties endpoint)
- `useAI` (optional): Whether to use AI (defaults to true)

**Response:**
```json
{
  "success": true,
  "data": {
    "forecast_summary": "Weather conditions summary...",
    "season": "longRains",
    "crop": "maize",
    "soil_ph_analysis": "Analysis of soil pH suitability and recommendations",
    "growth_stage_advice": "Specific advice for the current growth stage",
    "variety_specific_tips": "Tips specific to the selected variety",
    "actions": [
      "Action 1: Specific farming step",
      "Action 2: Another farming step"
    ],
    "resources_needed": [
      {
        "resource": "Nitrogen fertilizer (NPK)",
        "purpose": "Provide essential nutrients for growth",
        "quantity": "200-300 kg per hectare",
        "cost_estimate": "80,000-120,000 RWF per hectare",
        "where_to_get": "Agricultural cooperatives, fertilizer suppliers"
      },
      {
        "resource": "Weed control herbicides",
        "purpose": "Control competing weeds",
        "quantity": "2-3 applications per season",
        "cost_estimate": "15,000-25,000 RWF per application",
        "where_to_get": "Agricultural chemical suppliers"
      }
    ],
    "possible_diseases": [
      {
        "disease_name": "Maize Lethal Necrosis",
        "symptoms": "Yellowing leaves, stunted growth, poor grain development",
        "risk_factors": "High humidity, poor drainage, infected seeds",
        "prevention": "Use certified seeds, maintain field hygiene, proper spacing",
        "treatment": "Remove infected plants, apply fungicides if early detected",
        "seasonal_risk": "High"
      },
      {
        "disease_name": "Common Rust",
        "symptoms": "Reddish-brown pustules on leaves, reduced photosynthesis",
        "risk_factors": "High humidity, dense planting, poor air circulation",
        "prevention": "Plant resistant varieties, maintain proper spacing",
        "treatment": "Apply fungicides, remove infected plant debris",
        "seasonal_risk": "Medium"
      }
    ],
    "warnings": [
      "Warning about potential risks"
    ],
    "productivity_tips": [
      "Tip to boost yield"
    ],
    "metadata": {
      "generated_at": "2025-01-27T10:00:00.000Z",
      "advice_source": "gemini_ai",
      "location": {
        "lat": -1.9441,
        "lon": 30.0619
      },
      "additional_data": {
        "soilPh": 6.2,
        "growthState": "vegetative",
        "variety": "hybrid_maize"
      },
      "weather_service_available": true,
      "ai_service_available": true,
      "api_version": "1.0.0"
    }
  },
  "message": "Farming advice generated successfully"
}
```

##### GET /api/advice/health
Health check specifically for the advice service.

**Response:**
```json
{
  "success": true,
  "service": "Season-Aware Farming Advisor",
  "status": "healthy",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "services": {
    "weather": {...},
    "gemini": {...},
    "advice": {...}
  },
  "message": "All services are operational"
}
```

#### 3. Root Endpoint

##### GET /
API information and available endpoints.

**Response:**
```json
{
  "message": "Season-Aware Farming Advisor API",
  "version": "1.0.0",
  "description": "AI-powered farming advice system for Rwanda",
  "endpoints": {
    "health": "/health",
    "advice": "/api/advice",
    "documentation": "/api/docs"
  }
}
```

---

## 🔐 Authentication & Security

### Security Features
- **Helmet.js**: Security headers (CSP, XSS protection, etc.)
- **CORS**: Configurable cross-origin request handling
- **Rate Limiting**: Request throttling (100 requests per 15 minutes)
- **Input Validation**: Joi schema validation for all inputs
- **Error Sanitization**: No sensitive data in error responses

### Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per IP address
- **Headers**: Standard rate limit headers included
- **Response**: JSON error message when limit exceeded

### CORS Configuration
```javascript
// Development
origin: ['http://localhost:3000', 'http://localhost:3001']

// Production
origin: ['https://yourdomain.com']
```

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error description",
  "timestamp": "2025-01-27T10:00:00.000Z",
  "path": "/api/advice",
  "method": "POST"
}
```

### HTTP Status Codes

| Status | Code | Description | Example |
|--------|------|-------------|---------|
| 200 | OK | Request successful | Valid response data |
| 400 | Bad Request | Validation error | Invalid crop type |
| 401 | Unauthorized | Authentication error | Invalid API key |
| 404 | Not Found | Resource not found | Invalid endpoint |
| 429 | Too Many Requests | Rate limit exceeded | Too many requests |
| 500 | Internal Server Error | Server error | Unexpected error |
| 503 | Service Unavailable | Service unavailable | External API down |

### Common Error Scenarios

#### Validation Errors (400)
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Validation failed",
  "details": [
    {
      "field": "soilPh",
      "message": "Soil pH must be between 4.0 and 8.5",
      "value": 10.0
    },
    {
      "field": "growthState",
      "message": "Growth state must be one of: germination, vegetative, flowering, fruiting",
      "value": "invalid_stage"
    }
  ]
}
```

#### Service Unavailable (503)
```json
{
  "success": false,
  "error": "Service Unavailable",
  "message": "OpenWeather API rate limit exceeded",
  "timestamp": "2025-01-27T10:00:00.000Z"
}
```

#### Not Found (404)
```json
{
  "success": false,
  "error": "Not Found",
  "message": "The requested endpoint GET /api/invalid was not found",
  "availableEndpoints": {
    "root": "GET /",
    "health": "GET /health",
    "advice": "POST /api/advice"
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | - | Yes |
| `OPENWEATHER_API_KEY` | OpenWeather API key | - | Yes |
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `DEFAULT_LAT` | Default latitude (Kigali) | -1.9441 | No |
| `DEFAULT_LON` | Default longitude (Kigali) | 30.0619 | No |
| `OPENWEATHER_BASE_URL` | OpenWeather API base URL | https://api.openweathermap.org/data/2.5 | No |
| `GEMINI_BASE_URL` | Gemini API base URL | https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 900000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |

### Configuration File Structure
```javascript
// src/config/config.js
const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY,
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  // ... other configurations
};
```

### Weather Thresholds
```javascript
weatherThresholds: {
  temperature: {
    min: 10,  // Celsius
    max: 35   // Celsius
  },
  windSpeed: {
    warning: 20,  // km/h
    danger: 40    // km/h
  },
  rainfall: {
    light: 2.5,     // mm
    moderate: 7.5,  // mm
    heavy: 15       // mm
  }
}
```

### Soil pH Categories
```javascript
soilPhCategories: {
  very_acidic: { range: '4.0-5.0', description: 'Very acidic soil, may need lime application' },
  acidic: { range: '5.1-6.0', description: 'Acidic soil, suitable for acid-loving crops' },
  slightly_acidic: { range: '6.1-6.5', description: 'Slightly acidic, good for most crops' },
  neutral: { range: '6.6-7.3', description: 'Neutral pH, optimal for most crops' },
  slightly_alkaline: { range: '7.4-7.8', description: 'Slightly alkaline, may need acidification' },
  alkaline: { range: '7.9-8.5', description: 'Alkaline soil, may limit nutrient availability' }
}
```

---

## 🚀 Deployment

### Local Development
```bash
# Install dependencies
npm install

# Set environment variables
cp env.example .env
# Edit .env with your API keys

# Run in development mode
npm run dev

# Run in production mode
npm start
```

### Docker Deployment
```bash
# Build image
docker build -t season-aware-farming-advisor .

# Run container
docker run -p 3000:3000 --env-file .env season-aware-farming-advisor

# Or use docker-compose
docker-compose up -d
```

### Docker Compose
```yaml
version: '3.8'
services:
  farming-advisor-api:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Production Considerations
- Use environment-specific configuration files
- Implement proper logging (Winston, Bunyan)
- Set up monitoring and alerting
- Use reverse proxy (Nginx) for SSL termination
- Implement database for advice history (future enhancement)

---

## 🛠️ Development Guide

### Adding New Crops
1. Update `src/config/config.js` with crop information
2. Add crop-specific logic in `src/utils/cropUtils.js`
3. Update validation schemas in `src/middlewares/validationMiddleware.js`
4. Add tests for the new crop

### Adding New Weather Sources
1. Create new service in `src/services/`
2. Implement the same interface as `weatherService.js`
3. Update `adviceService.js` to use the new service
4. Add configuration options

### Code Style Guidelines
- Use ES6+ features (import/export, async/await)
- Follow JSDoc comment standards
- Use meaningful variable and function names
- Implement proper error handling
- Add input validation for all endpoints

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- Mock external services for testing
- Test error scenarios and edge cases

---

## 🧪 Testing

### Manual Testing with curl
```bash
# Health check
curl http://localhost:3000/health

# Get available crops
curl http://localhost:3000/api/advice/crops

# Get crop varieties
curl http://localhost:3000/api/advice/varieties/maize

# Get growth states
curl http://localhost:3000/api/advice/growth-states

# Get current season
curl http://localhost:3000/api/advice/season

# Generate advice with new fields
curl -X POST http://localhost:3000/api/advice \
  -H "Content-Type: application/json" \
  -d '{"crop": "maize", "soilPh": 6.2, "growthState": "vegetative", "variety": "hybrid_maize"}'

# Test basic advice with enhanced fields
curl "http://localhost:3000/api/advice/basic/maize?soilPh=6.2&growthState=vegetative&variety=hybrid_maize"
```

### Testing with test.http
Use the included `test.http` file with VS Code REST Client extension:
1. Install REST Client extension
2. Open `test.http`
3. Click "Send Request" above each endpoint
4. View response in split window

### Automated Testing
```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "weather"
```

### Test Data Examples

#### Enhanced Request with All New Fields
```json
{
  "crop": "maize",
  "lat": -1.9441,
  "lon": 30.0619,
  "soilPh": 6.2,
  "growthState": "vegetative",
  "variety": "hybrid_maize",
  "useAI": true
}
```

#### Expected Response Structure
```json
{
  "success": true,
  "data": {
    "forecast_summary": "Weather conditions summary...",
    "season": "longRains",
    "crop": "maize",
    "soil_ph_analysis": "Soil pH 6.2 is optimal for maize growth",
    "growth_stage_advice": "During vegetative stage, focus on nitrogen application",
    "variety_specific_tips": "Hybrid maize requires regular fertilization",
    "actions": [
      "Apply nitrogen fertilizer for leaf development",
      "Control weeds early in the season"
    ],
    "resources_needed": [
      {
        "resource": "Nitrogen fertilizer (NPK)",
        "purpose": "Provide essential nutrients for growth",
        "quantity": "200-300 kg per hectare",
        "cost_estimate": "80,000-120,000 RWF per hectare",
        "where_to_get": "Agricultural cooperatives"
      }
    ],
    "possible_diseases": [
      {
        "disease_name": "Maize Lethal Necrosis",
        "symptoms": "Yellowing leaves, stunted growth",
        "risk_factors": "High humidity, poor drainage",
        "prevention": "Use certified seeds, maintain hygiene",
        "treatment": "Remove infected plants",
        "seasonal_risk": "High"
      }
    ],
    "warnings": ["Monitor for disease symptoms during rainy season"],
    "productivity_tips": ["Plant in rows with proper spacing"]
  }
}
```

#### Testing Different Scenarios
```bash
# Test soil pH analysis
curl -X POST http://localhost:3000/api/advice \
  -H "Content-Type: application/json" \
  -d '{"crop": "maize", "soilPh": 5.0}'

# Test growth stage advice
curl -X POST http://localhost:3000/api/advice \
  -H "Content-Type: application/json" \
  -d '{"crop": "beans", "growthState": "flowering"}'

# Test variety-specific advice
curl -X POST http://localhost:3000/api/advice \
  -H "Content-Type: application/json" \
  -d '{"crop": "potatoes", "variety": "sweet_potato"}'

# Test comprehensive advice
curl -X POST http://localhost:3000/api/advice \
  -H "Content-Type: application/json" \
  -d '{"crop": "bananas", "soilPh": 6.5, "growthState": "fruiting", "variety": "cavendish"}'
```

#### Validation Testing
```bash
# Test invalid soil pH
curl -X POST http://localhost:3000/api/advice \
  -H "Content-Type: application/json" \
  -d '{"crop": "maize", "soilPh": 10.0}'

# Test invalid growth state
curl -X POST http://localhost:3000/api/advice \
  -H "Content-Type: application/json" \
  -d '{"crop": "maize", "growthState": "invalid_stage"}'

# Test missing required fields
curl -X POST http://localhost:3000/api/advice \
  -H "Content-Type: application/json" \
  -d '{"lat": -1.9441, "lon": 30.0619}'
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Server Won't Start
**Problem**: Port already in use
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process_id> /F

# Or use different port
PORT=3001 npm run dev
```

#### 2. Missing Dependencies
**Problem**: Module not found errors
```bash
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express-rate-limit'
```

**Solution**:
```bash
# Install missing package
npm install express-rate-limit

# Or reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. API Key Issues
**Problem**: Authentication errors
```bash
Error: Invalid OpenWeather API key
```

**Solution**:
- Verify API keys in `.env` file
- Check API key validity with service providers
- Ensure proper environment variable loading

#### 4. Weather Service Unavailable
**Problem**: Weather data not accessible
```bash
Error: OpenWeather API rate limit exceeded
```

**Solution**:
- Check API usage limits
- Implement caching for weather data
- Use fallback basic advice temporarily

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Set log level
LOG_LEVEL=debug npm run dev
```

### Health Check Diagnostics
```bash
# Check service status
curl http://localhost:3000/api/advice/status

# Check configuration
curl http://localhost:3000/health/config

# Detailed health check
curl http://localhost:3000/health/detailed
```

### Log Analysis
```bash
# View server logs
docker logs season-aware-farming-advisor

# Follow logs in real-time
docker logs -f season-aware-farming-advisor

# Search logs for errors
docker logs season-aware-farming-advisor 2>&1 | grep ERROR
```

---

## 📈 Performance & Monitoring

### Performance Metrics
- Response time tracking
- Request/response logging
- Memory usage monitoring
- CPU usage tracking

### Health Monitoring
- Service availability checks
- External API status monitoring
- Rate limit monitoring
- Error rate tracking

### Scaling Considerations
- Horizontal scaling with load balancer
- Database integration for advice history
- Redis caching for weather data
- Microservices architecture (future)

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Redis caching for weather data
- [ ] Database integration for advice history
- [ ] User authentication and personalized advice
- [ ] Mobile app integration
- [ ] Multi-language support (Kinyarwanda)
- [ ] SMS integration for farmers without internet
- [ ] Machine learning for improved predictions
- [ ] Soil testing kit integration
- [ ] Satellite imagery analysis
- [ ] Crop disease detection

### API Versioning
- Current version: v1.0.0
- Backward compatibility maintained
- New versions will be available at `/api/v2/`

### Integration Possibilities
- Mobile applications
- Web dashboards
- IoT weather stations
- Agricultural management systems
- Government farming programs
- Soil testing laboratories

---

## 📞 Support & Contact

### Getting Help
1. Check the health endpoints for service status
2. Review server logs for error details
3. Ensure environment variables are set correctly
4. Verify API keys are valid and have sufficient quotas

### Documentation Updates
- This documentation is maintained with the codebase
- Updates follow API changes
- Version history tracked in git

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details.

---

**Last Updated**: January 2025  
**API Version**: 1.0.0  
**Documentation Version**: 1.0.0

---

*Built with ❤️ for Rwanda's farmers*
