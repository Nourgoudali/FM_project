import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./LoginPage.css"
import logoFM from "../../assets/images/logo-fm.png"
import {FaEye, FaEyeSlash} from "react-icons/fa"
import toast from "react-hot-toast"

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userData = await login(email, password)
      toast.success("Connexion réussie")
      
      // Utiliser les données de l'utilisateur directement depuis la réponse
      const firstName = userData?.user?.firstName || userData?.firstName || ''
      const lastName = userData?.user?.lastName || userData?.lastName || ''
      
      if (firstName && lastName) {
        toast.success(`Bienvenue ${firstName} ${lastName}`)
      }
      
      navigate("/dashboard")
    } catch (err) {
      toast.error(err.message || "Échec de la connexion. Veuillez vérifier vos identifiants.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <img src={logoFM || "/placeholder.svg"} alt="FM Logo" className="logo" />
          </div>
        </div>
        <div className="login-content">
          <h1 className="login-title">Bienvenue</h1>
          <p className="login-subtitle">Connectez-vous à votre compte GMAO</p>
 
          {/* Les erreurs sont maintenant affichées avec des toasts */}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="input-with-icon">
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div className="input-with-icon">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-login" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
