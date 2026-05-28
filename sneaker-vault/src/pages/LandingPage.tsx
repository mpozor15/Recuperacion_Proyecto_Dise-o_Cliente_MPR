import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ShieldCheck, LayoutGrid, Search } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      
      <header className="px-6 py-4 flex justify-between items-center border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-extrabold tracking-tighter">
          Sneaker<span className="text-primary">Vault</span>
        </h1>
        
        <div className="flex items-center gap-4">
          <ModeToggle /> 
          <Link to="/login">
            <Button variant="default" className="font-semibold transition-transform hover:scale-105">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 gap-8 overflow-hidden">
        
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            El refugio definitivo para tu <span className="text-primary">colección</span>.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-[700px] mx-auto">
            Gestiona, filtra y organiza tus sneakers favoritas en un solo lugar. 
            Sube fotos, clasifica por tallas y mantén tu bóveda siempre bajo control.
          </p>
        </div>
        
        <Link to="/login" className="mt-4 animate-in fade-in zoom-in-75 duration-700 delay-300">
          <Button size="lg" className="text-lg font-bold px-8 h-14 rounded-full shadow-lg shadow-primary/25 hover:scale-110 hover:shadow-primary/40 transition-all duration-300">
            Empezar gratis
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mt-20 text-left">
          
          <div className="bg-muted/30 p-6 rounded-2xl border animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500 hover:-translate-y-2 transition-transform">
            <LayoutGrid className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Bóveda Visual</h3>
            <p className="text-muted-foreground">Sube fotos reales de tus zapatillas. Crea, edita y borra tus pares con una interfaz limpia y minimalista.</p>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-2xl border animate-in fade-in slide-in-from-bottom-12 duration-700 delay-700 hover:-translate-y-2 transition-transform">
            <Search className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Búsqueda en Tiempo Real</h3>
            <p className="text-muted-foreground">¿Tienes demasiados pares? Encuentra esa zapatilla al instante buscando por marca o modelo con nuestro filtro rápido.</p>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-2xl border animate-in fade-in slide-in-from-bottom-12 duration-700 delay-1000 hover:-translate-y-2 transition-transform">
            <ShieldCheck className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Seguridad y Roles</h3>
            <p className="text-muted-foreground">Tus datos están protegidos. Sistema de roles integrado con panel de administración para moderación de contenido.</p>
          </div>

        </div>
      </main>

      <footer className="border-t py-8 mt-12 bg-muted/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 SneakerVault. Proyecto de recuperación.</p>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Términos</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Contacto</span>
          </div>
        </div>
      </footer>

    </div>
  )
}