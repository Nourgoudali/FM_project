import { useState, useEffect } from "react"
import { FaTimes } from "react-icons/fa"
import "./EditStockItemForm.css"
import AddStockItemForm from "./AddStockItemForm"

function EditStockItemForm({ item, onSubmit, onCancel, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="stock-form-overlay">
      <div className="stock-form-container">
        <div className="stock-form-header">
          <h2>Modifier l'article</h2>
          <button className="close-button" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>
        <AddStockItemForm
          item={item}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isEdit={true}
        />
      </div>
    </div>
  )
}

export default EditStockItemForm
