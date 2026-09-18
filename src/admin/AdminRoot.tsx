import { useAuth } from "./authContext";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import "./Admin.css";

export default function AdminRoot() {
  const { admin, checking } = useAuth();

  if (checking) return <div className="admin-boot">Ouverture du poste de pilotage…</div>;
  return admin ? <AdminDashboard /> : <AdminLogin />;
}
