import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaFileExport, FaFilter, FaTimes, FaEye } from "react-icons/fa";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import "./CommandePage.css";
import AddCommandeForm from "../../components/Commande/AddCommandeForm";
import EditCommandeForm from "../../components/Commande/EditCommandeForm";
import DeleteCommandeConfirm from "../../components/Commande/DeleteCommandeConfirm";
import ViewCommandeDetails from "../../components/Commande/ViewCommandeDetails";
import { useSidebar } from "../../contexts/SidebarContext";
import { commandeAPI, fournisseurAPI } from "../../services/api";
import toast from "react-hot-toast";

const CommandePage = () => {
  const { sidebarOpen } = useSidebar();
  const [commandes, setCommandes] = useState([]);
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [currentCommande, setCurrentCommande] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "dateCommande", direction: "descending" });
  const [filters, setFilters] = useState({
    fournisseur: "all",
    devise: "all",
    dateDebut: "",
    dateFin: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [fournisseurs, setFournisseurs] = useState([]);

  // Chargement des données depuis l'API
  useEffect(() => {
    const fetchCommandes = async () => {
      setLoading(true);
      try {
        const response = await commandeAPI.getAllCommandes();
        setCommandes(response.data);
        setFilteredCommandes(response.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des commandes");
      } finally {
        setLoading(false);
      }
    };

    const fetchFournisseurs = async () => {
      try {
        const response = await fournisseurAPI.getAllFournisseurs();
        setFournisseurs(response.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des fournisseurs");
      }
    };

    fetchCommandes();
    fetchFournisseurs();
  }, []);

  // Filtrer les commandes en fonction du terme de recherche et des filtres
  useEffect(() => {
    let result = commandes;

    // Filtre par terme de recherche
    if (searchTerm) {
      result = result.filter(
        (commande) =>
          commande.numeroCommande?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          commande.fournisseur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          commande.numeroBL?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par fournisseur
    if (filters.fournisseur !== "all") {
      result = result.filter((commande) => commande.fournisseur?._id === filters.fournisseur);
    }

    // Filtre par devise
    if (filters.devise !== "all") {
      result = result.filter((commande) => commande.devise === filters.devise);
    }

    // Filtre par date de début
    if (filters.dateDebut) {
      const dateDebut = new Date(filters.dateDebut);
      result = result.filter((commande) => new Date(commande.dateCommande) >= dateDebut);
    }

    // Filtre par date de fin
    if (filters.dateFin) {
      const dateFin = new Date(filters.dateFin);
      dateFin.setHours(23, 59, 59, 999); // Fin de journée
      result = result.filter((commande) => new Date(commande.dateCommande) <= dateFin);
    }

    // Tri des résultats
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          let aValue = a;
          let bValue = b;
          
          for (const key of keys) {
            aValue = aValue?.[key];
            bValue = bValue?.[key];
          }
          
          if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        } else {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }
      });
    }

    setFilteredCommandes(result);
  }, [commandes, searchTerm, filters, sortConfig]);

  // Fonction pour trier les commandes
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      fournisseur: "all",
      devise: "all",
      dateDebut: "",
      dateFin: "",
    });
    setSearchTerm("");
    setShowFilters(false);
  };

  // Fonctions pour gérer les formulaires
  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleEditClick = (commande) => {
    setCurrentCommande(commande);
    setShowEditForm(true);
  };

  const handleViewClick = (commande) => {
    setCurrentCommande(commande);
    setShowViewDetails(true);
  };

  const handleDeleteClick = (commande) => {
    setCurrentCommande(commande);
    setShowDeleteConfirm(true);
  };

  const handleAddSuccess = (newCommande) => {
    setCommandes([...commandes, newCommande]);
    setShowAddForm(false);
  };

  const handleEditSuccess = (updatedCommande) => {
    setCommandes(
      commandes.map((commande) =>
        commande._id === updatedCommande._id ? updatedCommande : commande
      )
    );
    setShowEditForm(false);
    setCurrentCommande(null);
  };

  const handleDeleteSuccess = (deletedId) => {
    setCommandes(commandes.filter((commande) => commande._id !== deletedId));
    setShowDeleteConfirm(false);
    setCurrentCommande(null);
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="commande-management-container">
      <Sidebar />
      <div className="commande-management-content">
        <Header title="Gestion des Commandes" />

        <main className="commande-management-main">
          <div className="commande-controls">
            <div className="commande-search-filter-container">
              <div className="commande-search-container">
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="commande-search-input"
                />
                <button
                  className="commande-filter-button"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter />
                </button>
              </div>

              <div className="commande-action-buttons">
                <button className="commande-add-button" onClick={handleAddClick}>
                  <FaPlus /> Ajouter une commande
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="commande-filters-container">
                <div className="commande-filters-header">
                  <h3>Filtres</h3>
                  <button
                    className="commande-close-filters-button"
                    onClick={() => setShowFilters(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="commande-filters-body">
                  <div className="commande-filter-group">
                    <label>Fournisseur:</label>
                    <select
                      value={filters.fournisseur}
                      onChange={(e) =>
                        setFilters({ ...filters, fournisseur: e.target.value })
                      }
                    >
                      <option value="all">Tous</option>
                      {fournisseurs.map((fournisseur) => (
                        <option key={fournisseur._id} value={fournisseur._id}>
                          {fournisseur.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="commande-filter-group">
                    <label>Devise:</label>
                    <select
                      value={filters.devise}
                      onChange={(e) =>
                        setFilters({ ...filters, devise: e.target.value })
                      }
                    >
                      <option value="all">Toutes</option>
                      <option value="MAD">MAD</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div className="commande-filter-actions">
                    <button
                      className="commande-reset-filters-button"
                      onClick={resetFilters}
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="commande-loading">Chargement des commandes...</div>
          ) : (
            <div className="commande-table-container">
              <div className="commande-table-wrapper">
                <table className="commande-table">
                  <thead>
                    <tr>
                      <th onClick={() => requestSort("numeroCommande")}>
                        N° Commande
                        {sortConfig.key === "numeroCommande" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "ascending" ? " ▲" : " ▼"}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort("fournisseur.nom")}>
                        Fournisseur
                        {sortConfig.key === "fournisseur.nom" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "ascending" ? " ▲" : " ▼"}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort("devise")}>
                        Devise
                        {sortConfig.key === "devise" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "ascending" ? " ▲" : " ▼"}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort("tva")}>
                        TVA (%)
                        {sortConfig.key === "tva" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "ascending" ? " ▲" : " ▼"}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort("numeroBL")}>
                        N° BL
                        {sortConfig.key === "numeroBL" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "ascending" ? " ▲" : " ▼"}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort("dateCommande")}>
                        Date de commande
                        {sortConfig.key === "dateCommande" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "ascending" ? " ▲" : " ▼"}
                          </span>
                        )}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCommandes.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-data">
                          Aucune commande trouvée
                        </td>
                      </tr>
                    ) : (
                      filteredCommandes.map((commande) => (
                        <tr key={commande._id}>
                          <td>{commande.numeroCommande}</td>
                          <td>{commande.fournisseur?.nom || "Non défini"}</td>
                          <td>{commande.devise}</td>
                          <td>{commande.tva}%</td>
                          <td>{commande.numeroBL || "-"}</td>
                          <td>{formatDate(commande.dateCommande)}</td>
                          <td className="cmd-actions-cell">
                            <div className="cmd-action-buttons-container">
                              <button
                                className="cmd-view-button"
                                onClick={() => handleViewClick(commande)}
                                title="Voir les détails"
                              >
                                <FaEye />
                              </button>
                              <button
                                className="cmd-edit-button"
                                onClick={() => handleEditClick(commande)}
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="cmd-delete-button-icon"
                                onClick={() => handleDeleteClick(commande)}
                                title="Supprimer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Formulaires modaux */}
      {showAddForm && (
        <AddCommandeForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddSuccess}
          fournisseurs={fournisseurs}
        />
      )}

      {showEditForm && currentCommande && (
        <EditCommandeForm
          commande={currentCommande}
          onClose={() => {
            setShowEditForm(false);
            setCurrentCommande(null);
          }}
          onSuccess={handleEditSuccess}
          fournisseurs={fournisseurs}
        />
      )}

      {showDeleteConfirm && currentCommande && (
        <DeleteCommandeConfirm
          commande={currentCommande}
          onClose={() => setShowDeleteConfirm(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}

      {showViewDetails && currentCommande && (
        <ViewCommandeDetails
          commande={currentCommande}
          onClose={() => setShowViewDetails(false)}
        />
      )}
    </div>
  );
};

export default CommandePage;
