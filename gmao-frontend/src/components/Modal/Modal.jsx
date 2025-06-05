import { useEffect } from "react"
import "./Modal.css"
import { FaTimes } from "react-icons/fa"

function Modal({ isOpen, onClose, title, children, size = "medium" }) {
  // Empêcher le défilement du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isOpen) return null

  // Empêcher la propagation du clic à l'overlay
  const handleContentClick = (e) => {
    e.stopPropagation()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container modal-${size}`} onClick={handleContentClick}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
          <FaTimes/>
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}

export default Modal
