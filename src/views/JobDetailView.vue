<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const job = ref(null);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    isLoading.value = true;
    // Get job data from route params or localStorage
    const jobData = route.params.jobData;
    if (jobData) {
      job.value = JSON.parse(decodeURIComponent(jobData));
    } else {
      error.value = 'Job data not found';
    }
  } catch (err) {
    error.value = 'Failed to load job details';
  } finally {
    isLoading.value = false;
  }
});

const goBack = () => {
  router.push('/match');
};

const applyForJob = () => {
  if (job.value?.job_details?.details?.apply_link) {
    window.open(job.value.job_details.details.apply_link, '_blank');
  }
};

const viewJobPost = () => {
  if (job.value?.job_details?.details?.view_link) {
    window.open(job.value.job_details.details.view_link, '_blank');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div class="w-full px-6 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading job details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Job</h3>
        <p class="text-red-700">{{ error }}</p>
        <button @click="goBack" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
          Go Back
        </button>
      </div>

      <!-- Job Details -->
      <div v-else-if="job" class="w-full">
        <!-- Header -->
        <div class="mb-8">
          <button @click="goBack" class="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Job Matches
          </button>
          
          <div class="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
            <div class="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z"></path>
                    </svg>
                  </div>
                  <div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                      {{ job.job_details?.details?.title || 'Unknown Position' }}
                    </h1>
                    <p class="text-2xl font-semibold text-indigo-600 mb-3">
                      {{ job.job_details?.details?.company_name || 'Unknown Company' }}
                    </p>
                    <div class="flex items-center text-gray-600 text-lg">
                      <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {{ job.job_details?.details?.location || 'Unknown Location' }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Match Score -->
              <div class="text-center bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div class="text-5xl font-bold mb-2">
                  {{ job.match_result?.overall_match || 0 }}%
                </div>
                <div class="text-lg font-medium opacity-90">Match Score</div>
                <div class="text-sm opacity-75 mt-2">Perfect Match</div>
              </div>
            </div>

            <!-- Match Breakdown -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
              <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                <div class="text-2xl font-bold text-green-700 mb-1">{{ job.match_result?.skills_match || 0 }}%</div>
                <div class="text-sm font-medium text-green-600">Skills Match</div>
              </div>
              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                <div class="text-2xl font-bold text-blue-700 mb-1">{{ job.match_result?.experience_match || 0 }}%</div>
                <div class="text-sm font-medium text-blue-600">Experience</div>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                <div class="text-2xl font-bold text-purple-700 mb-1">{{ job.match_result?.education_match || 0 }}%</div>
                <div class="text-sm font-medium text-purple-600">Education</div>
              </div>
              <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                <div class="text-2xl font-bold text-orange-700 mb-1">{{ job.match_result?.location_match || 0 }}%</div>
                <div class="text-sm font-medium text-orange-600">Location</div>
              </div>
              <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 text-center border border-pink-200">
                <div class="text-2xl font-bold text-pink-700 mb-1">{{ job.match_result?.role_match || 0 }}%</div>
                <div class="text-sm font-medium text-pink-600">Role Match</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="text-center space-y-4">
              <button 
                @click="applyForJob"
                class="px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 transform"
              >
                <svg class="w-6 h-6 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Apply for this Position
              </button>
              
              <!-- View Job Post Button - Only show if view_link exists -->
              <div v-if="job.job_details?.details?.view_link" class="mt-4">
                <button 
                  @click="viewJobPost"
                  class="px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform"
                >
                  <svg class="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  See the Job Post
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Details Sections -->
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <!-- Main Content -->
          <div class="xl:col-span-3 space-y-8">
            <!-- Description -->
            <div class="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-gray-900">Job Description</h2>
              </div>
              <div class="prose prose-lg max-w-none">
                <div class="text-gray-700 leading-relaxed text-lg" v-html="job.job_details?.details?.description || 'No description available'"></div>
              </div>
            </div>

            <!-- Requirements -->
            <div v-if="job.job_details?.details?.requirements?.length" class="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-gray-900">Requirements</h2>
              </div>
              <ul class="space-y-4">
                <li v-for="(requirement, index) in job.job_details.details.requirements" :key="index" class="flex items-start">
                  <div class="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span class="text-gray-700 text-lg">{{ requirement }}</span>
                </li>
              </ul>
            </div>

            <!-- Qualifications -->
            <div v-if="job.job_details?.details?.qualification?.length" class="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-gray-900">Qualifications</h2>
              </div>
              <ul class="space-y-4">
                <li v-for="(qualification, index) in job.job_details.details.qualification" :key="index" class="flex items-start">
                  <div class="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span class="text-gray-700 text-lg">{{ qualification }}</span>
                </li>
              </ul>
            </div>

            <!-- Preferred Qualifications -->
            <div v-if="job.job_details?.details?.prferred_qualification?.length" class="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
              <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-gray-900">Preferred Qualifications</h2>
              </div>
              <ul class="space-y-4">
                <li v-for="(qualification, index) in job.job_details.details.prferred_qualification" :key="index" class="flex items-start">
                  <div class="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <span class="text-gray-700 text-lg">{{ qualification }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Job Info -->
            <div class="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900">Job Information</h3>
              </div>
              <div class="space-y-4">
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <span class="text-sm font-semibold text-gray-600 block mb-1">Industry</span>
                  <p class="text-gray-900 font-medium">{{ job.job_details?.details?.industry || 'Not specified' }}</p>
                </div>
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <span class="text-sm font-semibold text-gray-600 block mb-1">Posted Date</span>
                  <p class="text-gray-900 font-medium">{{ job.job_details?.details?.date_of_post || 'Not specified' }}</p>
                </div>
              </div>
            </div>

            <!-- Benefits -->
            <div v-if="job.job_details?.details?.benifits?.length" class="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900">Benefits</h3>
              </div>
              <ul class="space-y-3">
                <li v-for="(benefit, index) in job.job_details.details.benifits" :key="index" class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-gray-700">{{ benefit }}</span>
                </li>
              </ul>
            </div>

            <!-- Required Skills -->
            <div v-if="job.job_details?.details?.required_skills?.length" class="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900">Required Skills</h3>
              </div>
              <div class="flex flex-wrap gap-3">
                <span v-for="skill in job.job_details.details.required_skills" :key="skill" 
                      class="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm font-medium rounded-full border border-indigo-200">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 