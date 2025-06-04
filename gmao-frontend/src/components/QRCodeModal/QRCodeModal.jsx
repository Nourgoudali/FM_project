import "./QRCodeModal.css"

function QRCodeModal({ isOpen, onClose, documentTitle, qrCodeUrl }) {
  if (!isOpen) return null

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h3 className="qr-modal-title">QR Code pour accès rapide</h3>
          <button className="qr-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="qr-modal-content">
          <div className="qr-code-image">
            {/* Dans un environnement réel, l'image du QR code serait chargée depuis l'API */}
            <div className="qr-placeholder"></div>
          </div>
          <div className="qr-info">
            <h4 className="qr-document-title">{documentTitle}</h4>
            <p className="qr-instructions">
              Scannez ce code QR avec l'application mobile GMAO pour accéder rapidement à ce document sur le terrain.
            </p>
            <div className="qr-actions">
              <button className="btn btn-primary">
                <span className="icon-print"></span>
                Imprimer
              </button>
              <button className="btn btn-outline">
                <span className="icon-download"></span>
                Télécharger
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeModal
