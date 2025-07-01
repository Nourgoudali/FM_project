import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './MaintenancePlanning.css';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import { useSidebar } from '../contexts/SidebarContext';
import { maintenanceAPI } from '../services/api';

const localizer = momentLocalizer(moment);

const MaintenancePlanning = () => {
  const { toggleSidebar } = useSidebar();
  
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [formData, setFormData] = useState({
    equipment: '',
    periodicity: 'Mensuelle',
    description: '',
    provider: '',
    startDate: moment().format('YYYY-MM-DD'),
    status: 'planned'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [showValidationForm, setShowValidationForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMaintenanceTasks();
  }, []);

  const loadMaintenanceTasks = async () => {
    try {
      const tasks = await maintenanceAPI.getTasks();
      const formattedTasks = tasks.map(task => ({
        ...task,
        start: new Date(task.startDate),
        end: new Date(task.startDate),
        title: task.description,
        equipment: task.equipment,
        status: task.status,
        taskId: task._id || task.id
      }));
      setMaintenanceData(formattedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Erreur lors du chargement des tâches');
    }
  };

  const getColorForStatus = (task) => {
    const now = moment();
    const taskDate = moment(task.startDate);
    const daysUntil = taskDate.diff(now, 'days');

    switch (task.status) {
      case 'completed':
        return '#90EE90'; // Vert pour terminé et validé
      case 'planned':
        if (daysUntil <= 7) {
          return '#FFFF99'; // Jaune pour approchant
        }
        if (daysUntil <= 14) {
          return '#FF6666'; // Rouge pour en retard
        }
        return '#D3D3D3'; // Gris pour planifié
      default:
        return '#D3D3D3';
    }
  };

  const getEventStyle = (event) => {
    return {
      style: {
        backgroundColor: getColorForStatus(event),
        borderRadius: '4px',
        cursor: 'pointer',
        margin: '2px',
        padding: '5px'
      }
    };
  };

  const validateForm = () => {
    if (!formData.equipment.trim()) {
      setError('L\'équipement est requis');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description est requise');
      return false;
    }
    if (!formData.provider.trim()) {
      setError('Le prestataire est requis');
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!validateForm()) return;

      const data = {
        equipment: formData.equipment,
        description: formData.description,
        provider: formData.provider,
        startDate: formData.startDate,
        periodicity: formData.periodicity
      };

      await maintenanceAPI.createTask(data);
      setSuccessMessage('Maintenance ajoutée avec succès');
      setFormData({
        equipment: '',
        periodicity: 'Mensuelle',
        description: '',
        provider: '',
        startDate: moment().format('YYYY-MM-DD'),
        status: 'planned'
      });
      setError(null);
      await loadMaintenanceTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Erreur lors de la création de la tâche');
    }
  };

  const handleEventClick = async (event) => {
    try {
      console.log('Événement cliqué:', event);
      console.log('Type de l\'événement:', typeof event);
      console.log('Clés de l\'événement:', Object.keys(event));
      
      // Vérifier la structure de l'événement
      if (!event || typeof event !== 'object') {
        throw new Error('Événement invalide');
      }
      
      // Vérifier si l'événement contient un ID
      if (!event.id && !event._id) {
        throw new Error('Événement sans ID');
      }
      
      setSelectedTask(event);
      setShowValidationForm(true);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Erreur lors de la sélection de la tâche');
    }
  };

  const handleValidationSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedTask) {
        throw new Error('Aucune tâche sélectionnée');
      }

      console.log('Tâche sélectionnée:', selectedTask);
      console.log('Type de la tâche:', typeof selectedTask);
      console.log('Clés de la tâche:', Object.keys(selectedTask));
      
      // Vérifier que l'ID de la tâche est présent
      if (!selectedTask.id) {
        // Vérifier d'autres clés possibles pour l'ID
        const possibleIds = ['_id', 'taskId', 'maintenanceId'];
        let taskId = null;
        for (const key of possibleIds) {
          if (selectedTask[key]) {
            taskId = selectedTask[key];
            break;
          }
        }

        if (!taskId) {
          throw new Error('ID de tâche invalide');
        }

        // Utiliser l'ID trouvé
        selectedTask.id = taskId;
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Vérifier si l'utilisateur est authentifié
      if (!user || !user.token) {
        throw new Error('Vous devez être connecté pour valider une maintenance');
      }

      // Trouver l'ID utilisateur dans différentes structures possibles
      const userId = user._id || user.id || (user.user && (user.user._id || user.user.id));
      
      if (!userId) {
        throw new Error('ID utilisateur non trouvé');
      }

      // Vérifier que l'ID de la tâche est présent
      if (!selectedTask || !selectedTask._id) {
        throw new Error('ID de tâche invalide');
      }

      const response = await maintenanceAPI.validateTask(selectedTask._id, userId);
      console.log('Validation API appelée avec:', {
        taskId: selectedTask._id,
        userId
      });
      
      if (response.status === 'success') {
        setSuccessMessage('Maintenance validée avec succès');
        setShowValidationForm(false);
        setSelectedTask(null);
        await loadMaintenanceTasks();
      } else {
        setError(`Erreur lors de la validation de la maintenance: ${response.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error validating task:', error);
      setError(error.message || 'Erreur lors de la validation de la maintenance');
    }
  };

  const handleCloseValidationForm = () => {
    setShowValidationForm(false);
    setSelectedTask(null);
  };

  const pageTitle = "Planification de Maintenance";

  return (
    <div className="maintenance-planning-container">
      <Sidebar toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Header />
        <div className="planning-content">
          <h2>Planification de Maintenance</h2>
          <form onSubmit={handleSubmit} className="maintenance-form">
            <div className="form-group">
              <label htmlFor="equipment">Équipement:</label>
              <input
                type="text"
                id="equipment"
                name="equipment"
                value={formData.equipment}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="periodicity">Périodicité:</label>
              <select
                id="periodicity"
                name="periodicity"
                value={formData.periodicity}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Mensuelle">Mensuelle</option>
                <option value="Trimestrielle">Trimestrielle</option>
                <option value="Annuelle">Annuelle</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="form-input"
                rows="4"
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="provider">Prestataire:</label>
              <input
                type="text"
                id="provider"
                name="provider"
                value={formData.provider}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="startDate">Date de Début:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="submit-btn">Planifier Maintenance</button>
          </form>
          <div className="calendar-container">
            <Calendar
              localizer={localizer}
              events={maintenanceData}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              onSelectEvent={handleEventClick}
              eventPropGetter={getEventStyle}
              messages={{
                today: 'Aujourd\'hui',
                month: 'Mois',
                week: 'Semaine',
                day: 'Jour',
                previous: 'Précédent',
                next: 'Suivant',
                today: 'Aujourd\'hui',
                back: 'Retour',
                yes: 'Oui',
                no: 'Non'
              }}
            />
          </div>
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {showValidationForm && selectedTask && (
            <div className="validation-form">
              <h3>Validation de la Maintenance</h3>
              <form onSubmit={handleValidationSubmit}>
                <div className="form-group">
                  <p>Équipement: {selectedTask.equipment}</p>
                  <p>Description: {selectedTask.title}</p>
                  <p>Date: {moment(selectedTask.start).format('DD/MM/YYYY')}</p>
                </div>
                <button type="submit" className="submit-btn">Valider la Maintenance</button>
                <button type="button" onClick={handleCloseValidationForm} className="cancel-btn">Annuler</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePlanning;
