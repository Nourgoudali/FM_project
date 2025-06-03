import { FaTimes } from "react-icons/fa"
import { AddEquipmentForm } from "./AddEquipmentForm"
import "./EquipmentModals.css"

function EditEquipmentModal({ equipment, onClose, onSubmit }) {
  if (!equipment) return null;

  const handleEditEquipment = (updatedEquipment) => {
    if (onSubmit) {
      onSubmit(updatedEquipment);
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="equipment-modal-container">
        <div className="equipment-modal-header">
          <h2>Modifier l'équipement</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="equipment-modal-content">
          <AddEquipmentForm 
            onClose={onClose} 
            onEquipmentAdded={handleEditEquipment} 
            initialData={equipment}
            isEdit={true}
          />
        </div>
      </div>
    </div>
  );
}

export default EditEquipmentModal;
