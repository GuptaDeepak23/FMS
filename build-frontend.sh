#!/bin/bash
# Frontend Production Build Script

echo "🚀 Building frontend for production..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set production environment variable
export VITE_API_URL=https://ravishing-success.up.railway.app

# Build for production
echo "🔨 Building for production..."
npm run build

echo "✅ Frontend build complete!"
echo "📁 Build files are in: frontend/dist/"
echo "🌐 Ready to deploy to any static hosting service!"

# Optional: Deploy to Vercel
echo "🚀 Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod
    echo "✅ Deployed to Vercel!"
else
    echo "💡 Install Vercel CLI: npm i -g vercel"
    echo "💡 Then run: vercel --prod"
fi
