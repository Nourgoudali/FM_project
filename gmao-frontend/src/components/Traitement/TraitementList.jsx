import React, { useState, useEffect } from "react";
import { FaEye, FaSearch, FaPlus } from "react-icons/fa";
import { traitementAPI } from "../../services/api";
import "../Commande/CommandeForm.css";
import "./TraitementForm.css";
import toast from "react-hot-toast";

const TraitementList = ({ onViewTraitement, onAddTraitement }) => {
  const [traitements, setTraitements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTraitements, setFilteredTraitements] = useState([]);

  useEffect(() => {
    const fetchTraitements = async () => {
      try {
        setLoading(true);
        const response = await traitementAPI.getAllTraitements();
        setTraitements(response.data);
        setFilteredTraitements(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Impossible de charger la liste des traitements");
        setLoading(false);
      }
    };

    fetchTraitements();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTraitements(traitements);
    } else {
      const filtered = traitements.filter(
        (traitement) =>
          traitement.numeroBL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (traitement.commande?.numeroCommande &&
            traitement.commande.numeroCommande
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (traitement.commande?.fournisseur?.nom &&
            traitement.commande.fournisseur.nom
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
      setFilteredTraitements(filtered);
    }
  }, [searchTerm, traitements]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  if (loading && traitements.length === 0) {
    return <div className="loading">Chargement des traitements...</div>;
  }

  return (
    <div className="traitement-list-container">
      <div className="traitement-list-header">
        <h2>Liste des traitements de commande</h2>
        <div className="traitement-list-actions">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="add-traitement-button"
            onClick={() => onAddTraitement()}
          >
            <FaPlus /> Ajouter un traitement
          </button>
        </div>
      </div>

      {/* Les messages d'erreur sont maintenant affichés avec des toasts */}

      {filteredTraitements.length === 0 ? (
        <div className="no-data">Aucun traitement trouvé</div>
      ) : (
        <div className="traitement-table-container">
          <table className="traitement-table">
            <thead>
              <tr>
                <th>Numéro de commande</th>
                <th>Numéro de BL</th>
                <th>Fournisseur</th>
                <th>Date de commande</th>
                <th>Date de réception</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTraitements.map((traitement) => (
                <tr key={traitement._id}>
                  <td>{traitement.commande?.numeroCommande || "N/A"}</td>
                  <td>{traitement.numeroBL}</td>
                  <td>{traitement.commande?.fournisseur?.nom || "Non défini"}</td>
                  <td>
                    {traitement.commande?.dateCommande
                      ? formatDate(traitement.commande.dateCommande)
                      : "N/A"}
                  </td>
                  <td>{formatDate(traitement.dateReception)}</td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => onViewTraitement(traitement)}
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TraitementList;
