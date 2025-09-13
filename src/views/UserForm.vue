<template>
    <v-card class="pa-4">
        <v-form @submit.prevent="save">
            <v-text-field
                v-model="usuario.nombre"
                label="Nombre"
                :rules="[rules.required]"
                :disabled="loading"
                required
            />
            <v-text-field
                v-model="usuario.email"
                label="Email"
                :rules="[rules.required, rules.email]"
                :disabled="loading"
                required
            />
            <v-text-field
                v-model="usuario.password"
                label="Contraseña"
                type="password"
                :rules="[rules.required, rules.password]"
                :disabled="loading"
                required
            />
            <v-select
                v-model="usuario.rol"
                label="Rol"
                :items="rolesOptions"
                :rules="[rules.required]"
                :disabled="loading"
                required
            />

            <!-- Mensaje de estado -->
            <v-alert 
                v-if="message" 
                :type="messageType" 
                class="mb-4"
                dismissible
                @click:close="message = ''"
            >
                {{ message }}
            </v-alert>

            <v-btn 
                block 
                color="primary" 
                type="submit"
                :loading="loading"
                :disabled="loading"
            >
                {{ loading ? 'Guardando...' : 'Guardar' }}
            </v-btn>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Reactive data
const usuario = ref({
    nombre: '',
    email: '',
    password: '',
    rol: ''
})

const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// Options for select
const rolesOptions = [
    { title: 'Usuario', value: 'usuario' },
    { title: 'Admin', value: 'admin' }
]

// Validation rules
const rules = {
    required: (value: string) => !!value || 'Este campo es obligatorio',
    email: (value: string) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return pattern.test(value) || 'Email inválido'
    },
    password: (value: string) => {
        if (!value) return 'La contraseña es obligatoria'
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
        return true
    }
}

// Methods
const save = async () => {
    try {
        loading.value = true
        message.value = ''
        
        const response = await fetch('http://127.0.0.1:8000/api/usuarios/addUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: usuario.value.nombre,
                email: usuario.value.email,
                password: usuario.value.password,
                rol: usuario.value.rol
            })
        })

        if (response.ok) {
            const result = await response.json()
            console.log('Usuario guardado exitosamente:', result)
            message.value = 'Usuario registrado exitosamente'
            messageType.value = 'success'
            
            // Limpiar el formulario después del éxito
            usuario.value = {
                nombre: '',
                email: '',
                password: '',
                rol: ''
            }
        } else {
            const error = await response.json()
            console.error('Error al guardar usuario:', error)
            message.value = error.message || 'Error al registrar usuario'
            messageType.value = 'error'
        }
    } catch (error) {
        console.error('Error de conexión:', error)
        message.value = 'Error de conexión. Verifica que el servidor esté funcionando.'
        messageType.value = 'error'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
</style>