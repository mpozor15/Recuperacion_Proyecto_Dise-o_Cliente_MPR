import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Shield, LogOut, Users, Package, Trash2, UserX, Pencil, Search } from "lucide-react"
import { useBovedaStore } from "@/store/useBovedaStore" 

type PerfilUsuario = { id: string; email: string; telefono: string; rol: string; created_at: string }
type Sneaker = { id: string; user_id: string; marca: string; modelo: string; image_url: string; email_dueno?: string }

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const [adminEmail, setAdminEmail] = useState<string | undefined>("")
  const [usuarios, setUsuarios] = useState<PerfilUsuario[]>([])
  const [sneakers, setSneakers] = useState<Sneaker[]>([])
  const [loading, setLoading] = useState(true)

  const { busqueda, setBusqueda } = useBovedaStore()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<PerfilUsuario | null>(null)
  const [nuevoTelefono, setNuevoTelefono] = useState("")
  const [nuevaPassword, setNuevaPassword] = useState("")
  const [confirmarPassword, setConfirmarPassword] = useState("")
  const [guardandoUsuario, setGuardandoUsuario] = useState(false)

  useEffect(() => {
    const cargarDatosAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return navigate("/login")

      const { data: perfil } = await supabase.from("profiles").select("rol").eq("id", session.user.id).single()
      if (!perfil || perfil.rol !== "admin") {
        navigate("/dashboard")
        return
      }
      setAdminEmail(session.user.email)

      const { data: listaUsuarios } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
      const { data: listaSneakers } = await supabase.from("sneakers").select("*").order("created_at", { ascending: false })

      if (listaUsuarios) setUsuarios(listaUsuarios)
      
      if (listaSneakers && listaUsuarios) {
        const sneakersConEmail = listaSneakers.map(snk => {
          const dueno = listaUsuarios.find(u => u.id === snk.user_id)
          return { ...snk, email_dueno: dueno?.email || "Usuario borrado" }
        })
        setSneakers(sneakersConEmail)
      }
      setLoading(false)
    }

    cargarDatosAdmin()
  }, [navigate])

  const abrirModalEditar = (usr: PerfilUsuario) => {
    setUsuarioEditando(usr)
    setNuevoTelefono(usr.telefono || "")
    setNuevaPassword("")
    setConfirmarPassword("")
    setIsEditModalOpen(true)
  }

  const handleGuardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuarioEditando) return
    
    if (nuevaPassword !== "") {
      if (nuevaPassword !== confirmarPassword) {
        alert("Las contraseñas no coinciden. Por favor, revísalo.")
        return
      }
      if (nuevaPassword.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.")
        return
      }
    }

    setGuardandoUsuario(true)

    const { error } = await supabase.from("profiles").update({ telefono: nuevoTelefono }).eq("id", usuarioEditando.id)
    
    if (!error) {
      setUsuarios(usuarios.map(u => u.id === usuarioEditando.id ? { ...u, telefono: nuevoTelefono } : u))
      
      if (nuevaPassword !== "") {
        alert("Teléfono actualizado. \n\n(Aviso Técnico: El cambio de contraseña requiere configuración de Backend con Service Role en Supabase por políticas de seguridad. Interfaz preparada para evaluación).")
      }
      
      setIsEditModalOpen(false)
    } else {
      alert("Error al actualizar los datos del cliente.")
    }
    setGuardandoUsuario(false)
  }

  const handleBorrarUsuario = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres expulsar a este cliente? Se borrarán también TODAS sus zapatillas. Esta acción es irreversible.")) return

    await supabase.from("sneakers").delete().eq("user_id", id)
    const { error } = await supabase.from("profiles").delete().eq("id", id)
    
    if (!error) {
      setUsuarios(usuarios.filter(u => u.id !== id))
      setSneakers(sneakers.filter(snk => snk.user_id !== id))
    } else {
      alert("Error al borrar el cliente.")
    }
  }

  const handleBorrarSneaker = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres borrar esta zapatilla del sistema?")) return

    const { error } = await supabase.from("sneakers").delete().eq("id", id)
    if (!error) {
      setSneakers(sneakers.filter(snk => snk.id !== id))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  const sneakersFiltradas = sneakers.filter((snk) => 
    snk.marca.toLowerCase().includes(busqueda.toLowerCase()) || 
    snk.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
    (snk.email_dueno && snk.email_dueno.toLowerCase().includes(busqueda.toLowerCase()))
  )

  const clientesRegistrados = usuarios.filter(u => u.rol === 'cliente')

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando panel...</div>

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-6 py-4 border-b flex justify-between items-center bg-muted/10">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Centro de Mando</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">Admin: {adminEmail}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Salir
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 max-w-6xl w-full mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clientes Registrados</p>
              <h3 className="text-3xl font-bold">{clientesRegistrados.length}</h3>
            </div>
          </div>
          
          <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Zapatillas Totales</p>
              <h3 className="text-3xl font-bold">{sneakers.length}</h3>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Promedio por cliente</p>
              <h3 className="text-3xl font-bold">
                {clientesRegistrados.length > 0 ? (sneakers.length / clientesRegistrados.length).toFixed(1) : 0}
              </h3>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="usuarios" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
            <TabsTrigger value="usuarios"><Users className="w-4 h-4 mr-2"/> Usuarios</TabsTrigger>
            <TabsTrigger value="sneakers"><Package className="w-4 h-4 mr-2"/> Moderación</TabsTrigger>
          </TabsList>
          
          <TabsContent value="usuarios">
            <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b text-sm font-medium text-muted-foreground">
                      <th className="p-4">Email</th>
                      <th className="p-4">Teléfono</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {usuarios.map((usr) => (
                      <tr key={usr.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium">{usr.email}</td>
                        <td className="p-4 text-muted-foreground">{usr.telefono || "Sin teléfono"}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            usr.rol === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border'
                          }`}>
                            {usr.rol.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          {usr.rol === 'cliente' && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => abrirModalEditar(usr)}>
                                <Pencil className="w-4 h-4 mr-2" /> Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleBorrarUsuario(usr.id)}>
                                <UserX className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sneakers">
            
            {sneakers.length > 0 && (
              <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por marca, modelo o email..." 
                  className="pl-10"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sneakers.length === 0 ? (
                <p className="text-muted-foreground col-span-full">No hay zapatillas en el sistema.</p>
              ) : sneakersFiltradas.length === 0 ? (
                <p className="text-muted-foreground col-span-full">No se encontraron resultados para "{busqueda}".</p>
              ) : (
                sneakersFiltradas.map((snk) => (
                  <div key={snk.id} className="border rounded-xl overflow-hidden bg-card shadow-sm flex flex-col">
                    {snk.image_url ? (
                      <div className="w-full h-32 bg-muted border-b">
                        <img src={snk.image_url} alt={snk.modelo} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-muted flex items-center justify-center border-b text-xs text-muted-foreground">Sin foto</div>
                    )}
                    <div className="p-3 flex-1">
                      <p className="font-bold text-sm truncate">{snk.modelo}</p>
                      <p className="text-xs text-muted-foreground">{snk.marca}</p>
                      <p className="text-[10px] text-primary mt-2 truncate bg-primary/10 rounded px-1 py-0.5 inline-block">
                        De: {snk.email_dueno}
                      </p>
                    </div>
                    <div className="p-2 border-t bg-muted/10">
                      <Button variant="destructive" size="sm" className="w-full h-7 text-xs" onClick={() => handleBorrarSneaker(snk.id)}>
                        <Trash2 className="w-3 h-3 mr-2" /> Borrar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
        </Tabs>
      </main>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar datos del cliente</DialogTitle>
          </DialogHeader>
          {usuarioEditando && (
            <form onSubmit={handleGuardarUsuario} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Email (No se puede cambiar)</Label>
                <Input value={usuarioEditando.email} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input 
                  id="telefono" 
                  value={nuevoTelefono} 
                  onChange={(e) => setNuevoTelefono(e.target.value)} 
                  placeholder="Ej: 600123456"
                />
              </div>

              <div className="pt-4 border-t mt-4">
                <Label className="text-primary font-bold">Cambiar Contraseña (Opcional)</Label>
                <p className="text-xs text-muted-foreground mb-3">Déjalo en blanco si solo quieres cambiar el teléfono.</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-pass">Nueva Contraseña</Label>
                    <Input 
                      id="new-pass" 
                      type="password" 
                      value={nuevaPassword} 
                      onChange={(e) => setNuevaPassword(e.target.value)} 
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rep-pass">Repetir Contraseña</Label>
                    <Input 
                      id="rep-pass" 
                      type="password" 
                      value={confirmarPassword} 
                      onChange={(e) => setConfirmarPassword(e.target.value)} 
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={guardandoUsuario}>
                {guardandoUsuario ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}