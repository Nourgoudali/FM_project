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
import toast from 'react-hot-toast';

const TraitementPage = () => {
  const { isCollapsed } = useSidebar();
  const [traitements, setTraitements] = useState([]);
  const [loading, setLoading] = useState(true);
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
      toast.error("Impossible de charger la liste des traitements");
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
          toast.error("Impossible de charger les détails du traitement");
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
            toast.error("La commande spécifiée n'existe pas");
          }
        } catch (error) {
          toast.error("Impossible de charger les détails de la commande");
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
        toast.error("Impossible de charger la liste des commandes");
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
    <div className="traitement-container">
      <Sidebar isOpen={isCollapsed} />
      <div className="traitement-content">
        <Header title="Traitements de commande" />
        <main className="traitement-main">
            <div className="traitement-controls">
              <div className="traitement-search-filter-container">
                <div className="traitement-search-container">
                  <input
                    type="text"
                    placeholder="Rechercher par numéro, fournisseur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="traitement-search-input"
                  />
                </div>
                <div className="traitement-action-buttons">
                  <button 
                    className="traitement-add-button"
                    onClick={() => handleOpenAddModal()}
                  >
                    <FaPlus /> Ajouter un traitement
                  </button>
                </div>
              </div>
            </div>

            {/* Les messages d'erreur sont maintenant affichés avec des toasts */}

            {loading ? (
              <div className="traitement-loading-indicator">Chargement des traitements...</div>
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
                        <td>{traitement.commande?.fournisseur?.nomEntreprise || "Non défini"}</td>
                        <td>
                          {traitement.commande?.dateCommande
                            ? formatDate(traitement.commande.dateCommande)
                            : "N/A"}
                        </td>
                        <td>{formatDate(traitement.dateReception)}</td>
                        <td>
                          <div className="traitement-action-buttons">
                            <button
                              className="traitement-action-btn traitement-view"
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
          </main>
      </div>
    </div>
  );
};

export default TraitementPage;
