import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './MaintenancePlanning.css';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import { useSidebar } from '../contexts/SidebarContext';
import { maintenanceAPI } from '../services/maintenanceAPI';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    loadMaintenanceTasks();
  }, []);

  useEffect(() => {
    loadMaintenanceTasks();
  }, []);

  const loadMaintenanceTasks = async () => {
    try {
      const tasks = await maintenanceAPI.getTasks();
      setMaintenanceData(tasks.map(task => ({
        ...task,
        start: new Date(task.nextDue),
        end: new Date(task.nextDue),
        title: task.description,
        equipment: task.equipment,
        status: task.status
      })));
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate end date based on periodicity
    let endDate;
    switch (formData.periodicity) {
      case 'Mensuelle':
        endDate = moment(formData.startDate).add(1, 'month').toDate();
        break;
      case 'Trimestrielle':
        endDate = moment(formData.startDate).add(3, 'months').toDate();
        break;
      case 'Annuelle':
    }
  };

  const handleEventClick = async (event) => {
    try {
      // Update task status
      await maintenanceAPI.updateTask(event.id, {
        status: event.status === 'planned' ? 'completed' : 'planned'
      });
      
      // Load updated tasks
      await loadMaintenanceTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getEventStyle = (event) => {
    const now = moment();
    const eventStart = moment(event.start);
    const daysUntilStart = eventStart.diff(now, 'days');
    const daysOverdue = now.diff(eventStart, 'days');

    // Calculate status based on current date and tolerance period
    if (event.status === 'completed') {
      return { backgroundColor: '#90EE90' }; // Green for completed tasks
    }

    if (event.status === 'planned') {
      // If maintenance is within 7 days
      if (daysUntilStart <= 7 && daysUntilStart >= 0) {
        return { backgroundColor: '#FFFF99' }; // Yellow for approaching maintenance
      }
      
      // If maintenance is overdue (more than 14 days)
      if (daysOverdue > 14) {
        return { backgroundColor: '#FF6666' }; // Red for overdue more than 2 weeks
      }
      
      // If maintenance is overdue but less than 2 weeks
      if (daysOverdue > 7) {
        return { backgroundColor: '#FFFF99' }; // Yellow for overdue but within 2 weeks
      }
      
      // Default planned status
      return { backgroundColor: '#D3D3D3' }; // Gray for planned tasks
    }

    // Default case
    return { backgroundColor: '#D3D3D3' }; // Gray for any other status
  };

  const pageTitle = "Planification de Maintenance";

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content">
        <Header title={pageTitle} onToggleSidebar={toggleSidebar} />
        <div className="content-wrapper">
          <div className="maintenance-planning-container">
            <div className="maintenance-content">
              <h2>Planification de Maintenance</h2>
              
              <div className="maintenance-form">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Équipement concerné</label>
                    <input
                      type="text"
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Date de début</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                      required
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Périodicité</label>
                    <select
                      name="periodicity"
                      value={formData.periodicity}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    >
                      <option value="Mensuelle">Mensuelle</option>
                      <option value="Trimestrielle">Trimestrielle</option>
                      <option value="Annuelle">Annuelle</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Description de la tâche</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Prestataire</label>
                    <input
                      type="text"
                      name="provider"
                      value={formData.provider}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    />
                  </div>
                  
                  <button type="submit" className="submit-btn">Valider</button>
                </form>
              </div>

              <div className="calendar-container">
                <Calendar
                  localizer={localizer}
                  events={maintenanceData}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '80vh' }}
                  views={['month', 'week', 'day']}
                  eventPropGetter={getEventStyle}
                  onSelectEvent={handleEventClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePlanning;
