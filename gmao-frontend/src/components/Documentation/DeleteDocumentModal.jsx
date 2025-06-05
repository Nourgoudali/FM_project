import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { documentAPI } from "../../services/api";
import { toast } from "react-hot-toast";
import "./Documentation.css";
import { useState } from "react";

const DeleteDocumentModal = ({ isOpen, document, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleDelete = async () => {
    if (!document?._id) {
      toast.error("Document invalide");
      return;
    }

    try {
      setLoading(true);
      await documentAPI.deleteDocument(document._id);
      toast.success("Document supprimé avec succès");
      onSuccess(document._id);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la suppression du document:", error);
      toast.error("Une erreur est survenue lors de la suppression du document");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div
      className="doc-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <div className="doc-modal-container doc-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="doc-modal-header">
          <h3 id="delete-modal-title">Supprimer le document</h3>
          <button
            type="button"
            className="doc-close-button"
            onClick={handleCloseClick}
            disabled={loading}
            aria-label="Fermer"
          >
            <FaTimes />
          </button>
        </div>

        <div className="doc-delete-modal-content">
          <div className="doc-delete-warning">
            <FaExclamationTriangle className="doc-warning-icon" aria-hidden="true" />
            <p id="delete-modal-description">
              Êtes-vous sûr de vouloir supprimer définitivement "<strong>{document.title}</strong>" ? Cette action est irréversible.
            </p>
          </div>

          <div className="doc-document-preview">
            <h4>{document.title}</h4>
            {document.category && (
              <span className="doc-category-badge">{document.category}</span>
            )}
            {document.description && (
              <p className="doc-document-description">{document.description}</p>
            )}
          </div>

          <div className="doc-delete-actions">
            <button
              type="button"
              onClick={handleCloseClick}
              className="doc-btn doc-btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="doc-btn doc-btn-danger"
              disabled={loading}
              aria-label={`Supprimer définitivement ${document.title}`}
            >
              {loading ? "Suppression..." : "Supprimer définitivement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDocumentModal;