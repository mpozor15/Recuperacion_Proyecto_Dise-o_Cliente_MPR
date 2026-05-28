import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [telefono, setTelefono] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Correo o contraseña incorrectos.")
    } else {
      const { data: perfil } = await supabase.from("profiles").select("rol").eq("id", (await supabase.auth.getUser()).data.user?.id).single()
      if (perfil?.rol === "admin") navigate("/admin")
      else navigate("/dashboard")
    }
    setLoading(false)
  }

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMensaje(null)
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      setLoading(false)
      return
    }
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(`Error: ${signUpError.message}`)
      setLoading(false)
      return
    } 
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([{ id: data.user.id, email: email, telefono: telefono }])
      if (profileError) {
        setError(`Error: ${profileError.message}`)
      } else {
        setMensaje("¡Cuenta creada con éxito! Ya puedes iniciar sesión.")
        setEmail(""); setPassword(""); setConfirmPassword(""); setTelefono("")
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al inicio
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="login" className="w-full max-w-[450px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="registro">Registrarse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido de nuevo</CardTitle>
              <CardDescription>Accede a tu bóveda de sneakers.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input id="email-login" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Contraseña</Label>
                  <Input id="password-login" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registro">
          <Card>
            <CardHeader>
              <CardTitle>Crear una cuenta</CardTitle>
              <CardDescription>Regístrate como cliente para gestionar tu colección.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegistro} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-reg">Email</Label>
                  <Input id="email-reg" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" type="tel" placeholder="600123456" required value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password-reg">Contraseña</Label>
                    <Input id="password-reg" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Repetir Contraseña</Label>
                    <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive font-medium leading-tight">{error}</p>}
                {mensaje && <p className="text-sm text-green-500 font-medium">{mensaje}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear cuenta cliente"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}