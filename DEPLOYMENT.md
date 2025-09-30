# Vercel Deployment Guide

This project is configured for deployment on Vercel with separate frontend and backend deployments.

## Project Structure
- **Backend**: Root directory (`/`) - Node.js API with serverless functions
- **Frontend**: `course-manag/` directory - React application with Vite

## Deployment Steps

### 1. Backend Deployment

1. **Import Project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `/` (root)

2. **Configure Backend Settings**
   - Framework Preset: **Other**
   - Build Command: `npm install`
   - Output Directory: `./` (leave empty or use default)
   - Install Command: `npm install`

3. **Environment Variables**
   Set these in Vercel dashboard under Project Settings > Environment Variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Note your backend URL (e.g., `https://your-backend-app.vercel.app`)

### 2. Frontend Deployment

1. **Create New Vercel Project**
   - Import the same repository again
   - Set **Root Directory** to `course-manag/`

2. **Configure Frontend Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   Set this in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://your-backend-app.vercel.app
   ```
   (Use the backend URL from step 1.4)

4. **Deploy**
   - Click "Deploy"

## Configuration Files

- **Backend**: `/vercel.json` - Serverless function configuration
- **Frontend**: `/course-manag/vercel.json` - Vite build configuration

## Environment Files

- **Backend**: `/.env.example` - Database and server configuration
- **Frontend**: `/course-manag/.env.example` - API endpoint configuration

## Local Development

For local development with both services:

1. **Backend** (Terminal 1):
   ```bash
   npm install
   npm run dev
   # Runs on http://localhost:3000
   ```

2. **Frontend** (Terminal 2):
   ```bash
   cd course-manag
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend includes frontend domain in CORS origins
2. **API Not Found**: Verify `VITE_API_BASE_URL` points to correct backend deployment
3. **Database Connection**: Check `DATABASE_URL` is correctly set in backend environment

### Backend API Routes
All API routes are available at: `https://your-backend-app.vercel.app/api/`
- `/api/courses` - Course management
- `/api/search` - Course search
- `/api/ask` - AI assistant
- `/api/ingest` - CSV upload

### Frontend Configuration
The frontend automatically adapts API calls based on `VITE_API_BASE_URL` environment variable.

## Notes

- Both deployments will have separate URLs
- Update frontend environment variable after backend deployment
- Database should be hosted separately (e.g., Railway, Supabase, or Vercel Postgres)
- Consider using Vercel's built-in Postgres for production database