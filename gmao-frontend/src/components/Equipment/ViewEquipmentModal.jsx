import { useState } from "react"
import { FaTimes, FaSearch, FaSearchMinus } from "react-icons/fa"
import "./EquipmentModals.css"

// Composant pour afficher l'image en plein écran
function FullscreenImage({ src, alt, onClose }) {
  return (
    <div className="fullscreen-image-overlay" onClick={onClose}>
      <div className="fullscreen-image-container">
        <button className="fullscreen-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <img src={src} alt={alt} className="fullscreen-image" />
        <div className="fullscreen-image-caption">
          <FaSearchMinus /> Cliquez n'importe où pour fermer
        </div>
      </div>
    </div>
  );
}

function ViewEquipmentModal({ equipment, onClose }) {
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);
  
  if (!equipment) return null;

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return '-';
    }
  };

  // Fonction pour obtenir la classe de couleur en fonction du statut
  const getStatusClass = (status) => {
    switch (status) {
      case "En service":
        return "status-operational";
      case "En maintenance":
        return "status-maintenance";
      case "Hors service":
        return "status-out-of-service";
      default:
        return "";
    }
  };

  return (
    <div className="modal-overlay">
      <div className="equipment-modal-container">
        <div className="equipment-modal-header">
          <h2>Détails de l'équipement</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="equipment-modal-content">
          <div className="equipment-detail-header">
            <div 
              className="equipment-image-container" 
              onClick={() => equipment.image && setShowImageFullscreen(true)}
              style={{ cursor: equipment.image ? 'pointer' : 'default' }}
            >
              <img 
                src={equipment.image && typeof equipment.image === 'string' ? 
                  `http://localhost:5000${equipment.image}` : 
                  "/placeholder.svg?height=200&width=200"
                } 
                alt={equipment.name || 'Équipement'} 
                className="equipment-detail-image" 
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=200&width=200";
                }}
              />
              {equipment.image && (
                <div className="equipment-image-overlay">
                  <FaSearch className="equipment-image-zoom-icon" />
                  <span>Agrandir</span>
                </div>
              )}
            </div>
            <div className="equipment-header-info">
              <h3 className="equipment-detail-name">{equipment.name}</h3>
              <p className="equipment-detail-reference">Référence: {equipment.reference}</p>
              <div className={`equipment-status-badge ${getStatusClass(equipment.status)}`}>
                {equipment.status}
              </div>
            </div>
          </div>

          <div className="equipment-detail-sections">
            <div className="equipment-detail-section">
              <h4 className="equipment-section-title">Informations générales</h4>
              <div className="equipment-detail-grid">
                <div className="equipment-detail-item">
                  <span className="equipment-detail-label">Catégorie</span>
                  <span className="equipment-detail-value">{equipment.category || '-'}</span>
                </div>
                <div className="equipment-detail-item">
                  <span className="equipment-detail-label">Localisation</span>
                  <span className="equipment-detail-value">{equipment.location || '-'}</span>
                </div>
              </div>
            </div>

            <div className="equipment-detail-section">
              <h4 className="equipment-section-title">Caractéristiques techniques</h4>
              <div className="equipment-detail-grid">
                <div className="equipment-detail-item">
                  <span className="equipment-detail-label">Marque</span>
                  <span className="equipment-detail-value">{equipment.brand || '-'}</span>
                </div>
                <div className="equipment-detail-item">
                  <span className="equipment-detail-label">Modèle</span>
                  <span className="equipment-detail-value">{equipment.model || '-'}</span>
                </div>
                <div className="equipment-detail-item">
                  <span className="equipment-detail-label">Numéro de série</span>
                  <span className="equipment-detail-value">{equipment.serialNumber || '-'}</span>
                </div>
              </div>
            </div>

            <div className="equipment-detail-section">
              <h4 className="equipment-section-title">Informations complémentaires</h4>
              <div className="equipment-detail-grid">
                <div className="equipment-detail-item">
                  <span className="equipment-detail-label">Date d'achat</span>
                  <span className="equipment-detail-value">{equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString() : '-'}</span>
                </div>
                <div className="equipment-detail-item">
                  <span className="equipment-detail-label">Fin de garantie</span>
                  <span className="equipment-detail-value">{equipment.warrantyEnd ? new Date(equipment.warrantyEnd).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            </div>

            {equipment.description && (
              <div className="equipment-detail-section">
                <h4 className="equipment-section-title">Description</h4>
                <p className="equipment-description">{equipment.description}</p>
              </div>
            )}
          </div>

          <div className="equipment-modal-actions">
            <button className="equipment-btn equipment-btn-outline" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Affichage de l'image en plein écran lorsque cliquée */}
      {showImageFullscreen && equipment.image && typeof equipment.image === 'string' && (
        <FullscreenImage 
          src={`http://localhost:5000${equipment.image}`} 
          alt={equipment.name || 'Équipement'} 
          onClose={() => setShowImageFullscreen(false)} 
        />
      )}
    </div>
  );
}

export default ViewEquipmentModal;
