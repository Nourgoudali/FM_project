import { FaTimes } from "react-icons/fa"
import "./DeleteStockConfirm.css"

function DeleteStockConfirm({ item, onConfirm, onCancel, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="stock-form-overlay">
      <div className="stock-form-container delete-container">
        <div className="stock-form-header">
          <h2>Confirmer la suppression</h2>
          <button className="close-button" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>
        <div className="delete-confirmation">
          <p>Êtes-vous sûr de vouloir supprimer l'article <strong>{item?.name}</strong> ?</p>
          <p>Cette action est irréversible.</p>
          
          <div className="stock-form__actions">
            <button className="stock-form__btn stock-form__btn--outline" onClick={onCancel}>
              Annuler
            </button>
            <button className="stock-form__btn stock-form__btn--danger" onClick={onConfirm}>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteStockConfirm
