"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"
import "./DashboardCharts.css"

function DashboardCharts({ equipmentData, interventionData }) {
  const equipmentStatusChartRef = useRef(null)
  const interventionTypeChartRef = useRef(null)
  const interventionTrendChartRef = useRef(null)
  const availabilityChartRef = useRef(null)

  // Graphique de répartition des équipements par statut
  useEffect(() => {
    if (equipmentStatusChartRef.current) {
      const chartInstance = new Chart(equipmentStatusChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["En service", "En maintenance", "Hors service", "En stock"],
          datasets: [
            {
              data: [156, 23, 4, 12],
              backgroundColor: ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6"],
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
      })

      return () => {
        chartInstance.destroy()
      }
    }
  }, [equipmentStatusChartRef])

  // Graphique de répartition des interventions par type
  useEffect(() => {
    if (interventionTypeChartRef.current) {
      const chartInstance = new Chart(interventionTypeChartRef.current, {
        type: "pie",
        data: {
          labels: ["Préventive", "Curative", "Améliorative"],
          datasets: [
            {
              data: [65, 30, 5],
              backgroundColor: ["#3b82f6", "#f59e0b", "#8b5cf6"],
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
      })

      return () => {
        chartInstance.destroy()
      }
    }
  }, [interventionTypeChartRef])

  // Graphique d'évolution des interventions dans le temps
  useEffect(() => {
    if (interventionTrendChartRef.current) {
      const chartInstance = new Chart(interventionTrendChartRef.current, {
        type: "line",
        data: {
          labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
          datasets: [
            {
              label: "Préventives",
              data: [12, 15, 18, 14, 16, 19, 22, 20, 18, 16, 14, 12],
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
            {
              label: "Curatives",
              data: [8, 6, 5, 9, 7, 4, 6, 8, 10, 12, 9, 7],
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: true,
              text: "Évolution des interventions",
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
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Nombre d'interventions",
              },
            },
            x: {
              title: {
                display: true,
                text: "Mois",
              },
            },
          },
        },
      })

      return () => {
        chartInstance.destroy()
      }
    }
  }, [interventionTrendChartRef])

  // Graphique de disponibilité des équipements critiques
  useEffect(() => {
    if (availabilityChartRef.current) {
      const chartInstance = new Chart(availabilityChartRef.current, {
        type: "bar",
        data: {
          labels: ["Pompe P-10", "Compresseur C-123", "Moteur M-405", "Convoyeur CV-200", "Chaudière CH-100"],
          datasets: [
            {
              label: "Disponibilité (%)",
              data: [98, 75, 95, 45, 92],
              backgroundColor: [
                "#22c55e", // Vert pour > 90%
                "#f59e0b", // Orange pour > 70%
                "#22c55e", // Vert pour > 90%
                "#ef4444", // Rouge pour < 70%
                "#22c55e", // Vert pour > 90%
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Disponibilité des équipements critiques",
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
          scales: {
            x: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: "Disponibilité (%)",
              },
            },
          },
        },
      })

      return () => {
        chartInstance.destroy()
      }
    }
  }, [availabilityChartRef])

  return (
    <div className="dashboard-charts">
      <div className="charts-row">
        <div className="chart-container">
          <canvas ref={equipmentStatusChartRef}></canvas>
        </div>
        <div className="chart-container">
          <canvas ref={interventionTypeChartRef}></canvas>
        </div>
      </div>
      <div className="charts-row">
        <div className="chart-container full-width">
          <canvas ref={interventionTrendChartRef}></canvas>
        </div>
      </div>
      <div className="charts-row">
        <div className="chart-container full-width">
          <canvas ref={availabilityChartRef}></canvas>
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts
