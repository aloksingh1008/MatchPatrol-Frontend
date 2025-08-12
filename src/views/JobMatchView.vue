<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Matched Jobs State
const matches = ref([]);
const matchesOffset = ref(0);
const matchesHasMore = ref(true);
const isLoadingMatches = ref(false);
const isLoadingMoreMatches = ref(false);

// Recommended Jobs State
const recommendedJobs = ref([]);
const recommendedOffset = ref(0);
const recommendedHasMore = ref(true);
const isLoadingRecommended = ref(false);
const isLoadingMoreRecommended = ref(false);

// General State
const isLoading = ref(true);
const error = ref(null);
const limit = ref(10);

// Statistics State
const statistics = ref({
  matched_jobs_count: 0,
  recommended_jobs_count: 0
});
const isLoadingStats = ref(false);

// Domain filtering
const selectedDomain = ref('all');

// Job section switching
const activeSection = ref('matched'); // 'matched' or 'recommended'

// Get domains from user profile
const availableDomains = computed(() => {
  const domains = authStore.userProfile?.domain || [];
  console.log('🔍 Available domains computed:', domains);
  console.log('📊 UserProfile:', authStore.userProfile);
  console.log('🌐 Domains from user profile:', domains);
  return domains;
});

// Check if profile is complete for job matching
const isProfileComplete = computed(() => {
  const profile = authStore.userProfile;
  if (!profile) return false;
  
  // Check if essential profile fields are filled
  const hasPersonalInfo = profile.personalInfo?.name && profile.personalInfo?.location;
  const hasSkills = profile.skills && profile.skills.length > 0;
  const hasExperience = profile.experience && profile.experience.length > 0;
  const hasJobPreferences = profile.jobPreferences?.preferredIndustry;
  
  return hasPersonalInfo && hasSkills && hasExperience && hasJobPreferences;
});



// Function to fetch matched jobs with domain filtering
const fetchMatchedJobs = async (isLoadMore = false) => {
  const startTime = Date.now();
  
  try {
    if (isLoadMore) {
      isLoadingMoreMatches.value = true;
    } else {
      isLoadingMatches.value = true;
      error.value = null;
    }

    const user_id = authStore.userProfile?.displayId;
    if (!user_id) throw new Error('No user_id found');

    // Prepare domain parameter - pass selected domain or empty string
    const domainParam = selectedDomain.value === 'all' ? '' : selectedDomain.value;
    
    console.log('🚀 Fetching matched jobs:', {
      user_id,
      offset: matchesOffset.value,
      limit: limit.value,
      domain: domainParam,
      selectedDomain: selectedDomain.value,
      isLoadMore
    });

    const res = await axios.post('/api/get-match-results/', { 
      user_id, 
      offset: matchesOffset.value, 
      limit: limit.value,
      domain: domainParam // Pass domain as parameter to API
    });

    console.log('✅ Matched jobs response:', res.data);

    const newResults = res.data.message || [];
    
    if (isLoadMore) {
      matches.value.push(...newResults);
    } else {
      matches.value = newResults;
    }

    // Since external API doesn't return pagination metadata, 
    // we assume there are more results if we got the full limit
    matchesHasMore.value = newResults.length === limit.value;
    matchesOffset.value += limit.value;
    
    console.log('📊 Matched jobs updated:', {
      totalJobs: matches.value.length,
      newResults: newResults.length,
      hasMore: matchesHasMore.value
    });

  } catch (err) {
    console.error('❌ Error fetching matched jobs:', err);
    error.value = err.message || 'Failed to fetch matched jobs';
  } finally {
    // Ensure minimum loading time of 2000ms for load more requests
    if (isLoadMore) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
    }
    
    isLoadingMatches.value = false;
    isLoadingMoreMatches.value = false;
  }
};

