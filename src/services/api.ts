import axios from 'axios'

// Bases del backend
// Si VITE_API_URL es relativo (p.ej. '/api'), usaremos el mismo origen con proxy de Vite
export const API_BASE = import.meta.env.VITE_API_URL || '/api'
export const APP_BASE = (() => {
  const base = API_BASE
  if (/^https?:\/\//i.test(base)) {
    return base.replace(/\/api\/?$/, '')
  }
  // relativo: usar raíz del mismo origen (proxy de Vite se hará cargo)
  return ''
})()

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Para enviar cookies y credenciales
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

// Recomendado por Laravel/Sanctum para reconocer solicitudes AJAX
api.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

// Interceptor para agregar el token CSRF automáticamente
api.interceptors.request.use((config) => {
  // Obtener el token CSRF de las cookies
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }

  // rutas que no deben llevar token Bearer
  const noAuthEndpoints = ['/login', '/register']

  if (!noAuthEndpoints.includes(config.url || '')) {
    const bearerToken = localStorage.getItem('token')
    if (bearerToken) config.headers.Authorization = `Bearer ${bearerToken}`
  }

  return config
})

export default api

// Asegura la cookie CSRF de Sanctum antes de mutaciones (POST/PUT/PATCH/DELETE)
export async function ensureCsrf(): Promise<void> {
  // Llama al endpoint de Sanctum que setea XSRF-TOKEN
  // Importante: es fuera de /api y con credenciales
  const url = (APP_BASE ? `${APP_BASE}` : '') + '/sanctum/csrf-cookie'
  await axios.get(url, { withCredentials: true })
}

// Bearer auth helpers
export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }
}

// Interceptor de respuesta: manejar 401/419 limpiando token y redirigiendo a login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 || status === 419) {
      // limpiar token y redirigir a login
      setAuthToken(null)
      const current = window.location.pathname + window.location.search
      const loginUrl = `/login?redirect=${encodeURIComponent(current)}`
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = loginUrl
        return
      }
    }
    return Promise.reject(error)
  }
)
