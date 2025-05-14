import React, { useState } from 'react';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailNotifications: true,
    language: 'fr',
    theme: 'light'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simuler la sauvegarde des paramètres
    alert('Paramètres sauvegardés avec succès !');
  };

  return (
    <div className="settings-container">
      <h1>Paramètres</h1>
      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onChange={handleChange}
              />
              Activer les notifications
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
              />
              Recevoir des notifications par email
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Préférences</h2>
          <div className="form-group">
            <label>Langue</label>
            <select name="language" value={settings.language} onChange={handleChange}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="form-group">
            <label>Thème</label>
            <select name="theme" value={settings.theme} onChange={handleChange}>
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </div>
        </div>

        <button type="submit" className="save-settings-btn">Sauvegarder</button>
      </form>
    </div>
  );
};

export default SettingsPage; 