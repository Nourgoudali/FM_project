"use client"

import "./PerformanceIndicators.css"

function PerformanceIndicators({ data }) {
  // Données simulées pour les KPIs
  const kpis = [
    {
      title: "MTBF",
      value: "168h",
      description: "Temps moyen entre pannes",
      trend: "up",
      percentage: "+12%",
    },
    {
      title: "MTTR",
      value: "4.2h",
      description: "Temps moyen de réparation",
      trend: "down",
      percentage: "-8%",
    },
    {
      title: "Taux de disponibilité",
      value: "97.5%",
      description: "Disponibilité globale des équipements",
      trend: "up",
      percentage: "+2.5%",
    },
    {
      title: "Taux de conformité",
      value: "94%",
      description: "Conformité aux plannings de maintenance",
      trend: "neutral",
      percentage: "0%",
    },
  ]

  return (
    <div className="performance-indicators">
      <h2 className="indicators-title">Indicateurs de performance</h2>
      <div className="indicators-grid">
        {kpis.map((kpi, index) => (
          <div key={index} className="indicator-card">
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
        ))}
      </div>
    </div>
  )
}

export default PerformanceIndicators
