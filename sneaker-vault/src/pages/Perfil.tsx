import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, Mail, Package, ArrowLeft, Pencil, Lock } from "lucide-react"

export default function Perfil() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [datosPerfil, setDatosPerfil] = useState<any>(null)
  const [totalSneakers, setTotalSneakers] = useState(0)
  const [loading, setLoading] = useState(true)

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  const [nuevoTelefono, setNuevoTelefono] = useState("")
  const [nuevaPassword, setNuevaPassword] = useState("")
  const [confirmarPassword, setConfirmarPassword] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    const cargarPerfil = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return navigate("/login")
      setUser(session.user)

      const { data: perfil } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      const { count } = await supabase
        .from("sneakers")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", session.user.id)

      setDatosPerfil({
        email: session.user.email,
        telefono: perfil?.telefono || "No especificado",
      })
      setNuevoTelefono(perfil?.telefono || "")
      setTotalSneakers(count || 0)
      setLoading(false)
    }
    cargarPerfil()
  }, [navigate])

  const handleUpdateTelefono = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setActionError(null)
    setActionMessage(null)

    const { error } = await supabase
      .from("profiles")
      .update({ telefono: nuevoTelefono })
      .eq("id", user.id)

    if (error) {
      setActionError("Error al actualizar el teléfono.")
    } else {
      setDatosPerfil({ ...datosPerfil, telefono: nuevoTelefono })
      setActionMessage("¡Teléfono actualizado correctamente!")
      setTimeout(() => {
        setIsPhoneModalOpen(false)
        setActionMessage(null)
      }, 1500)
    }
    setActionLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setActionError(null)
    setActionMessage(null)

    if (nuevaPassword !== confirmarPassword) {
      setActionError("Las contraseñas no coinciden.")
      setActionLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: nuevaPassword })

    if (error) {
      setActionError(`Error: ${error.message}`)
    } else {
      setActionMessage("¡Contraseña actualizada de forma segura!")
      setTimeout(() => {
        setIsPasswordModalOpen(false)
        setActionMessage(null)
        setNuevaPassword("")
        setConfirmarPassword("")
      }, 1500)
    }
    setActionLoading(false)
  }

  const resetearMensajes = () => {
    setActionError(null)
    setActionMessage(null)
    setNuevaPassword("")
    setConfirmarPassword("")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando tu perfil...</div>
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a mi Bóveda
        </Link>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Mi Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b pb-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Correo Electrónico</p>
                  <p className="font-semibold">{datosPerfil.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b pb-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">Teléfono</p>
                  <p className="font-semibold">{datosPerfil.telefono}</p>
                </div>
                
                <Dialog open={isPhoneModalOpen} onOpenChange={(open) => { setIsPhoneModalOpen(open); resetearMensajes(); }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Actualizar Teléfono</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateTelefono} className="space-y-4 mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Nuevo número de teléfono</Label>
                        <Input 
                          id="telefono" 
                          type="tel" 
                          value={nuevoTelefono} 
                          onChange={(e) => setNuevoTelefono(e.target.value)} 
                          required 
                        />
                      </div>
                      {actionError && <p className="text-sm text-destructive font-medium">{actionError}</p>}
                      {actionMessage && <p className="text-sm text-green-500 font-medium">{actionMessage}</p>}
                      <Button type="submit" className="w-full" disabled={actionLoading}>
                        {actionLoading ? "Guardando..." : "Guardar teléfono"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center gap-3 border-b pb-3">
                <Package className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Zapatillas en la Bóveda</p>
                  <p className="font-semibold text-primary">{totalSneakers} pares registrados</p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center pt-2 pb-6">
            <Dialog open={isPasswordModalOpen} onOpenChange={(open) => { setIsPasswordModalOpen(open); resetearMensajes(); }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Lock className="w-4 h-4 mr-2" /> Cambiar Contraseña
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Actualizar Contraseña</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdatePassword} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={nuevaPassword} 
                      onChange={(e) => setNuevaPassword(e.target.value)} 
                      required 
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Repetir Nueva Contraseña</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmarPassword} 
                      onChange={(e) => setConfirmarPassword(e.target.value)} 
                      required 
                      minLength={6}
                    />
                  </div>
                  {actionError && <p className="text-sm text-destructive font-medium">{actionError}</p>}
                  {actionMessage && <p className="text-sm text-green-500 font-medium">{actionMessage}</p>}
                  <Button type="submit" className="w-full" disabled={actionLoading}>
                    {actionLoading ? "Actualizando..." : "Cambiar contraseña"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}