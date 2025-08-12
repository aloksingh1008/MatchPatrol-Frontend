<script setup>
import { ref, computed } from 'vue';
import allJobs from '@/data/jobs.json';

const jobs = ref(allJobs);
const searchTerm = ref('');
const selectedLocation = ref('');

const locations = computed(() => {
  const allLocations = jobs.value.map(job => job.location);
  return ['All Locations', ...new Set(allLocations)];
});

const filteredJobs = computed(() => {
  return jobs.value.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesLocation = selectedLocation.value === 'All Locations' || 
                            selectedLocation.value === '' || 
                            job.location === selectedLocation.value;
    return matchesSearch && matchesLocation;
  });
});

</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold">Job Board</h1>
      <p class="mt-2 text-gray-600">Explore all available opportunities.</p>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow flex items-center gap-4">
        <input type="text" v-model="searchTerm" placeholder="Search by title or company..." class="flex-grow block w-full rounded-md border-gray-300 shadow-sm p-2">
        <select v-model="selectedLocation" class="block rounded-md border-gray-300 shadow-sm p-2">
            <option v-for="location in locations" :key="location" :value="location">{{ location }}</option>
        </select>
    </div>

    <!-- Job Listings -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="job in filteredJobs" :key="job.id" class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-bold">{{ job.title }}</h3>
            <p class="text-md text-gray-700">{{ job.company }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ job.location }}</p>
            <p class="mt-4 text-gray-600">{{ job.description }}</p>
            <button class="mt-4 w-full px-4 py-2 rounded-md font-semibold text-white bg-blue-500 hover:bg-blue-600">View Details</button>
        </div>
         <div v-if="filteredJobs.length === 0" class="md:col-span-3 text-center text-gray-500">
            <p>No jobs found matching your criteria.</p>
        </div>
    </div>
  </div>
</template> 