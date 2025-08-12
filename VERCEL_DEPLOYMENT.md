# Vercel Deployment Guide

## 🚀 **Frontend Deployment (Vercel)**

### **Step 1: Prepare Your Repository**
```bash
# Ensure your code is committed to GitHub
git add .
git commit -m "Prepare for Vercel deployment with environment variables"
git push origin main
```

### **Step 2: Connect to Vercel**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### **Step 3: Set Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:

#### **Required Environment Variables:**

```bash
# API Endpoints
VITE_EXTERNAL_API_BASE=http://ai1.strategicerpcloud.com:11111
VITE_BACKEND_API_BASE=https://match-patrol-frontend.vercel.app

VITE_FIREBASE_API_KEY=AIzaSyA5lNSQ7CfJ9KcBl6YMS8ZgjEuCxPEZ020
VITE_FIREBASE_AUTH_DOMAIN=bookmarker-ebe11.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://bookmarker-ebe11-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=bookmarker-ebe11
VITE_FIREBASE_STORAGE_BUCKET=bookmarker-ebe11.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=489154616765
VITE_FIREBASE_APP_ID=1:489154616765:web:cce6d4d4ba179f7469c6d4

# App Configuration
VITE_APP_NAME=MatchPatrol
VITE_APP_VERSION=1.0.0
```

**Important**: 
- Set all variables for **Production**, **Preview**, and **Development** environments
- Variables must start with `VITE_` to be accessible in the frontend
- Use the exact values from your current Firebase configuration

### **Step 4: Deploy**
1. Click **"Deploy"** in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## 🔧 **Monorepo Deployment Strategy**

Since you're using a monorepo approach with both frontend and backend in the same project, you have two deployment options:

### **Option 1: Deploy to Vercel (Frontend Only) + Separate Backend**

If you want to deploy the backend separately, follow the Railway deployment steps below.

### **Option 2: Deploy Full Stack to Vercel (Recommended)**

Vercel can handle full-stack deployments. Update your `vite.config.js` to include the server:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  // ... other config
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

And add a `vercel.json` file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

### **Environment Variables for Full Stack Deployment**

```bash
# API Endpoints
VITE_EXTERNAL_API_BASE=http://ai1.strategicerpcloud.com:11111
VITE_BACKEND_API_BASE=https://match-patrol-frontend.vercel.app

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyA5lNSQ7CfJ9KcBl6YMS8ZgjEuCxPEZ020
VITE_FIREBASE_AUTH_DOMAIN=bookmarker-ebe11.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://bookmarker-ebe11-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=bookmarker-ebe11
VITE_FIREBASE_STORAGE_BUCKET=bookmarker-ebe11.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=489154616765
VITE_FIREBASE_APP_ID=1:489154616765:web:cce6d4d4ba179f7469c6d4

# App Configuration
VITE_APP_NAME=MatchPatrol
VITE_APP_VERSION=1.0.0
```

## 🔧 **Alternative: Separate Backend Deployment (Railway)**

If you prefer to deploy the backend separately:

## 🔒 **Security Considerations**

### **1. Firebase Security Rules**
```javascript
// firebase.rules
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### **2. CORS Configuration**
Your backend should allow your Vercel domain:
```javascript
// In server.js
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

### **3. Environment Variable Security**
- ✅ **Never commit** `.env` files to Git
- ✅ **Use Vercel's** environment variable system
- ✅ **Rotate API keys** regularly
- ✅ **Use HTTPS** for all API calls

## 🧪 **Testing Deployment**

### **1. Test Environment Variables**
```javascript
// Add this to your app to verify variables are loaded
console.log('Environment Check:', {
  externalApi: import.meta.env.VITE_EXTERNAL_API_BASE,
  backendApi: import.meta.env.VITE_BACKEND_API_BASE,
  firebaseProject: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  mode: import.meta.env.MODE
});
```

### **2. Test API Connectivity**
```bash
# Test backend health
curl https://your-backend-domain.railway.app/api/health

# Test external API
curl http://ai1.strategicerpcloud.com:11111/health
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Environment Variables Not Loading**
**Solution**: 
- Ensure variables start with `VITE_` for frontend
- Check that variables are set for all environments (Production, Preview, Development)
- Redeploy after adding new environment variables

### **Issue 2: CORS Errors**
**Solution**: 
- Update backend CORS to include your Vercel domain
- Add `https://your-app.vercel.app` to allowed origins

### **Issue 3: Build Failures**
**Solution**: 
- Check that all dependencies are in `package.json`
- Ensure Firebase configuration is correct
- Check Vercel build logs for specific errors

### **Issue 4: API Timeouts**
**Solution**: 
- The fallback system will handle this automatically
- Check Railway logs for backend issues

### **Issue 5: Firebase Authentication Not Working**
**Solution**:
- Verify Firebase configuration in environment variables
- Check Firebase console for authentication settings
- Ensure domain is added to authorized domains in Firebase

## 📊 **Monitoring & Debugging**

### **1. Vercel Analytics**
- Enable in Vercel Dashboard
- Monitor performance and errors

### **2. Railway Logs**
```bash
railway logs
```

### **3. Environment Variable Debugging**
```javascript
// Add to your app temporarily
if (import.meta.env.DEV) {
  console.log('All Environment Variables:', import.meta.env);
}
```

### **4. Firebase Debugging**
```javascript
// Check Firebase connection
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Firebase Auth State:', auth.currentUser);
```

## ✅ **Deployment Checklist**

- [ ] Environment variables set in Vercel
- [ ] Firebase configuration updated to use environment variables
- [ ] Backend deployed to Railway/Heroku
- [ ] CORS configured for Vercel domain
- [ ] Firebase security rules updated
- [ ] All API endpoints tested
- [ ] Fallback system working
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Authentication flow tested
- [ ] Domain filter functionality verified

## 🔄 **Continuous Deployment**

### **Automatic Deployments**
1. Connect GitHub repository to Vercel
2. Every push to `main` triggers deployment
3. Preview deployments for pull requests

### **Environment-Specific Variables**
- **Production**: Live environment variables
- **Preview**: Test environment variables
- **Development**: Local environment variables

## 🎯 **Quick Deployment Commands**

```bash
# 1. Commit your changes
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# 2. Deploy backend to Railway
cd matchpatrol-backend
railway up

# 3. Update Vercel environment variables with backend URL
# 4. Deploy frontend to Vercel (automatic via GitHub integration)
```

## 🔧 **Post-Deployment Verification**

1. **Test Authentication**: Sign up/sign in functionality
2. **Test Job Matching**: Verify domain filter works
3. **Test API Calls**: Check all endpoints are working
4. **Test Error Handling**: Verify fallback systems work
5. **Performance Check**: Ensure app loads quickly

This setup ensures your MatchPatrol app works reliably in production with proper security and error handling! 🎉 