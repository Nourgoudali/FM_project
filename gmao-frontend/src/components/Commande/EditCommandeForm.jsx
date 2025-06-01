import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { commandeAPI, stockAPI } from "../../services/api";
import "./CommandeForm.css";

const EditCommandeForm = ({ commande, onClose, onSuccess, fournisseurs }) => {
  const [formData, setFormData] = useState({
    fournisseur: commande.fournisseur?._id || "",
    devise: commande.devise || "MAD",
    tva: commande.tva || 20,
    numeroBL: commande.numeroBL || "",
  });
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({
    produit: "",
    quantiteSouhaitee: "",
    quantiteMinCommande: "",
    prixUnitaire: "",
    remise: ""
  });

  // Charger les articles de stock et initialiser les produits sélectionnés
  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const response = await stockAPI.getAllStocks();
        setStockItems(response.data);
        
        // Initialiser les produits sélectionnés à partir de la commande existante
        if (commande.produits && commande.produits.length > 0) {
          const initialProducts = await Promise.all(commande.produits.map(async (product) => {
            // Si le produit est déjà peuplé
            if (product.produit && typeof product.produit === 'object') {
              return {
                ...product,
                produit: product.produit._id,
                nom: product.produit.name,
                reference: product.produit.reference
              };
            } 
            // Si le produit n'est qu'un ID, chercher les détails dans les articles de stock
            else {
              const stockItem = response.data.find(item => item._id === product.produit);
              return {
                ...product,
                nom: stockItem ? stockItem.name : "Produit inconnu",
                reference: stockItem ? stockItem.reference : "N/A"
              };
            }
          }));
          setSelectedProducts(initialProducts);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des articles de stock:", error);
        setError("Impossible de charger les articles de stock.");
      }
    };

    fetchStockItems();
  }, [commande]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "produit") {
      const selectedStock = stockItems.find(item => item._id === value);
      if (selectedStock) {
        setCurrentProduct({
          ...currentProduct,
          produit: value,
          prixUnitaire: selectedStock.prixUnitaire,
          quantiteMinCommande: selectedStock.stockMin
        });
      } else {
        setCurrentProduct({
          ...currentProduct,
          [name]: value
        });
      }
    } else {
      // Valider que la valeur est numérique
      if (name === "quantiteSouhaitee" || name === "quantiteMinCommande" || name === "prixUnitaire" || name === "remise") {
        // Accepter uniquement les chiffres et le point décimal
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
          setCurrentProduct({
            ...currentProduct,
            [name]: value === "" ? "" : name === "remise" || name === "prixUnitaire" ? value : value
          });
        }
      } else {
        setCurrentProduct({
          ...currentProduct,
          [name]: value
        });
      }
    }
  };
  
  // Fonction pour convertir les valeurs de texte en nombres lors de l'ajout du produit
  const getNumericValue = (value) => {
    // S'assurer que value est une chaîne de caractères
    const strValue = String(value);
    if (strValue === "") return 0;
    return strValue.includes(".") ? parseFloat(strValue) : parseInt(strValue, 10);
  };

  const addProductToList = () => {
    if (!currentProduct.produit) {
      setError("Veuillez sélectionner un produit.");
      return;
    }

    // Convertir les valeurs de texte en nombres
    const quantiteSouhaitee = getNumericValue(currentProduct.quantiteSouhaitee);
    const quantiteMinCommande = getNumericValue(currentProduct.quantiteMinCommande);
    const prixUnitaire = getNumericValue(currentProduct.prixUnitaire);
    const remise = getNumericValue(currentProduct.remise);

    if (quantiteSouhaitee <= 0) {
      setError("La quantité souhaitée doit être supérieure à 0.");
      return;
    }

    const selectedStock = stockItems.find(item => item._id === currentProduct.produit);
    if (!selectedStock) {
      setError("Produit non trouvé.");
      return;
    }
    
    // Vérifier si la quantité souhaitée est inférieure à la quantité minimale à commander
    if (quantiteSouhaitee < quantiteMinCommande) {
      setError(`Vous devez commander au moins ${quantiteMinCommande} unités de ce produit.`);
      return;
    }

    // Calcul du total et du TTC
    const total = quantiteSouhaitee * prixUnitaire;
    const remiseAmount = total * (remise / 100);
    const totalApresRemise = total - remiseAmount;
    // Le TTC est égal au total après remise
    const ttc = totalApresRemise;

    const newProduct = {
      ...currentProduct,
      nom: selectedStock.name,
      reference: selectedStock.reference,
      total: total,
      ttc: ttc
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    setCurrentProduct({
      produit: "",
      quantiteSouhaitee: 0,
      quantiteMinCommande: 0,
      prixUnitaire: 0,
      remise: 0
    });
    setError("");
  };

  const removeProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.fournisseur) {
      setError("Veuillez sélectionner un fournisseur.");
      setLoading(false);
      return;
    }

    if (selectedProducts.length === 0) {
      setError("Veuillez ajouter au moins un produit à la commande.");
      setLoading(false);
      return;
    }

    // Préparer les données pour l'API
    const commandeData = {
      ...formData,
      produits: selectedProducts.map(product => ({
        produit: product.produit,
        quantiteSouhaitee: product.quantiteSouhaitee,
        quantiteMinCommande: product.quantiteMinCommande,
        prixUnitaire: product.prixUnitaire,
        remise: product.remise,
        total: product.total,
        ttc: product.ttc
      }))
    };

    try {
      const response = await commandeAPI.updateCommande(commande._id, commandeData);
      onSuccess(response.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la commande:", error);
      setError("Une erreur est survenue lors de la mise à jour de la commande.");
    } finally {
      setLoading(false);
    }
  };

  // Calcul du total général
  const totalHT = selectedProducts.reduce((sum, product) => sum + product.total, 0);
  const totalTTC = selectedProducts.reduce((sum, product) => sum + product.ttc, 0);

  return (
    <div className="edit-cmd-modal-overlay">
      <div className="edit-cmd-form-modal">
        <div className="edit-cmd-form-header">
          <h2>Modifier la commande {commande.numeroCommande}</h2>
          <button className="edit-cmd-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-cmd-form">
          <div className="edit-cmd-form-section">
            <h3>Informations générales</h3>
            <div className="edit-cmd-form-row">
              <div className="edit-cmd-form-group">
                <label htmlFor="fournisseur">Fournisseur</label>
                <select
                  id="fournisseur"
                  name="fournisseur"
                  value={formData.fournisseur}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map((fournisseur) => (
                    <option key={fournisseur._id} value={fournisseur._id}>
                      {fournisseur.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-cmd-form-group">
                <label htmlFor="devise">Devise</label>
                <select
                  id="devise"
                  name="devise"
                  value={formData.devise}
                  onChange={handleChange}
                  required
                >
                  <option value="MAD">MAD</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div className="edit-cmd-form-group">
                <label htmlFor="tva">TVA (%)</label>
                <input
                  type="text"
                  id="tva"
                  name="tva"
                  value={formData.tva}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    // Accepter uniquement les chiffres et le point décimal
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setFormData({
                        ...formData,
                        [name]: value
                      });
                    }
                  }}
                  pattern="^\d*\.?\d*$"
                  required
                />
              </div>

              <div className="edit-cmd-form-group">
                <label htmlFor="numeroBL">Numéro BL (facultatif)</label>
                <input
                  type="text"
                  id="numeroBL"
                  name="numeroBL"
                  value={formData.numeroBL}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="edit-cmd-form-section">
            <h3>Ajouter des produits</h3>
            <div className="edit-cmd-form-row">
              <div className="edit-cmd-form-group">
                <label htmlFor="produit">Produit</label>
                <select
                  id="produit"
                  name="produit"
                  value={currentProduct.produit}
                  onChange={handleProductChange}
                >
                  <option value="">Sélectionner un produit</option>
                  {stockItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.reference} - {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-cmd-form-group">
                <label htmlFor="quantiteSouhaitee">Quantité souhaitée</label>
                <input
                  type="text"
                  id="quantiteSouhaitee"
                  name="quantiteSouhaitee"
                  value={currentProduct.quantiteSouhaitee}
                  onChange={handleProductChange}
                  placeholder="1"
                />
              </div>

              <div className="edit-cmd-form-group">
                <label htmlFor="quantiteMinCommande">Quantité min à commander</label>
                <input
                  type="text"
                  id="quantiteMinCommande"
                  name="quantiteMinCommande"
                  value={currentProduct.quantiteMinCommande}
                  onChange={handleProductChange}
                  placeholder="0"
                />
              </div>

              <div className="edit-cmd-form-group">
                <label htmlFor="prixUnitaire">Prix unitaire</label>
                <input
                  type="text"
                  id="prixUnitaire"
                  name="prixUnitaire"
                  value={currentProduct.prixUnitaire}
                  onChange={handleProductChange}
                  placeholder="0.00"
                />
              </div>

              <div className="edit-cmd-form-group">
                <label htmlFor="remise">Remise (%)</label>
                <input
                  type="text"
                  id="remise"
                  name="remise"
                  value={currentProduct.remise}
                  onChange={handleProductChange}
                  placeholder="0"
                />
              </div>

              <div className="edit-cmd-form-group">
                <button
                  type="button"
                  className="edit-cmd-add-product-button"
                  onClick={addProductToList}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {error && <div className="edit-cmd-error-message">{error}</div>}

          <div className="edit-cmd-selected-products-section">
            <h3>Produits sélectionnés</h3>
            {selectedProducts.length === 0 ? (
              <p>Aucun produit sélectionné</p>
            ) : (
              <div className="edit-cmd-selected-products-table-container">
                <table className="edit-cmd-selected-products-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Produit</th>
                      <th>Quantité souhaitée</th>
                      <th>Quantité min</th>
                      <th>Prix unitaire (DH)</th>
                      <th>Remise (%)</th>
                      <th>Total (DH)</th>
                      <th>TTC (DH)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((product, index) => (
                      <tr key={index}>
                        <td>{product.reference}</td>
                        <td>{product.nom}</td>
                        <td>{product.quantiteSouhaitee}</td>
                        <td>{product.quantiteMinCommande}</td>
                        <td>{product.prixUnitaire}</td>
                        <td>{product.remise}</td>
                        <td>{product.total?.toFixed(2) || (product.quantiteSouhaitee * product.prixUnitaire * (1 - product.remise / 100)).toFixed(2)}</td>
                        <td>{product.ttc?.toFixed(2) || (product.quantiteSouhaitee * product.prixUnitaire * (1 - product.remise / 100) * (1 + formData.tva / 100)).toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="edit-cmd-remove-product-button"
                            onClick={() => removeProduct(index)}
                          >
                            <FaTimes />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="6" className="edit-cmd-total-label">Total</td>
                      <td>{totalHT.toFixed(2)}</td>
                      <td>{totalTTC.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className="edit-cmd-form-actions">
            <button type="button" className="edit-cmd-cancel-button" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="edit-cmd-submit-button"
              disabled={loading || selectedProducts.length === 0}
            >
              {loading ? "Mise à jour en cours..." : "Mettre à jour la commande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCommandeForm;
