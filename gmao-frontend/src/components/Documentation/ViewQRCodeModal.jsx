import React from "react";
import { FaTimes, FaDownload } from "react-icons/fa";
import { toast } from "react-hot-toast";

const ViewQRCodeModal = ({ isOpen, document, onClose, onDownload }) => {
  // Vérifier si le modal doit être affiché
  if (!isOpen) return null;
  
  // Vérifier si le document est valide
  if (!document) {
    // Afficher un message d'erreur et fermer le modal
    if (isOpen) {
      toast.error("Document non trouvé");
      // Utiliser setTimeout pour éviter les avertissements de mise à jour d'état pendant le rendu
      onClose();
    }
    return null;
  }

  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="doc-modal-header">
          <h3>Détails du document - {document.reference}</h3>
          <button 
            type="button" 
            className="doc-close-btn" 
            onClick={onClose}
            aria-label="Fermer"
          >
            <FaTimes />
          </button>
        </div>
        <div className="doc-detail-body">
          <div className="doc-detail-info">
            <p><strong>Titre:</strong> {document.title || 'Non spécifié'}</p>
            <p><strong>Catégorie:</strong> {document.category || 'Non spécifiée'}</p>
            {document.equipment?.name && (
              <p><strong>Équipement:</strong> {document.equipment.name}</p>
            )}
            {document.description && (
              <p><strong>Description:</strong> {document.description}</p>
            )}
          </div>
          
          <div className="doc-detail-actions">
            <button 
              className="doc-download-button"
              onClick={() => {
                if (onDownload) onDownload(document);
                onClose();
              }}
            >
              <FaDownload /> Télécharger le PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewQRCodeModal;