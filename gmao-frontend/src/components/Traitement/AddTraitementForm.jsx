import React, { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";
import { commandeAPI, traitementAPI } from "../../services/api";
import "../Commande/CommandeForm.css";
import "./TraitementForm.css";

const AddTraitementForm = ({ commandeId, commandes, onClose, onAddSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [commande, setCommande] = useState(null);
  const [numeroBL, setNumeroBL] = useState("");
  const [dateReception, setDateReception] = useState("");
  const [produits, setProduits] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [traitements, setTraitements] = useState([]);
  const [filteredCommandes, setFilteredCommandes] = useState([]);

  // État pour stocker la commande sélectionnée
  const [selectedCommandeId, setSelectedCommandeId] = useState(commandeId || "");

  // Fonction pour charger les détails d'une commande
  const fetchCommandeDetails = async (id) => {
    if (!id) {
      setCommande(null);
      setProduits([]);
      setNumeroBL("");
      return;
    }
    
    try {
      setLoading(true);
      const response = await commandeAPI.getCommandeById(id);
      setCommande(response.data);
      
      // Si la commande a déjà un numéro BL, on le prérempli
      if (response.data.numeroBL) {
        setNumeroBL(response.data.numeroBL);
      }
      
      // Initialiser les produits avec les quantités commandées
      setProduits(
        response.data.produits.map(p => ({
          produitId: p.produit._id,
          nom: p.produit.name,
          reference: p.produit.reference,
          quantiteCommandee: p.quantiteSouhaitee,
          quantiteRecue: ""
        }))
      );
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération de la commande:", error);
      setError("Impossible de charger les détails de la commande");
      setLoading(false);
    }
  };

  // Charger les détails de la commande lorsqu'une commande est sélectionnée
  useEffect(() => {
    if (selectedCommandeId) {
      fetchCommandeDetails(selectedCommandeId);
    }
  }, [selectedCommandeId]);
  
  // Récupérer tous les traitements existants pour filtrer les commandes déjà traitées
  useEffect(() => {
    const fetchTraitements = async () => {
      try {
        const response = await traitementAPI.getAllTraitements();
        setTraitements(response.data);
        
        // Filtrer les commandes qui n'ont pas encore été traitées
        const commandesTraitees = response.data.map(t => t.commande?._id);
        let commandesNonTraitees = commandes.filter(c => !commandesTraitees.includes(c._id));
        
        // Si une commande est présélectionnée mais qu'elle a déjà été traitée,
        // l'ajouter quand même à la liste pour permettre son traitement
        if (commandeId && !commandesNonTraitees.some(c => c._id === commandeId)) {
          const commandePreselectionee = commandes.find(c => c._id === commandeId);
          if (commandePreselectionee) {
            commandesNonTraitees = [commandePreselectionee, ...commandesNonTraitees];
          }
        }
        
        setFilteredCommandes(commandesNonTraitees);
      } catch (error) {
        console.error("Erreur lors de la récupération des traitements:", error);
      }
    };
    
    fetchTraitements();
  }, [commandes, commandeId]);
  
  // Initialiser avec la commande passée en prop si disponible
  useEffect(() => {
    if (commandeId) {
      setSelectedCommandeId(commandeId);
    }
  }, [commandeId]);
  
  // Gérer le changement de commande sélectionnée
  const handleCommandeChange = (e) => {
    setSelectedCommandeId(e.target.value);
  };

  const handleQuantiteRecueChange = (index, value) => {
    // Validation pour n'accepter que des valeurs numériques
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const updatedProduits = [...produits];
      updatedProduits[index].quantiteRecue = value;
      setProduits(updatedProduits);
    }
  };

  const getNumericValue = (value) => {
    return value === "" ? 0 : parseFloat(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!numeroBL) {
      setError("Le numéro de BL est requis");
      return;
    }
    
    if (!dateReception) {
      setError("La date de réception est requise");
      return;
    }
    
    // Vérifier que toutes les quantités reçues sont renseignées
    const invalidProducts = produits.filter(p => !p.quantiteRecue || getNumericValue(p.quantiteRecue) <= 0);
    if (invalidProducts.length > 0) {
      setError("Toutes les quantités reçues doivent être renseignées et supérieures à 0");
      return;
    }
    
    try {
      setLoading(true);
      
      // Préparer les données pour l'API
      const traitementData = {
        commandeId: selectedCommandeId,
        numeroBL,
        dateReception,
        produits: produits.map(p => ({
          produitId: p.produitId,
          quantiteCommandee: p.quantiteCommandee,
          quantiteRecue: getNumericValue(p.quantiteRecue)
        }))
      };
      
      // Envoyer les données à l'API
      const response = await traitementAPI.createTraitement(traitementData);
      
      if (response.status === 201 || response.status === 200) {
        setSuccess("Traitement de commande enregistré avec succès");
        
        // Réinitialiser le formulaire
        setNumeroBL("");
        setDateReception("");
        setProduits([]);
        setSelectedCommandeId("");
        setCommande(null);
        
        // Mettre à jour la liste des commandes filtrées
        const updatedTraitements = [...traitements, response.data];
        setTraitements(updatedTraitements);
        
        const commandesTraitees = updatedTraitements.map(t => t.commande?._id);
        const commandesNonTraitees = commandes.filter(c => !commandesTraitees.includes(c._id));
        setFilteredCommandes(commandesNonTraitees);
        
        // Fermer la modal et rafraîchir les données après 1.5 secondes
        setTimeout(() => {
          onClose();
          // Appeler la fonction de rappel pour rafraîchir les données
          if (onAddSuccess && typeof onAddSuccess === 'function') {
            onAddSuccess();
          }
        }, 1500);
      } else {
        throw new Error("Erreur lors de la création du traitement");
      }
      
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du traitement:", error);
      setError("Impossible d'enregistrer le traitement de commande");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="traite-modal-overlay">
      <div className="traite-form-container">
      <div className="traite-form-header">
        <h2>{commande ? `Traitement de la commande ${commande.numeroCommande}` : "Ajouter un traitement"}</h2>
        <button className="traite-close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      {error && <div className="traite-error-message">{error}</div>}
      {success && <div className="traite-success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="traite-form">
        <div className="traite-form-section">
          <div className="traite-form-row">
            <div className="traite-form-group">
              <label htmlFor="commande">Commande</label>
              <select
                id="commande"
                value={selectedCommandeId}
                onChange={handleCommandeChange}
                required
                className="traite-form-select"
              >
                <option value="">Sélectionner une commande</option>
                {filteredCommandes.map(cmd => (
                  <option key={cmd._id} value={cmd._id}>
                    {cmd.numeroCommande} - {cmd.fournisseur?.nom || "Fournisseur inconnu"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedCommandeId && (
            <>
              <div className="traite-form-row">
                <div className="traite-form-group">
                  <label htmlFor="numeroBL">Numéro de BL</label>
                  <input
                    type="text"
                    id="numeroBL"
                    value={numeroBL}
                    onChange={(e) => setNumeroBL(e.target.value)}
                    required
                  />
                </div>
                <div className="traite-form-group">
                  <label htmlFor="dateReception">Date de réception</label>
                  <input
                    type="date"
                    id="dateReception"
                    value={dateReception}
                    onChange={(e) => setDateReception(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="traite-form-row">
                <div className="traite-form-group">
                  <label>Fournisseur</label>
                  <input
                    type="text"
                    value={commande?.fournisseur?.nom || "Non défini"}
                    readOnly
                    disabled
                  />
                </div>
                <div className="traite-form-group">
                  <label>Date de commande</label>
                  <input
                    type="text"
                    value={commande ? formatDate(commande.dateCommande) : ""}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </>
          )}
        
        </div>

        {selectedCommandeId && produits.length > 0 && (
          <div className="traite-form-section">
            <h3>Produits commandés</h3>
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
                  {produits.map((produit, index) => (
                    <tr key={index}>
                      <td>{produit.reference}</td>
                      <td>{produit.nom}</td>
                      <td>{produit.quantiteCommandee}</td>
                      <td>
                        <input
                          type="text"
                          value={produit.quantiteRecue}
                          onChange={(e) => handleQuantiteRecueChange(index, e.target.value)}
                          className="traite-quantity-input"
                          required
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      )}
      
      {selectedCommandeId && produits.length === 0 && (
        <div className="traite-form-section">
          <div className="traite-no-data">Cette commande ne contient aucun produit</div>
        </div>
      )}

        <div className="traite-form-actions">
          <button type="submit" className="traite-save-button" disabled={loading}>
            {loading ? "Enregistrer" : "Enregistrement..."} {!loading && <FaSave />}
          </button>
          <button type="button" className="traite-cancel-button" onClick={onClose} disabled={loading}>
            Annuler
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default AddTraitementForm;
