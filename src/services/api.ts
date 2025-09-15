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
