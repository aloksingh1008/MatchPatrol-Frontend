import { defineStore } from 'pinia';
import { ref as vueRef } from 'vue';
import { auth, db } from '@/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { ref as dbRef, set, get, update } from 'firebase/database';
import router from '@/router';
import emptyProfile from '@/data/userProfile.json'
import axios from 'axios';

// Environment variables for API endpoints
const EXTERNAL_API_BASE = import.meta.env.VITE_EXTERNAL_API_BASE || 'http://ai1.strategicerpcloud.com:11111';
const BACKEND_API_BASE = import.meta.env.VITE_BACKEND_API_BASE || 'https://match-patrol-frontend.vercel.app';

// Log environment configuration (only in development)
if (import.meta.env.DEV) {
  console.log('Environment Configuration:');
  console.log('EXTERNAL_API_BASE:', EXTERNAL_API_BASE);
  console.log('BACKEND_API_BASE:', BACKEND_API_BASE);
  console.log('NODE_ENV:', import.meta.env.MODE);
}

export const useAuthStore = defineStore('auth', () => {
    const user = vueRef(null);
    const userProfile = vueRef(null);
    const loading = vueRef(false);
    const error = vueRef(null);

    // Helper function to extract domain from URL
    function extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (error) {
            return url; // Return original URL if parsing fails
        }
    }

    // Function to seed user profile to external API
    async function seedUserProfile(profileOverride) {
        const profileToSend = profileOverride || userProfile.value;
        if (!profileToSend) {
            return;
        }

        // Ensure required fields are set
        let userId = profileToSend.displayId || '';
        let industry = profileToSend.jobPreferences?.preferredIndustry || '';
        if (!industry) industry = 'Technology'; // Default fallback for new users
        if (!userId) throw new Error('user_id must be a non-empty string');

        try {
            // Extract domains from company career page URLs
            const domains = (profileToSend.jobPreferences?.companyCareerPageUrls || []).map(url => 
                extractDomain(url)
            );

            // Get the full company URLs as links
            const links = profileToSend.jobPreferences?.companyCareerPageUrls || [];

            const payload = {
                user_id: userId,
                industry: industry,
                domains: domains,  // Array of extracted domains only
                details: profileToSend, // Full user profile
                links: links  // Array of full company URLs
            };

            // Ensure the payload matches exactly what the server expects
            const serverPayload = {
                user_id: String(payload.user_id),
                industry: String(payload.industry),
                domains: Array.isArray(payload.domains) ? payload.domains : [],
                details: typeof payload.details === 'object' ? payload.details : {},
                links: Array.isArray(payload.links) ? payload.links : []
            };

            // Ensure all fields are properly formatted for the server
            if (!payload.user_id || typeof payload.user_id !== 'string') {
                throw new Error('user_id must be a non-empty string');
            }
            
            if (!payload.industry || typeof payload.industry !== 'string') {
                payload.industry = 'Technology'; // Default fallback
            }
            
            if (!Array.isArray(payload.domains)) {
                payload.domains = [];
            }
            
            if (!Array.isArray(payload.links)) {
                payload.links = [];
            }
            
            if (!payload.details || typeof payload.details !== 'object') {
                payload.details = {};
            }

            // Use our local backend
            const backendUrl = `${BACKEND_API_BASE}/api/update-user`;
            
            try {
                const response = await axios.post(backendUrl, serverPayload, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });

                // Fire update-urls API with companyCareerPageUrls
                const companyUrls = profileToSend.jobPreferences?.companyCareerPageUrls || [];
                if (Array.isArray(companyUrls) && companyUrls.length > 0) {
                  try {
                    await axios.post(`${EXTERNAL_API_BASE}/update-urls/`, { link: companyUrls }, {
                      headers: { 'Content-Type': 'application/json' },
                      timeout: 10000
                    });
                  } catch (urlError) {
                    // Handle error silently
                  }
                }
            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    }

    // Function to fetch user profile from Firebase
    async function fetchUserProfileFromDb(userId) {
        try {
            const userProfileRef = dbRef(db, `users/${userId}/profile`);
            const snapshot = await get(userProfileRef);
            
            if (snapshot.exists()) {
                const profileData = snapshot.val();
                userProfile.value = profileData;
                
                // Ensure domains are set, if not set fallback domains
                if (!profileData.domain || profileData.domain.length === 0) {
                    const fallbackDomains = [];
                    
                    // Add domains based on preferred industry
                    const industry = profileData.jobPreferences?.preferredIndustry;
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
                    const skills = profileData.skills || [];
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
                    
                    userProfile.value.domain = fallbackDomains;
                }
                
                return profileData;
            } else {
                userProfile.value = null;
                return null;
            }
        } catch (error) {
            throw error;
        }
    }

    async function checkAndCreateUserProfile(newUser) {
    const userProfileRef = dbRef(db, `users/${newUser.uid}/profile`);
    const snapshot = await get(userProfileRef);
    const updates = {};

    // Case 1: Profile exists
    if (snapshot.exists()) {
        const profile = snapshot.val();
        // If displayId is already there, we're done.
        if (profile.displayId) {
            return;
        }

        // Case 1a: Profile exists but is missing displayId (DATA REPAIR)
        const finalDisplayId = newUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        updates[`/users/${newUser.uid}/profile/displayId`] = finalDisplayId;
        updates[`/usernames/${finalDisplayId}`] = newUser.uid; // Overwrite to claim username
        await update(dbRef(db), updates);
        return;
    }
    
    // Case 2: Profile does not exist (NEW USER)
    // Generate a unique displayId to avoid collisions with other users
    const baseName = newUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    let potentialId = baseName;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) { 
        const usernameRef = dbRef(db, 'usernames/' + potentialId);
        const usernameSnapshot = await get(usernameRef);
        if (!usernameSnapshot.exists()) {
            isUnique = true;
        } else {
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            potentialId = `${baseName}${randomDigits}`;
        }
        attempts++;
    }
    const finalDisplayId = potentialId;

    // Create an empty profile for new users
    const newProfile = {
      personalInfo: {
        name: '',
        email: newUser.email,
        phone: '',
        location: ''
      },
      skills: [],
      experience: [],
      education: [],
      projects: [],
      jobPreferences: {
        preferredIndustry: '',
        minSalary: 0,
        maxSalary: 0,
        companyCareerPageUrls: []
      },
      displayId: finalDisplayId
    };
    
    updates[`/users/${newUser.uid}/profile`] = newProfile;
    updates[`/usernames/${finalDisplayId}`] = newUser.uid;
    
    await update(dbRef(db), updates);

    // Send base profile to external API
    try {
      await seedUserProfile(newProfile);
    } catch (e) {
      console.error('Failed to seed base profile to external API:', e);
    }
}

    // Function to fetch user data from external API
    async function fetchUserFromExternalAPI(displayId) {
        try {
            const backendUrl = `${BACKEND_API_BASE}/api/get-user/${displayId}`;
            const response = await axios.get(backendUrl);
            
            // Update userProfile with domains from external API response
            if (response.data?.message?.domains && Array.isArray(response.data.message.domains)) {
                if (!userProfile.value) {
                    userProfile.value = {};
                }
                userProfile.value.domain = response.data.message.domains;
                console.log('✅ Updated userProfile with domains from external API:', response.data.message.domains);
            }
            
            return response.data;
        } catch (error) {
            // If external API fails, ensure userProfile has fallback domains
            if (userProfile.value && !userProfile.value.domain) {
                const fallbackDomains = [];
                
                // Add domains based on preferred industry
                const industry = userProfile.value.jobPreferences?.preferredIndustry;
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
                const skills = userProfile.value.skills || [];
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
                
                userProfile.value.domain = fallbackDomains;
            }
            
            throw error;
        }
    }

    function init() {
        try {
            onAuthStateChanged(auth, async (currentUser) => {
                try {
                    if (currentUser) {
                        loading.value = true;
                        user.value = currentUser;
                        await checkAndCreateUserProfile(currentUser);
                        await fetchUserProfileFromDb(currentUser.uid);
                        loading.value = false;
                    } else {
                        user.value = null;
                        userProfile.value = null;
                    }
                } catch (error) {
                    loading.value = false;
                }
            });
        } catch (error) {
            // Handle error silently
        }
    }

    async function login(email, password) {
        loading.value = true;
        error.value = null;
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Force navigation after successful login
            router.push('/');
        } catch (e) {
            error.value = e.message;
            throw e; // Re-throw so the component can handle it
        } finally {
            loading.value = false;
        }
    }

    async function googleSignIn() {
        loading.value = true;
        error.value = null;
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // Force navigation after successful Google sign in
            router.push('/');
        } catch (e) {
            error.value = e.message;
            throw e; // Re-throw so the component can handle it
        } finally {
            loading.value = false;
        }
    }

    async function logout() {
        loading.value = true;
        error.value = null;
        try {
            await signOut(auth);
            user.value = null;
        } catch (e) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    }
    
    // For new user registration
    async function register(email, password, displayName = null) {
        loading.value = true;
        error.value = null;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update the user's display name if provided
            if (displayName && userCredential.user) {
                await updateProfile(userCredential.user, {
                    displayName: displayName
                });
            }
            
            // Force navigation to profile after successful registration for new users
            router.push('/profile');
        } catch (e) {
            error.value = e.message;
            throw e; // Re-throw so the component can handle it
        } finally {
            loading.value = false;
        }
    }

    return { user, userProfile, loading, error, init, login, googleSignIn, logout, register, seedUserProfile, fetchUserFromExternalAPI };
}); 