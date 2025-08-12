#!/bin/bash

# MatchPatrol App - Vercel Deployment Script
echo "🚀 Starting Vercel Deployment Process..."

# Step 1: Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Git working directory is not clean. Please commit your changes first."
    echo "Run: git add . && git commit -m 'Your commit message'"
    exit 1
fi

# Step 2: Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# Step 3: Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Step 4: Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "🔗 Your app should be available at the URL shown above"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel Dashboard"
echo "2. Deploy backend to Railway"
echo "3. Update VITE_BACKEND_API_BASE with Railway URL"
echo "4. Test the deployed application"
