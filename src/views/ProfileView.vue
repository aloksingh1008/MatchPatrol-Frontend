<script setup>
import { ref, watchEffect, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { db } from '@/firebase';
import { ref as dbRef, get, set } from 'firebase/database';
import initialProfileData from '@/data/userProfile.json';
import axios from 'axios';

const authStore = useAuthStore();
const profile = ref(null);
const isEditing = ref(false);
const isSaving = ref(false);
const isLoading = ref(false);
const isExternalLoading = ref(false);
const notification = ref({ show: false, message: '', type: 'success' });
const newSkill = ref('');
const newCompanyUrl = ref('');

const locations = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', // India
  'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Chicago, IL', // USA
  'London', 'Berlin', 'Toronto', 'Singapore', 'Dubai', 'Sydney', 'Remote'
];

const industries = [
  'Technology & IT', 'Finance & Banking', 'Healthcare & Life Sciences', 
  'Manufacturing & Engineering', 'Retail & Consumer Goods', 'Education & Training',
  'Transportation & Logistics', 'Government & Public Sector', 'Energy & Environment',
  'Media & Communications', 'Hospitality & Tourism', 'Legal & Consulting'
];

function showNotification(message, type = 'success') {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 4000);
}

async function seedUserProfile() {
  if (authStore.user) {
    try {
      await saveUserProfile(authStore.user.uid, initialProfileData);
      await fetchUserProfile(authStore.user.uid); // Re-fetch to update the UI
    } catch (error) {
      // Handle error silently
    }
  }
}



async function seedToExternalAPI() {
  if (authStore.userProfile) {
    try {
      await authStore.seedUserProfile();
      alert("Profile sent to external API successfully!");
    } catch (error) {
      alert("Error sending profile to external API: " + error.message);
    }
  } else {
    alert("No user profile available");
  }
}

async function fetchUserProfile(userId) {
  const userProfileRef = dbRef(db, `users/${userId}/profile`);
  const snapshot = await get(userProfileRef);
  if (snapshot.exists()) {
    const fetchedProfile = snapshot.val();
    // Defensive initialization for all fields
    if (!fetchedProfile.personalInfo) {
      fetchedProfile.personalInfo = { name: '', email: '', phone: '', location: '' };
    }
    if (!Array.isArray(fetchedProfile.skills)) {
      fetchedProfile.skills = [];
    }
    if (!Array.isArray(fetchedProfile.experience)) {
      fetchedProfile.experience = [];
    }
    if (!Array.isArray(fetchedProfile.education)) {
      fetchedProfile.education = [];
    }
    if (!Array.isArray(fetchedProfile.projects)) {
      fetchedProfile.projects = [];
    }
    if (!fetchedProfile.jobPreferences) {
      fetchedProfile.jobPreferences = {};
    }
    const defaults = {
        preferredIndustry: '',
        minSalary: 0,
        maxSalary: 0,
        companyCareerPageUrls: []
    };
    for (const key in defaults) {
        if (fetchedProfile.jobPreferences[key] === undefined) {
            fetchedProfile.jobPreferences[key] = defaults[key];
        }
    }
    profile.value = fetchedProfile;
  } else {
    // Defensive: initialize empty profile if not found
    profile.value = {
      personalInfo: { name: '', email: '', phone: '', location: '' },
      skills: [],
      experience: [],
      education: [],
      projects: [],
      jobPreferences: { preferredIndustry: '', minSalary: 0, maxSalary: 0, companyCareerPageUrls: [] },
      displayId: ''
    };
    console.error("No profile data found for user:", userId);
  }
}

