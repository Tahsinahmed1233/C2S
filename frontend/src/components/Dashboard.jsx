import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { dashboardAPI } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_workers: 0,
    current_on_shift: 0,
    today_production: 0,
    line_efficiency: 0,
    defect_rate: 0,
    total_orders: 0,
    total_cost: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const response = await dashboardAPI.getStats();
    if (response.data?.success) {
      setStats(response.data.data);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="dashboard-content-wrap">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Executive Operations Dashboard</h1>
            <p className="page-subtitle">
              Real-time telemetry across factory floor lines, worker appraisals,
              and AI predictive insights
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/ai-insights')}
            >
              <i className="fas fa-brain"></i> AI Forecast
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/production')}
            >
              <i className="fas fa-industry"></i> Production Lines
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="dashboard-grid">
          <div
            className="stat-card"
            onClick={() => navigate('/attendance')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-card-header">
              <span className="stat-card-title">Total Workers</span>
              <div className="stat-card-icon icon-yellow">
                <i className="fas fa-users"></i>
              </div>
            </div>
            <div className="stat-card-value">{stats.total_workers}</div>
            <div className="stat-card-subtitle">
              Current On Shift • Click for Attendance
            </div>
          </div>

          <div
            className="stat-card"
            onClick={() => navigate('/production')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-card-header">
              <span className="stat-card-title">Today's Output</span>
              <div className="stat-card-icon icon-green">
                <i className="fas fa-tshirt"></i>
              </div>
            </div>
            <div className="stat-card-value">
              {Number(stats.today_production || 0).toLocaleString()} pcs
            </div>
            <div className="stat-card-subtitle">
              Target 4,000 pcs (96% Pace)
            </div>
          </div>

          <div
            className="stat-card"
            onClick={() => navigate('/job-sequencing')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-card-header">
              <span className="stat-card-title">Line Efficiency (%)</span>
              <div className="stat-card-icon icon-blue">
                <i className="fas fa-chart-line"></i>
              </div>
            </div>
            <div className="stat-card-value">{stats.line_efficiency}%</div>
            <div className="stat-card-subtitle">Avg across all 6 lines</div>
          </div>

          <div
            className="stat-card"
            onClick={() => navigate('/quality-control')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-card-header">
              <span className="stat-card-title">Defect Rate (%)</span>
              <div className="stat-card-icon icon-red">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
            <div className="stat-card-value">
              {Number(stats.defect_rate || 0)}%
            </div>
            <div className="stat-card-subtitle">Target below 2.0% AQL</div>
          </div>

          <div
            className="stat-card"
            onClick={() => navigate('/job-sequencing')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-card-header">
              <span className="stat-card-title">Total Active Orders</span>
              <div className="stat-card-icon icon-blue">
                <i className="fas fa-shopping-cart"></i>
              </div>
            </div>
            <div className="stat-card-value">{stats.total_orders}</div>
            <div className="stat-card-subtitle">Target 200 orders</div>
          </div>

          <div
            className="stat-card"
            onClick={() => navigate('/waste')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-card-header">
              <span className="stat-card-title">Total Floor Cost</span>
              <div className="stat-card-icon icon-green">
                <i className="fas fa-dollar-sign"></i>
              </div>
            </div>
            <div className="stat-card-value">
              ${Number(stats.total_cost || 0).toLocaleString()}
            </div>
            <div className="stat-card-subtitle">Includes scrap offset</div>
          </div>
        </div>

        {/* AI Warning Banner */}
        <div
          className="ai-alert-banner critical"
          style={{ margin: '0.5rem 0' }}
        >
          <div className="alert-icon-box">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <div className="alert-text-body">
            <div className="alert-headline">
              <h4>AI Warning: Defect Risk Escalation on Line 3</h4>
              <span className="alert-line-badge">Line 3 Sewing</span>
            </div>
            <p>
              Increasing stitch tension defect risk detected. Immediate machine
              calibration and needle inspection recommended.
            </p>
          </div>
          <div className="alert-action-btn">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/ai-insights')}
            >
              <i className="fas fa-search"></i> Investigate Line 3
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          <div
            className="chart-card"
            onClick={() => navigate('/performance')}
            style={{ cursor: 'pointer' }}
          >
            <div className="chart-card-header-row">
              <h3 className="chart-card-title">Top Worker By Performance</h3>
              <span className="badge badge-info">View Ranking</span>
            </div>
            <div className="chart-bars-list">
              <div className="chart-bar-item">
                <span className="bar-name">Taskin Amir</span>
                <div className="progress-bar-container" style={{ flex: 1 }}>
                  <div
                    className="progress-fill success"
                    style={{ width: '95%' }}
                  ></div>
                </div>
                <span className="bar-val">95%</span>
              </div>
              <div className="chart-bar-item">
                <span className="bar-name">Riya Akter</span>
                <div className="progress-bar-container" style={{ flex: 1 }}>
                  <div
                    className="progress-fill success"
                    style={{ width: '92%' }}
                  ></div>
                </div>
                <span className="bar-val">92%</span>
              </div>
              <div className="chart-bar-item">
                <span className="bar-name">Hosain Masba</span>
                <div className="progress-bar-container" style={{ flex: 1 }}>
                  <div
                    className="progress-fill success"
                    style={{ width: '88%' }}
                  ></div>
                </div>
                <span className="bar-val">88%</span>
              </div>
            </div>
          </div>

          <div
            className="chart-card"
            onClick={() => navigate('/production')}
            style={{ cursor: 'pointer' }}
          >
            <div className="chart-card-header-row">
              <h3 className="chart-card-title">Worker Contribution Per Line</h3>
              <span className="badge badge-info">Floor Balance</span>
            </div>
            <div className="chart-bars-list">
              <div className="chart-bar-item">
                <span className="bar-name">Line-A (Sewing)</span>
                <div className="progress-bar-container" style={{ flex: 1 }}>
                  <div
                    className="progress-fill success"
                    style={{ width: '96%' }}
                  ></div>
                </div>
                <span className="bar-val">48 / 50</span>
              </div>
              <div className="chart-bar-item">
                <span className="bar-name">Line-B (Sewing)</span>
                <div className="progress-bar-container" style={{ flex: 1 }}>
                  <div
                    className="progress-fill success"
                    style={{ width: '88%' }}
                  ></div>
                </div>
                <span className="bar-val">44 / 50</span>
              </div>
              <div className="chart-bar-item">
                <span className="bar-name">Line-C (Finishing)</span>
                <div className="progress-bar-container" style={{ flex: 1 }}>
                  <div
                    className="progress-fill success"
                    style={{ width: '93%' }}
                  ></div>
                </div>
                <span className="bar-val">28 / 30</span>
              </div>
            </div>
          </div>
        </div>

        {/* Worker Recognition & Rewards Carousel */}
        <div className="worker-section">
          <div className="worker-section-header">
            <div>
              <h3 className="worker-section-title">
                Worker Recognition &amp; Rewards
              </h3>
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-neutral-500)',
                }}
              >
                Top rated operators recognized for productivity and quality
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/rewards')}
            >
              <i className="fas fa-gift"></i> View All Rewards
            </button>
          </div>

          <div className="worker-grid">
            <div className="worker-card">
              <div className="worker-card-header">
                <div className="worker-avatar">T</div>
                <div className="worker-performance">95%</div>
              </div>
              <div className="worker-info">
                <div className="worker-name">Taskin Amir</div>
                <div className="worker-id">EMP-001 • Sewing</div>
              </div>
              <div className="worker-achievement">
                Exceeded production targets by 15% this month
              </div>
              <div className="worker-badge promoted">PROMOTED</div>
            </div>

            <div className="worker-card">
              <div className="worker-card-header">
                <div className="worker-avatar">R</div>
                <div className="worker-performance">92%</div>
              </div>
              <div className="worker-info">
                <div className="worker-name">Riya Akter</div>
                <div className="worker-id">EMP-002 • QC Lead</div>
              </div>
              <div className="worker-achievement">
                Zero defects in quality control for 30 days
              </div>
              <div className="worker-badge bonus">BONUS AWARDED</div>
            </div>

            <div className="worker-card">
              <div className="worker-card-header">
                <div className="worker-avatar">H</div>
                <div className="worker-performance">88%</div>
              </div>
              <div className="worker-info">
                <div className="worker-name">Hosain Masba</div>
                <div className="worker-id">EMP-003 • Finishing</div>
              </div>
              <div className="worker-achievement">
                Improved finishing efficiency by 20%
              </div>
              <div className="worker-badge promoted">PROMOTED</div>
            </div>

            <div className="worker-card">
              <div className="worker-card-header">
                <div className="worker-avatar">J</div>
                <div className="worker-performance">85%</div>
              </div>
              <div className="worker-info">
                <div className="worker-name">Jahida Alam</div>
                <div className="worker-id">EMP-004 • Packaging</div>
              </div>
              <div className="worker-achievement">
                Consistent attendance and punctuality record
              </div>
              <div className="worker-badge bonus">BONUS AWARDED</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
