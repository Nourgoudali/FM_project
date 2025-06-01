import React, { useState } from "react";
import { FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { traitementAPI } from "../../services/api";
import "../Commande/CommandeForm.css";
import "./TraitementForm.css";

const ViewTraitementDetails = ({ traitement, onClose, onDeleteSuccess }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      setLoading(true);
      await traitementAPI.deleteTraitement(traitement._id);
      
      // Fermer la modale
      onClose();
      
      // Appeler la fonction de rappel pour rafraîchir les données
      if (onDeleteSuccess && typeof onDeleteSuccess === 'function') {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du traitement:", error);
      setError("Impossible de supprimer le traitement");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  if (!traitement) {
    return null;
  }

  return (
    <div className="traite-modal-overlay">
      <div className="traite-details-container">
      <div className="traite-details-header">
        <h2>Détails du traitement</h2>
        <button className="traite-close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="traite-details-content">
        <div className="traite-details-section">
          <div className="traite-info-grid">
            <div className="traite-info-item">
              <span className="traite-info-label">Numéro de commande:</span>
              <span className="traite-info-value">{traitement?.commande?.numeroCommande || "N/A"}</span>
            </div>
            <div className="traite-info-item">
              <span className="traite-info-label">Numéro de BL:</span>
              <span className="traite-info-value">{traitement?.numeroBL || "N/A"}</span>
            </div>
            <div className="traite-info-item">
              <span className="traite-info-label">Date de réception:</span>
              <span className="traite-info-value">{traitement ? formatDate(traitement.dateReception) : "N/A"}</span>
            </div>
            <div className="traite-info-item">
              <span className="traite-info-label">Fournisseur:</span>
              <span className="traite-info-value">
                {traitement?.commande?.fournisseur ? 
                  `${traitement.commande.fournisseur.nomEntreprise} (${traitement.commande.fournisseur.nom} ${traitement.commande.fournisseur.prenom})` : 
                  "Non défini"}
              </span>
            </div>
            <div className="traite-info-item">
              <span className="traite-info-label">Date de commande:</span>
              <span className="traite-info-value">
                {traitement?.commande ? formatDate(traitement.commande.dateCommande) : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="traite-details-section">
          <h3>Produits reçus</h3>
          <div className="traite-products-table-container">
            <table className="traite-products-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Produit</th>
                  <th>Quantité commandée</th>
                  <th>Quantité reçue</th>
                </tr>
              </thead>
              <tbody>
                {traitement?.produits.map((produit, index) => (
                  <tr key={index}>
                    <td>{produit.produit?.reference || "N/A"}</td>
                    <td>{produit.produit?.name || "Produit inconnu"}</td>
                    <td>{produit.quantiteCommandee}</td>
                    <td>{produit.quantiteRecue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="traite-details-actions">
          <button
            className={`traite-delete-button ${confirmDelete ? "confirm" : ""}`}
            onClick={handleDelete}
          >
            <FaTrash /> {confirmDelete ? "Confirmer la suppression" : "Supprimer"}
          </button>
          <button
            className="traite-back-button"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ViewTraitementDetails;
