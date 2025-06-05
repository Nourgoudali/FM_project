import React from "react";
import { FaTimes } from "react-icons/fa";
import QRCode from "react-qr-code";
import { toast } from "react-hot-toast";

const ViewQRCodeModal = ({ isOpen, document, onClose }) => {
  // Vérifier si le modal doit être affiché
  if (!isOpen) return null;
  
  // Vérifier si le document est valide
  if (!document || !document.qrCodeData) {
    // Afficher un message d'erreur et fermer le modal
    if (isOpen) {
      toast.error("Impossible d'afficher le QR code : données manquantes");
      // Utiliser setTimeout pour éviter les avertissements de mise à jour d'état pendant le rendu
      setTimeout(onClose, 0);
    }
    return null;
  }

  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="doc-modal-header">
          <h3>QR Code pour {document.title || 'Document'}</h3>
          <button 
            type="button" 
            className="doc-close-button" 
            onClick={onClose}
            aria-label="Fermer"
          >
            <FaTimes />
          </button>
        </div>
        <div className="doc-qr-code">
          <QRCode 
            value={document.qrCodeData} 
            size={200} 
            level="H" // Niveau de correction d'erreur élevé
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
          <p className="doc-qr-instruction">Scannez ce code pour accéder au document</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ViewQRCodeModal);