# 🚀 Deployment Guide - JobMatch App

## 🔒 Security Best Practices

### 1. Environment Variables
Always use environment variables for sensitive configuration:

```bash
# Frontend (.env.local)
VITE_EXTERNAL_API_BASE=https://your-api-domain.com
VITE_BACKEND_API_BASE=https://your-backend-domain.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

# Backend (.env)
EXTERNAL_API_BASE=https://your-api-domain.com
PORT=3001
NODE_ENV=production
```

### 2. Code Obfuscation
Use build tools to minify and obfuscate your code:

```bash
# Vite automatically minifies in production
npm run build

# For additional obfuscation, add to vite.config.js:
import { defineConfig } from 'vite'
import vue from '@vue/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### 3. API Key Protection
- Never expose API keys in client-side code
- Use backend proxy for all external API calls
- Implement rate limiting on your backend
- Use HTTPS for all API communications

### 4. Firebase Security Rules
Configure proper Firebase security rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🌐 Deployment Platforms

### Vercel (Frontend)
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Add all `VITE_*` variables in Vercel dashboard
3. **Build Settings**:
   ```bash
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
4. **Domain**: Configure custom domain with SSL

### Railway/Heroku (Backend)
1. **Environment Variables**: Add all backend environment variables
2. **Port Configuration**: Use `process.env.PORT`
3. **CORS Configuration**: Allow only your frontend domain
4. **Rate Limiting**: Implement API rate limiting

### Firebase (Database)
1. **Security Rules**: Configure proper read/write rules
2. **Authentication**: Enable only necessary auth providers
3. **Hosting**: Use Firebase Hosting for static files

## 🛡️ Additional Security Measures

### 1. Content Security Policy (CSP)
Add CSP headers to prevent XSS attacks:

```javascript
// In your server.js
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  next();
});
```

### 2. API Rate Limiting
Implement rate limiting on your backend:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Input Validation
Always validate and sanitize inputs:

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/update-user', [
  body('user_id').isString().notEmpty(),
  body('industry').isString().optional(),
  body('domains').isArray().optional(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request
});
```

### 4. Error Handling
Never expose internal errors to clients:

```javascript
// Global error handler
app.use((error, req, res, next) => {
  console.error('Internal error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});
```

## 📋 Deployment Checklist

### Frontend (Vercel)
- [ ] Environment variables configured
- [ ] Build optimization enabled
- [ ] Custom domain with SSL
- [ ] Error tracking (Sentry)
- [ ] Analytics configured

### Backend (Railway/Heroku)
- [ ] Environment variables set
- [ ] CORS configured for frontend domain
- [ ] Rate limiting implemented
- [ ] Input validation added
- [ ] Error handling configured
- [ ] Health check endpoint
- [ ] Logging configured

### Database (Firebase)
- [ ] Security rules configured
- [ ] Authentication enabled
- [ ] Backup strategy in place
- [ ] Monitoring configured

### General Security
- [ ] HTTPS enforced
- [ ] API keys secured
- [ ] Code minified/obfuscated
- [ ] Console logs removed
- [ ] Error messages sanitized
- [ ] Rate limiting active
- [ ] Input validation working

## 🔍 Monitoring & Maintenance

### 1. Error Tracking
Use Sentry or similar for error monitoring:
```javascript
import * as Sentry from "@sentry/vue";

Sentry.init({
  app,
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### 2. Performance Monitoring
Monitor API response times and user experience:
```javascript
// Add performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});
```

### 3. Regular Security Audits
- Update dependencies regularly
- Monitor for security vulnerabilities
- Review access logs
- Test authentication flows

## 🚨 Emergency Procedures

### If API Keys are Compromised
1. Immediately rotate all API keys
2. Update environment variables
3. Redeploy applications
4. Monitor for suspicious activity
5. Review access logs

### If Database is Compromised
1. Take backup immediately
2. Review security rules
3. Check authentication logs
4. Update user passwords if necessary
5. Implement additional security measures

## 📞 Support

For deployment issues:
1. Check environment variables
2. Verify API endpoints
3. Review build logs
4. Test locally first
5. Use staging environment

Remember: Security is an ongoing process, not a one-time setup! 