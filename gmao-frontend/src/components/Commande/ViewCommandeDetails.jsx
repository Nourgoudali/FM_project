import { useState, useEffect } from "react";
import { FaTimes, FaFileExport, FaClipboardCheck, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./CommandeForm.css";
import { traitementAPI } from "../../services/api";

const ViewCommandeDetails = ({ commande, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [traitementId, setTraitementId] = useState(null);
  const navigate = useNavigate();
  
  // Vérifier si la commande a déjà été traitée
  useEffect(() => {
    const checkTraitement = async () => {
      try {
        setLoading(true);
        const response = await traitementAPI.getTraitementsByCommande(commande._id);
        if (response.data && response.data.length > 0) {
          setIsProcessed(true);
          setTraitementId(response.data[0]._id);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du traitement:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (commande && commande._id) {
      checkTraitement();
    }
  }, [commande]);

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  // Calculer les totaux
  const totalHT = commande.produits.reduce((sum, product) => sum + product.total, 0);
  const totalTTC = commande.produits.reduce((sum, product) => sum + product.ttc, 0);

  return (
    <div className="view-cmd-modal-overlay">
      <div className="view-cmd-form-modal">
        <div className="view-cmd-form-header">
          <h2>Détails de la commande {commande.numeroCommande}</h2>
          <button className="view-cmd-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="view-cmd-form">
          <div className="view-cmd-form-section">
            <h3>Informations générales</h3>
            <div className="view-cmd-info-grid">
              <div className="view-cmd-info-item">
                <span className="view-cmd-info-label">Numéro de commande:</span>
                <span className="view-cmd-info-value">{commande.numeroCommande}</span>
              </div>
              <div className="view-cmd-info-item">
                <span className="view-cmd-info-label">Fournisseur:</span>
                <span className="view-cmd-info-value">{commande.fournisseur?.nom || "Non défini"}</span>
              </div>
              <div className="view-cmd-info-item">
                <span className="view-cmd-info-label">Devise:</span>
                <span className="view-cmd-info-value">{commande.devise}</span>
              </div>
              <div className="view-cmd-info-item">
                <span className="view-cmd-info-label">TVA:</span>
                <span className="view-cmd-info-value">{commande.tva}%</span>
              </div>
              <div className="view-cmd-info-item">
                <span className="view-cmd-info-label">Numéro BL:</span>
                <span className="view-cmd-info-value">{commande.numeroBL || "-"}</span>
              </div>
              <div className="view-cmd-info-item">
                <span className="view-cmd-info-label">Date de commande:</span>
                <span className="view-cmd-info-value">{formatDate(commande.dateCommande)}</span>
              </div>
            </div>
          </div>

          <div className="view-cmd-form-section">
            <h3>Produits commandés</h3>
            <div className="view-cmd-selected-products-table-container">
              <table className="view-cmd-selected-products-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Produit</th>
                    <th>Quantité souhaitée</th>
                    <th>Quantité min</th>
                    <th>Prix unitaire (DH)</th>
                    <th>Total (DH)</th>
                    <th>Remise (%)</th>
                    <th>TTC (DH)</th>
                  </tr>
                </thead>
                <tbody>
                  {commande.produits.map((product, index) => (
                    <tr key={index}>
                      <td>{product.produit?.reference || "N/A"}</td>
                      <td>{product.produit?.name || "Produit inconnu"}</td>
                      <td>{product.quantiteSouhaitee}</td>
                      <td>{product.quantiteMinCommande}</td>
                      <td>{product.prixUnitaire}</td>
                      <td>{product.total?.toFixed(2) || "-"}</td>
                      <td>{product.remise}</td>
                      <td>{product.ttc?.toFixed(2) || "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="view-cmd-total-label">Total</td>
                    <td>{totalHT.toFixed(2)}</td>
                    <td></td>
                    <td>{totalTTC.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="view-cmd-form-actions">
            {loading ? (
              <button type="button" className="view-cmd-traitement-button" disabled>
                Chargement...
              </button>
            ) : isProcessed ? (
              <button 
                type="button" 
                className="view-cmd-traitement-button view-cmd-traitement-viewed"
                onClick={() => navigate(`/traitements?view=${traitementId}`)}
              >
                <FaEye /> Voir le traitement
              </button>
            ) : (
              <button 
                type="button" 
                className="view-cmd-traitement-button"
                onClick={() => navigate(`/traitements?add=true&commande=${commande._id}`)}
              >
                <FaClipboardCheck /> Traiter la commande
              </button>
            )}
            <button type="button" className="view-cmd-close-button-bottom" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCommandeDetails;
