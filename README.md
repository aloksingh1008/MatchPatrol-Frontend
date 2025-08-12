# 🚀 MatchPatrol - AI-Powered Job Matching App

MatchPatrol is an intelligent job matching platform that uses AI to connect professionals with their perfect job opportunities. The app analyzes user profiles, skills, and preferences to provide personalized job recommendations with domain-based filtering.

## ✨ Features

- **AI-Powered Job Matching**: Advanced algorithms match users with relevant job opportunities
- **Domain-Based Filtering**: Filter jobs by specific company domains and preferences
- **User Profile Management**: Comprehensive profile system with skills, experience, and preferences
- **Real-time Job Updates**: Live job data from multiple sources
- **Authentication System**: Secure Firebase-based authentication
- **Responsive Design**: Modern UI built with Vue.js and Tailwind CSS
- **Deployment Ready**: Optimized for Vercel deployment with Railway backend

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Authentication**: Firebase Authentication
- **Database**: Firebase Realtime Database
- **Deployment**: Vercel (Frontend), Railway (Backend)
- **API Integration**: External job matching APIs

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project setup
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd job-matching-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```bash
   # API Endpoints
   VITE_EXTERNAL_API_BASE=http://ai1.strategicerpcloud.com:11111
   VITE_BACKEND_API_BASE=http://localhost:3001

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=your_database_url
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # App Configuration
   VITE_APP_NAME=MatchPatrol
   VITE_APP_VERSION=1.0.0
   ```

4. **Start development server**
   ```bash
   # Frontend only
   npm run dev

   # Full stack (frontend + backend)
   npm run dev:full
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
job-matching-app/
├── src/
│   ├── components/          # Vue components
│   ├── views/              # Page components
│   │   ├── HomeView.vue    # Landing page
│   │   ├── LoginView.vue   # Authentication
│   │   ├── ProfileView.vue # User profile
│   │   ├── JobMatchView.vue # Job matching interface
│   │   └── ...
│   ├── stores/             # Pinia stores
│   │   └── auth.js         # Authentication store
│   ├── router/             # Vue Router configuration
│   ├── data/               # Static data files
│   ├── firebase.js         # Firebase configuration
│   ├── main.js             # App entry point
│   └── App.vue             # Root component
├── server.js               # Express backend server
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── package.json            # Dependencies and scripts
├── env.example             # Environment variables template
├── deploy.sh               # Deployment script
└── README.md               # This file
```

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`

2. **Set Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables:
   ```bash
   VITE_EXTERNAL_API_BASE=http://ai1.strategicerpcloud.com:11111
   VITE_BACKEND_API_BASE=https://match-patrol-frontend.vercel.app
   VITE_FIREBASE_API_KEY=AIzaSyA5lNSQ7CfJ9KcBl6YMS8ZgjEuCxPEZ020
   VITE_FIREBASE_AUTH_DOMAIN=bookmarker-ebe11.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://bookmarker-ebe11-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=bookmarker-ebe11
   VITE_FIREBASE_STORAGE_BUCKET=bookmarker-ebe11.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=489154616765
   VITE_FIREBASE_APP_ID=1:489154616765:web:cce6d4d4ba179f7469c6d4
   VITE_APP_NAME=MatchPatrol
   VITE_APP_VERSION=1.0.0
   ```

3. **Deploy**
   ```bash
   ./deploy.sh
   ```

### Backend (Railway)

1. **Create backend directory**
   ```bash
   mkdir matchpatrol-backend
   cd matchpatrol-backend
   cp ../job-matching-app/server.js .
   cp ../job-matching-app/package.json .
   ```

2. **Deploy to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway variables set EXTERNAL_API_BASE=http://ai1.strategicerpcloud.com:11111
   railway variables set PORT=3001
   railway up
   ```

3. **Update frontend environment**
   Update `VITE_BACKEND_API_BASE` with your Railway URL

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run server` - Start backend server only
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Key Features Implementation

#### Domain-Based Job Filtering
- Jobs are filtered based on user's preferred company domains
- Domains are extracted from user's career page URLs
- Filter works only for matched jobs section

#### AI Job Matching
- External API integration for job matching
- Skills and experience-based matching algorithms
- Real-time job recommendations

#### User Authentication
- Firebase Authentication integration
- Secure user profile management
- Session persistence

## 🔒 Security

- Environment variables for sensitive configuration
- Firebase security rules for data access
- CORS configuration for API endpoints
- Input validation and sanitization

## 📊 Monitoring

- Vercel Analytics for frontend monitoring
- Railway logs for backend monitoring
- Firebase console for authentication and database monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [Deployment Guide](VERCEL_DEPLOYMENT.md)
- Review the [API Documentation](DEPLOYMENT.md)
- Open an issue on GitHub

## 🎯 Roadmap

- [ ] Enhanced AI matching algorithms
- [ ] Job application tracking
- [ ] Resume parsing and analysis
- [ ] Company insights and reviews
- [ ] Mobile app development
- [ ] Advanced analytics dashboard

---

**MatchPatrol** - Connecting talent with opportunity through intelligent job matching! 🚀
