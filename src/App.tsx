import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ContentProvider } from "./content/ContentProvider";
import { AuthProvider } from "./admin/AuthProvider";
import PublicSite from "./PublicSite";
import AdminRoot from "./admin/AdminRoot";

export default function App() {
  return (
    <BrowserRouter>
      <ContentProvider>
        <Routes>
          {/* L'AuthProvider reste confiné à l'admin : aucun appel de session
              n'est déclenché pour les visiteurs du site. */}
          <Route
            path="/admin"
            element={
              <AuthProvider>
                <AdminRoot />
              </AuthProvider>
            }
          />
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </ContentProvider>
    </BrowserRouter>
  );
}
