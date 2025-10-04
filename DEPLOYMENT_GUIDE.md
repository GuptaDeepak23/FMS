# 🚀 Railway Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Prepare Your Repository
```bash
# Make sure all files are committed
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Deploy on Railway

#### Option A: Railway CLI (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Option B: Railway Web Dashboard
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your feedback repository

### 3. Configure Services

#### Backend Service
- **Name**: `feedback-backend`
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && python run.py`
- **Port**: `8000`

#### Frontend Service  
- **Name**: `feedback-frontend`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`

#### Database Service
- **Name**: `feedback-db`
- **Type**: PostgreSQL
- **Plan**: Free

### 4. Environment Variables

Set these in Railway dashboard:

#### Backend Environment Variables:
```
DB_HOST=localhost
DB_NAME=feedback_system
DB_USER=postgres
DB_PASSWORD=[from Railway PostgreSQL service]
DB_PORT=5432
ENVIRONMENT=production
```

#### Frontend Environment Variables:
```
VITE_API_URL=https://your-backend-url.railway.app
```

### 5. Domain Configuration
- Railway will provide URLs like:
  - Backend: `https://feedback-backend-production.up.railway.app`
  - Frontend: `https://feedback-frontend-production.up.railway.app`

### 6. Update Frontend API URL
Update `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.railway.app';
```

## 🎯 Alternative Platforms

### Render.com
1. Create account at [render.com](https://render.com)
2. Connect GitHub repository
3. Create 3 services:
   - Web Service (Backend)
   - Static Site (Frontend)  
   - PostgreSQL Database

### Fly.io
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Launch: `fly launch`
4. Deploy: `fly deploy`

## 📊 Cost Comparison

| Platform | Free Tier | Database | Ease of Use |
|----------|-----------|----------|-------------|
| Railway | $5 credit/month | ✅ PostgreSQL | ⭐⭐⭐⭐⭐ |
| Render | 750 hours/month | ✅ PostgreSQL | ⭐⭐⭐⭐ |
| Fly.io | 3 small VMs | ✅ PostgreSQL | ⭐⭐⭐ |
| Vercel | Unlimited | ❌ (separate) | ⭐⭐⭐⭐ |

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check Python/Node versions
2. **Database connection**: Verify environment variables
3. **CORS errors**: Update allowed origins
4. **MediaPipe issues**: May need GPU-enabled instance

### Railway Specific:
- Check logs: `railway logs`
- Restart service: `railway restart`
- Scale service: `railway scale`
