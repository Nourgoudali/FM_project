import React, { useState, useEffect } from 'react';
import '../styles/DocumentationPage.css';

const DocumentationPage = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulation du chargement des documents
    setTimeout(() => {
      const mockDocuments = [
        { id: 1, title: 'Manuel d\'utilisation Machine A', category: 'Manuels', date: '2023-01-15', size: '2.5 MB', type: 'pdf' },
        { id: 2, title: 'Schéma électrique Machine B', category: 'Schémas', date: '2023-03-22', size: '1.8 MB', type: 'pdf' },
        { id: 3, title: 'Procédure de maintenance préventive', category: 'Procédures', date: '2023-02-10', size: '1.2 MB', type: 'docx' },
        { id: 4, title: 'Fiche technique Machine C', category: 'Fiches techniques', date: '2023-04-05', size: '3.1 MB', type: 'pdf' },
        { id: 5, title: 'Rapport d\'inspection annuelle', category: 'Rapports', date: '2023-05-18', size: '4.5 MB', type: 'xlsx' }
      ];
      
      // Extraire les catégories uniques
      const uniqueCategories = [...new Set(mockDocuments.map(doc => doc.category))];
      
      setDocuments(mockDocuments);
      setCategories(uniqueCategories);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrer les documents par catégorie et terme de recherche
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'xlsx': return '📊';
      default: return '📁';
    }
  };

  return (
    <div className="documentation-container">
      <h1>Centre de Documentation</h1>
      
      {loading ? (
        <p>Chargement des documents...</p>
      ) : (
        <>
          <div className="document-filters">
            <div className="filter-group">
              <label>Catégorie:</label>
              <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="all">Toutes les catégories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="search-group">
              <input
                type="text"
                placeholder="Rechercher des documents..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button className="search-btn">Rechercher</button>
            </div>
            
            <button className="upload-btn">Ajouter un document</button>
          </div>

          <div className="documents-list">
            {filteredDocuments.length === 0 ? (
              <p className="no-documents">Aucun document trouvé</p>
            ) : (
              filteredDocuments.map(doc => (
                <div key={doc.id} className="document-card">
                  <div className="document-icon">{getDocumentIcon(doc.type)}</div>
                  <div className="document-info">
                    <h3>{doc.title}</h3>
                    <p className="document-category">{doc.category}</p>
                    <p className="document-details">
                      <span>Date: {doc.date}</span>
                      <span>Taille: {doc.size}</span>
                    </p>
                  </div>
                  <div className="document-actions">
                    <button className="view-btn">Voir</button>
                    <button className="download-btn">Télécharger</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentationPage; 