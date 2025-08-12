<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

async function logout() {
  await authStore.logout();
  router.push('/');
}

function goToLogin() {
  router.push('/login');
}
</script>

<template>
  <!-- Header for authenticated users -->
  <header v-if="authStore.user" class="bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg border-b border-amber-400">
    <nav class="container mx-auto px-6 py-3">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <RouterLink to="/" class="text-3xl font-extrabold text-white tracking-tight">MatchPatrol</RouterLink>
        </div>
        <div class="flex space-x-4 items-center">
          <RouterLink to="/profile" class="px-4 py-2 rounded-lg text-base font-semibold text-white hover:bg-white/20 transition-colors duration-150">Profile</RouterLink>
          <RouterLink to="/match" class="px-4 py-2 rounded-lg text-base font-semibold text-white hover:bg-white/20 transition-colors duration-150">Job Matches</RouterLink>
          <div class="border-l border-amber-300 h-6 mx-2"></div>
          <span v-if="authStore.userProfile" class="text-base font-semibold text-amber-100">
            {{ authStore.userProfile.displayId }}
          </span>
          <button @click="logout" class="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200">Logout</button>
        </div>
      </div>
    </nav>
    <div class="h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-70"></div>
  </header>

  <!-- Header for non-authenticated users -->
  <header v-else class="bg-white shadow-sm border-b border-gray-200">
    <nav class="container mx-auto px-6 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <RouterLink to="/" class="text-3xl font-extrabold text-gray-900 tracking-tight">MatchPatrol</RouterLink>
        </div>
        <div class="flex space-x-4 items-center">
          <button @click="goToLogin" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  </header>

  <main class="h-full">
    <RouterView />
  </main>
</template> 