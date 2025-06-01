import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { commandeAPI } from "../../services/api";
import "./CommandeForm.css";

const DeleteCommandeConfirm = ({ commande, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      await commandeAPI.deleteCommande(commande._id);
      onSuccess(commande._id);
    } catch (error) {
      console.error("Erreur lors de la suppression de la commande:", error);
      setError("Une erreur est survenue lors de la suppression de la commande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="delete-confirm-modal">
        <div className="commande-form-header">
          <h2>Supprimer la commande</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="delete-confirm-content">
          <p>
            Êtes-vous sûr de vouloir supprimer la commande{" "}
            <strong>{commande.numeroCommande}</strong> ?
          </p>
          <p>Cette action est irréversible.</p>

          {error && <div className="error-message">{error}</div>}

          <div className="delete-confirm-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Annuler
            </button>
            <button
              type="button"
              className="delete-button"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Suppression en cours..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCommandeConfirm;
