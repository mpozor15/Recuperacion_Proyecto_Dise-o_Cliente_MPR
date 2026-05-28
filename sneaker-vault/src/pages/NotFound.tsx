import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
      <div className="space-y-6 max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        <div className="bg-destructive/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        
        <h1 className="text-6xl font-extrabold tracking-tight text-primary">404</h1>
        <h2 className="text-2xl font-bold tracking-tight">¡Ups! Te has salido de la bóveda.</h2>
        
        <p className="text-muted-foreground">
          La página que estás buscando no existe, ha sido movida o te has equivocado al escribir la dirección.
        </p>

        <div className="pt-6">
          <Link to="/">
            <Button size="lg" className="rounded-full shadow-lg hover:scale-105 transition-transform">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a un lugar seguro
            </Button>
          </Link>
        </div>
        
      </div>
    </div>
  )
}