<template>
  <v-app>
    <v-app-bar v-if="!isLogin" color="primary" dark>
      <v-app-bar-title>
        Taller Laravel + Vue
        <v-chip size="small" class="ml-3" color="secondary" variant="tonal">{{ host }}</v-chip>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn variant="text" :to="'/usuarios'" prepend-icon="mdi-account-group">Usuarios</v-btn>
      <v-btn variant="text" :to="'/usuarios/nuevo'" prepend-icon="mdi-account-plus">Nuevo Usuario</v-btn>
      <v-btn variant="text" :to="'/tareas'" prepend-icon="mdi-clipboard-text">Tareas</v-btn>
      <v-divider vertical class="mx-2" />
      <v-chip v-if="currentUser" size="small" color="white" text-color="primary" variant="outlined" class="mr-2">
        {{ currentUser.nombre || currentUser.name || currentUser.email }}
      </v-chip>
      <v-btn variant="text" color="error" prepend-icon="mdi-logout" @click="logout">Salir</v-btn>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setAuthToken, getStoredToken } from '@/services/api'

const route = useRoute()
const router = useRouter()
const host = window.location.host

function userKey(h = host) { return `user:${h}` }

const currentUser = ref<any | null>(null)

function loadUser() {
  try {
    const raw = localStorage.getItem(userKey())
    currentUser.value = raw ? JSON.parse(raw) : null
  } catch { currentUser.value = null }
}

loadUser()

// Mantener sincronizado si cambia el almacenamiento externamente
window.addEventListener('storage', (e) => {
  if (e.key === userKey()) loadUser()
})

const isLogin = computed(() => route.name === 'login')

function logout() {
  setAuthToken(null, host)
  try { localStorage.removeItem(userKey()) } catch {}
  router.push({ name: 'login' })
}


</script>

<style scoped>
.ml-3 { margin-left: 0.75rem; }
.mr-2 { margin-right: 0.5rem; }
</style>