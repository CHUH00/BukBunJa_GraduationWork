
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children }) {
  if (user === null) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}