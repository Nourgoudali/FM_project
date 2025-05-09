"use client"

import { useState } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import { useAuth } from "../../contexts/AuthContext"
import "./ProfilePage.css"

function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { currentUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    role: currentUser?.role || "",
    phone: currentUser?.phone || "",
    department: currentUser?.department || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Dans un environnement réel, envoyer les données à l'API
    console.log("Données du profil mises à jour:", formData)
    setIsEditing(false)
  }

  return (
    <div className="profile-container">
      <Sidebar isOpen={sidebarOpen} />

      <div className="profile-content">
        <Header title="Profil" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="profile-main">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">{currentUser?.name?.charAt(0) || "U"}</div>
              <div className="profile-info">
                <h2 className="profile-name">{currentUser?.name || "Utilisateur"}</h2>
                <p className="profile-role">{currentUser?.role || "Rôle non défini"}</p>
              </div>
              <button className="edit-button" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Annuler" : "Modifier"}
              </button>
            </div>

            {isEditing ? (
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nom complet</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Rôle</label>
                  <input type="text" id="role" name="role" value={formData.role} onChange={handleChange} readOnly />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Téléphone</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Département</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-group">
                  <span className="detail-label">Nom complet</span>
                  <span className="detail-value">{currentUser?.name || "Non défini"}</span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{currentUser?.email || "Non défini"}</span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Rôle</span>
                  <span className="detail-value">{currentUser?.role || "Non défini"}</span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Téléphone</span>
                  <span className="detail-value">{currentUser?.phone || "Non défini"}</span>
                </div>

                <div className="detail-group">
                  <span className="detail-label">Département</span>
                  <span className="detail-value">{currentUser?.department || "Non défini"}</span>
                </div>
              </div>
            )}
          </div>

          <div className="profile-card">
            <h3 className="section-title">Sécurité</h3>
            <div className="security-options">
              <button className="security-button">Changer le mot de passe</button>
              <button className="security-button">Activer l'authentification à deux facteurs</button>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="section-title">Préférences</h3>
            <div className="preferences-options">
              <div className="preference-item">
                <span>Notifications par email</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="preference-item">
                <span>Notifications dans l'application</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="preference-item">
                <span>Mode sombre</span>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProfilePage
