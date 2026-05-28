import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Pencil, Plus, Search, Upload, Link as LinkIcon } from "lucide-react"
import { useBovedaStore } from "@/store/useBovedaStore"

type Sneaker = {
  id: string
  marca: string
  modelo: string
  talla: string
  estado: string
  image_url: string | null 
}

export default function DashboardCliente() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [sneakers, setSneakers] = useState<Sneaker[]>([])
  const { busqueda, setBusqueda } = useBovedaStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sneakerEditando, setSneakerEditando] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false) 

  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [talla, setTalla] = useState("")
  const [estado, setEstado] = useState("")
  
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null) 
  const [imagenUrl, setImagenUrl] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return navigate("/login")
      
      setUser(session.user)
      
      const { data } = await supabase
        .from("sneakers")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (data) setSneakers(data)
    }
    fetchData()
  }, [navigate])

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setGuardando(true)

    try {
      let urlImagenFinal = null;

      if (imagenArchivo) {
        const nombreArchivo = `${user.id}/${Date.now()}_${imagenArchivo.name}`
        
        const { error: errorSubida } = await supabase.storage
          .from("sneakers")
          .upload(nombreArchivo, imagenArchivo)

        if (errorSubida) throw errorSubida

        const { data: { publicUrl } } = supabase.storage
          .from("sneakers")
          .getPublicUrl(nombreArchivo)
          
        urlImagenFinal = publicUrl;
      } 
      else if (imagenUrl.trim() !== "") {
        urlImagenFinal = imagenUrl.trim();
      }

      if (sneakerEditando) {
        const zapatillaActual = sneakers.find(s => s.id === sneakerEditando)
        const urlDefinitiva = urlImagenFinal ? urlImagenFinal : zapatillaActual?.image_url

        const { data, error } = await supabase
          .from("sneakers")
          .update({ marca, modelo, talla, estado, image_url: urlDefinitiva })
          .eq("id", sneakerEditando)
          .select()

        if (error) throw error
        if (data) {
          setSneakers(sneakers.map(snk => snk.id === sneakerEditando ? data[0] : snk))
        }
      } else {
        const { data, error } = await supabase
          .from("sneakers")
          .insert([{ user_id: user.id, marca, modelo, talla, estado, image_url: urlImagenFinal }])
          .select()

        if (error) throw error
        if (data) {
          setSneakers([data[0], ...sneakers])
        }
      }
      cerrarModal()
    } catch (error: any) {
      alert(`ERROR TÉCNICO: ${error.message || JSON.stringify(error)}`)
      console.error(error)
    } finally {
      setGuardando(false)
    }
  }

  const handleBorrar = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres borrar esta sneaker?")) return
    const { error } = await supabase.from("sneakers").delete().eq("id", id)
    if (!error) {
      setSneakers(sneakers.filter(snk => snk.id !== id))
    }
  }

  const abrirParaCrear = () => {
    setSneakerEditando(null)
    setMarca(""); setModelo(""); setTalla(""); setEstado(""); setImagenArchivo(null); setImagenUrl("");
    setIsModalOpen(true)
  }

  const abrirParaEditar = (snk: Sneaker) => {
    setSneakerEditando(snk.id)
    setMarca(snk.marca); setModelo(snk.modelo); setTalla(snk.talla); setEstado(snk.estado); 
    setImagenArchivo(null); setImagenUrl("");
    setIsModalOpen(true)
  }

  const cerrarModal = () => setIsModalOpen(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  const sneakersFiltradas = sneakers.filter((snk) => 
    snk.marca.toLowerCase().includes(busqueda.toLowerCase()) || 
    snk.modelo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mi Bóveda</h1>
          <p className="text-muted-foreground mt-1">Conectado como: {user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/perfil")}>
            Mi Perfil
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Tus Sneakers</h2>
          
          <Button size="lg" className="font-bold shrink-0" onClick={abrirParaCrear}>
            <Plus className="mr-2 h-5 w-5" /> Añadir Sneaker
          </Button>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{sneakerEditando ? "Editar zapatilla" : "Registrar nueva zapatilla"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleGuardar} className="space-y-4 mt-4">
                
                <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-dashed">
                  <div className="space-y-2">
                    <Label htmlFor="imagen" className="flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" /> Subir archivo físico
                    </Label>
                    <Input 
                      id="imagen" 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        setImagenArchivo(e.target.files?.[0] || null)
                        setImagenUrl("") 
                      }} 
                    />
                  </div>
                  
                  <div className="relative flex items-center gap-2 py-1">
                    <div className="flex-1 border-t border-border"></div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">O</span>
                    <div className="flex-1 border-t border-border"></div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imagenUrl" className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" /> Pegar enlace de internet
                    </Label>
                    <Input 
                      id="imagenUrl" 
                      type="url" 
                      placeholder="https://ejemplo.com/foto.jpg"
                      value={imagenUrl}
                      onChange={(e) => {
                        setImagenUrl(e.target.value)
                        setImagenArchivo(null) 
                      }} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" required value={marca} onChange={(e) => setMarca(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" required value={modelo} onChange={(e) => setModelo(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="talla">Talla (EU)</Label>
                    <Input id="talla" required value={talla} onChange={(e) => setTalla(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input id="estado" required value={estado} onChange={(e) => setEstado(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={guardando}>
                  {guardando ? "Guardando..." : (sneakerEditando ? "Guardar cambios" : "Guardar en la bóveda")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {sneakers.length > 0 && (
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por marca o modelo..." 
              className="pl-10"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        )}
        
        {sneakers.length === 0 ? (
          <div className="h-64 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground bg-muted/20">
            Aún no tienes sneakers registradas. ¡Añade tu primer par con foto!
          </div>
        ) : sneakersFiltradas.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            No se han encontrado resultados para "{busqueda}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sneakersFiltradas.map((snk) => (
              <Card key={snk.id} className="flex flex-col overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                {snk.image_url && (
                  <div className="w-full h-48 bg-muted border-b overflow-hidden">
                    <img 
                      src={snk.image_url} 
                      alt={snk.modelo} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className="pb-2 flex-1 pt-4">
                  <CardTitle className="text-lg">{snk.modelo}</CardTitle>
                  <p className="text-sm font-medium text-primary">{snk.marca}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground mt-2 border-t pt-4">
                    <span>Talla: <strong className="text-foreground">{snk.talla}</strong></span>
                    <span>Estado: <strong className="text-foreground">{snk.estado}</strong></span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 border-t pt-4 bg-muted/10">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => abrirParaEditar(snk)}>
                    <Pencil className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBorrar(snk.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}