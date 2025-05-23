import { Link } from "react-router-dom"
import "./HomePage.css"
import logoFM from "../../assets/images/logo-fm.png"

function HomePage() {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="hp-header-container">
          <div className="hp-header-logo">
            <img src={logoFM || "/placeholder.svg"} alt="FM Logo" className="hp-logo-image" />
            <span className="hp-logo-text">GMAO Équipements Critiques</span>
          </div>
          <Link to="/login" className="hp-btn-login">
            Se connecter
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hp-hero-section">
        <div className="hp-hero-container">
          <h1 className="hp-hero-title">Gestion intelligente de vos équipements critiques</h1>
          <p className="hp-hero-subtitle">
            Optimisez vos opérations de maintenance grâce à notre solution GMAO : suivi en temps réel, maintenance
            prédictive et analyses avancées.
          </p>
          <div className="hp-hero-actions">
            <Link to="/login" className="hp-btn hp-btn-primary hp-btn-start">
              Démarrer maintenant
            </Link>
            <Link to="/login" className="hp-btn hp-btn-outline hp-btn-demo">
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="hp-features-section">
        <div className="hp-container">
          <h2 className="hp-section-title">Fonctionnalités principales</h2>

          <div className="hp-features-grid">
            {/* Feature 1 */}
            <div className="hp-feature-card hp-feature-primary">
              <div className="hp-feature-icon">
                <span className="hp-icon-realtime"></span>
              </div>
              <h3 className="hp-feature-title">Supervision en temps réel</h3>
              <p className="hp-feature-description">
                Suivez l'état de vos équipements en temps réel, recevez des alertes instantanées et accédez aux données
                essentielles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="hp-feature-card">
              <div className="hp-feature-icon">
                <span className="hp-icon-predictive"></span>
              </div>
              <h3 className="hp-feature-title">Maintenance prédictive</h3>
              <p className="hp-feature-description">
                Anticipez les pannes grâce à l'intelligence artificielle. Optimisez vos interventions et réduisez les
                coûts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="hp-feature-card">
              <div className="hp-feature-icon">
                <span className="hp-icon-analytics"></span>
              </div>
              <h3 className="hp-feature-title">Analyses avancées</h3>
              <p className="hp-feature-description">
                Générez des rapports détaillés, suivez vos KPIs, prenez des décisions basées sur les données.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="hp-why-section">
        <div className="hp-container">
          <h2 className="hp-section-title">Pourquoi choisir notre solution ?</h2>

          <div className="hp-benefits-list">
            <div className="hp-benefit-item">
              <div className="hp-benefit-check">✓</div>
              <div className="hp-benefit-content">
                <h3 className="hp-benefit-title">Interface intuitive</h3>
                <p className="hp-benefit-description">Une prise en main rapide pour tous vos collaborateurs.</p>
              </div>
            </div>

            <div className="hp-benefit-item">
              <div className="hp-benefit-check">✓</div>
              <div className="hp-benefit-content">
                <h3 className="hp-benefit-title">Support réactif</h3>
                <p className="hp-benefit-description">Une équipe disponible 24/7 pour répondre à vos questions.</p>
              </div>
            </div>

            <div className="hp-benefit-item">
              <div className="hp-benefit-check">✓</div>
              <div className="hp-benefit-content">
                <h3 className="hp-benefit-title">Déploiement rapide</h3>
                <p className="hp-benefit-description">Mise en place en moins de 48 heures.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="hp-container hp-footer-container">
          <div className="hp-footer-grid">
            <div className="hp-footer-brand">
              <img src={logoFM || "/placeholder.svg"} alt="FM Logo" className="hp-footer-logo" />
              <p className="hp-footer-description">
                Gestion de Maintenance Assistée par Ordinateur pour équipements critiques
              </p>
            </div>

            <div className="hp-footer-links">
              <h3 className="hp-footer-title">Contact</h3>
              <ul className="hp-footer-list">
                <li>+33 1 23 45 67 89</li>
                <li>contact@gmao-fm.com</li>
                <li>
                  123 Avenue de la Maintenance
                  <br />
                  75001 Paris, France
                </li>
              </ul>
            </div>

            <div className="hp-footer-links">
              <h3 className="hp-footer-title">Ressources</h3>
              <ul className="hp-footer-list">
                <li>
                  <Link to="/documentation">Documentation</Link>
                </li>
                <li>
                  <Link to="/blog">Blog</Link>
                </li>
                <li>
                  <Link to="/support">Support</Link>
                </li>
              </ul>
            </div>

            <div className="hp-footer-links">
              <h3 className="hp-footer-title">Légal</h3>
              <ul className="hp-footer-list">
                <li>
                  <Link to="/mentions-legales">Mentions légales</Link>
                </li>
                <li>
                  <Link to="/confidentialite">Politique de confidentialité</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="hp-footer-bottom">
            <p className="hp-copyright">2024 GMAO Équipements Critiques. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
