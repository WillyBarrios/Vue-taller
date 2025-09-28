<template>
  <v-data-table
    :items="filtered"
    :headers="headers"
    :loading="loading"
    class="elevation-1"
  >
    <template #top>
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="ma-2"
        density="comfortable"
      >{{ errorMessage }}</v-alert>
    </template>
    <template #item.created_at="{ item }">
      {{ formatDate(item.created_at) }}
    </template>
    
    <template #no-data>
      <div class="pa-6 text-center">No hay usuarios para mostrar.</div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

type Usuario = { id:number; nombre:string; email:string; rol:'admin'|'usuario'; created_at:string }

const props = defineProps<{ searchTerm?: string }>()

const items = ref<Usuario[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const headers = [
  { title: 'Nombre', value: 'nombre' },
  { title: 'Email',  value: 'email' },
  { title: 'Rol',    value: 'rol' },
  { title: 'Fecha de Creación', value: 'created_at' },
]

// carga desde la API
const fetchUsers = async () => {
  loading.value = true
  try {
    errorMessage.value = null
    const { data } = await api.get('/usuarios/listUsers')
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.usuarios)
        ? (data as any).usuarios
        : Array.isArray((data as any)?.data)
          ? (data as any).data
          : []
    items.value = list.map((u: any) => ({
      id: Number(u.id ?? u.usuario_id ?? u.id_usuario ?? u.ID ?? u.Id ?? 0),
      nombre: String(u.nombre ?? u.name ?? `${(u.first_name ?? '').trim()} ${(u.last_name ?? '').trim()}`.trim()),
      email: String(u.email ?? u.correo ?? ''),
      rol: String(u.rol ?? u.role ?? 'usuario') as 'admin' | 'usuario',
      created_at: String(u.created_at ?? u.fecha_creacion ?? ''),
    }))
  } catch (err: any) {
    console.error('fetchUsers error:', err?.response || err)
    const status = err?.response?.status
    const msg = err?.response?.data?.message || err?.message || 'Error cargando usuarios'
    errorMessage.value = `No se pudieron cargar usuarios${status ? ' (' + status + ')' : ''}: ${msg}`
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)

// Función para formatear fecha
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return dateString // Si hay error, mostrar el string original
  }
}

const filtered = computed(() => {
  const q = (props.searchTerm || '').toLowerCase().trim()
  if (!q) return items.value
  return items.value.filter(u =>
    u.nombre.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)  ||
    u.rol.toLowerCase().includes(q)     ||
    u.created_at.toLowerCase().includes(q)
  )
})


/*
import { watch } from 'vue'
watch(() => props.searchTerm, () => { fetchUsers() })
*/
</script>
