import React, { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";
import { commandeAPI, traitementAPI } from "../../services/api";
import "../Commande/CommandeForm.css";
import "./TraitementForm.css";
import toast from "react-hot-toast";

const AddTraitementForm = ({ commandeId, commandes, onClose, onAddSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [commande, setCommande] = useState(null);
  const [numeroBL, setNumeroBL] = useState("");
  const [dateReception, setDateReception] = useState("");
  const [produits, setProduits] = useState([]);
  const [traitements, setTraitements] = useState([]);
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  
  // Liste des raisons d'écart possibles
  const raisonsEcart = ['Pertes', 'Casses', 'Vols', 'Erreurs de saisie', 'Autre', 'Aucun écart'];

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
      
      // Initialiser les produits avec les quantités commandées et la raison d'écart par défaut
      setProduits(
        response.data.produits.map(p => ({
          produitId: p.produit._id,
          nom: p.produit.name,
          reference: p.produit.reference,
          quantiteCommandee: p.quantiteSouhaitee,
          quantiteRecue: "",
          raisonEcart: "Aucun écart" // Raison d'écart par défaut
        }))
      );
      
      setLoading(false);
    } catch (error) {
      toast.error("Erreur lors du chargement des détails de la commande. Veuillez réessayer.");
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
        toast.error("Erreur lors de la récupération des traitements. Veuillez réessayer.");
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
      
      // Si la quantité reçue est différente de la quantité commandée, on met la raison d'écart à "Autre"
      // sinon on la met à "Aucun écart"
      const quantiteRecue = parseFloat(value) || 0;
      const quantiteCommandee = updatedProduits[index].quantiteCommandee;
      
      if (quantiteRecue !== quantiteCommandee && quantiteRecue > 0) {
        if (updatedProduits[index].raisonEcart === "Aucun écart") {
          updatedProduits[index].raisonEcart = "Autre";
        }
      } else if (quantiteRecue === quantiteCommandee) {
        updatedProduits[index].raisonEcart = "Aucun écart";
      }
      
      setProduits(updatedProduits);
    }
  };
  
  // Gérer le changement de raison d'écart
  const handleRaisonEcartChange = (index, value) => {
    const updatedProduits = [...produits];
    updatedProduits[index].raisonEcart = value;
    setProduits(updatedProduits);
  };

  const getNumericValue = (value) => {
    return value === "" ? 0 : parseFloat(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!numeroBL) {
      toast.error("Le numéro de BL est requis");
      return;
    }
    
    if (!dateReception) {
      toast.error("La date de réception est requise");
      return;
    }
    
    // Vérifier que toutes les quantités reçues sont renseignées
    const invalidProducts = produits.filter(p => !p.quantiteRecue || getNumericValue(p.quantiteRecue) <= 0);
    if (invalidProducts.length > 0) {
      toast.error("Toutes les quantités reçues doivent être renseignées et supérieures à 0");
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
          quantiteRecue: getNumericValue(p.quantiteRecue),
          raisonEcart: p.raisonEcart
        }))
      };
      
      // Envoyer les données à l'API
      const response = await traitementAPI.createTraitement(traitementData);
      
      if (response.status === 201 || response.status === 200) {
        toast.success("Traitement enregistré avec succès!");
        
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
        
        // Fermer la modal après un court délai
        setTimeout(() => {
          onAddSuccess();
          onClose();
        }, 1500);
      } else {
        throw new Error("Erreur lors de la création du traitement");
      }
      
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du traitement. Veuillez réessayer.");
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
                    <th>Raison écart</th>
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
                      <td>
                        <select
                          value={produit.raisonEcart}
                          onChange={(e) => handleRaisonEcartChange(index, e.target.value)}
                          className="traite-form-select"
                          disabled={parseFloat(produit.quantiteRecue) === produit.quantiteCommandee}
                        >
                          {raisonsEcart.map(raison => (
                            <option key={raison} value={raison}>{raison}</option>
                          ))}
                        </select>
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
          <button type="button" className="traite-cancel-button" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button type="submit" className="traite-save-button" disabled={loading}>
            {loading ? "Enregistrer" : "Enregistrement..."} {!loading && <FaSave />}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default AddTraitementForm;
