import { Navigate } from "react-router-dom";
import { useRole, isAtLeast } from "../hooks/useRole";

const ProtectedRoute = ({ children, minRole = "Low" }) => {
  const role = useRole();
  if (!role) return <Navigate to="/login" />;
  if (!isAtLeast(role, minRole)) return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;
