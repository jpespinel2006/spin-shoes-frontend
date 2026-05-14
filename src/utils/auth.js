/**
 * Decodifica el payload del JWT guardado en localStorage.
 * No verifica la firma (eso lo hace el backend).
 * Retorna null si no hay token o está malformado.
 */
export function getTokenPayload() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** Devuelve el rol del usuario logueado: 'user' | 'admin' | 'superadmin' | null */
export function getUserRol() {
  return getTokenPayload()?.rol ?? null;
}

/** True si el usuario tiene alguno de los roles indicados */
export function hasRol(...roles) {
  const rol = getUserRol();
  return rol !== null && roles.includes(rol);
}