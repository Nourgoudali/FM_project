import React from 'react';
import { FaTimes } from 'react-icons/fa';
import AddUserForm from './AddUserForm';
import './AddUserForm.css';

function EditUserModal({ user, onClose, onSubmit }) {
  if (!user) return null;

  const handleEditUser = (userData) => {
    // Ajouter l'ID de l'utilisateur aux données
    const updatedUserData = {
      ...userData,
      id: user._id || user.id
    };
    onSubmit(updatedUserData);
  };

  return (
    <div className="modal-overlay">
      <div className="user-modal-container">
        <div className="user-modal-header">
          <h2>Modifier l'utilisateur</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="user-modal-content">
          <AddUserForm 
            onClose={onClose} 
            onSubmit={handleEditUser} 
            user={user}
            isEdit={true}
            hidePasswordFields={true}
          />
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
