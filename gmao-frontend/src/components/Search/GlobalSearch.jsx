"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import "./GlobalSearch.css"

function GlobalSearch() {
  const [isActive, setIsActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  // Catégories de recherche
  const categories = [
    { id: "equipments", name: "Équipements", icon: "equipment" },
    { id: "interventions", name: "Interventions", icon: "intervention" },
    { id: "users", name: "Utilisateurs", icon: "user" },
    { id: "stock", name: "Stock", icon: "stock" },
  ]

  // Simuler une recherche
  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([])
      return
    }

    setLoading(true)

    // Simuler un délai de recherche
    const timer = setTimeout(() => {
      // Dans un environnement réel, cette recherche serait effectuée via l'API
      const mockResults = [
        {
          category: "equipments",
          items: [
            { id: 1, name: "Pompe P-10", description: "Pompe hydraulique principale" },
            { id: 2, name: "Compresseur C-123", description: "Compresseur d'air industriel" },
          ].filter(
            (item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        },
        {
          category: "interventions",
          items: [
            { id: 1, name: "INT-2024-001", description: "Maintenance préventive Pompe P-10" },
            { id: 2, name: "INT-2024-002", description: "Réparation Compresseur C-123" },
          ].filter(
            (item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        },
        {
          category: "users",
          items: [
            { id: 1, name: "Jean Dupont", description: "Technicien maintenance" },
            { id: 2, name: "Marie Martin", description: "Responsable maintenance" },
          ].filter(
            (item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        },
        {
          category: "stock",
          items: [
            { id: 1, name: "Filtre hydraulique", description: "Référence: P001" },
            { id: 2, name: "Joint torique", description: "Référence: P002" },
          ].filter(
            (item) =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        },
      ]

      // Filtrer les catégories qui ont des résultats
      setResults(mockResults.filter((category) => category.items.length > 0))
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fermer la recherche lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsActive(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Gérer l'ouverture/fermeture avec le raccourci clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K ou Cmd+K pour ouvrir la recherche
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsActive(true)
      }

      // Échap pour fermer la recherche
      if (e.key === "Escape" && isActive) {
        setIsActive(false)
        setSearchTerm("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isActive])

  const handleSearchFocus = () => {
    setIsActive(true)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleResultClick = (category, item) => {
    // Naviguer vers la page correspondante
    switch (category) {
      case "equipments":
        navigate(`/equipments?id=${item.id}`)
        break
      case "interventions":
        navigate(`/interventions?id=${item.id}`)
        break
      case "users":
        navigate(`/users?id=${item.id}`)
        break
      case "stock":
        navigate(`/stock?id=${item.id}`)
        break
      default:
        break
    }

    setIsActive(false)
    setSearchTerm("")
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.icon : "search"
  }

  return (
    <div className="global-search" ref={searchRef}>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher... "
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
        />
        {searchTerm && (
          <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
            ×
          </button>
        )}
      </div>

      {isActive && searchTerm.length > 1 && (
        <div className="search-results-dropdown">
          <div className="search-content">
            {loading ? (
              <div className="search-loading">Recherche en cours...</div>
            ) : results.length === 0 ? (
              <div className="search-no-results">Aucun résultat trouvé pour "{searchTerm}"</div>
            ) : (
              <div className="search-results">
                {results.map((category) => (
                  <div key={`cat-${category.category.toLowerCase().replace(/\s+/g, '-')}`} className="result-category">
                    <h3 className="category-title">
                      <span className={`category-icon icon-${getCategoryIcon(category.category)}`}></span>
                      {getCategoryName(category.category)}
                    </h3>
                    <ul className="result-list">
                      {category.items.map((item) => (
                        <li
                          key={`${category.category}-${item.id || item._id || item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="result-item"
                          onClick={() => handleResultClick(category.category, item)}
                        >
                          <div className="result-name">{item.name}</div>
                          <div className="result-description">{item.description}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