// Function to fetch recommended jobs with domain filtering
const fetchRecommendedJobs = async (isLoadMore = false) => {
  const startTime = Date.now();
  
  try {
    if (isLoadMore) {
      isLoadingMoreRecommended.value = true;
    } else {
      isLoadingRecommended.value = true;
      error.value = null;
    }

    const user_id = authStore.userProfile?.displayId;
    if (!user_id) throw new Error('No user_id found');

    // Prepare domain parameter - pass selected domain or empty string
    const domainParam = selectedDomain.value === 'all' ? '' : selectedDomain.value;

    const res = await axios.post('/api/get-recommended-match-results/', { 
      user_id, 
      offset: recommendedOffset.value, 
      limit: 5, // Fixed limit of 5 for recommended jobs
      domain: domainParam // Pass domain as parameter to API
    });

    const newResults = res.data.message || [];
    
    if (isLoadMore) {
      recommendedJobs.value.push(...newResults);
    } else {
      recommendedJobs.value = newResults;
    }

    // Since external API doesn't return pagination metadata, 
    // we assume there are more results if we got the full limit (5 for recommended jobs)
    recommendedHasMore.value = newResults.length === 5;
    recommendedOffset.value += 5;

  } catch (err) {
    error.value = err.message || 'Failed to fetch recommended jobs';
  } finally {
    // Ensure minimum loading time of 2000ms for load more requests
    if (isLoadMore) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
    }
    
    isLoadingRecommended.value = false;
    isLoadingMoreRecommended.value = false;
  }
};



// Function to handle section switching
const handleSectionChange = (section) => {
  activeSection.value = section;
};

// Function to handle domain selection change
const handleDomainChange = async (domain) => {
  console.log('🎯 Domain filter changed to:', domain);
  selectedDomain.value = domain;
  // Reset pagination when domain changes
  matchesOffset.value = 0;
  recommendedOffset.value = 0;
  matchesHasMore.value = true;
  recommendedHasMore.value = true;
  
  // Wait for user profile to be available
  let profileLoaded = false;
  let attempts = 0;
  const maxAttempts = 5; // Wait up to 2.5 seconds (5 * 500ms)
  
  while (!profileLoaded && attempts < maxAttempts) {
    if (authStore.userProfile?.displayId) {
      profileLoaded = true;
    } else {
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      attempts++;
    }
  }
  
  if (!profileLoaded) {
    console.log('❌ Profile not loaded, skipping domain filter');
    return;
  }
  
  console.log('✅ Profile loaded, fetching filtered results for domain:', domain);
  
  // Fetch new results with domain filter and update statistics
  fetchMatchedJobs();
  fetchRecommendedJobs();
  fetchStatistics();
};

// Simple infinite scroll handler
const handleScroll = () => {
  // Check if we're near the bottom of the page
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  if (scrollTop + windowHeight >= documentHeight - 100) {
    // Load more matched jobs if available
    if (!isLoadingMoreMatches.value && matchesHasMore.value) {
      fetchMatchedJobs(true);
    }
    
    // Load more recommended jobs if available
    if (!isLoadingMoreRecommended.value && recommendedHasMore.value) {
      fetchRecommendedJobs(true);
    }
  }
};

