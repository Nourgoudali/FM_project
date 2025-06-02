"use client"

import { useState, useEffect } from "react"
import "./PerformanceIndicators.css"
import { kpiAPI } from "../../services/api"
import toast from "react-hot-toast"

function PerformanceIndicators() {
  const [kpis, setKpis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true)
        const response = await kpiAPI.getLatestKPI()
        
        if (response.data && Array.isArray(response.data)) {
          // Transforme les données de l'API en format attendu par le composant
          const transformedData = response.data.map(kpi => {
            // Calcul de la tendance (up, down, neutral) basé sur la différence entre la valeur actuelle et la précédente
            let trend = "neutral";
            let percentage = "0%";
            
            if (kpi.previousValue && kpi.currentValue) {
              const diff = kpi.currentValue - kpi.previousValue;
              const percentChange = ((diff / kpi.previousValue) * 100).toFixed(1);
              
              if (diff > 0) {
                trend = kpi.isPositiveTrend ? "up" : "down"; // Si augmentation est positive (ex: disponibilité)
                percentage = `+${percentChange}%`;
              } else if (diff < 0) {
                trend = kpi.isPositiveTrend ? "down" : "up"; // Si diminution est positive (ex: MTTR)
                percentage = `${percentChange}%`;
              }
            }
            
            return {
              title: kpi.name,
              value: kpi.formattedValue || `${kpi.currentValue}${kpi.unit || ''}`,
              description: kpi.description,
              trend: trend,
              percentage: percentage
            };
          });
          
          setKpis(transformedData);
        }
      } catch (err) {
        toast.error("Impossible de charger les indicateurs de performance")
      } finally {
        setLoading(false)
      }
    }

    fetchKPIs()
  }, [])

  if (loading) {
    return <div className="performance-indicators loading">Chargement des indicateurs...</div>
  }

  // Les erreurs sont maintenant affichées avec des toasts

  return (
    <div className="performance-indicators">
      <h2 className="indicators-title">Indicateurs de performance</h2>
      <div className="indicators-grid">
        {kpis.length > 0 ? (
          kpis.map((kpi, index) => (
            <div key={`kpi-${kpi.title || kpi.name || `indicator-${index}`}`.toLowerCase().replace(/\s+/g, '-')} className="indicator-card">
              <div className="indicator-header">
                <h3 className="indicator-title">{kpi.title}</h3>
                <div className={`trend-badge trend-${kpi.trend}`}>
                  <span className={`trend-icon trend-${kpi.trend}-icon`}></span>
                  <span className="trend-value">{kpi.percentage}</span>
                </div>
              </div>
              <div className="indicator-value">{kpi.value}</div>
              <div className="indicator-description">{kpi.description}</div>
            </div>
          ))
        ) : (
          <div className="no-data-message">Aucun indicateur disponible</div>
        )}
      </div>
    </div>
  )
}

export default PerformanceIndicators
