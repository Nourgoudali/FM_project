"use client"

import React, { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import Modal from "../../components/Modal/Modal"
import "./DocumentationPage.css"
import { useSidebar } from "../../contexts/SidebarContext"
import { documentAPI, equipmentAPI, API } from "../../services/api"
import toast from "react-hot-toast"

const DocumentationPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "Manuel",
    equipment: "",
    file: null,
    fileUrl: "", // Ajout du champ fileUrl
  })
  // Nouveaux états pour les modals
  const [showQRModal, setShowQRModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentDocument, setCurrentDocument] = useState(null)

  // Catégories de documents
  const categories = ["Manuel", "Procédure", "Schéma", "Fiche technique", "Rapport"]

  // Équipements (récupérés depuis l'API)
  const [equipments, setEquipments] = useState([])

  // Récupérer les équipements au chargement
  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const response = await equipmentAPI.getAllEquipments();
        if (response && response.data) {
          setEquipments(response.data);
        }
      } catch (error) {
        toast.error("Erreur lors de la récupération des équipements");
      }
    };
    fetchEquipments();
  }, [])

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
        toast.error("Impossible de charger les documents")
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
      const file = files[0]
      if (file.size > 0) { // Vérifier que le fichier n'est pas vide
        setUploadForm({
          ...uploadForm,
          file,
          fileUrl: file.name // Mettre à jour le fileUrl immédiatement
        })
      }
    } else if (name === "equipment") {
      // Store only the equipment ID when selected
      setUploadForm({
        ...uploadForm,
        equipment: value || null,
      })
    } else if (name === "generateQR") {
      // Handle QR code checkbox
      setUploadForm({
        ...uploadForm,
        generateQR: value === "on",
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

    try {
      // Vérifier que tous les champs requis sont remplis
      if (!uploadForm.title.trim() || !uploadForm.category) {
        toast.error("Veuillez remplir tous les champs obligatoires")
        setLoading(false)
        return
      }

      // Vérifier le fichier
      if (!uploadForm.file && !uploadForm.fileUrl) {
        toast.error("Veuillez sélectionner un fichier ou fournir une URL")
        setLoading(false)
        return
      }

      // Préparer les données du document
      const documentData = {
        title: uploadForm.title.trim(),
        description: uploadForm.description || '',
        category: uploadForm.category,
        equipment: uploadForm.equipment || null,
        fileUrl: uploadForm.file.name,
        qrCode: uploadForm.generateQR || false
      };

      try {
        const response = await documentAPI.uploadDocument(documentData, uploadForm.file);
        
        if (!response) {
          throw new Error('Réponse API invalide');
        }

        // Vérifier si c'est une erreur
        if (response.error) {
          throw new Error(response.error.message || 'Erreur lors de l\'upload');
        }

        // Vérifier si c'est une réponse réussie
        if (response.data) {
          // Ajouter le nouveau document à la liste
          setDocuments(prevDocs => [...prevDocs, response.data]);
          setShowUploadModal(false);
          // Réinitialiser le formulaire
          setUploadForm({
            title: "",
            description: "",
            category: "Manuel",
            equipment: "",
            file: null,
            generateQR: false
          });
        } else {
          throw new Error('Réponse invalide du serveur');
        }
      } catch (error) {
        console.error("Erreur détaillée:", error);
        throw new Error(error.message || 'Erreur lors de l\'upload du document');
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'upload du document")
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
      toast.error("Une erreur est survenue lors de la génération du QR code")
    }
  }

  const handleShowQRCode = (document) => {
    setCurrentDocument(document)
    setShowQRModal(true)
  }

  const handleDownloadQRCode = async (document) => {
    try {
      // Simuler le téléchargement du QR code
      // Dans une vraie application, vous devriez appeler une API pour générer le QR code
      const qrCodeData = await documentAPI.generateQRCode(document._id);
      
      // Créer un lien de téléchargement pour le QR code
      const link = document.createElement('a');
      link.href = qrCodeData.url; // URL du QR code généré
      link.download = `${document.title}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Une erreur est survenue lors du téléchargement du QR code")
    }
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
      toast.error(`Une erreur est survenue lors du téléchargement de "${document.title}"`)
    }
  }

  const handleOpenDeleteModal = (document) => {
    if (!document || !document._id) {
      toast.error("Document invalide")
      return;
    }
    setCurrentDocument(document)
    setShowDeleteModal(true)
  }

  const handleDeleteDocument = async () => {
    if (!currentDocument || !currentDocument._id) {
      toast.error("Document non sélectionné")
      return;
    }
    
    try {
      // Appel à l'API pour supprimer le document
      await documentAPI.deleteDocument(currentDocument._id);
      
      // Mettre à jour la liste des documents
      const updatedDocuments = documents.filter((doc) => doc._id !== currentDocument._id);
      setDocuments(updatedDocuments);
      setShowDeleteModal(false);
      setCurrentDocument(null);
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression du document")
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
          ) : (
            <div className="documents-grid">
              {filteredDocuments.length === 0 ? (
                <div className="no-results">Aucun document trouvé</div>
              ) : (
                filteredDocuments.map((document) => (
                  <div key={document._id || `doc-${(document.title || 'document').toLowerCase().replace(/\s+/g, '-')}`} className="document-card">
                    <div className="document-header">
                      <div className="document-icon">
                        <span className={`file-icon file-${(document.fileType || 'pdf').toLowerCase()}`}></span>
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
                        {document.equipment && <span className="document-equipment">{document.equipment.name}</span>}
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
                          <span className="info-value">{document.uploadedBy ? `${document.uploadedBy.firstName} ${document.uploadedBy.lastName}` : 'Utilisateur inconnu'}</span>
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
                    value={uploadForm.equipment ? uploadForm.equipment._id : ""}
                    onChange={handleUploadFormChange}
                    className="form-select"
                  >
                    <option value="">Aucun équipement</option>
                    {equipments.map((equipment) => (
                      <option key={equipment._id} value={equipment._id}>
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
                <input 
                  type="checkbox" 
                  id="generateQR" 
                  name="generateQR" 
                  className="checkbox-input" 
                  checked={uploadForm.generateQR || false}
                  onChange={handleUploadFormChange}
                />
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
              <button className="btn btn-primary" onClick={() => handleDownloadQRCode(currentDocument)}>
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
