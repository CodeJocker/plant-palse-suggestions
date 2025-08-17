# 🌾 Season-Aware Farming Advisor API

An AI-powered farming advice system that provides season-aware recommendations based on weather forecasts for Rwanda's agricultural conditions.

## ✨ Features

- **Weather Integration**: Fetches 48-hour weather forecasts from OpenWeather API
- **Season Detection**: Automatically detects Rwanda's current agricultural season
- **AI-Powered Advice**: Uses Google Gemini AI to generate personalized farming recommendations
- **Crop-Specific Guidance**: Supports maize, beans, potatoes, and bananas
- **Fallback System**: Provides basic seasonal advice when AI services are unavailable
- **Location Awareness**: Uses GPS coordinates or defaults to Kigali, Rwanda
- **Production Ready**: Includes Docker support, health checks, and comprehensive error handling

## 🏗️ Architecture

```
src/
├── config/          # Configuration and environment variables
├── controllers/     # HTTP request handlers
├── middlewares/     # Request validation and error handling
├── routes/          # API endpoint definitions
├── services/        # Business logic and external API integration
└── utils/           # Utility functions for weather and crop processing
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenWeather API key (free tier available)
- Google Gemini API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd Hackathon-2025-backend
npm install
```

### 2. Environment Setup

Copy the example environment file and add your API keys:

```bash
cp env.example .env
```

Edit `.env` with your actual API keys:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
OPENWEATHER_API_KEY=your_actual_openweather_api_key
PORT=3000
NODE_ENV=development
```

### 3. Run Locally

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Build and Run

```bash
# Build the Docker image
docker build -t season-aware-farming-advisor .

# Run with docker-compose
docker-compose up -d

# Or run directly with Docker
docker run -p 3000:3000 --env-file .env season-aware-farming-advisor
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 API Endpoints

### Core Endpoints

#### Generate Farming Advice
```http
POST /api/advice
Content-Type: application/json

{
  "crop": "maize",
  "lat": -1.9441,
  "lon": 30.0619,
  "useAI": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "forecast_summary": "Weather conditions summary...",
    "season": "longRains",
    "crop": "maize",
    "actions": [
      "Action 1: Specific farming step",
      "Action 2: Another farming step"
    ],
    "warnings": [
      "Warning about potential risks"
    ],
    "productivity_tips": [
      "Tip to boost yield"
    ],
    "metadata": {
      "generated_at": "2025-01-27T10:00:00.000Z",
      "advice_source": "gemini_ai"
    }
  }
}
```

#### Get Available Crops
```http
GET /api/advice/crops
```

#### Get Current Season
```http
GET /api/advice/season
```

#### Get Service Status
```http
GET /api/advice/status
```

#### Basic Advice (No External APIs)
```http
GET /api/advice/basic/maize
```

### Health Check Endpoints

```http
GET /health              # Basic health check
GET /health/detailed     # Detailed service status
GET /health/config       # Configuration status
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | - | Yes |
| `OPENWEATHER_API_KEY` | OpenWeather API key | - | Yes |
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `DEFAULT_LAT` | Default latitude (Kigali) | -1.9441 | No |
| `DEFAULT_LON` | Default longitude (Kigali) | 30.0619 | No |

### Supported Crops

- **Maize**: High water needs, long rainy season
- **Beans**: Moderate water needs, short rainy season  
- **Potatoes**: Moderate water needs, long rainy season
- **Bananas**: High water needs, all seasons

### Agricultural Seasons

- **Short Dry**: January - February
- **Long Rains**: March - May
- **Long Dry**: June - September
- **Short Rains**: October - December

## 🧪 Testing

### Test with curl

```bash
# Get basic advice for maize
curl http://localhost:3000/api/advice/basic/maize

# Get available crops
curl http://localhost:3000/api/advice/crops

# Health check
curl http://localhost:3000/health

# Generate AI-powered advice
curl -X POST http://localhost:3000/api/advice \
  -H "Content-Type: application/json" \
  -d '{"crop": "maize", "lat": -1.9441, "lon": 30.0619}'
```

### Test with test.http

Use the included `test.http` file with VS Code REST Client extension or similar tools.

## 📊 Response Structure

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "error": string (if applicable),
  "timestamp": string (ISO 8601)
}
```

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400**: Validation errors, invalid input
- **401**: Authentication errors (invalid API keys)
- **404**: Resource not found
- **429**: Rate limit exceeded
- **500**: Internal server errors
- **503**: Service unavailable

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Request throttling
- **Input Validation**: Joi schema validation
- **Error Sanitization**: No sensitive data in error responses

## 📈 Monitoring & Health Checks

- **Health Endpoints**: Multiple health check levels
- **Service Status**: Individual service availability
- **Request Logging**: Detailed request/response logging
- **Performance Metrics**: Response time tracking

## 🛠️ Development

### Project Structure

```
├── src/
│   ├── config/          # App configuration
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Custom middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker services
├── package.json         # Dependencies
└── README.md           # This file
```

### Adding New Crops

1. Update `src/config/config.js` with crop information
2. Add crop-specific logic in `src/utils/cropUtils.js`
3. Update validation schemas in `src/middlewares/validationMiddleware.js`

### Adding New Weather Sources

1. Create new service in `src/services/`
2. Implement the same interface as `weatherService.js`
3. Update `adviceService.js` to use the new service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

1. Check the health endpoints for service status
2. Review the logs for error details
3. Ensure all environment variables are set correctly
4. Verify API keys are valid and have sufficient quotas

## 🔮 Future Enhancements

- [ ] Redis caching for weather data
- [ ] Database integration for advice history
- [ ] User authentication and personalized advice
- [ ] Mobile app integration
- [ ] Multi-language support (Kinyarwanda)
- [ ] SMS integration for farmers without internet
- [ ] Machine learning for improved predictions

---

**Built with ❤️ for Rwanda's farmers**
