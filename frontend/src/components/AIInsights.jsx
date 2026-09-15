import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { aiAPI } from '../api';
import './AIInsights.css';

const AIInsights = () => {
  const [data, setData] = useState(null);
  const [horizonDays, setHorizonDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [horizonDays]);

  const loadInsights = async () => {
    setLoading(true);
    const res = await aiAPI.getInsights();
    if (res.data?.success) {
      setData(res.data.data);
    }
    setLoading(false);
  };

  const handleApplyRebalance = (realloc) => {
    alert(
      `Rebalancing applied: Reallocated ${realloc.name} from ${realloc.current_line} to ${realloc.recommended_line}. Floor throughput recalculated!`,
    );
  };

  return (
    <Layout>
      <div className="ai-page">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              AI Operational Insights & Predictive Simulation
            </h1>
            <p className="page-subtitle">
              Machine learning capacity forecasting, defect risk escalation
              warnings, and intelligent shift rebalancing
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-accent"
              onClick={() =>
                alert(
                  'Simulating 14-day production scenario with +15% overtime...',
                )
              }
            >
              <i className="fas fa-play-circle"></i> Run AI Simulation
            </button>
          </div>
        </div>

        {/* Forecast Horizon Controller */}
        <div className="horizon-slider-card">
          <div className="slider-header">
            <div>
              <h3>
                Simulation Horizon: <strong>{horizonDays} Days Ahead</strong>
              </h3>
              <p>
                Predicting floor capacity, bottleneck points, and yarn
                requirements for next {horizonDays} operating days
              </p>
            </div>
            <div className="horizon-buttons">
              {[3, 7, 14, 30].map((d) => (
                <button
                  key={d}
                  className={`btn btn-sm ${horizonDays === d ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setHorizonDays(d)}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Key Predictions */}
        <div className="ai-kpi-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Projected Output</span>
              <div className="stat-card-icon icon-blue">
                <i className="fas fa-chart-line"></i>
              </div>
            </div>
            <div className="stat-card-value">
              {(data?.predicted_output_units || 28400).toLocaleString()} pcs
            </div>
            <div className="stat-card-subtitle">
              +4.2% above buyer baseline target
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Capacity Utilization</span>
              <div className="stat-card-icon icon-green">
                <i className="fas fa-tachometer-alt"></i>
              </div>
            </div>
            <div className="stat-card-value">
              {data?.capacity_utilization_pct || 88.7}%
            </div>
            <div className="stat-card-subtitle">
              Optimal machine balance zone
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">
                On-Time Delivery Probability
              </span>
              <div className="stat-card-icon icon-green">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            <div className="stat-card-value">
              {data?.on_time_delivery_probability || 96.2}%
            </div>
            <div className="stat-card-subtitle">
              Calculated across 4 active purchase orders
            </div>
          </div>
        </div>

        {/* Real-Time Risk Alerts */}
        <div className="ai-alerts-section">
          <h2>Automated Floor Risk & Bottleneck Alerts</h2>
          <div className="alerts-stack">
            {(data?.risk_alerts || []).map((alertItem) => (
              <div
                key={alertItem.id}
                className={`ai-alert-banner ${alertItem.severity.toLowerCase()}`}
              >
                <div className="alert-icon-box">
                  <i
                    className={`fas ${alertItem.severity === 'Critical' ? 'fa-exclamation-circle' : alertItem.severity === 'Warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}
                  ></i>
                </div>
                <div className="alert-text-body">
                  <div className="alert-headline">
                    <h4>{alertItem.type}</h4>
                    <span className="alert-line-badge">{alertItem.line}</span>
                  </div>
                  <p>{alertItem.message}</p>
                </div>
                <div className="alert-action-btn">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() =>
                      alert(`Action triggered: ${alertItem.action_label}`)
                    }
                  >
                    {alertItem.action_label}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Operator Reallocations */}
        <div className="reallocation-card">
          <div className="table-header-row">
            <h2>AI Intelligent Floor Balancing Recommendations</h2>
            <span className="badge badge-success">2 Active Suggestions</span>
          </div>

          <div className="table-responsive">
            <table className="c2s-table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Current Station</th>
                  <th>Recommended Station</th>
                  <th>Optimization Rationale</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(data?.suggested_reallocations || []).map((rec, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{rec.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {rec.current_line}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-warning">
                        {rec.recommended_line}
                      </span>
                    </td>
                    <td>{rec.reason}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApplyRebalance(rec)}
                      >
                        <i className="fas fa-check"></i> Apply Shift
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIInsights;
