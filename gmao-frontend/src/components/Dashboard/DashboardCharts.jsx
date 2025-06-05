import { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"
import "./DashboardCharts.css"

function DashboardCharts({ equipmentData, interventionData }) {
  const equipmentStatusChartRef = useRef(null)
  const interventionTypeChartRef = useRef(null)
  const availabilityChartRef = useRef(null)
  
  // États pour stocker les données traitées pour les graphiques
  const [equipmentStatusData, setEquipmentStatusData] = useState({
    labels: [],
    data: [],
  })
  
  const [interventionTypeData, setInterventionTypeData] = useState({
    labels: [],
    data: [],
  })
  
  const [interventionTrendData, setInterventionTrendData] = useState({
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
    datasets: [
      {
        label: "Préventives",
        data: Array(12).fill(0),
      },
      {
        label: "Curatives",
        data: Array(12).fill(0),
      },
    ],
  })
  
  const [availabilityData, setAvailabilityData] = useState({
    labels: [],
    data: [],
  })
  
  const [chartsReady, setChartsReady] = useState(false)

  // Traiter les données d'équipements quand elles sont disponibles
  useEffect(() => {
    if (equipmentData && Array.isArray(equipmentData)) {
      // Calculer le nombre d'équipements par statut
      const statusCounts = {
        "operational": 0,
        "maintenance": 0,
        "out_of_service": 0
      };
      
      // Extraire les équipements critiques pour le graphique de disponibilité
      const criticalEquipments = [];
      
      equipmentData.forEach(equipment => {
        // Compter par statut
        if (statusCounts.hasOwnProperty(equipment.status)) {
          statusCounts[equipment.status]++;
        }
        
        // Collecter les 5 équipements les plus critiques basés sur leur disponibilité
        if (equipment.availability !== undefined) {
          criticalEquipments.push({
            name: equipment.name,
            availability: equipment.availability
          });
        }
      });
      
      // Mapper les clés techniques vers des libellés lisibles
      const statusLabels = {
        'operational': 'En service',
        'maintenance': 'En maintenance',
        'out_of_service': 'Hors service'
      };
      
      // Mettre à jour les données pour le graphique de répartition par statut
      setEquipmentStatusData({
        labels: Object.keys(statusCounts).map(key => statusLabels[key] || key),
        data: Object.values(statusCounts),
      });
      
      // Mettre à jour les données pour le graphique de disponibilité
      if (criticalEquipments.length > 0) {
        // Trier par disponibilité croissante et prendre les 5 premiers
        criticalEquipments.sort((a, b) => a.availability - b.availability);
        const topCritical = criticalEquipments.slice(0, 5);
        
        setAvailabilityData({
          labels: topCritical.map(eq => eq.name),
          data: topCritical.map(eq => eq.availability),
        });
      }
      
      setChartsReady(true);
    }
  }, [equipmentData]);
  
  // Traiter les données d'interventions quand elles sont disponibles
  useEffect(() => {
    if (interventionData && Array.isArray(interventionData)) {
      // Compter les interventions par type
      const typeCounts = {
        "Préventive": 0,
        "Curative": 0,
        "Corrective": 0,
      };
      
      interventionData.forEach(intervention => {
        if (typeCounts.hasOwnProperty(intervention.type)) {
          typeCounts[intervention.type]++;
        }
      });
      
      // Mettre à jour les données pour le graphique de répartition par type
      setInterventionTypeData({
        labels: Object.keys(typeCounts),
        data: Object.values(typeCounts),
      });
      
      // Calculer les interventions par mois pour le graphique d'évolution
      const monthlyInterventions = {
        "Préventive": Array(12).fill(0),
        "Curative": Array(12).fill(0),
        "Corrective": Array(12).fill(0),
      };
      
      interventionData.forEach(intervention => {
        // Extraire le mois de la date d'intervention
        if (intervention.date) {
          const date = new Date(intervention.date);
          const month = date.getMonth(); // 0-11
          
          if (intervention.type in monthlyInterventions) {
            monthlyInterventions[intervention.type][month]++;
          }
        }
      });
      
      // Mettre à jour les données pour le graphique d'évolution
      setInterventionTrendData({
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
        datasets: [
          {
            label: "Préventives",
            data: monthlyInterventions["Préventive"],
          },
          {
            label: "Curatives",
            data: monthlyInterventions["Curative"],
          },
        ],
      });
      
      setChartsReady(true);
    }
  }, [interventionData]);

  // Graphique de répartition des équipements par statut
  useEffect(() => {
    if (equipmentStatusChartRef.current) {
      // Détruire le graphique existant s'il y en a un
      const chartInstance = Chart.getChart(equipmentStatusChartRef.current);
      if (chartInstance) {
        chartInstance.destroy();
      }
      
      // Créer un nouveau graphique
      new Chart(equipmentStatusChartRef.current, {
        type: "doughnut",
        data: {
          labels: equipmentStatusData.labels,
          datasets: [
            {
              data: equipmentStatusData.data,
              backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                },
              },
            },
            title: {
              display: true,
              text: "Répartition des équipements par statut",
              font: {
                size: 14,
                weight: "bold",
              },
              padding: {
                top: 10,
                bottom: 20,
              },
            },
          },
        },
      });
    }
  }, [equipmentStatusChartRef, equipmentStatusData]);

  // Graphique de répartition des interventions par type
  useEffect(() => {
    if (interventionTypeChartRef.current) {
      // Détruire le graphique existant s'il y en a un
      const chartInstance = Chart.getChart(interventionTypeChartRef.current);
      if (chartInstance) {
        chartInstance.destroy();
      }
      
      // Créer un nouveau graphique
      new Chart(interventionTypeChartRef.current, {
        type: "pie",
        data: {
          labels: interventionTypeData.labels,
          datasets: [
            {
              data: interventionTypeData.data,
              backgroundColor: ["#3b82f6", "#f59e0b", "#8b5cf6"], // Bleu, Orange, Violet
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                },
              },
            },
            title: {
              display: true,
              text: "Répartition des interventions par type",
              font: {
                size: 14,
                weight: "bold",
              },
              padding: {
                top: 10,
                bottom: 20,
              },
            },
          },
        },
      });
    }
  }, [interventionTypeChartRef, interventionTypeData]);

  if (!chartsReady || !equipmentData || !interventionData) {
    return <div className="charts-loading">Chargement des graphiques...</div>;
  }

  return (
    <div className="dashboard-charts">
      <h2 className="charts-title">Analyses et Graphiques</h2>
      <div className="charts-grid">
        <div className="chart-card">
          <canvas ref={equipmentStatusChartRef}/>
        </div>
        <div className="chart-card">
          <canvas ref={interventionTypeChartRef}/>
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts
