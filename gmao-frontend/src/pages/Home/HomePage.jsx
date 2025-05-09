import { Link } from "react-router-dom"
import "./HomePage.css"
import logoFM from "../../assets/images/logo-fm.jpg"

function HomePage() {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="container header-container">
          <div className="header-logo">
            <img src={logoFM || "/placeholder.svg"} alt="FM Logo" className="logo-image" />
            <span className="logo-text">GMAO Équipements Critiques</span>
          </div>
          <Link to="/login" className="btn btn-login">
            Se connecter
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <h1 className="hero-title">Gestion intelligente de vos équipements critiques</h1>
          <p className="hero-subtitle">
            Optimisez vos opérations de maintenance grâce à notre solution GMAO : suivi en temps réel, maintenance
            prédictive et analyses avancées.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-start">
              Démarrer maintenant
            </Link>
            <Link to="/dashboard" className="btn btn-outline btn-demo">
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Fonctionnalités principales</h2>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card feature-primary">
              <div className="feature-icon">
                <span className="icon-realtime"></span>
              </div>
              <h3 className="feature-title">Supervision en temps réel</h3>
              <p className="feature-description">
                Suivez l'état de vos équipements en temps réel, recevez des alertes instantanées et accédez aux données
                essentielles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon-predictive"></span>
              </div>
              <h3 className="feature-title">Maintenance prédictive</h3>
              <p className="feature-description">
                Anticipez les pannes grâce à l'intelligence artificielle. Optimisez vos interventions et réduisez les
                coûts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon-analytics"></span>
              </div>
              <h3 className="feature-title">Analyses avancées</h3>
              <p className="feature-description">
                Générez des rapports détaillés, suivez vos KPIs, prenez des décisions basées sur les données.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title">Pourquoi choisir notre solution ?</h2>

          <div className="benefits-list">
            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <div className="benefit-content">
                <h3 className="benefit-title">Interface intuitive</h3>
                <p className="benefit-description">Une prise en main rapide pour tous vos collaborateurs.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <div className="benefit-content">
                <h3 className="benefit-title">Support réactif</h3>
                <p className="benefit-description">Une équipe disponible 24/7 pour répondre à vos questions.</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-check">✓</div>
              <div className="benefit-content">
                <h3 className="benefit-title">Déploiement rapide</h3>
                <p className="benefit-description">Mise en place en moins de 48 heures.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src={logoFM || "/placeholder.svg"} alt="FM Logo" className="footer-logo" />
              <p className="footer-description">
                Gestion de Maintenance Assistée par Ordinateur pour équipements critiques
              </p>
            </div>

            <div className="footer-links">
              <h3 className="footer-title">Contact</h3>
              <ul className="footer-list">
                <li>+33 1 23 45 67 89</li>
                <li>contact@gmao-fm.com</li>
                <li>
                  123 Avenue de la Maintenance
                  <br />
                  75001 Paris, France
                </li>
              </ul>
            </div>

            <div className="footer-links">
              <h3 className="footer-title">Ressources</h3>
              <ul className="footer-list">
                <li>
                  <button>Documentation</button>
                </li>
                <li>
                  <button>Blog</button>
                </li>
                <li>
                  <button>Support</button>
                </li>
              </ul>
            </div>

            <div className="footer-links">
              <h3 className="footer-title">Légal</h3>
              <ul className="footer-list">
                <li>
                  <button>Mentions légales</button>
                </li>
                <li>
                  <button>Politique de confidentialité</button>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright"> 2024 GMAO Équipements Critiques. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
