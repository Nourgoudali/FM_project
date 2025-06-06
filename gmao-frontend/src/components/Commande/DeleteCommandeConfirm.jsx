import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { commandeAPI } from "../../services/api";
import "./CommandeForm.css";
import toast from "react-hot-toast";

const DeleteCommandeConfirm = ({ commande, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      await commandeAPI.deleteCommande(commande._id);
      onSuccess(commande._id);
      toast.success("Commande supprimée avec succès.");
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression de la commande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cmd-modal-overlay">
      <div className="cmd-delete-confirm-modal">
        <div className="cmd-form-header">
          <h2>Supprimer la commande</h2>
          <button className="cmd-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="cmd-delete-confirm-content">
          <p>
            Êtes-vous sûr de vouloir supprimer la commande{" "}
            <strong>{commande.numeroCommande}</strong> ?
          </p>
          <p>Cette action est irréversible.</p>

          {/* Les messages d'erreur sont maintenant affichés avec des toasts */}

          <div className="cmd-delete-confirm-actions">
            <button type="button" className="cmd-cancel-button" onClick={onClose}>
              Annuler
            </button>
            <button
              type="button"
              className="cmd-delete-button"
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
