import "./Header.css"

function Header({ title, onToggleSidebar }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
    </header>
  )
}

export default Header