async function saveUserProfile(userId, profileData) {
  isSaving.value = true;
  // Defensive: ensure all fields are initialized
  if (!profileData.personalInfo) profileData.personalInfo = { name: '', email: '', phone: '', location: '' };
  if (!Array.isArray(profileData.skills)) profileData.skills = [];
  if (!Array.isArray(profileData.experience)) profileData.experience = [];
  if (!Array.isArray(profileData.education)) profileData.education = [];
  if (!Array.isArray(profileData.projects)) profileData.projects = [];
  if (!profileData.jobPreferences) profileData.jobPreferences = { preferredIndustry: '', minSalary: 0, maxSalary: 0, companyCareerPageUrls: [] };
  if (!Array.isArray(profileData.jobPreferences.companyCareerPageUrls)) profileData.jobPreferences.companyCareerPageUrls = [];
  try {
    // Save to Firebase
    const userProfileRef = dbRef(db, `users/${userId}/profile`);
    await set(userProfileRef, profileData);
    // Update the auth store's userProfile with the new data
    authStore.userProfile = { ...profileData };
    
    // Also send to external API if user has a displayId
    if (authStore.userProfile && authStore.userProfile.displayId) {
      try {
        await authStore.seedUserProfile();
        showNotification('Profile saved successfully!', 'success');
      } catch (externalError) {
        showNotification('Profile saved locally, but sync failed: ' + externalError.message, 'warning');
      }
    } else {
      showNotification('Profile saved successfully!', 'success');
    }
  } catch (error) {
    showNotification('Error saving profile: ' + error.message, 'error');
  } finally {
    isSaving.value = false;
  }
}

