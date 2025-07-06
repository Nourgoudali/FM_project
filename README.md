# Système de Gestion de Maintenance Assistée par Ordinateur (GMAO)

Cette application est un système de GMAO complet qui permet de gérer efficacement les interventions techniques, le suivi des équipements, les stocks et la planification des maintenances.

## Fonctionnalités Principales

### 1. Gestion des Interventions
- Création et suivi des interventions techniques
- Attribution des interventions aux techniciens
- Suivi du statut et de la progression des interventions
- Génération de rapports d'intervention

### 2. Gestion des Équipements
- Catalogue complet des équipements
- Suivi de l'état et de la maintenance préventive
- Historique des interventions par équipement
- Gestion des caractéristiques techniques

### 3. Gestion des Stocks
- Suivi des articles en stock
- Gestion des niveaux de stock (minimum, maximum, sécurité)
- Alertes de rupture de stock
- Gestion des catégories PDR (Fluidique, Électrotechnique, Maintenance générale)
- Fournisseurs et commandes

### 4. Planification
- Calendrier des maintenances préventives
- Planning des interventions
- Gestion des plannings techniques
- Ressources et disponibilités

### 5. Documentation
- Gestion des documents techniques
- Manuels d'utilisation et de maintenance
- Historique des modifications
- Partage et accès aux documents

## Architecture

### Frontend
- **Technologies**: React.js, Material-UI, React Router
- **Structure**:
  - Components: Composants réutilisables
  - Pages: Pages principales de l'application
  - Services: API et services utilitaires
  - Styles: Styles globaux et composants
  - Utils: Fonctions utilitaires

### Backend
- **Technologies**: Node.js, Express.js, MongoDB
- **Structure**:
  - Controllers: Logique métier
  - Models: Schémas de données
  - Routes: API endpoints
  - Middleware: Fonctions intermédiaires
  - Services: Services utilitaires
  - Config: Configuration de l'application

## Installation

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB
- npm ou yarn

### Installation Backend
```bash
cd gmao-backend
npm install
# Créer un fichier .env avec les variables d'environnement
npm run dev
```

### Installation Frontend
```bash
cd gmao-frontend
npm install
npm start
```

## Structure des Données

### Catégories PDR
- Fluidique
- Électrotechnique
- Maintenance générale

### États des Articles en Stock
- En stock
- Stock faible
- Rupture de stock

## API Endpoints

### Stock Management
- GET /api/stock: Récupérer tous les articles
- POST /api/stock: Ajouter un nouvel article
- PUT /api/stock/:id: Modifier un article
- DELETE /api/stock/:id: Supprimer un article
- GET /api/stock/categories: Récupérer les catégories PDR

### Equipment Management
- GET /api/equipment: Récupérer tous les équipements
- POST /api/equipment: Ajouter un nouvel équipement
- PUT /api/equipment/:id: Modifier un équipement
- DELETE /api/equipment/:id: Supprimer un équipement

### Intervention Management
- GET /api/interventions: Récupérer toutes les interventions
- POST /api/interventions: Créer une nouvelle intervention
- PUT /api/interventions/:id: Mettre à jour une intervention
- DELETE /api/interventions/:id: Supprimer une intervention

## Sécurité
- Authentification JWT
- Rôles et permissions
- Validation des données
- Protection contre les injections SQL

## Contributing

1. Clonez le repository
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez la branche (`git push origin feature/amazing-feature`)
5. Créez une Pull Request

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository GitHub.

## Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.
