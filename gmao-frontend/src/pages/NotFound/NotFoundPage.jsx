"use client"

import { Link } from "react-router-dom"
import "./NotFoundPage.css"

function NotFoundPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page non trouvée</h2>
        <p className="not-found-message">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <div className="not-found-actions">
          <Link to="/" className="home-button">
            Retour à l'accueil
          </Link>
          <Link to="/dashboard" className="dashboard-button">
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
