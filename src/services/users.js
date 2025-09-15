// Servicio para obtener usuarios
export async function fetchUsuarios() {
  const res = await fetch('http://127.0.0.1:8000/api/usuarios/listUsers');
  return await res.json();
}
