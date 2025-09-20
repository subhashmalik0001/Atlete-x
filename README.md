# AthletiX - Advanced Athletic Performance Platform

## Features Implemented

### ✅ Advanced Biomechanics Analysis
- **Video Analysis**: Upload or record videos for intelligent form analysis
- **9 Test Types**: Vertical jump, sit-ups, push-ups, pull-ups, shuttle run, endurance run, flexibility, agility ladder, height/weight
- **Real-time Feedback**: Form scoring, technique analysis, and personalized recommendations
- **EMG Integration**: Muscle activity monitoring during tests

### ✅ Database-Agnostic Backend
- **Generic Database Interface**: Works with any database platform
- **In-Memory Development**: No database setup required for testing
- **Easy Migration**: Switch to any database (PostgreSQL, MySQL, MongoDB, etc.)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install -g pnpm
pnpm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and add:
```
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Get Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 4. Run Development Server
```bash
pnpm run
```

## API Endpoints

### Test Analysis
- `POST /api/tests/analyze` - Analyze video with advanced algorithms
- `GET /api/tests/history/:userId` - Get user's test history
- `GET /api/tests/stats/:userId` - Get user statistics

### EMG Data
- `POST /api/emg/data` - Store EMG sensor data
- `GET /api/emg/history/:userId` - Get EMG history

## Database Migration

The backend uses a generic database interface. To switch databases:

1. Implement the `DatabaseAdapter` interface in `server/lib/database.ts`
2. Replace the `InMemoryDatabase` with your database implementation
3. Update the `db` export

Example for PostgreSQL:
```typescript
class PostgreSQLDatabase implements DatabaseAdapter {
  // Implement all interface methods
}

export const db: DatabaseAdapter = new PostgreSQLDatabase();
```

## Hardware Integration

### EMG Sensor (Muscle BioAmp Patchy v0.2)
- Real-time muscle activity monitoring
- Fatigue detection
- Bluetooth connectivity
- See `hardware/` directory for Arduino firmware

## Frontend Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **PWA Ready**: Offline-first architecture
- **Real-time Updates**: Live EMG data streaming
- **Multi-language**: English, Hindi, Bengali support

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Analytics**: Advanced ML Processing
- **Database**: Database-agnostic (currently in-memory)
- **Hardware**: ESP32, EMG sensors
- **Deployment**: Netlify, Vercel compatible

## Next Steps

1. **Database Setup**: Choose and configure your preferred database
2. **File Storage**: Add video storage (AWS S3, Cloudinary, etc.)
3. **Authentication**: Implement user management
4. **Deployment**: Deploy to production environment