onMounted(async () => {
  console.log('🔄 JobMatchView mounted, starting initialization...');
  
  // Wait for user profile to be available
  let profileLoaded = false;
  let attempts = 0;
  const maxAttempts = 10; // Wait up to 5 seconds (10 * 500ms)
  
  while (!profileLoaded && attempts < maxAttempts) {
    if (authStore.userProfile?.displayId) {
      profileLoaded = true;
      console.log('✅ User profile loaded:', {
        displayId: authStore.userProfile.displayId,
        hasDomains: !!authStore.userProfile.domain,
        domains: authStore.userProfile.domain,
        domainsCount: authStore.userProfile.domain?.length || 0
      });
    } else {
      console.log(`⏳ Waiting for profile... attempt ${attempts + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      attempts++;
    }
  }
  
  if (!profileLoaded) {
    console.log('❌ Failed to load user profile after 5 seconds');
    error.value = 'Unable to load user profile. Please try refreshing the page.';
    isLoading.value = false;
    return;
  }
  
  // Fetch latest user profile from external API to get domain information
  try {
    console.log('🌐 Fetching latest profile from external API...');
    await authStore.fetchUserFromExternalAPI(authStore.userProfile.displayId);
    console.log('✅ External API call completed, updated profile:', {
      hasDomains: !!authStore.userProfile.domain,
      domains: authStore.userProfile.domain,
      domainsCount: authStore.userProfile.domain?.length || 0
    });
  } catch (error) {
    console.log('⚠️ External API call failed (using fallback):', error.message);
  }
  
  // Fetch both matched and recommended jobs, plus statistics
  try {
    console.log('📊 Fetching initial job data...');
    await Promise.all([
      fetchMatchedJobs(),
      fetchRecommendedJobs(),
      fetchStatistics()
    ]);
    console.log('✅ Initial job data loaded');
  } catch (error) {
    console.error('❌ Error loading initial job data:', error);
  }
  
  // Set main loading to false after both requests complete
  isLoading.value = false;
  console.log('🎉 JobMatchView initialization complete');
  
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});



// Function to fetch match statistics
const fetchStatistics = async () => {
  try {
    isLoadingStats.value = true;
    const user_id = authStore.userProfile?.displayId;
    if (!user_id) throw new Error('No user_id found');

    const res = await axios.post('/api/get-match-statistics/', { user_id });
    
    if (res.data?.message) {
      statistics.value = res.data.message;
    }
  } catch (err) {
    // Handle error silently
  } finally {
    isLoadingStats.value = false;
  }
};

// Function to retry fetching jobs
const retryFetch = async () => {
  error.value = null;
  isLoading.value = true;
  matchesOffset.value = 0;
  recommendedOffset.value = 0;
  matchesHasMore.value = true;
  recommendedHasMore.value = true;
  
  // Only fetch if user profile is available
  if (authStore.userProfile?.displayId) {
    try {
      await Promise.all([
        fetchMatchedJobs(),
        fetchRecommendedJobs(),
        fetchStatistics()
      ]);
    } catch (error) {
      // Handle error silently
    }
  }
  
  isLoading.value = false;
};

// Function to navigate to job detail page
const viewJobDetails = (job) => {
  const jobData = encodeURIComponent(JSON.stringify(job));
  router.push(`/job/${jobData}`);
};

// Function to navigate to profile page
const goToProfile = () => {
  router.push('/profile');
};

// Function to refresh domains from external API
const refreshDomains = async () => {
  if (authStore.userProfile?.displayId) {
    try {
      console.log('🔄 Refreshing domains from external API...');
      await authStore.fetchUserFromExternalAPI(authStore.userProfile.displayId);
      console.log('✅ Domains refreshed:', authStore.userProfile?.domain);
    } catch (error) {
      console.error('❌ Error refreshing domains:', error);
    }
  }
};

// Development mode check
const isDev = import.meta.env.DEV;
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-6 py-8 max-w-7xl">
      <!-- Loading State -->
      <div v-if="isLoading || (isLoadingMatches && isLoadingRecommended)" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p class="text-gray-600 text-lg">Loading your job matches...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-8 shadow-lg">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <h3 class="text-xl font-semibold text-red-800 mb-2">Error Loading Matches</h3>
          <p class="text-red-700 mb-6">{{ error }}</p>
          <button @click="retryFetch()" class="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium">
            Try Again
          </button>
        </div>
      </div>

      <!-- Profile Incomplete State -->
      <div v-else-if="!isProfileComplete" class="max-w-4xl mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8 shadow-lg">
        <div class="text-center">
          <div class="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Complete Your Profile First</h3>
          <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
            To get personalized job matches, we need to know more about you. Please complete your profile with your skills, experience, and job preferences.
          </p>
          <div class="space-y-4">
            <div class="bg-white rounded-lg p-4 border border-indigo-200">
              <h4 class="font-semibold text-gray-900 mb-2">What we need:</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Personal information (name, location)
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Skills and expertise
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Work experience
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Job preferences (industry, salary)
                </li>
              </ul>
            </div>
            <button @click="goToProfile()" class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Complete Your Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-800">Job Matches</h1>
          </div>
          <p class="text-sm text-gray-600 max-w-md mx-auto">Discover your perfect job opportunities based on your profile</p>
        </div>

                <!-- Controls Section -->
        <div class="flex flex-col lg:flex-row gap-4 mb-8">
          <!-- Job Section Tabs - Fixed width on left -->
          <div class="w-full lg:w-1/2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700">Job Sections</span>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="handleSectionChange('matched')"
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2',
                    activeSection === 'matched' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                  Matched
                  <span class="px-2 py-0.5 text-xs rounded-full" :class="activeSection === 'matched' ? 'bg-indigo-500' : 'bg-gray-300'">
                    {{ isLoadingStats ? '...' : (statistics.matched_jobs_count || 0).toLocaleString() }}
                  </span>
                </button>
                <button 
                  @click="handleSectionChange('recommended')"
                  :class="[
                    'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2',
                    activeSection === 'recommended' 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                  Recommended
                  <span class="px-2 py-0.5 text-xs rounded-full" :class="activeSection === 'recommended' ? 'bg-indigo-500' : 'bg-gray-300'">
                    {{ isLoadingStats ? '...' : (statistics.recommended_jobs_count || 0).toLocaleString() }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Domain Filter - Only show for matched jobs on the right -->
          <div v-if="activeSection === 'matched' && availableDomains.length > 0" class="w-full lg:w-1/2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700">Filter by Domain</span>
              </div>
              <div class="relative">
                <select 
                  v-model="selectedDomain"
                  @change="handleDomainChange(selectedDomain)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm text-gray-700 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="all">All Jobs</option>
                  <option 
                    v-for="domain in availableDomains" 
                    :key="domain"
                    :value="domain"
                  >
                    {{ domain }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <!-- No Domains Available - Only show for matched jobs on the right -->
          <div v-else-if="activeSection === 'matched' && availableDomains.length === 0" class="w-full lg:w-1/2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700">Domain Filter</span>
              </div>
              <div class="text-sm text-gray-500 mb-3">
                No domains available. Please update your profile with company preferences.
              </div>
              <button 
                @click="refreshDomains"
                class="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Refresh Domains
              </button>
            </div>
          </div>
        </div>



        <!-- Recommended Jobs Section -->
        <div v-if="activeSection === 'recommended' && recommendedJobs.length > 0" class="mb-12">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-800">Recommended Jobs</h2>
            </div>
                        <div class="text-right">
              <div v-if="isLoadingStats" class="animate-pulse">
                <div class="h-6 bg-gray-300 rounded w-16"></div>
              </div>
              <div v-else class="text-sm text-gray-600">
                Total: <span class="font-semibold text-gray-800">{{ (statistics.recommended_jobs_count || 0).toLocaleString() }}</span>
              </div>
            </div>
        </div>

          <!-- Loading State for Recommended Jobs -->
          <div v-if="isLoadingRecommended" class="flex justify-center items-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p class="text-gray-600 text-base">Loading recommended jobs...</p>
            </div>
          </div>
          
          <!-- Recommended Jobs Grid -->
          <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="job in recommendedJobs" :key="job.id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-gray-900 mb-2 truncate">{{ job.job_details?.details?.title || 'Unknown Position' }}</h3>
                  <p class="text-sm text-gray-600 mb-2 truncate">{{ job.job_details?.details?.company_name || 'Unknown Company' }}</p>
                  <div class="flex items-center text-gray-500 text-sm">
                    <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="truncate">{{ job.job_details?.details?.location || 'Unknown Location' }}</span>
                  </div>
                </div>
                <div class="text-right ml-3">
                  <div class="text-2xl font-bold text-indigo-600">{{ job.match_result?.overall_match || 0 }}%</div>
                  <div class="text-xs text-gray-500">Match</div>
                </div>
              </div>
              
              <div class="mb-4">
                <div class="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Overall Match</span>
                  <span>{{ job.match_result?.overall_match || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: (job.match_result?.overall_match || 0) + '%' }"></div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="text-center">
                  <div class="text-sm font-semibold text-gray-700">{{ job.match_result?.skills_match || 0 }}%</div>
                  <div class="text-xs text-gray-500">Skills</div>
                </div>
                <div class="text-center">
                  <div class="text-sm font-semibold text-gray-700">{{ job.match_result?.experience_match || 0 }}%</div>
                  <div class="text-xs text-gray-500">Experience</div>
                </div>
              </div>
              
              <button @click="viewJobDetails(job)" class="w-full px-4 py-3 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-all duration-300 group-hover:shadow-md">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </button>
            </div>
          </div>
          

        </div>

        <!-- Matched Jobs Section -->
        <div v-if="activeSection === 'matched' && matches.length > 0" class="mb-12">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
              <h2 class="text-2xl font-bold text-gray-800">Matched Jobs</h2>
            </div>
            <div class="text-right">
              <div v-if="isLoadingStats" class="animate-pulse">
                <div class="h-6 bg-gray-300 rounded w-16"></div>
              </div>
              <div v-else class="text-sm text-gray-600">
                Total: <span class="font-semibold text-gray-800">{{ (statistics.matched_jobs_count || 0).toLocaleString() }}</span>
              </div>
            </div>
          </div>
          
          <!-- Loading State for Matched Jobs -->
          <div v-if="isLoadingMatches" class="flex justify-center items-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p class="text-gray-600 text-base">Loading matched jobs...</p>
            </div>
          </div>
          
          <!-- Matched Jobs Grid -->
          <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="job in matches" :key="job.id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-gray-900 mb-2 truncate">{{ job.job_details?.details?.title || 'Unknown Position' }}</h3>
                  <p class="text-sm text-gray-600 mb-2 truncate">{{ job.job_details?.details?.company_name || 'Unknown Company' }}</p>
                  <div class="flex items-center text-gray-500 text-sm">
                    <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span class="truncate">{{ job.job_details?.details?.location || 'Unknown Location' }}</span>
                  </div>
                </div>
                <div class="text-right ml-3">
                  <div class="text-2xl font-bold text-indigo-600">{{ job.match_result?.overall_match || 0 }}%</div>
                  <div class="text-xs text-gray-500">Match</div>
                </div>
              </div>
              
              <div class="mb-4">
                <div class="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Overall Match</span>
                  <span>{{ job.match_result?.overall_match || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: (job.match_result?.overall_match || 0) + '%' }"></div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="text-center">
                  <div class="text-sm font-semibold text-gray-700">{{ job.match_result?.skills_match || 0 }}%</div>
                  <div class="text-xs text-gray-500">Skills</div>
                </div>
                <div class="text-center">
                  <div class="text-sm font-semibold text-gray-700">{{ job.match_result?.experience_match || 0 }}%</div>
                  <div class="text-xs text-gray-500">Experience</div>
                </div>
              </div>
              
              <button @click="viewJobDetails(job)" class="w-full px-4 py-3 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-all duration-300 group-hover:shadow-md">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </button>
            </div>
          </div>
          

        </div>

        <!-- Bottom Loading Indicator -->
        <div v-if="isLoadingMoreMatches || isLoadingMoreRecommended" class="text-center py-12">
          <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-200 max-w-md mx-auto">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p class="text-gray-600 text-base font-medium">
              {{ isLoadingMoreMatches && isLoadingMoreRecommended ? 'Loading more jobs...' : 
                 isLoadingMoreMatches ? 'Loading more matched jobs...' : 
                 'Loading more recommended jobs...' }}
            </p>
          </div>
        </div>

        <!-- No More Results -->
        <div v-else-if="!matchesHasMore && !recommendedHasMore && matches.length > 0 && recommendedJobs.length > 0" class="text-center py-12">
          <div class="bg-white rounded-xl shadow-sm p-8 border border-gray-200 max-w-md mx-auto">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-gray-600 text-base font-medium">No more jobs to load</p>
          </div>
        </div>

        <!-- No Jobs in Active Section -->
        <div v-if="activeSection === 'matched' && matches.length === 0 && !isLoadingMatches" class="text-center py-20">
          <div class="bg-white rounded-xl shadow-sm p-12 border border-gray-200 max-w-md mx-auto">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <h3 class="text-xl font-bold text-gray-800 mb-4">No matched jobs found</h3>
            <p class="text-gray-600 mb-6">Try updating your profile or switching to recommended jobs</p>
            <button @click="handleSectionChange('recommended')" class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium">
              View Recommended Jobs
            </button>
          </div>
        </div>

        <div v-if="activeSection === 'recommended' && recommendedJobs.length === 0 && !isLoadingRecommended" class="text-center py-20">
          <div class="bg-white rounded-xl shadow-sm p-12 border border-gray-200 max-w-md mx-auto">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
            <h3 class="text-xl font-bold text-gray-800 mb-4">No recommended jobs found</h3>
            <p class="text-gray-600 mb-6">Try updating your profile or switching to matched jobs</p>
            <button @click="handleSectionChange('matched')" class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium">
              View Matched Jobs
            </button>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="matches.length === 0 && recommendedJobs.length === 0 && !isLoading" class="text-center py-20">
          <div class="bg-white rounded-xl shadow-sm p-12 border border-gray-200 max-w-md mx-auto">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <h3 class="text-xl font-bold text-gray-800 mb-4">No job matches found</h3>
            <p class="text-gray-600 mb-6">Try updating your profile to get better matches</p>
            <button @click="$router.push('/profile')" class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium">
              Update Profile
            </button>
          </div>
        </div>


      </div>
    </div>
  </div>
</template> 