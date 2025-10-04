#!/bin/bash
# Railway Deployment Script

echo "🚀 Deploying Feedback Management System to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Initialize Railway project
echo "📦 Initializing Railway project..."
railway init

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set PGHOST=$PGHOST
railway variables set PGDATABASE=$PGDATABASE  
railway variables set PGUSER=$PGUSER
railway variables set PGPASSWORD=$PGPASSWORD
railway variables set PGPORT=$PGPORT

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your app is now live on Railway!"
