import { useState } from "react"
import { Link } from "react-router-dom"
import "./Header.css"

function Header({ title, onToggleSidebar }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">{title}</h1>
      </div>
      
    </header>
  )
}

export default Header
