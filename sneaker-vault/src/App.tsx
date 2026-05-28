import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import Auth from "./pages/Auth"
import DashboardCliente from "./pages/DashboardCliente"
import DashboardAdmin from "./pages/DashboardAdmin"
import Perfil from "./pages/Perfil" 
import NotFound from "./pages/NotFound"
import { ThemeProvider } from "./components/theme-provider" // <-- Importamos el provider

function App() {
  return (
    // Envolvemos toda la aplicación en el ThemeProvider
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/dashboard" element={<DashboardCliente />} />
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/perfil" element={<Perfil />} /> 
          <Route path="*" element={<NotFound />} /> 
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App