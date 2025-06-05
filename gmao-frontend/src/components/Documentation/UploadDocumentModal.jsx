import { useState, useEffect, useCallback } from "react";
import { FaTimes, FaQrcode } from "react-icons/fa";
import QRCode from "react-qr-code";
import { documentAPI, equipmentAPI } from "../../services/api";
import { toast } from "react-hot-toast";
import "./Documentation.css";

const UploadDocumentModal = ({ isOpen, onClose, onSuccess }) => {
  const initialFormData = {
    title: "",
    description: "",
    category: "Manuel",
    equipment: "",
    file: null,
    qrCodeData: null,
    generateQR: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showQRCode, setShowQRCode] = useState(false);
  const [availableEquipments, setAvailableEquipments] = useState([]);
  const [isLoadingEquipments, setIsLoadingEquipments] = useState(false);
  const [loading, setLoading] = useState(false);
  const categories = ["Manuel", "Procédure", "Schéma", "Fiche technique", "Rapport"];

  // Charger les équipements sans documents
  const fetchEquipments = useCallback(async () => {
    try {
      console.log("=== DÉBUT DU CHARGEMENT DES ÉQUIPEMENTS ===");
      setIsLoadingEquipments(true);
      
      // 1. Récupérer tous les équipements non archivés
      console.log("1. Récupération des équipements...");
      const equipmentsRes = await equipmentAPI.getAllEquipments();
      console.log("Réponse brute des équipements:", equipmentsRes);
      
      // Vérifier et extraire les données des équipements
      const equipmentsData = equipmentsRes?.data?.data || equipmentsRes?.data || [];
      console.log("Données brutes des équipements:", equipmentsData);
      
      const allEquipments = Array.isArray(equipmentsData) 
        ? equipmentsData.filter(eq => eq && eq._id && eq.status !== 'archived')
        : [];
      
      console.log("Équipements non archivés:", allEquipments);
      
      // 2. Récupérer les documents existants
      console.log("\n2. Récupération des documents...");
      const documentsRes = await documentAPI.getAllDocuments();
      console.log("Réponse brute des documents:", documentsRes);
      
      // Vérifier et extraire les données des documents
      const documentsData = documentsRes?.data?.data || documentsRes?.data || [];
      console.log("Données brutes des documents:", documentsData);
      
      // 3. Identifier les équipements déjà documentés
      const equippedIds = new Set();
      
      if (Array.isArray(documentsData)) {
        documentsData.forEach(doc => {
          if (!doc) return;
          
          // Extraire l'ID de l'équipement selon la structure des données
          let equipmentId = null;
          
          if (typeof doc.equipment === 'string') {
            equipmentId = doc.equipment;
          } else if (doc.equipment?._id) {
            equipmentId = doc.equipment._id;
          } else if (doc.equipmentId) {
            equipmentId = doc.equipmentId;
          }
          
          if (equipmentId) {
            console.log(`Document ${doc._id} lié à l'équipement:`, equipmentId);
            equippedIds.add(equipmentId);
          } else {
            console.log(`Document ${doc._id} sans équipement associé`);
          }
        });
      }
      
      console.log("\n3. IDs des équipements avec document:", Array.from(equippedIds));
      
      // 4. Filtrer les équipements sans document
      const availableEquips = allEquipments.filter(
        eq => eq._id && !equippedIds.has(eq._id)
      );

      console.log("\n4. Équipements disponibles pour ajout de document:", availableEquips);
      
      // 5. Mettre à jour l'état
      setAvailableEquipments(availableEquips);
      
      // 6. Si aucun équipement disponible, afficher un message
      if (availableEquips.length === 0) {
        console.warn("Aucun équipement disponible pour ajouter un document");
        if (allEquipments.length > 0) {
          console.warn("Tous les équipements ont déjà un document associé");
        } else {
          console.warn("Aucun équipement trouvé dans la base de données");
        }
      }
      
    } catch (error) {
      console.error("Erreur lors du chargement des équipements:", error);
      toast.error("Erreur lors du chargement des équipements: " + (error.message || 'Veuillez réessayer'));
      setAvailableEquipments([]);
    } finally {
      setIsLoadingEquipments(false);
    }
  }, []);

  // Charger les équipements quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      fetchEquipments();
    } else {
      setFormData(initialFormData);
      setShowQRCode(false);
      setAvailableEquipments([]);
    }
  }, [isOpen, fetchEquipments]);

  // Générer un identifiant unique pour le QR code
  const generateQRCodeData = useCallback(() => {
    return `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }, []);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, files, checked, type } = e.target;

    setFormData((prev) => {
      const newData = { ...prev };

      if (name === "file" && files?.length > 0) {
        newData.file = files[0];
      } else if (name === "generateQR") {
        newData.generateQR = checked;
        newData.qrCodeData = checked ? generateQRCodeData() : null;
        setShowQRCode(checked);
      } else {
        newData[name] = type === "checkbox" ? checked : value;
      }

      return newData;
    });
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation des champs obligatoires
      if (!formData.title.trim()) {
        toast.error("Le titre est obligatoire");
        return;
      }
      if (!formData.category) {
        toast.error("La catégorie est obligatoire");
        return;
      }
      if (!formData.file) {
        toast.error("Veuillez sélectionner un fichier");
        return;
      }
      if (formData.equipment === '') {
        toast.error("Veuillez sélectionner un équipement");
        return;
      }

      // Préparer les données du formulaire
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title.trim());
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("category", formData.category);
      
      // Ajouter l'équipement s'il est sélectionné
      if (formData.equipment) {
        formDataToSend.append("equipment", formData.equipment);
      }
      
      // Ajouter le fichier
      formDataToSend.append("file", formData.file);
      
      // Ajouter le QR code si généré
      if (formData.qrCodeData) {
        formDataToSend.append("qrCodeData", formData.qrCodeData);
      }

      // Envoyer la requête
      const response = await documentAPI.upload(formDataToSend);
      
      if (response.data?.success) {
        toast.success("Document ajouté avec succès");
        onSuccess(response.data.data); // Passer les données du document créé
        onClose();
      } else {
        throw new Error(response.data?.message || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload du document:", error);
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de l'envoi du document";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="doc-modal-overlay" onClick={onClose}>
      <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="doc-modal-header">
          <h3>Ajouter un document</h3>
          <button type="button" className="doc-close-button" onClick={onClose} disabled={loading}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="doc-upload-form">
          <div className="doc-form-group">
            <label htmlFor="title">Titre du document *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="doc-form-control"
              required
              disabled={loading}
            />
          </div>

          <div className="doc-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="doc-form-control"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="doc-form-row">
            <div className="doc-form-group">
              <label htmlFor="category">Catégorie *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="doc-form-control"
                required
                disabled={loading}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="doc-form-group">
              <label htmlFor="equipment" className="doc-form-label">
                Équipement *
              </label>
              <select
                id="equipment"
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                className="doc-form-control"
                disabled={loading || isLoadingEquipments}
                required
                aria-required="true"
                aria-invalid={!formData.equipment}
              >
                <option value="">Sélectionner un équipement</option>
                {isLoadingEquipments ? (
                  <option disabled>Chargement des équipements...</option>
                ) : availableEquipments.length > 0 ? (
                  availableEquipments.map((eq) => (
                    <option key={eq._id} value={eq._id}>
                      {eq.reference ? `${eq.reference} - ` : ''}{eq.name || 'Sans nom'}
                    </option>
                  ))
                ) : (
                  <option disabled>
                    Tous les équipements ont déjà un document
                  </option>
                )}
              </select>
              {!isLoadingEquipments && availableEquipments.length === 0 && (
                <p className="doc-hint">
                  Tous les équipements ont déjà un document associé. Veuillez en ajouter un nouveau avant de pouvoir y associer un document.
                </p>
              )}
            </div>
          </div>

          <div className="doc-form-group">
            <label htmlFor="file" className="doc-file-upload-label">
              <span>{formData.file ? formData.file.name : 'Choisir un fichier...'}</span>
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleChange}
                className="doc-file-input"
                required
                disabled={loading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </label>
            
          </div>

          <div className="doc-form-check">
            <input
              type="checkbox"
              id="generateQR"
              name="generateQR"
              checked={formData.generateQR}
              onChange={handleChange}
              className="doc-form-check-input"
              disabled={loading || !formData.equipment}
            />
            <label htmlFor="generateQR" className="doc-form-check-label">
              Générer un QR code
            </label>
          </div>



          <div className="doc-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="doc-btn doc-btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button type="submit" className="doc-btn doc-btn-primary" disabled={loading}>
              {loading ? "Envoi en cours..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal;