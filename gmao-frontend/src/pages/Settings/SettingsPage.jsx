"use client"

import { useState } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import "./SettingsPage.css"

function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("general")
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "GMAO Équipements Critiques",
    language: "fr",
    timezone: "Europe/Paris",
    dateFormat: "DD/MM/YYYY",
    theme: "light",
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    maintenanceReminders: true,
    criticalAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
  })
  const [userSettings, setUserSettings] = useState({
    name: "Thomas Martin",
    email: "thomas.martin@example.com",
    role: "Administrateur",
    password: "********",
  })
  const [apiSettings, setApiSettings] = useState({
    apiKey: "sk_test_abcdefghijklmnopqrstuvwxyz",
    webhookUrl: "https://example.com/webhook",
    enableApi: true,
  })

  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target
    setGeneralSettings({
      ...generalSettings,
      [name]: value,
    })
  }

  const handleNotificationSettingsChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    })
  }

  const handleUserSettingsChange = (e) => {
    const { name, value } = e.target
    setUserSettings({
      ...userSettings,
      [name]: value,
    })
  }

  const handleApiSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setApiSettings({
      ...apiSettings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Ici, vous implémenteriez la logique pour sauvegarder les paramètres
    alert("Paramètres sauvegardés avec succès!")
  }

  return (
    <div className="settings-container">
      <Sidebar isOpen={sidebarOpen} />

      <div className="settings-content">
        <Header title="Paramètres" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="settings-main">
          <div className="settings-layout">
            <div className="settings-sidebar">
              <nav className="settings-nav">
                <button
                  className={`settings-nav-item ${activeTab === "general" ? "active" : ""}`}
                  onClick={() => setActiveTab("general")}
                >
                  <span className="settings-nav-icon general-icon"></span>
                  <span className="settings-nav-text">Général</span>
                </button>
                <button
                  className={`settings-nav-item ${activeTab === "notifications" ? "active" : ""}`}
                  onClick={() => setActiveTab("notifications")}
                >
                  <span className="settings-nav-icon notifications-icon"></span>
                  <span className="settings-nav-text">Notifications</span>
                </button>
                <button
                  className={`settings-nav-item ${activeTab === "user" ? "active" : ""}`}
                  onClick={() => setActiveTab("user")}
                >
                  <span className="settings-nav-icon user-icon"></span>
                  <span className="settings-nav-text">Profil utilisateur</span>
                </button>
                <button
                  className={`settings-nav-item ${activeTab === "api" ? "active" : ""}`}
                  onClick={() => setActiveTab("api")}
                >
                  <span className="settings-nav-icon api-icon"></span>
                  <span className="settings-nav-text">API & Intégrations</span>
                </button>
              </nav>
            </div>

            <div className="settings-panel">
              <form onSubmit={handleSubmit}>
                {/* Paramètres généraux */}
                {activeTab === "general" && (
                  <div className="settings-section">
                    <h2 className="settings-section-title">Paramètres généraux</h2>
                    <p className="settings-section-description">
                      Configurez les paramètres généraux de l'application GMAO.
                    </p>

                    <div className="form-group">
                      <label htmlFor="companyName" className="form-label">
                        Nom de l'entreprise
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={generalSettings.companyName}
                        onChange={handleGeneralSettingsChange}
                        className="form-control"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="language" className="form-label">
                          Langue
                        </label>
                        <select
                          id="language"
                          name="language"
                          value={generalSettings.language}
                          onChange={handleGeneralSettingsChange}
                          className="form-control"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="timezone" className="form-label">
                          Fuseau horaire
                        </label>
                        <select
                          id="timezone"
                          name="timezone"
                          value={generalSettings.timezone}
                          onChange={handleGeneralSettingsChange}
                          className="form-control"
                        >
                          <option value="Europe/Paris">Europe/Paris</option>
                          <option value="Europe/London">Europe/London</option>
                          <option value="America/New_York">America/New_York</option>
                          <option value="Asia/Tokyo">Asia/Tokyo</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="dateFormat" className="form-label">
                          Format de date
                        </label>
                        <select
                          id="dateFormat"
                          name="dateFormat"
                          value={generalSettings.dateFormat}
                          onChange={handleGeneralSettingsChange}
                          className="form-control"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="theme" className="form-label">
                          Thème
                        </label>
                        <select
                          id="theme"
                          name="theme"
                          value={generalSettings.theme}
                          onChange={handleGeneralSettingsChange}
                          className="form-control"
                        >
                          <option value="light">Clair</option>
                          <option value="dark">Sombre</option>
                          <option value="system">Système</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paramètres de notifications */}
                {activeTab === "notifications" && (
                  <div className="settings-section">
                    <h2 className="settings-section-title">Paramètres de notifications</h2>
                    <p className="settings-section-description">
                      Configurez comment et quand vous souhaitez recevoir des notifications.
                    </p>

                    <div className="form-group checkbox-group">
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          name="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationSettingsChange}
                          className="checkbox-input"
                        />
                        <label htmlFor="emailNotifications" className="checkbox-label">
                          Notifications par email
                        </label>
                      </div>
                      <p className="checkbox-description">
                        Recevez des notifications par email pour les événements importants.
                      </p>
                    </div>

                    <div className="form-group checkbox-group">
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="smsNotifications"
                          name="smsNotifications"
                          checked={notificationSettings.smsNotifications}
                          onChange={handleNotificationSettingsChange}
                          className="checkbox-input"
                        />
                        <label htmlFor="smsNotifications" className="checkbox-label">
                          Notifications par SMS
                        </label>
                      </div>
                      <p className="checkbox-description">
                        Recevez des notifications par SMS pour les événements critiques.
                      </p>
                    </div>

                    <h3 className="settings-subsection-title">Types de notifications</h3>

                    <div className="form-group checkbox-group">
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="maintenanceReminders"
                          name="maintenanceReminders"
                          checked={notificationSettings.maintenanceReminders}
                          onChange={handleNotificationSettingsChange}
                          className="checkbox-input"
                        />
                        <label htmlFor="maintenanceReminders" className="checkbox-label">
                          Rappels de maintenance
                        </label>
                      </div>
                    </div>

                    <div className="form-group checkbox-group">
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="criticalAlerts"
                          name="criticalAlerts"
                          checked={notificationSettings.criticalAlerts}
                          onChange={handleNotificationSettingsChange}
                          className="checkbox-input"
                        />
                        <label htmlFor="criticalAlerts" className="checkbox-label">
                          Alertes critiques
                        </label>
                      </div>
                    </div>

                    <div className="form-group checkbox-group">
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="weeklyReports"
                          name="weeklyReports"
                          checked={notificationSettings.weeklyReports}
                          onChange={handleNotificationSettingsChange}
                          className="checkbox-input"
                        />
                        <label htmlFor="weeklyReports" className="checkbox-label">
                          Rapports hebdomadaires
                        </label>
                      </div>
                    </div>

                    <div className="form-group checkbox-group">
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="monthlyReports"
                          name="monthlyReports"
                          checked={notificationSettings.monthlyReports}
                          onChange={handleNotificationSettingsChange}
                          className="checkbox-input"
                        />
                        <label htmlFor="monthlyReports" className="checkbox-label">
                          Rapports mensuels
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paramètres utilisateur */}
                {activeTab === "user" && (
                  <div className="settings-section">
                    <h2 className="settings-section-title">Profil utilisateur</h2>
                    <p className="settings-section-description">Gérez vos informations personnelles et de connexion.</p>

                    <div className="form-group">
                      <label htmlFor="name" className="form-label">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={userSettings.name}
                        onChange={handleUserSettingsChange}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={userSettings.email}
                        onChange={handleUserSettingsChange}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="role" className="form-label">
                        Rôle
                      </label>
                      <input
                        type="text"
                        id="role"
                        name="role"
                        value={userSettings.role}
                        disabled
                        className="form-control disabled"
                      />
                      <p className="form-help">Le rôle ne peut être modifié que par un administrateur.</p>
                    </div>

                    <h3 className="settings-subsection-title">Sécurité</h3>

                    <div className="form-group">
                      <label htmlFor="currentPassword" className="form-label">
                        Mot de passe actuel
                      </label>
                      <input type="password" id="currentPassword" name="currentPassword" className="form-control" />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="newPassword" className="form-label">
                          Nouveau mot de passe
                        </label>
                        <input type="password" id="newPassword" name="newPassword" className="form-control" />
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirmer le mot de passe
                        </label>
                        <input type="password" id="confirmPassword" name="confirmPassword" className="form-control" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Paramètres API */}
                {activeTab === "api" && (
                  <div className="settings-section">
                    <h2 className="settings-section-title">API & Intégrations</h2>
                    <p className="settings-section-description">
                      Gérez les clés API et les intégrations avec d'autres systèmes.
                    </p>

                    <div className="form-group checkbox-group">
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id="enableApi"
                          name="enableApi"
                          checked={apiSettings.enableApi}
                          onChange={handleApiSettingsChange}
                          className="checkbox-input"
                        />
                        <label htmlFor="enableApi" className="checkbox-label">
                          Activer l'API
                        </label>
                      </div>
                      <p className="checkbox-description">
                        Permet à d'autres systèmes d'accéder à vos données via l'API REST.
                      </p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="apiKey" className="form-label">
                        Clé API
                      </label>
                      <div className="input-with-button">
                        <input
                          type="text"
                          id="apiKey"
                          name="apiKey"
                          value={apiSettings.apiKey}
                          onChange={handleApiSettingsChange}
                          className="form-control"
                          readOnly
                        />
                        <button type="button" className="btn btn-outline">
                          Régénérer
                        </button>
                      </div>
                      <p className="form-help">
                        Cette clé donne accès à votre compte. Ne la partagez pas et régénérez-la si nécessaire.
                      </p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="webhookUrl" className="form-label">
                        URL de Webhook
                      </label>
                      <input
                        type="url"
                        id="webhookUrl"
                        name="webhookUrl"
                        value={apiSettings.webhookUrl}
                        onChange={handleApiSettingsChange}
                        className="form-control"
                        placeholder="https://"
                      />
                      <p className="form-help">Les événements de votre compte GMAO seront envoyés à cette URL.</p>
                    </div>

                    <h3 className="settings-subsection-title">Intégrations disponibles</h3>

                    <div className="integrations-list">
                      <div className="integration-item">
                        <div className="integration-logo erp-logo"></div>
                        <div className="integration-info">
                          <h4 className="integration-name">ERP Connect</h4>
                          <p className="integration-description">
                            Connectez votre GMAO à votre système ERP pour synchroniser les données.
                          </p>
                        </div>
                        <button type="button" className="btn btn-outline">
                          Configurer
                        </button>
                      </div>

                      <div className="integration-item">
                        <div className="integration-logo iot-logo"></div>
                        <div className="integration-info">
                          <h4 className="integration-name">IoT Platform</h4>
                          <p className="integration-description">
                            Intégrez les données de vos capteurs IoT pour la maintenance prédictive.
                          </p>
                        </div>
                        <button type="button" className="btn btn-outline">
                          Configurer
                        </button>
                      </div>

                      <div className="integration-item">
                        <div className="integration-logo calendar-logo"></div>
                        <div className="integration-info">
                          <h4 className="integration-name">Calendar Sync</h4>
                          <p className="integration-description">
                            Synchronisez les interventions avec Google Calendar ou Outlook.
                          </p>
                        </div>
                        <button type="button" className="btn btn-primary">
                          Connecté
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn btn-outline">
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsPage
