import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { commandeAPI, stockAPI } from "../../services/api";
import "./CommandeForm.css";
import { toast } from "react-hot-toast";

const AddCommandeForm = ({ onClose, onSuccess, fournisseurs }) => {
  const [formData, setFormData] = useState({
    fournisseur: "",
    devise: "MAD",
    tva: "",
    numeroBL: "",
    produits: []
  });
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({});

  // Charger les articles de stock
  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const response = await stockAPI.getAllStocks();
        setStockItems(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des articles de stock:", error);
        toast.error("Impossible de charger les articles de stock.");
      }
    };

    fetchStockItems();
  }, []);

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
    return strValue.includes(".") ? parseFloat(strValue) : parseInt(strValue, 10);
  };

  const addProductToList = () => {
    if (!currentProduct.produit) {
      toast.error("Veuillez sélectionner un produit.");
      return;
    }

    // Convertir les valeurs de texte en nombres
    const quantiteSouhaitee = getNumericValue(currentProduct.quantiteSouhaitee);
    const quantiteMinCommande = getNumericValue(currentProduct.quantiteMinCommande);
    const prixUnitaire = getNumericValue(currentProduct.prixUnitaire);
    const remise = getNumericValue(currentProduct.remise);

    if (quantiteSouhaitee <= 0) {
      toast.error("La quantité souhaitée doit être supérieure à 0.");
      return;
    }

    const selectedStock = stockItems.find(item => item._id === currentProduct.produit);
    if (!selectedStock) {
      toast.error("Produit non trouvé.");
      return;
    }
    
    // Vérifier si la quantité souhaitée est inférieure à la quantité minimale à commander
    if (quantiteSouhaitee < quantiteMinCommande) {
      toast.error(`Vous devez commander au moins ${quantiteMinCommande} unités de ce produit.`);
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
  };

  const removeProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.fournisseur) {
      toast.error("Veuillez sélectionner un fournisseur.");
      setLoading(false);
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à la commande.");
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
      const response = await commandeAPI.createCommande(commandeData);
      onSuccess(response.data);
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      toast.error("Une erreur est survenue lors de la création de la commande.");
    } finally {
      setLoading(false);
    }
  };

  // Calcul du total général
  const totalHT = selectedProducts.reduce((sum, product) => sum + product.total, 0);
  const totalTTC = selectedProducts.reduce((sum, product) => sum + product.ttc, 0);

  return (
    <div className="cmd-modal-overlay">
      <div className="cmd-form-modal">
        <div className="cmd-form-header">
          <h2>Ajouter une nouvelle commande</h2>
          <button className="cmd-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cmd-form">
          <div className="cmd-form-section">
            <h3>Informations générales</h3>
            <div className="cmd-form-row">
              <div className="cmd-form-group">
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
                    {fournisseur.nomEntreprise}  - {fournisseur.nom} {fournisseur.prenom} 
                    </option>
                  ))}
                </select>
              </div>

              <div className="cmd-form-group">
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

              <div className="cmd-form-group">
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

              <div className="cmd-form-group">
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

          <div className="cmd-form-section">
            <h3>Ajouter des produits</h3>
            <div className="cmd-form-row">
              <div className="cmd-form-group">
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

              <div className="cmd-form-group">
                <label htmlFor="quantiteSouhaitee">Quantité souhaitée</label>
                <input
                  type="text"
                  id="quantiteSouhaitee"
                  name="quantiteSouhaitee"
                  value={currentProduct.quantiteSouhaitee}
                  onChange={handleProductChange}
                  placeholder="1"
                  pattern="^\d+$"
                  required
                />
              </div>

              <div className="cmd-form-group">
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

              <div className="cmd-form-group">
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

              <div className="cmd-form-group">
                <label htmlFor="remise">Remise (%)</label>
                <input
                  type="text"
                  id="remise"
                  name="remise"
                  value={currentProduct.remise}
                  onChange={handleProductChange}
                  placeholder="0"
                  required
                />
              </div>

            </div>
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button
                type="button"
                className="cmd-add-product-button"
                onClick={addProductToList}
              >
                Ajouter
              </button>
            </div>
          </div>

          <div className="cmd-selected-products-section">
            <h3>Produits sélectionnés</h3>
            {selectedProducts.length === 0 ? (
              <p>Aucun produit sélectionné</p>
            ) : (
              <div className="cmd-selected-products-table-container">
                <table className="cmd-selected-products-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Produit</th>
                      <th>Quantité souhaitée</th>
                      <th>Quantité min à commander</th>
                      <th>Prix unitaire (DH)</th>
                      <th>Total (DH)</th>
                      <th>Remise (%)</th>
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
                        <td>{product.total.toFixed(2)}</td>
                        <td>{product.remise}</td>
                        <td>{product.ttc.toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="cmd-remove-product-button"
                            onClick={() => removeProduct(index)}
                          >
                            <FaTimes />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                  <td colSpan="5" className="cmd-total-label">Total</td>
                    <td>{totalHT.toFixed(2)}</td>
                    <td></td>
                    <td>{totalTTC.toFixed(2)}</td>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className="cmd-form-actions">
            <button type="button" className="cmd-cancel-button" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="cmd-submit-button"
              disabled={loading || selectedProducts.length === 0}
            >
              {loading ? "Création en cours..." : "Créer la commande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCommandeForm;
