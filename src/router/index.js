import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const getCurrentUser = () => {
  return new Promise((resolve) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/match',
      name: 'match',
      component: () => import('../views/JobMatchView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/resume',
      name: 'resume',
      component: () => import('../views/ResumeBuilderView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/jobs',
      name: 'jobs',
      component: () => import('../views/JobBoardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/job/:jobData',
      name: 'job-detail',
      component: () => import('../views/JobDetailView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  try {
    const isLoggedIn = await getCurrentUser();
    
    if (requiresAuth && !isLoggedIn) {
      next('/login');
    } else if (to.path === '/login' && isLoggedIn) {
      next('/');
    } else {
      next();
    }
  } catch (error) {
    console.error('Router guard error:', error);
    if (requiresAuth) {
      next('/login');
    } else {
      next();
    }
  }
});

export default router 