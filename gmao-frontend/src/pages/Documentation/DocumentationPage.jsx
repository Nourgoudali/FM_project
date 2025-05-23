"use client"

import React, { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import Modal from "../../components/Modal/Modal"
import "./DocumentationPage.css"
import { useSidebar } from "../../contexts/SidebarContext"
import { documentAPI } from "../../services/api"

const DocumentationPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "Manuel",
    equipment: "",
    file: null,
  })
  // Nouveaux états pour les modals
  const [showQRModal, setShowQRModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentDocument, setCurrentDocument] = useState(null)

  // Catégories de documents
  const categories = ["Manuel", "Procédure", "Schéma", "Fiche technique", "Rapport"]

  // Équipements (normalement récupérés depuis l'API)
  const equipments = [
    { id: 1, name: "Pompe P-10" },
    { id: 2, name: "Compresseur Ref.C-123" },
    { id: 3, name: "Moteur M-405" },
    { id: 4, name: "Convoyeur CV-200" },
    { id: 5, name: "Chaudière CH-100" },
  ]

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // Utiliser l'API pour récupérer les documents
        const response = await documentAPI.getAllDocuments();
        
        if (response && response.data) {
          setDocuments(response.data);
          setFilteredDocuments(response.data);
        } else {
          // Simuler les données pour la démo seulement si l'API échoue
          const mockDocuments = [
            {
              id: 1,
              title: "Manuel d'utilisation Pompe P-10",
              description: "Instructions détaillées pour l'utilisation et l'entretien de la pompe P-10",
              category: "Manuel",
              equipment: "Pompe P-10",
              uploadDate: "2024-01-10",
              uploadedBy: "Thomas Martin",
              fileSize: "2.4 MB",
              fileType: "PDF",
              qrCode: true,
            },
            {
              id: 2,
              title: "Schéma électrique Compresseur C-123",
              description: "Schéma détaillé des connexions électriques du compresseur",
              category: "Schéma",
              equipment: "Compresseur Ref.C-123",
              uploadDate: "2024-01-15",
              uploadedBy: "Marie Dupont",
              fileSize: "1.8 MB",
              fileType: "PDF",
              qrCode: true,
            },
            {
              id: 3,
              title: "Procédure de maintenance préventive",
              description: "Procédure standard pour les opérations de maintenance préventive",
              category: "Procédure",
              equipment: "",
              uploadDate: "2023-12-05",
              uploadedBy: "Jean Dupont",
              fileSize: "1.2 MB",
              fileType: "DOCX",
              qrCode: false,
            },
            {
              id: 4,
              title: "Fiche technique Moteur M-405",
              description: "Spécifications techniques complètes du moteur M-405",
              category: "Fiche technique",
              equipment: "Moteur M-405",
              uploadDate: "2023-11-20",
              uploadedBy: "Pierre Durand",
              fileSize: "3.5 MB",
              fileType: "PDF",
              qrCode: true,
            },
            {
              id: 5,
              title: "Rapport d'inspection Convoyeur CV-200",
              description: "Résultats de l'inspection annuelle du convoyeur CV-200",
              category: "Rapport",
              equipment: "Convoyeur CV-200",
              uploadDate: "2024-01-05",
              uploadedBy: "Sophie Lefebvre",
              fileSize: "4.2 MB",
              fileType: "PDF",
              qrCode: false,
            },
          ]

          setDocuments(mockDocuments)
          setFilteredDocuments(mockDocuments)
        }
        setLoading(false)
      } catch (error) {
        console.error("Erreur lors du chargement des documents:", error)
        setError("Impossible de charger les documents")
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  useEffect(() => {
    // Filtrer les documents en fonction de la recherche et de la catégorie
    const filtered = documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.equipment.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = filterCategory === "all" || doc.category === filterCategory

      return matchesSearch && matchesCategory
    })

    setFilteredDocuments(filtered)
  }, [searchTerm, filterCategory, documents])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value)
  }

  const handleUploadFormChange = (e) => {
    const { name, value, files } = e.target
    if (name === "file" && files.length > 0) {
      setUploadForm({
        ...uploadForm,
        file: files[0],
      })
    } else {
      setUploadForm({
        ...uploadForm,
        [name]: value,
      })
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Créer un objet FormData pour l'upload du fichier
      const documentData = {
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        equipment: uploadForm.equipment,
      };

      // Appel à l'API pour créer un nouveau document
      const response = await documentAPI.createDocument(documentData, uploadForm.file);
      
      if (response && response.data) {
        // Ajouter le nouveau document à la liste
        setDocuments([...documents, response.data]);
        setShowUploadModal(false);
        // Réinitialiser le formulaire
        setUploadForm({
          title: "",
          description: "",
          category: "Manuel",
          equipment: "",
          file: null,
        });
      } else {
        // Fallback si l'API échoue
        const newDocument = {
          id: documents.length + 1,
          title: uploadForm.title,
          description: uploadForm.description,
          category: uploadForm.category,
          equipment: uploadForm.equipment,
          uploadDate: new Date().toISOString().split("T")[0],
          uploadedBy: "Thomas Martin", // Normalement récupéré depuis le contexte d'authentification
          fileSize: "1.0 MB", // Normalement calculé à partir du fichier
          fileType: uploadForm.file ? uploadForm.file.name.split(".").pop().toUpperCase() : "PDF",
          qrCode: true,
        };

        setDocuments([...documents, newDocument]);
        setShowUploadModal(false);
        setUploadForm({
          title: "",
          description: "",
          category: "Manuel",
          equipment: "",
          file: null,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'upload du document:", error)
      setError("Impossible d'uploader le document")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQRCode = async (documentId) => {
    try {
      // Dans un environnement réel, vous appelleriez l'API pour générer un QR code
      // Par exemple: await documentAPI.generateQRCode(documentId);
      
      // Pour la démo, on simule la génération
      const updatedDocuments = documents.map((doc) => {
        if (doc.id === documentId) {
          return { ...doc, qrCode: true }
        }
        return doc
      })

      setDocuments(updatedDocuments)
    } catch (error) {
      console.error("Erreur lors de la génération du QR code:", error);
      alert("Erreur lors de la génération du QR code");
    }
  }

  const handleShowQRCode = (document) => {
    setCurrentDocument(document)
    setShowQRModal(true)
  }

  const handleDownloadDocument = async (document) => {
    try {
      // Appel à l'API pour télécharger le document
      const response = await documentAPI.downloadDocument(document.id);
      
      // Créer un objet URL pour le blob reçu
      const url = window.URL.createObjectURL(response.data);
      
      // Créer un lien temporaire pour le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.title); // Nom du fichier à télécharger
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors du téléchargement du document:", error);
      alert(`Erreur lors du téléchargement de "${document.title}"`);
    }
  }

  const handleOpenDeleteModal = (document) => {
    setCurrentDocument(document)
    setShowDeleteModal(true)
  }

  const handleDeleteDocument = async () => {
    if (!currentDocument) return;
    
    try {
      // Appel à l'API pour supprimer le document
      await documentAPI.deleteDocument(currentDocument.id);
      
      // Mettre à jour la liste des documents
      const updatedDocuments = documents.filter((doc) => doc.id !== currentDocument.id);
      setDocuments(updatedDocuments);
      setShowDeleteModal(false);
      setCurrentDocument(null);
    } catch (error) {
      console.error("Erreur lors de la suppression du document:", error);
      setError("Impossible de supprimer le document");
    }
  }

  return (
    <div className="documentation-container">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="documentation-content">
        <Header title="Documentation" onToggleSidebar={toggleSidebar} />
        
        <main className="documentation-main">
          {/* Actions Bar */}
          <div className="actions-bar">
            <div className="search-container">
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>

            <div className="filters-container">
              <div className="filter-select">
                <select value={filterCategory} onChange={handleCategoryChange} className="select-input">
                  <option value="all">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={`cat-${category.toLowerCase().replace(/\s+/g, '-')}`} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <span className="select-icon"></span>
              </div>

              <button className="btn btn-primary upload-btn" onClick={() => setShowUploadModal(true)}>
                <span className="btn-icon icon-upload"></span>
                Ajouter un document
              </button>
            </div>
          </div>

          {/* Documents Grid */}
          {loading ? (
            <div className="loading-indicator">Chargement des documents...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="documents-grid">
              {filteredDocuments.length === 0 ? (
                <div className="no-results">Aucun document trouvé</div>
              ) : (
                filteredDocuments.map((document) => (
                  <div key={document._id || document.id || `doc-${document.title.toLowerCase().replace(/\s+/g, '-')}`} className="document-card">
                    <div className="document-header">
                      <div className="document-icon">
                        <span className={`file-icon file-${document.fileType.toLowerCase()}`}></span>
                      </div>
                      <div className="document-actions">
                        <button 
                          className="action-btn download-btn" 
                          title="Télécharger"
                          onClick={() => handleDownloadDocument(document)}
                        >
                          <span className="icon-download"></span>
                        </button>
                        {document.qrCode ? (
                          <button
                            className="action-btn qr-btn"
                            title="Voir le QR Code"
                            onClick={() => handleShowQRCode(document)}
                          >
                            <span className="icon-qrcode"></span>
                          </button>
                        ) : (
                          <button
                            className="action-btn generate-qr-btn"
                            title="Générer un QR Code"
                            onClick={() => handleGenerateQRCode(document.id)}
                          >
                            <span className="icon-qrcode"></span>
                          </button>
                        )}
                        <button
                          className="action-btn delete-btn"
                          title="Supprimer"
                          onClick={() => handleOpenDeleteModal(document)}
                        >
                          <span className="icon-delete"></span>
                        </button>
                      </div>
                    </div>

                    <div className="document-content">
                      <h3 className="document-title">{document.title}</h3>
                      <p className="document-description">{document.description}</p>
                    </div>

                    <div className="document-footer">
                      <div className="document-meta">
                        <span className="document-category">{document.category}</span>
                        {document.equipment && <span className="document-equipment">{document.equipment}</span>}
                      </div>
                      <div className="document-info">
                        <div className="info-item">
                          <span className="info-label">Taille:</span>
                          <span className="info-value">{document.fileSize}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Ajouté le:</span>
                          <span className="info-value">{document.uploadDate}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Par:</span>
                          <span className="info-value">{document.uploadedBy}</span>
                        </div>
                      </div>
                      {document.qrCode && (
                        <div className="qr-code-container">
                          <div className="qr-code-preview"></div>
                          <button 
                            className="btn btn-small"
                            onClick={() => handleShowQRCode(document)}
                          >
                            Voir QR Code
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">Ajouter un document</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="upload-form">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Titre
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleUploadFormChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={uploadForm.description}
                  onChange={handleUploadFormChange}
                  className="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={uploadForm.category}
                    onChange={handleUploadFormChange}
                    className="form-control"
                  >
                    {categories.map((category) => (
                      <option key={`cat-${category.toLowerCase().replace(/\s+/g, '-')}`} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="equipment" className="form-label">
                    Équipement (optionnel)
                  </label>
                  <select
                    id="equipment"
                    name="equipment"
                    value={uploadForm.equipment}
                    onChange={handleUploadFormChange}
                    className="form-control"
                  >
                    <option value="">Aucun</option>
                    {equipments.map((equipment) => (
                      <option key={`equip-${equipment._id || equipment.id}`} value={equipment.name}>
                        {equipment.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="file" className="form-label">
                  Fichier
                </label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={handleUploadFormChange}
                    className="file-input"
                    required
                  />
                  <div className="file-upload-box">
                    <span className="icon-upload"></span>
                    <span className="upload-text">
                      {uploadForm.file ? uploadForm.file.name : "Glissez votre fichier ici ou cliquez pour parcourir"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <input type="checkbox" id="generateQR" className="checkbox-input" defaultChecked />
                <label htmlFor="generateQR" className="checkbox-label">
                  Générer un QR code pour ce document
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowUploadModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Chargement..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <Modal 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)} 
        title="Code QR du document"
        size="small"
      >
        {currentDocument && (
          <div className="qr-code-modal-content">
            <div className="qr-code-display">
              <div className="qr-code-image">
                {/* Simuler un QR code avec un div */}
                <div className="qr-code-placeholder">
                  <div className="qr-squares">
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                    <div className="qr-square"></div>
                  </div>
                </div>
              </div>
              <div className="qr-code-info">
                <h3>{currentDocument.title}</h3>
                <p>Scannez ce code QR pour accéder directement au document.</p>
              </div>
            </div>
            <div className="qr-code-actions">
              <button className="btn btn-outline" onClick={() => setShowQRModal(false)}>
                Fermer
              </button>
              <button className="btn btn-primary">
                Télécharger le QR code
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        title="Confirmer la suppression" 
        size="small"
      >
        {currentDocument && (
          <div className="delete-confirmation">
            <p>Êtes-vous sûr de vouloir supprimer ce document ?</p>
            <p><strong>{currentDocument.title}</strong></p>
            <p>Cette action est irréversible.</p>
            
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </button>
              <button className="btn btn-danger" onClick={handleDeleteDocument}>
                Supprimer
              </button>
            </div>
          </div>
        )}
      </Modal>
      
    </div>
  )
}

export default DocumentationPage
