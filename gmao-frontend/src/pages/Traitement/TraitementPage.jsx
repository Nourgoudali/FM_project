import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { useSidebar } from '../../contexts/SidebarContext';
import { FaPlus, FaEye, FaSearch } from 'react-icons/fa';
import { traitementAPI, commandeAPI } from '../../services/api';
import AddTraitementForm from '../../components/Traitement/AddTraitementForm';
import ViewTraitementDetails from '../../components/Traitement/ViewTraitementDetails';
import { useLocation, useNavigate } from 'react-router-dom';
import './TraitementPage.css';

const TraitementPage = () => {
  const { isCollapsed } = useSidebar();
  const [traitements, setTraitements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTraitements, setFilteredTraitements] = useState([]);
  const [selectedTraitement, setSelectedTraitement] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCommandeId, setSelectedCommandeId] = useState(null);
  const [commandes, setCommandes] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Fonction pour charger les traitements (peut être appelée à tout moment)
  const fetchTraitements = async () => {
    try {
      setLoading(true);
      const response = await traitementAPI.getAllTraitements();
      setTraitements(response.data);
      setFilteredTraitements(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des traitements:", error);
      setError("Impossible de charger la liste des traitements");
      setLoading(false);
    }
  };

  // Charger les traitements au chargement initial
  useEffect(() => {
    fetchTraitements();
  }, []);
  
  // Gérer les paramètres d'URL pour ouvrir automatiquement les modales
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const viewParam = queryParams.get('view');
    const addParam = queryParams.get('add');
    const commandeParam = queryParams.get('commande');
    
    // Si on a un ID de traitement à afficher
    if (viewParam) {
      const fetchTraitementDetails = async () => {
        try {
          const response = await traitementAPI.getTraitementById(viewParam);
          if (response.data) {
            setSelectedTraitement(response.data);
            // Nettoyer l'URL après avoir ouvert la modale
            navigate('/traitements', { replace: true });
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du traitement:", error);
          setError("Impossible de charger les détails du traitement");
        }
      };
      fetchTraitementDetails();
    }
    
    // Si on doit ouvrir la modale d'ajout avec une commande présélectionnée
    if (addParam === 'true' && commandeParam) {
      // Vérifier si la commande existe
      const fetchCommandeDetails = async () => {
        try {
          const response = await commandeAPI.getCommandeById(commandeParam);
          if (response.data) {
            setSelectedCommandeId(commandeParam);
            setShowAddModal(true);
          } else {
            setError("La commande spécifiée n'existe pas");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de la commande:", error);
          setError("Impossible de charger les détails de la commande");
        } finally {
          // Nettoyer l'URL après avoir ouvert la modale
          navigate('/traitements', { replace: true });
        }
      };
      fetchCommandeDetails();
    }
  }, [location.search, navigate]);

  // Charger les commandes pour le modal d'ajout
  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await commandeAPI.getAllCommandes();
        setCommandes(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
      }
    };

    fetchCommandes();
  }, []);

  // Filtrer les traitements en fonction du terme de recherche
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

  // Fonction pour ouvrir la modal de détails
  const handleViewTraitement = (traitement) => {
    setSelectedTraitement(traitement);
  };

  // Fonction pour fermer la modal de détails
  const handleCloseViewModal = () => {
    setSelectedTraitement(null);
  };

  // Fonction pour ouvrir la modal d'ajout
  const handleOpenAddModal = (commandeId = null) => {
    setSelectedCommandeId(commandeId);
    setShowAddModal(true);
  };

  // Fonction pour fermer la modal d'ajout
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setSelectedCommandeId(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="traite-layout">
      <Sidebar />
      <div className="traite-main">
        <Header title="Traitements de commande" />
        <div className="traite-content">
          <div className="traite-container">
            <div className="traite-toolbar">
              <div className="traite-toolbar-right">
                <div className="traite-search">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="traite-toolbar-left">
                <button 
                  className="traite-button primary"
                  onClick={() => handleOpenAddModal()}
                >
                  <FaPlus /> Ajouter un traitement
                </button>
              </div>
            </div>

            {error && <div className="traite-error-message">{error}</div>}

            {loading ? (
              <div className="traite-loading">Chargement des traitements...</div>
            ) : filteredTraitements.length === 0 ? (
              <div className="traite-no-data">Aucun traitement trouvé</div>
            ) : (
              <div className="traite-table-container">
                <table className="traite-table">
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
                        <td>{traitement.commande?.fournisseur?.nomEntreprise || "Non défini"}</td>
                        <td>
                          {traitement.commande?.dateCommande
                            ? formatDate(traitement.commande.dateCommande)
                            : "N/A"}
                        </td>
                        <td>{formatDate(traitement.dateReception)}</td>
                        <td>
                          <div className="traite-actions">
                            <button
                              className="traite-action-button view"
                              onClick={() => handleViewTraitement(traitement)}
                              title="Voir les détails"
                            >
                              <FaEye />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {selectedTraitement && (
              <ViewTraitementDetails 
                traitement={selectedTraitement} 
                onClose={handleCloseViewModal}
                onDeleteSuccess={fetchTraitements}
              />
            )}
            
            {showAddModal && (
              <AddTraitementForm 
                commandeId={selectedCommandeId} 
                commandes={commandes}
                onClose={handleCloseAddModal}
                onAddSuccess={fetchTraitements}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraitementPage;
