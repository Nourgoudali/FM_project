import { FaTimes } from "react-icons/fa"
import "./DeleteUserModal.css"

function DeleteUserModal({ user, onClose, onConfirm }) {
  if (!user) return null;

  return (
    <div className="delete-user-modal-overlay">
      <div className="delete-user-modal-container">
        <div className="delete-user-modal-header">
          <h2>Confirmer la suppression</h2>
          <button className="delete-user-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="delete-user-modal-content">
          <p className="delete-user-warning">
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{user.firstName} {user.lastName}</strong> ?
          </p>
          <p>Cette action est irréversible et supprimera définitivement cet utilisateur du système.</p>
          
          <div className="delete-user-modal-actions">
            <button className="delete-user-cancel-btn" onClick={onClose}>
              Annuler
            </button>
            <button 
              className="delete-user-confirm-btn" 
              onClick={() => onConfirm(user._id || user.id)}
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteUserModal;
