<script setup>
import { ref, computed } from 'vue';
import userProfile from '@/data/userProfile.json';
import jsPDF from 'jspdf';

const profile = ref(userProfile);

const includedSections = ref({
  experience: true,
  education: true,
  skills: true,
  projects: true,
});

const aiSuggestions = [
    "For developer roles, always include your 'Skills' and 'Projects' sections.",
    "If applying to a specific industry, tailor your project descriptions to match the industry's needs.",
    "Consider removing jobs older than 10 years unless they are highly relevant.",
    "Always lead with your most recent and relevant experience."
];

function generatePdf() {
  const doc = new jsPDF();
  let yPos = 20;

  // Name and Contact Info
  doc.setFontSize(22).text(profile.value.personalInfo.name, 20, yPos);
  yPos += 10;
  doc.setFontSize(12).text(`${profile.value.personalInfo.email} | ${profile.value.personalInfo.phone} | ${profile.value.personalInfo.location}`, 20, yPos);
  yPos += 15;

  // Skills
  if (includedSections.value.skills) {
    doc.setFontSize(16).text('Skills', 20, yPos);
    yPos += 8;
    doc.setFontSize(10).text(profile.value.skills.join(', '), 20, yPos, { maxWidth: 170 });
    yPos += 15;
  }
  
  // Experience
  if (includedSections.value.experience) {
    doc.setFontSize(16).text('Experience', 20, yPos);
    yPos += 8;
    profile.value.experience.forEach(job => {
        doc.setFontSize(12).setFont(undefined, 'bold').text(job.title, 20, yPos);
        yPos += 6;
        doc.setFontSize(10).setFont(undefined, 'normal').text(`${job.company} | ${job.period}`, 20, yPos);
        yPos += 6;
        doc.setFontSize(10).text(job.description, 20, yPos, { maxWidth: 170 });
        yPos += 10;
    });
    yPos += 5;
  }

  // Education
  if (includedSections.value.education) {
    doc.setFontSize(16).text('Education', 20, yPos);
    yPos += 8;
    profile.value.education.forEach(edu => {
        doc.setFontSize(12).setFont(undefined, 'bold').text(edu.degree, 20, yPos);
        yPos += 6;
        doc.setFontSize(10).setFont(undefined, 'normal').text(`${edu.institution} | ${edu.period}`, 20, yPos);
        yPos += 10;
    });
    yPos += 5;
  }

  // Projects
  if (includedSections.value.projects) {
    doc.setFontSize(16).text('Projects', 20, yPos);
    yPos += 8;
    profile.value.projects.forEach(proj => {
        doc.setFontSize(12).setFont(undefined, 'bold').text(proj.name, 20, yPos);
        yPos += 6;
        doc.setFontSize(10).setFont(undefined, 'normal').text(proj.description, 20, yPos, { maxWidth: 170 });
        yPos += 6;
        doc.setTextColor(0, 0, 255).textWithLink(proj.url, 20, yPos, { url: proj.url });
        doc.setTextColor(0, 0, 0);
        yPos += 10;
    });
  }

  doc.save(`${profile.value.personalInfo.name}_Resume.pdf`);
}

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <!-- Left Panel: Options -->
    <div class="md:col-span-1 space-y-8">
      <div>
        <h1 class="text-3xl font-bold">Resume Builder</h1>
        <p class="mt-2 text-gray-600">Select the sections to include in your resume.</p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-4">Include Sections</h2>
        <div class="space-y-2">
            <label v-for="(value, key) in includedSections" :key="key" class="flex items-center">
                <input type="checkbox" v-model="includedSections[key]" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                <span class="ml-2 text-gray-700 capitalize">{{ key }}</span>
            </label>
        </div>
      </div>
      
      <div class="bg-indigo-50 p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-4 text-indigo-800">AI Suggestions</h2>
        <ul class="list-disc list-inside space-y-2 text-indigo-700">
            <li v-for="(suggestion, index) in aiSuggestions" :key="index">{{ suggestion }}</li>
        </ul>
      </div>

      <button @click="generatePdf" class="w-full px-6 py-3 rounded-md font-semibold text-white bg-green-500 hover:bg-green-600">Download PDF</button>

    </div>

    <!-- Right Panel: Preview -->
    <div class="md:col-span-2 bg-white p-8 rounded-lg shadow">
      <h2 class="text-2xl font-bold text-center">{{ profile.personalInfo?.name || 'Your Name' }}</h2>
      <p class="text-center text-sm text-gray-600 mb-8">{{ profile.personalInfo?.email || 'email@example.com' }} | {{ profile.personalInfo?.phone || 'Phone' }} | {{ profile.personalInfo?.location || 'Location' }}</p>

      <!-- Skills -->
      <div v-if="includedSections.skills">
        <h3 class="text-xl font-bold border-b-2 pb-1 mb-2">Skills</h3>
        <p class="text-gray-700">{{ Array.isArray(profile.skills) ? profile.skills.join(', ') : 'No skills listed' }}</p>
      </div>

      <!-- Experience -->
      <div v-if="includedSections.experience" class="mt-6">
        <h3 class="text-xl font-bold border-b-2 pb-1 mb-2">Experience</h3>
        <div v-for="(job, index) in profile.experience" :key="index" class="mb-4">
          <h4 class="text-lg font-semibold">{{ job.title }}</h4>
          <p class="text-sm text-gray-600">{{ job.company }} | {{ job.period }}</p>
          <p class="mt-1 text-gray-700">{{ job.description }}</p>
        </div>
      </div>

      <!-- Education -->
      <div v-if="includedSections.education" class="mt-6">
        <h3 class="text-xl font-bold border-b-2 pb-1 mb-2">Education</h3>
        <div v-for="(edu, index) in profile.education" :key="index" class="mb-4">
          <h4 class="text-lg font-semibold">{{ edu.degree }}</h4>
          <p class="text-sm text-gray-600">{{ edu.institution }} | {{ edu.period }}</p>
        </div>
      </div>

      <!-- Projects -->
      <div v-if="includedSections.projects" class="mt-6">
        <h3 class="text-xl font-bold border-b-2 pb-1 mb-2">Projects</h3>
        <div v-for="(proj, index) in profile.projects" :key="index" class="mb-4">
          <h4 class="text-lg font-semibold">{{ proj.name }}</h4>
          <a :href="proj.url" class="text-sm text-blue-500">{{ proj.url }}</a>
          <p class="mt-1 text-gray-700">{{ proj.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template> 