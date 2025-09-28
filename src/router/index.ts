import { createRouter, createWebHistory } from 'vue-router'
import { getStoredToken } from '@/services/api'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/usuarios' },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },

    { path: '/usuarios', name: 'usuarios', component: () => import('@/views/HomeView.vue'), meta: { requiresAuth: true } },

    { path: '/usuarios/nuevo', name: 'usuarios-nuevo', component: () => import('@/views/UserForm.vue'), meta: { requiresAuth: true } },
    { path: '/usuarios/:id/editar', name: 'usuarios-editar', component: () => import('@/views/UserForm.vue'), props: true, meta: { requiresAuth: true } },

    { path: '/:pathMatch(.*)*', redirect: '/usuarios' },
    { path: '/tareas', name: 'tareas', component: () => import('@/views/TareasView.vue'), meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const token = getStoredToken()
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && token) {
    return { name: 'usuarios' }
  }
  return true
})

export default router
