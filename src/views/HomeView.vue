<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative container mx-auto px-6 py-20 lg:py-32">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="text-white">
            <h1 class="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Find Your Dream Job with
              <span class="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                AI-Powered Matching
              </span>
            </h1>
            <p class="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
              Upload your resume, set your preferences, and let our AI find the perfect job matches for you. 
              Get 3x more interviews with intelligent job matching.
            </p>
            
            <!-- Different CTAs based on authentication status -->
            <div v-if="authStore.user" class="flex flex-col sm:flex-row gap-4">
              <RouterLink 
                to="/match" 
                class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Start Matching Now
              </RouterLink>
              <RouterLink 
                to="/resume" 
                class="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Build Resume
              </RouterLink>
            </div>
            
            <!-- Sign In CTA for non-authenticated users -->
            <div v-else class="flex flex-col sm:flex-row gap-4">
              <RouterLink 
                to="/login" 
                class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Sign In to Get Started
              </RouterLink>
              <button 
                @click="scrollToFeatures"
                class="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
                Learn More
              </button>
            </div>
          </div>
          <div class="relative">
            <div class="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span class="text-white/90">AI analyzing your profile...</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span class="text-white/90">Finding matching jobs...</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span class="text-white/90">Preparing recommendations...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Floating elements -->
      <div class="absolute top-20 right-20 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl"></div>
      <div class="absolute bottom-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="p-6">
            <div class="text-4xl font-bold text-indigo-600 mb-2">95%</div>
            <div class="text-gray-600">Match Accuracy</div>
          </div>
          <div class="p-6">
            <div class="text-4xl font-bold text-purple-600 mb-2">3x</div>
            <div class="text-gray-600">More Interviews</div>
          </div>
          <div class="p-6">
            <div class="text-4xl font-bold text-blue-600 mb-2">10k+</div>
            <div class="text-gray-600">Jobs Analyzed</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">How MatchPatrol Works</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            The process of finding a job is complicated and time-consuming. We've designed a unique process 
            allowing anyone to get a job faster with minimum effort using AI.
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Create Your Profile</h3>
            <p class="text-gray-600 leading-relaxed">
              Upload your CV and set your preferences. Our AI analyzes your skills, experience, and career goals 
              to understand what you're looking for.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">AI Job Matching</h3>
            <p class="text-gray-600 leading-relaxed">
              Our advanced AI searches through thousands of job postings to find the perfect matches based on 
              your skills, experience, and preferences.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div class="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Get Interviews</h3>
            <p class="text-gray-600 leading-relaxed">
              Receive personalized job recommendations and apply with confidence. Track your applications 
              and get insights to improve your success rate.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to accelerate your job search and land your dream position.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="group p-6 rounded-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300">
            <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
            <p class="text-gray-600">AI-powered job matching based on your skills, experience, and career goals.</p>
          </div>

          <div class="group p-6 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Resume Builder</h3>
            <p class="text-gray-600">Create professional resumes with AI assistance and multiple templates.</p>
          </div>

          <div class="group p-6 rounded-xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-red-50 transition-all duration-300">
            <div class="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
              <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
            <p class="text-gray-600">Track your application success rate and get insights to improve.</p>
          </div>

          <div class="group p-6 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
            <p class="text-gray-600">Get instant notifications about new job matches and application status.</p>
          </div>

          <div class="group p-6 rounded-xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Community</h3>
            <p class="text-gray-600">Connect with other job seekers and share experiences and tips.</p>
          </div>

          <div class="group p-6 rounded-xl hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 transition-all duration-300">
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Fast Results</h3>
            <p class="text-gray-600">Get job matches within minutes, not days or weeks.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            See how MatchPatrol has helped thousands of professionals find their dream jobs.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white rounded-2xl p-8 shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <div class="ml-4">
                <h4 class="font-semibold text-gray-900">Sarah Johnson</h4>
                <p class="text-gray-600">Software Engineer</p>
              </div>
            </div>
            <p class="text-gray-700 leading-relaxed">
              "MatchPatrol helped me find my dream role in just 2 weeks! The AI matching was incredibly accurate 
              and I got 3x more interviews than my previous job search."
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div class="ml-4">
                <h4 class="font-semibold text-gray-900">Mike Chen</h4>
                <p class="text-gray-600">Product Manager</p>
              </div>
            </div>
            <p class="text-gray-700 leading-relaxed">
              "The resume builder feature is amazing! It helped me create a professional resume that 
              perfectly highlighted my skills and experience."
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                E
              </div>
              <div class="ml-4">
                <h4 class="font-semibold text-gray-900">Emily Rodriguez</h4>
                <p class="text-gray-600">Marketing Specialist</p>
              </div>
            </div>
            <p class="text-gray-700 leading-relaxed">
              "I was struggling to find relevant jobs. MatchPatrol's AI found positions I never would have 
              discovered on my own. Highly recommended!"
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-4xl font-bold text-white mb-6">
          Ready to Find Your Dream Job?
        </h2>
        <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of professionals who have already accelerated their careers with MatchPatrol. 
          Start your journey today!
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink 
            v-if="authStore.user"
            to="/match" 
            class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Start Matching Now
          </RouterLink>
          <RouterLink 
            v-else
            to="/login" 
            class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            Sign In to Get Started
          </RouterLink>
          <RouterLink 
            v-if="authStore.user"
            to="/resume" 
            class="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Build Your Resume
          </RouterLink>
          <button 
            v-else
            @click="scrollToFeatures"
            class="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
            Learn More
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

function scrollToFeatures() {
  const featuresSection = document.getElementById('features');
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' });
  }
}
</script> 