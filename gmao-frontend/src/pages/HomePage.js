import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-logo">
          <h1>GMAO FM</h1>
        </div>
        <nav className="home-nav">
          <Link to="/login" className="nav-link">Connexion</Link>
          <a href="#features" className="nav-link">Fonctionnalités</a>
          <a href="#about" className="nav-link">À propos</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1>Système de Gestion de Maintenance Assistée par Ordinateur</h1>
          <p>Optimisez la gestion de vos équipements et la planification de vos maintenances</p>
          <Link to="/login" className="cta-button">Commencer maintenant</Link>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2>Fonctionnalités principales</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Gestion des équipements</h3>
            <p>Suivez l'état et l'historique de tous vos équipements</p>
          </div>
          <div className="feature-card">
            <h3>Planification des maintenances</h3>
            <p>Planifiez et suivez toutes vos interventions</p>
          </div>
          <div className="feature-card">
            <h3>Gestion des stocks</h3>
            <p>Optimisez votre inventaire de pièces détachées</p>
          </div>
          <div className="feature-card">
            <h3>Maintenance prédictive</h3>
            <p>Anticipez les pannes grâce à l'analyse des données</p>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <h2>À propos de GMAO FM</h2>
        <p>
          Notre solution de GMAO est conçue pour aider les entreprises à optimiser 
          la gestion de leurs équipements, réduire les temps d'arrêt et prolonger 
          la durée de vie des machines. Avec notre interface intuitive et nos fonctionnalités 
          avancées, vous pouvez améliorer l'efficacité de votre service de maintenance.
        </p>
      </section>

      <section id="contact" className="contact-section">
        <h2>Contactez-nous</h2>
        <form className="contact-form">
          <div className="form-group">
            <label>Nom</label>
            <input type="text" placeholder="Votre nom" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Votre email" />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea placeholder="Votre message"></textarea>
          </div>
          <button type="submit" className="submit-btn">Envoyer</button>
        </form>
      </section>

      <footer className="home-footer">
        <p>&copy; 2023 GMAO FM. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default HomePage; 