async function fetchUserFromExternalAPI() {
  if (authStore.userProfile && authStore.userProfile.displayId) {
    isExternalLoading.value = true;
    try {
      const userData = await authStore.fetchUserFromExternalAPI(authStore.userProfile.displayId);
      
      // Ensure profile.value is properly initialized
      if (!profile.value) {
        profile.value = {
          personalInfo: { name: '', email: '', phone: '', location: '' },
          skills: [],
          experience: [],
          education: [],
          projects: [],
          jobPreferences: { preferredIndustry: '', minSalary: 0, maxSalary: 0, companyCareerPageUrls: [] },
          displayId: '',
          domain: []
        };
      }
      
      // Ensure all nested objects exist
      if (!profile.value.personalInfo) {
        profile.value.personalInfo = { name: '', email: '', phone: '', location: '' };
      }
      if (!Array.isArray(profile.value.skills)) {
        profile.value.skills = [];
      }
      if (!Array.isArray(profile.value.experience)) {
        profile.value.experience = [];
      }
      if (!Array.isArray(profile.value.education)) {
        profile.value.education = [];
      }
      if (!Array.isArray(profile.value.projects)) {
        profile.value.projects = [];
      }
      if (!profile.value.jobPreferences) {
        profile.value.jobPreferences = { preferredIndustry: '', minSalary: 0, maxSalary: 0, companyCareerPageUrls: [] };
      }
      if (!Array.isArray(profile.value.jobPreferences.companyCareerPageUrls)) {
        profile.value.jobPreferences.companyCareerPageUrls = [];
      }
      
      // Handle the response structure where data is under 'message' property
      if (userData && userData.message) {
        // Update profile properties individually for better reactivity
        const externalData = userData.message.details || {};
        const externalIndustry = userData.message.industry;
        
        // Update personal info
        if (externalData.personalInfo && profile.value.personalInfo) {
          profile.value.personalInfo = { ...externalData.personalInfo };
        }
        
        // Update skills
        if (externalData.skills && profile.value.skills) {
          profile.value.skills = [...externalData.skills];
        }
        
        // Update experience
        if (externalData.experience && profile.value.experience) {
          profile.value.experience = [...externalData.experience];
        }
        
        // Update education
        if (externalData.education && profile.value.education) {
          profile.value.education = [...externalData.education];
        }
        
        // Update projects
        if (externalData.projects && profile.value.projects) {
          profile.value.projects = [...externalData.projects];
        }
        
        // Update job preferences
        if (externalData.jobPreferences && profile.value.jobPreferences) {
          profile.value.jobPreferences = { ...externalData.jobPreferences };
        }
        
        // Update display ID
        if (externalData.displayId) {
          profile.value.displayId = externalData.displayId;
        }
        
        // Update industry in job preferences if it exists in the external data
        if (externalIndustry && externalIndustry !== 'null' && externalIndustry !== 'undefined' && profile.value.jobPreferences) {
          // Remove quotes if they exist
          const cleanIndustry = externalIndustry.replace(/"/g, '');
          profile.value.jobPreferences.preferredIndustry = cleanIndustry;
        }
        
        // Update domain information if it exists in the external data
        const externalDomains = userData.message.domains;
        if (externalDomains) {
          // Ensure domains is always stored as an array
          if (Array.isArray(externalDomains)) {
            profile.value.domain = [...externalDomains];
          } else if (typeof externalDomains === 'string') {
            // If it's a single string, convert to array
            profile.value.domain = [externalDomains];
          } else {
            // If it's null/undefined, set empty array
            profile.value.domain = [];
          }
        } else {
          profile.value.domain = [];
        }
        
        showNotification("Profile updated successfully!", 'success');
      } else if (userData && userData.data) {
        // Fallback for different response structure
        await nextTick();
        profile.value = { ...userData.data };
        showNotification("Profile updated successfully!", 'success');
      } else {
        showNotification("No profile data available", 'error');
      }
    } catch (error) {
      // If external API fails, set fallback domains based on user's industry/skills
      if (profile.value) {
        const fallbackDomains = [];
        
        // Add domains based on preferred industry
        const industry = profile.value.jobPreferences?.preferredIndustry;
        if (industry) {
          if (industry.includes('Technology') || industry.includes('IT')) {
            fallbackDomains.push('Technology', 'Software', 'IT Services');
          } else if (industry.includes('Finance')) {
            fallbackDomains.push('Finance', 'Banking', 'Investment');
          } else if (industry.includes('Healthcare')) {
            fallbackDomains.push('Healthcare', 'Medical', 'Pharmaceutical');
          } else {
            fallbackDomains.push('General', 'Business', 'Consulting');
          }
        }
        
        // Add domains based on skills
        const skills = profile.value.skills || [];
        skills.forEach(skill => {
          if (skill.toLowerCase().includes('javascript') || skill.toLowerCase().includes('vue') || skill.toLowerCase().includes('react')) {
            if (!fallbackDomains.includes('Technology')) fallbackDomains.push('Technology');
          }
          if (skill.toLowerCase().includes('python') || skill.toLowerCase().includes('data')) {
            if (!fallbackDomains.includes('Data Science')) fallbackDomains.push('Data Science');
          }
          if (skill.toLowerCase().includes('design') || skill.toLowerCase().includes('ui')) {
            if (!fallbackDomains.includes('Design')) fallbackDomains.push('Design');
          }
        });
        
        // Ensure we have at least some fallback domains
        if (fallbackDomains.length === 0) {
          fallbackDomains.push('Technology', 'Business', 'General');
        }
        
        profile.value.domain = fallbackDomains;
      }
      
      showNotification("Error updating profile: " + error.message, 'error');
    } finally {
      isExternalLoading.value = false;
    }
  }
}

watchEffect(() => {
  if (authStore.user) {
    fetchUserProfile(authStore.user.uid);
    // Only fetch from external API if the profile is not empty
    if (
      authStore.userProfile &&
      authStore.userProfile.displayId &&
      // Check if the profile is not empty (has at least one non-empty section)
      (
        (authStore.userProfile.personalInfo && (
          authStore.userProfile.personalInfo.name ||
          authStore.userProfile.personalInfo.email ||
          authStore.userProfile.personalInfo.phone ||
          authStore.userProfile.personalInfo.location
        )) ||
        (Array.isArray(authStore.userProfile.skills) && authStore.userProfile.skills.length > 0) ||
        (Array.isArray(authStore.userProfile.experience) && authStore.userProfile.experience.length > 0) ||
        (Array.isArray(authStore.userProfile.education) && authStore.userProfile.education.length > 0) ||
        (Array.isArray(authStore.userProfile.projects) && authStore.userProfile.projects.length > 0) ||
        (authStore.userProfile.jobPreferences && (
          authStore.userProfile.jobPreferences.preferredIndustry ||
          authStore.userProfile.jobPreferences.minSalary > 0 ||
          authStore.userProfile.jobPreferences.maxSalary > 0 ||
          (Array.isArray(authStore.userProfile.jobPreferences.companyCareerPageUrls) && authStore.userProfile.jobPreferences.companyCareerPageUrls.length > 0)
        ))
      )
    ) {
      setTimeout(() => {
        fetchUserFromExternalAPI();
      }, 3000); // Wait 3 seconds for Firebase to load
    }
  }
});

function addSkill() {
  if (newSkill.value && !profile.value.skills.includes(newSkill.value)) {
    profile.value.skills.push(newSkill.value);
    newSkill.value = '';
  }
}

function removeSkill(index) {
  profile.value.skills.splice(index, 1);
}

function addExperience() {
  profile.value.experience.push({ title: '', company: '', startDate: '', endDate: '', currently: false, description: '' });
}

function removeExperience(index) {
  profile.value.experience.splice(index, 1);
}

function addEducation() {
  profile.value.education.push({ degree: '', institution: '', startDate: '', endDate: '', currently: false });
}

function removeEducation(index) {
  profile.value.education.splice(index, 1);
}

function addProject() {
  profile.value.projects.push({ name: '', url: '', startDate: '', endDate: '', description: '' });
}

function removeProject(index) {
  profile.value.projects.splice(index, 1);
}

function addCompanyUrl() {
    if (newCompanyUrl.value && profile.value.jobPreferences.companyCareerPageUrls.length < 10 && !profile.value.jobPreferences.companyCareerPageUrls.includes(newCompanyUrl.value)) {
        profile.value.jobPreferences.companyCareerPageUrls.push(newCompanyUrl.value);
        newCompanyUrl.value = '';
    }
}

function removeCompanyUrl(index) {
    profile.value.jobPreferences.companyCareerPageUrls.splice(index, 1);
}

function toggleEdit() {
  isEditing.value = !isEditing.value;
  if (!isEditing.value && authStore.user) {
    saveUserProfile(authStore.user.uid, profile.value);
  }
}
</script>

<template>
  <!-- Full Screen Loader -->
  <div v-if="isSaving" class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
    <div class="text-white text-2xl font-bold animate-pulse">
      Saving Profile...
    </div>
  </div>

  <!-- Notification Toast -->
  <div v-if="notification.show" 
       class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
       :class="{
         'border-l-4 border-green-500': notification.type === 'success',
         'border-l-4 border-yellow-500': notification.type === 'warning',
         'border-l-4 border-red-500': notification.type === 'error'
       }">
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg v-if="notification.type === 'success'" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="notification.type === 'warning'" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <svg v-else class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-medium text-gray-900">{{ notification.message }}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button @click="notification.show = false" class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- External API Loading Indicator -->
  <div v-if="isExternalLoading" class="fixed top-4 left-4 z-40 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
    <div class="flex items-center space-x-2">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      <span class="text-sm font-medium">Updating profile...</span>
    </div>
  </div>

  <div v-if="profile" class="bg-gradient-to-br from-blue-50 via-indigo-100 to-white min-h-screen">
    <div class="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
      <div>
          <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Profile</h1>
          <p class="mt-2 text-gray-500 text-lg">Your professional snapshot. Keep it updated for the best job matches.</p>
      </div>
      <div class="flex items-center">
          <button @click="toggleEdit" class="px-6 py-2 rounded-lg font-semibold text-white shadow-sm transition-colors duration-150"
          :class="{
              'bg-gradient-to-r from-indigo-500 to-blue-500 hover:scale-105': isEditing && !isSaving,
              'bg-blue-600 hover:bg-blue-700': !isEditing,
            'bg-gray-400': isSaving
          }"
          :disabled="isSaving">
          <span v-if="isSaving">Saving...</span>
          <span v-else>{{ isEditing ? 'Save Profile' : 'Edit Profile' }}</span>
        </button>
      </div>
    </div>

    <!-- Personal Information -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
        <div class="flex items-center mb-6">
          <svg class="h-8 w-8 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 class="text-3xl font-extrabold text-indigo-700 tracking-tight">Personal Information</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <p v-if="!isEditing" class="mt-1 text-lg">{{ profile.personalInfo?.name || '' }}</p>
          <input v-else type="text" v-model="profile.personalInfo.name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <p v-if="!isEditing" class="mt-1 text-lg">{{ profile.personalInfo?.email || '' }}</p>
          <input v-else type="email" v-model="profile.personalInfo.email"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Phone</label>
          <p v-if="!isEditing" class="mt-1 text-lg">{{ profile.personalInfo?.phone || '' }}</p>
          <input v-else type="text" v-model="profile.personalInfo.phone"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Location</label>
          <p v-if="!isEditing" class="mt-1 text-lg">{{ profile.personalInfo?.location || '' }}</p>
          <select v-else v-model="profile.personalInfo.location"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-2">
            <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Skills -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
        <div class="flex items-center mb-6">
          <svg class="h-8 w-8 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5zm7-13a3 3 0 01-6 0 3 3 0 016 0z" />
          </svg>
          <h2 class="text-3xl font-extrabold text-indigo-700 tracking-tight">Skills</h2>
        </div>
        <div v-if="!isEditing" class="flex flex-wrap gap-3">
        <span v-for="skill in profile.skills" :key="skill"
            class="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-semibold shadow-md px-4 py-1 rounded-full">
          {{ skill }}
        </span>
      </div>
      <div v-else>
        <div class="flex items-center gap-2 mb-4">
            <label class="block text-sm font-medium text-gray-700">Skill</label>
          <input type="text" list="skills-list" v-model="newSkill" @keyup.enter="addSkill" placeholder="Add a skill"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-2">
          <datalist id="skills-list">
            <option value="JavaScript"></option>
            <option value="Python"></option>
            <option value="Java"></option>
            <option value="React"></option>
            <option value="Node.js"></option>
          </datalist>
          <button @click="addSkill"
              class="px-4 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:scale-105">Add</button>
        </div>
          <div v-if="!Array.isArray(profile.skills) || profile.skills.length === 0" class="text-gray-500 italic mb-2">No skills added yet.</div>
        <div class="flex flex-wrap gap-2">
          <span v-for="(skill, index) in profile.skills" :key="index"
            class="flex items-center bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
            {{ skill }}
            <button @click="removeSkill(index)" class="ml-2 text-blue-800 hover:text-blue-600">
              &times;
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- Experience -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
        <div class="flex items-center mb-6">
          <svg class="h-8 w-8 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2A16 16 0 0012 0a16 16 0 00-10 20a2 2 0 002 2z" />
          </svg>
          <h2 class="text-3xl font-extrabold text-indigo-700 tracking-tight">Experience</h2>
        </div>
        <div class="space-y-6">
          <div v-if="profile.experience.length === 0 && isEditing" class="text-gray-500 italic mb-2">No experience added yet.</div>
        <div v-for="(job, index) in profile.experience" :key="index" class="relative">
          <div v-if="!isEditing">
            <h3 class="text-xl font-bold">{{ job.title }}</h3>
              <p class="text-md text-gray-700">{{ job.company }} | {{ job.startDate }} - {{ job.currently ? 'Present' : job.endDate }}</p>
            <p class="mt-2 text-gray-600">{{ job.description }}</p>
          </div>
          <div v-else class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" v-model="job.title" placeholder="Title"
              class="block w-full rounded-md border-gray-300 shadow-sm p-2">
              <label class="block text-sm font-medium text-gray-700">Company</label>
            <input type="text" v-model="job.company" placeholder="Company"
              class="block w-full rounded-md border-gray-300 shadow-sm p-2">
              <div class="flex items-center gap-4 mt-1">
                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" v-model="job.startDate" placeholder="Start Date"
                  class="block w-1/2 rounded-md border-gray-300 shadow-sm p-2">
                <label class="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" v-model="job.endDate" :disabled="job.currently" placeholder="End Date"
                  class="block w-1/2 rounded-md border-gray-300 shadow-sm p-2">
              </div>
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="job.currently" @change="job.currently ? job.endDate = '' : null">
                Currently working here
              </label>
              <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea v-model="job.description" placeholder="Description"
              class="block w-full rounded-md border-gray-300 shadow-sm p-2"></textarea>
            <button @click="removeExperience(index)"
              class="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full hover:bg-red-700">&times;</button>
          </div>
        </div>
        <button v-if="isEditing" @click="addExperience"
            class="mt-4 px-4 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:scale-105">Add
          Experience</button>
      </div>
    </div>

    <!-- Education -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
        <div class="flex items-center mb-6">
          <svg class="h-8 w-8 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253zm-9-1.253C6.832 17.477 8.418 17 10.165 17c1.746 0 3.332.477 4.5 1.253v-13C13.499 5.477 11.913 5 10.165 5 8.418 5 6.832 5.477 5.665 6.253z" />
          </svg>
          <h2 class="text-3xl font-extrabold text-indigo-700 tracking-tight">Education</h2>
        </div>
        <div class="space-y-6">
          <div v-if="profile.education.length === 0 && isEditing" class="text-gray-500 italic mb-2">No education added yet.</div>
        <div v-for="(edu, index) in profile.education" :key="index" class="relative">
          <div v-if="!isEditing">
            <h3 class="text-xl font-bold">{{ edu.degree }}</h3>
              <p class="text-md text-gray-700">{{ edu.institution }} | {{ edu.startDate }} - {{ edu.currently ? 'Present' : edu.endDate }}</p>
          </div>
          <div v-else class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Degree</label>
            <input type="text" v-model="edu.degree" placeholder="Degree"
              class="block w-full rounded-md border-gray-300 shadow-sm p-2">
              <label class="block text-sm font-medium text-gray-700">Institution</label>
            <input type="text" v-model="edu.institution" placeholder="Institution"
              class="block w-full rounded-md border-gray-300 shadow-sm p-2">
              <div class="flex items-center gap-4 mt-1">
                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" v-model="edu.startDate" placeholder="Start Date"
                  class="block w-1/2 rounded-md border-gray-300 shadow-sm p-2">
                <label class="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" v-model="edu.endDate" :disabled="edu.currently" placeholder="End Date"
                  class="block w-1/2 rounded-md border-gray-300 shadow-sm p-2">
              </div>
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="edu.currently" @change="edu.currently ? edu.endDate = '' : null">
                Currently studying here
              </label>
            <button @click="removeEducation(index)"
              class="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full hover:bg-red-700">&times;</button>
          </div>
        </div>
        <button v-if="isEditing" @click="addEducation"
            class="mt-4 px-4 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:scale-105">Add
          Education</button>
      </div>
    </div>

    <!-- Projects -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
        <div class="flex items-center mb-6">
          <svg class="h-8 w-8 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h2 class="text-3xl font-extrabold text-indigo-700 tracking-tight">Projects</h2>
        </div>
        <div class="space-y-6">
          <div v-if="profile.projects.length === 0 && isEditing" class="text-gray-500 italic mb-2">No projects added yet.</div>
        <div v-for="(project, index) in profile.projects" :key="index" class="relative">
          <div v-if="!isEditing">
            <h3 class="text-xl font-bold">{{ project.name }}</h3>
              <p class="text-md text-gray-700">{{ project.startDate }} - {{ project.endDate }}</p>
            <a :href="project.url" target="_blank" class="text-blue-500 hover:underline">{{ project.url }}</a>
            <p class="mt-2 text-gray-600">{{ project.description }}</p>
          </div>
          <div v-else class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Project Name</label>
            <input type="text" v-model="project.name" placeholder="Project Name"
              class="block w-full rounded-md border-gray-300 shadow-sm p-2">
              <label class="block text-sm font-medium text-gray-700">Project URL</label>
            <input type="text" v-model="project.url" placeholder="Project URL"
              class="block w-full rounded-md border-gray-300 shadow-sm p-2">
              <div class="flex items-center gap-4 mt-1">
                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" v-model="project.startDate" placeholder="Start Date"
                  class="block w-1/2 rounded-md border-gray-300 shadow-sm p-2">
                <label class="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" v-model="project.endDate" placeholder="End Date"
                  class="block w-1/2 rounded-md border-gray-300 shadow-sm p-2">
              </div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea v-model="project.description" placeholder="Description"
              class="block w-full rounded-md border-gray-300 shadow-sm p-2"></textarea>
            <button @click="removeProject(index)"
              class="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full hover:bg-red-700">&times;</button>
          </div>
        </div>
        <button v-if="isEditing" @click="addProject"
            class="mt-4 px-4 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:scale-105">Add Project</button>
      </div>
    </div>

    <!-- Job Preferences -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
        <div class="flex items-center mb-6">
          <svg class="h-8 w-8 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h2 class="text-3xl font-extrabold text-indigo-700 tracking-tight">Job Preferences</h2>
        </div>
        <div>
      <div v-if="!isEditing" class="space-y-4">
          <div>
              <h3 class="text-lg font-semibold">Preferred Industry</h3>
              <p v-if="profile.jobPreferences.preferredIndustry && profile.jobPreferences.preferredIndustry !== 'Not specified'" class="mt-1 text-gray-700">{{ profile.jobPreferences.preferredIndustry }}</p>
              <p v-else class="mt-1 text-gray-500 italic">Not provided</p>
          </div>
          <div>
              <h3 class="text-lg font-semibold">Salary Range</h3>
              <p v-if="profile.jobPreferences.maxSalary > 0" class="mt-1 text-gray-700">${{ profile.jobPreferences.minSalary }} - ${{ profile.jobPreferences.maxSalary }}</p>
              <p v-else class="mt-1 text-gray-500 italic">Not provided</p>
          </div>
          <div>
              <h3 class="text-lg font-semibold">Company's Career Page URLs</h3>
              <ul v-if="profile.jobPreferences.companyCareerPageUrls && profile.jobPreferences.companyCareerPageUrls.length > 0" class="list-disc list-inside mt-2">
                  <li v-for="url in profile.jobPreferences.companyCareerPageUrls" :key="url">
                      <a :href="url" target="_blank" class="text-blue-500 hover:underline">{{ url }}</a>
                  </li>
              </ul>
              <p v-else class="mt-1 text-gray-500 italic">No URLs added</p>
          </div>
      </div>
      <div v-else class="space-y-6">
          <!-- Preferred Industry -->
          <div>
              <label class="block text-sm font-medium text-gray-700">Preferred Industry</label>
              <select v-model="profile.jobPreferences.preferredIndustry" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                  <option v-for="industry in industries" :key="industry" :value="industry">{{ industry }}</option>
              </select>
          </div>
          <!-- Salary Range -->
          <div>
              <label class="block text-sm font-medium text-gray-700">Salary Range</label>
              <div class="flex items-center gap-4 mt-1">
                    <label class="block text-sm font-medium text-gray-700">Min Salary</label>
                  <input type="number" v-model.number="profile.jobPreferences.minSalary" placeholder="Min" class="block w-full rounded-md border-gray-300 shadow-sm p-2">
                  <span>-</span>
                    <label class="block text-sm font-medium text-gray-700">Max Salary</label>
                  <input type="number" v-model.number="profile.jobPreferences.maxSalary" placeholder="Max" class="block w-full rounded-md border-gray-300 shadow-sm p-2">
              </div>
          </div>
          <!-- Company's Career Page URLs -->
          <div>
              <label class="block text-sm font-medium text-gray-700">Company's Career Page URLs</label>
              <p class="text-sm text-gray-500">{{ profile.jobPreferences.companyCareerPageUrls.length }} / 10 URLs added</p>
              <div class="flex items-center gap-2 mt-2 mb-2">
                    <label class="block text-sm font-medium text-gray-700">URL</label>
                  <input type="url" v-model="newCompanyUrl" @keyup.enter="addCompanyUrl" placeholder="https://example.com/careers" class="block w-full rounded-md border-gray-300 shadow-sm p-2">
                    <button @click="addCompanyUrl" :disabled="profile.jobPreferences.companyCareerPageUrls.length >= 10" class="px-4 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:scale-105 disabled:bg-gray-400">Add</button>
              </div>
                <ul v-if="profile.jobPreferences.companyCareerPageUrls.length > 0" class="list-disc list-inside mt-2 space-y-1">
                  <li v-for="(url, index) in profile.jobPreferences.companyCareerPageUrls" :key="index" class="flex items-center">
                      <a :href="url" target="_blank" class="text-blue-500 hover:underline truncate">{{ url }}</a>
                      <button @click="removeCompanyUrl(index)" class="ml-2 text-red-500 hover:text-red-700">&times;</button>
                  </li>
              </ul>
                <p v-else class="mt-1 text-gray-500 italic">No URLs added yet. Add your first one above.</p>
            </div>
          </div>
          </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-16 text-gray-400 text-lg">
    <p>Loading profile...</p>
  </div>
</template>