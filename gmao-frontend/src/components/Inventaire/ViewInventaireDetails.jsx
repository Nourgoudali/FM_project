import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { inventaireAPI } from '../../services/api';
import './InventaireForm.css';
import { toast } from 'react-hot-toast';

const ViewInventaireDetails = ({ inventaireId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [inventaire, setInventaire] = useState(null);

  useEffect(() => {
    const fetchInventaireDetails = async () => {
      try {
        setLoading(true);
        const response = await inventaireAPI.getInventaireById(inventaireId);
        setInventaire(response.data);
      } catch (err) {
        toast.error("Impossible de charger les détails de l'inventaire. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    if (inventaireId) {
      fetchInventaireDetails();
    }
  }, [inventaireId]);

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="inventaire-modal-overlay">
      <div className="inventaire-modal inventaire-details-modal">
        <div className="inventaire-modal-header">
          <h2>Détails de l'inventaire</h2>
          <button className="inventaire-modal-close" onClick={onClose} title="Fermer">
            <FaTimes />
          </button>
        </div>

        {loading && (
          <div className="inventaire-loading">Chargement des détails...</div>
        ) || inventaire && (
          <div className="inventaire-details">
            <div className="inventaire-details-section">
              <h3>Informations générales</h3>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Référence:</div>
                <div className="inventaire-details-value">{inventaire.reference || 'N/A'}</div>
              </div>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Date d'inventaire:</div>
                <div className="inventaire-details-value">{formatDate(inventaire.dateInventaire)}</div>
              </div>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Réalisé par:</div>
                <div className="inventaire-details-value">
                  {inventaire.utilisateur ? (
                    `${inventaire.utilisateur.firstName || ''} ${inventaire.utilisateur.lastName || ''}`.trim() || 'Utilisateur inconnu'
                  ) : (
                    'Non assigné'
                  )}
                </div>
              </div>
            </div>

            <div className="inventaire-details-section">
              <h3>Produits inventoriés ({inventaire.produits?.length || 0})</h3>
              {inventaire.produits && inventaire.produits.length > 0 ? (
                <div className="inventaire-produits-liste">
                  {inventaire.produits.map((produitItem, index) => (
                    <div key={index} className="inventaire-produit-card">
                      <div className="inventaire-produit-header">
                        <h4>Produit {index + 1}</h4>
                        <span className={`inventaire-ecart-badge ${produitItem.ecart < 0 ? 'negative' : produitItem.ecart > 0 ? 'positive' : 'neutral'}`}>
                          Écart: {produitItem.ecart}
                        </span>
                      </div>
                      
                      <div className="inventaire-produit-details">
                        <div className="inventaire-details-row">
                          <div className="inventaire-details-label">Référence:</div>
                          <div className="inventaire-details-value">{produitItem.produit?.reference || 'N/A'}</div>
                        </div>
                        <div className="inventaire-details-row">
                          <div className="inventaire-details-label">Nom:</div>
                          <div className="inventaire-details-value">{produitItem.produit?.name || produitItem.produit?.nom || 'N/A'}</div>
                        </div>
                        <div className="inventaire-details-row">
                          <div className="inventaire-details-label">Lieu de stockage:</div>
                          <div className="inventaire-details-value">{produitItem.produit?.lieuStockage || 'N/A'}</div>
                        </div>
                        <div className="inventaire-details-row">
                          <div className="inventaire-details-label">Stock théorique:</div>
                          <div className="inventaire-details-value">{produitItem.stockTheorique}</div>
                        </div>
                        <div className="inventaire-details-row">
                          <div className="inventaire-details-label">Stock réel compté:</div>
                          <div className="inventaire-details-value">{produitItem.quantiteComptee}</div>
                        </div>
                        <div className="inventaire-details-row">
                          <div className="inventaire-details-label">Raison de l'écart:</div>
                          <div className="inventaire-details-value">{produitItem.raisonEcart}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="inventaire-no-produits">Aucun produit dans cet inventaire</div>
              )}
            </div>

            <div className="inventaire-details-section">
              <h3>Informations complémentaires</h3>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Date d'inventaire:</div>
                <div className="inventaire-details-value">{formatDate(inventaire.dateInventaire)}</div>
              </div>
              {inventaire.createdBy && (
                <div className="inventaire-details-row">
                  <div className="inventaire-details-label">Créé par:</div>
                  <div className="inventaire-details-value">
                    {inventaire.createdBy.prenom} {inventaire.createdBy.nom}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="inventaire-form-buttons">
          <button
            type="button"
            className="inventaire-form-cancel"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewInventaireDetails;
