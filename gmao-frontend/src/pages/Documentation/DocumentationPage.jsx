import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEye, FaDownload } from "react-icons/fa";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import UploadDocumentModal from "../../components/Documentation/UploadDocumentModal";
import ViewQRCodeModal from "../../components/Documentation/ViewQRCodeModal";
import DeleteDocumentModal from "../../components/Documentation/DeleteDocumentModal";
import "./DocumentationPage.css";
import { useSidebar } from "../../contexts/SidebarContext";
import { documentAPI, equipmentAPI } from "../../services/api";
import { toast } from "react-hot-toast";

const DocumentationPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const categories = ["Manuel", "Procédure", "Schéma", "Fiche technique", "Rapport"];
  const [sortConfig, setSortConfig] = useState({ key: "title", direction: "ascending" });

  // Récupérer tous les documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await documentAPI.getAllDocuments();
        // Vérification et normalisation des données
        const docs = Array.isArray(response?.data?.data) 
          ? response.data.data.filter(doc => doc && doc._id) // Filtrer les documents invalides
          : [];
        setDocuments(docs);
        setFilteredDocuments(docs);
      } catch (error) {
        console.error("Erreur lors de la récupération des documents:", error);
        toast.error("Impossible de charger les documents");
        setDocuments([]);
        setFilteredDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  // Filtrer et trier les documents
  useEffect(() => {
    try {
      let filtered = documents
        .filter(doc => {
          if (!doc || !doc._id) return false; // Ignorer les documents invalides
          
          const searchTermLower = searchTerm.toLowerCase();
          const titleMatch = doc.title?.toLowerCase().includes(searchTermLower) || false;
          const descMatch = doc.description?.toLowerCase().includes(searchTermLower) || false;
          const equipMatch = doc.equipment?.name?.toLowerCase().includes(searchTermLower) || false;
          
          const matchesSearch = titleMatch || descMatch || equipMatch;
          const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
          
          return matchesSearch && matchesCategory;
        });

      // Appliquer le tri
      filtered.sort((a, b) => {
        try {
          const key = sortConfig.key;
          const direction = sortConfig.direction === "ascending" ? 1 : -1;
          
          let valueA, valueB;
          
          if (key === "equipment") {
            valueA = a.equipment?.name?.toString()?.toLowerCase() || "";
            valueB = b.equipment?.name?.toString()?.toLowerCase() || "";
          } else {
            valueA = a[key]?.toString()?.toLowerCase() || "";
            valueB = b[key]?.toString()?.toLowerCase() || "";
          }
          
          return valueA.localeCompare(valueB) * direction;
        } catch (err) {
          console.error("Erreur lors du tri:", err);
          return 0;
        }
      });

      setFilteredDocuments(filtered);
    } catch (error) {
      console.error("Erreur lors du filtrage des documents:", error);
      setFilteredDocuments([]);
    }
  }, [searchTerm, filterCategory, documents, sortConfig]);

  // Gestion des changements de recherche
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Gestion du changement de catégorie
  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value);
  };

  // Gestion de l'ajout d'un document
  const handleDocumentUploaded = (newDocument) => {
    setDocuments((prevDocs) => [...prevDocs, newDocument]);
    setShowUploadModal(false);
  };

  // Gestion de l'affichage des détails du document
  const handleViewDocument = (doc) => {
    if (!doc) {
      toast.error("Document non trouvé");
      return;
    }
    setCurrentDocument(doc);
    setShowDocumentModal(true);
  };

  // Téléchargement du document
  const handleDownloadDocument = async (doc) => {
    try {
      const response = await fetch(doc.fileUrl, {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") || "{}").token}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.title);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error(`Erreur lors du téléchargement de "${doc?.title || 'ce document'}"`);
    }
  };

  // Gestion de l'ouverture du modal de suppression
  const handleOpenDeleteModal = (document) => {
    if (!document?._id) {
      toast.error("Document invalide");
      return;
    }
    setCurrentDocument(document);
    setShowDeleteModal(true);
  };

  // Gestion de la suppression d'un document
  const handleDocumentDeleted = (deletedDocumentId) => {
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc._id !== deletedDocumentId));
    setShowDeleteModal(false);
    toast.success("Document supprimé avec succès");
  };

  // Gestion du tri
  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  // Rendu des modals
  const renderModals = () => (
    <>
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleDocumentUploaded}
      />
      {/* Modal de détail du document */}
      <ViewQRCodeModal
        isOpen={!!currentDocument && showDocumentModal}
        document={currentDocument}
        onClose={() => setShowDocumentModal(false)}
        onDownload={handleDownloadDocument}
      />
      <DeleteDocumentModal
        isOpen={showDeleteModal}
        document={currentDocument}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleDocumentDeleted}
      />
    </>
  );

  return (
    <div className="doc-documentation-container">
      <Sidebar isOpen={sidebarOpen} />
      <div className="doc-documentation-content">
        <Header title="Documentation" onToggleSidebar={toggleSidebar} />
        <main className="doc-documentation-main">
          <div className="doc-header-actions">
            <div className="doc-search-container">
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="doc-search-input"
              />
            </div>
            <div className="doc-actions">
              <select
                value={filterCategory}
                onChange={handleCategoryChange}
                className="doc-select-input"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button
                className="doc-add-button"
                onClick={() => setShowUploadModal(true)}
                disabled={loading}
              >
                <FaPlus className="doc-button-icon" />
                Ajouter un document
              </button>
            </div>
          </div>

          {loading ? (
            <div className="doc-loading">Chargement des documents...</div>
          ) : (
            <div className="doc-table-container">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort("reference")}>
                      Référence
                    </th>
                    <th onClick={() => requestSort("title")}>
                      Titre
                      {sortConfig.key === "title" && (
                        <span>{sortConfig.direction === "ascending" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                    <th onClick={() => requestSort("category")}>
                      Catégorie
                      {sortConfig.key === "category" && (
                        <span>{sortConfig.direction === "ascending" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                    <th onClick={() => requestSort("equipment")}>
                      Équipement
                      {sortConfig.key === "equipment" && (
                        <span>{sortConfig.direction === "ascending" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="doc-no-data">
                        Aucun document trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map((document) => (
                      <tr key={document._id}>
                        <td className="doc-title">{document.reference}</td>
                        <td className="doc-title">{document.title}</td>
                        <td className="doc-category">
                          <span className="doc-category-badge">{document.category}</span>
                        </td>
                        <td className="doc-equipment">{document.equipment?.name || "-"}</td>
                        <td className="doc-actions-cell">
                          <div className="doc-action-buttons">
                            <button
                              className="doc-view-button view"
                              onClick={() => handleViewDocument(document)}
                              title="Voir les détails"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="doc-delete-button"
                              onClick={() => handleOpenDeleteModal(document)}
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
          )}
        </main>
      </div>
      {renderModals()}
    </div>
  );
};

export default DocumentationPage;