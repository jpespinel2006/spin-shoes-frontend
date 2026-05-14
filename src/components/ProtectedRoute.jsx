import { Navigate, Outlet } from "react-router-dom";
import { hasRol } from "../utils/auth";

/**
 * ProtectedRoute — protege rutas según token y, opcionalmente, por rol.
 *
 * Uso básico (solo requiere login):
 *   <Route element={<ProtectedRoute />}>...</Route>
 *
 * Uso con roles (solo admin o superadmin):
 *   <Route element={<ProtectedRoute roles={["admin", "superadmin"]} />}>...</Route>
 */
export default function ProtectedRoute({ roles }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si se especifican roles, verificar que el usuario los tenga
  if (roles && roles.length > 0 && !hasRol(...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
