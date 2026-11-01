import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {
  const { auth, isCheckingAuth } = useSelector(({ auth }) => auth);

  if (!auth?._id && !isCheckingAuth) {
    return <Navigate to="/authentication/sign-in" replace />;
  }

  return <Outlet />;
}
