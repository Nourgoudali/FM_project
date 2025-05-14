import React, { useState, useEffect } from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: ''
  });

  useEffect(() => {
    // Simuler le chargement du profil
    setTimeout(() => {
      const userData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33 6 12 34 56 78',
        department: 'Maintenance',
        role: 'Technicien',
        joinDate: '2022-05-15'
      };
      setProfile(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        department: userData.department
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simuler la mise à jour du profil
    setProfile({
      ...profile,
      ...formData
    });
    setIsEditing(false);
    alert('Profil mis à jour avec succès !');
  };

  if (loading) {
    return <div className="profile-container"><p>Chargement du profil...</p></div>;
  }

  return (
    <div className="profile-container">
      <h1>Mon Profil</h1>
      
      {!isEditing ? (
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              {profile.name.charAt(0)}
            </div>
          </div>
          
          <div className="profile-details">
            <h2>{profile.name}</h2>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Téléphone:</strong> {profile.phone}</p>
            <p><strong>Département:</strong> {profile.department}</p>
            <p><strong>Rôle:</strong> {profile.role}</p>
            <p><strong>Date d'inscription:</strong> {profile.joinDate}</p>
            
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              Modifier le profil
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Nom</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Département</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>
          
          <div className="button-group">
            <button type="submit" className="save-btn">Sauvegarder</button>
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage; 