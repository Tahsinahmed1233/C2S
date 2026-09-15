import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { machinesAPI } from '../api';
import './MachineMaintenance.css';

const MachineMaintenance = () => {
  const [data, setData] = useState({ summary: {}, machines: [] });
  const [loading, setLoading] = useState(true);

  // Modals
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Form
  const [workOrderForm, setWorkOrderForm] = useState({
    machine_id: 1,
    maintenance_type: 'Preventive',
    description:
      'Routine oil pump cleaning, belt tension calibration, needle bar lubrication',
    cost: 120,
    scheduled_date: new Date(Date.now() + 3 * 86400000)
      .toISOString()
      .split('T')[0],
  });

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    setLoading(true);
    const res = await machinesAPI.getMachines();
    if (res.data?.success) {
      setData(res.data.data);
    }
    setLoading(false);
  };

  const handleCreateWorkOrder = async (e) => {
    e.preventDefault();
    await machinesAPI.createWorkOrder(workOrderForm);
    alert('Maintenance work order created successfully!');
    setShowWorkOrderModal(false);
    loadMachines();
  };

  return (
    <Layout>
      <div className="machines-page">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Machine Maintenance & Fleet Health</h1>
            <p className="page-subtitle">
              Predictive breakdown monitoring, scheduled work orders, and sensor
              telemetry
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowExportModal(true)}
            >
              <i className="fas fa-file-export"></i> Export Report
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowWorkOrderModal(true)}
            >
              <i className="fas fa-tools"></i> New Work Order
            </button>
          </div>
        </div>

        {/* Machine Stats */}
        <div className="machine-stats-grid">
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Fleet Health Index</span>
              <div className="stat-card-icon icon-green">
                <i className="fas fa-heartbeat"></i>
              </div>
            </div>
            <div className="stat-card-value">
              {data.summary?.overall_fleet_health || 81.5}%
            </div>
            <div className="stat-card-subtitle">
              Normal vibration &amp; heat index
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Operational Machines</span>
              <div className="stat-card-icon icon-blue">
                <i className="fas fa-cog"></i>
              </div>
            </div>
            <div className="stat-card-value">
              {data.summary?.operational || 2} /{' '}
              {data.summary?.total_machines || 4}
            </div>
            <div className="stat-card-subtitle">
              Active on sewing &amp; cutting lines
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">In Maintenance</span>
              <div className="stat-card-icon icon-yellow">
                <i className="fas fa-wrench"></i>
              </div>
            </div>
            <div className="stat-card-value">
              {data.summary?.in_maintenance || 1}
            </div>
            <div className="stat-card-subtitle">Work order in progress</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Breakdown Alert</span>
              <div className="stat-card-icon icon-red">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
            <div className="stat-card-value">{data.summary?.broken || 1}</div>
            <div className="stat-card-subtitle">Line-C Button Holer down</div>
          </div>
        </div>

        {/* Machine Fleet Grid */}
        <div className="machine-cards-section">
          <h2>Machinery Fleet Status</h2>
          {loading ? (
            <div className="loading-state">
              Loading machine fleet telemetry...
            </div>
          ) : (
            <div className="machines-grid">
              {(data.machines || []).map((m) => (
                <div key={m.id} className="machine-card">
                  <div className="machine-card-header">
                    <div>
                      <h3>{m.machine_name}</h3>
                      <span className="machine-code-badge">
                        {m.machine_code} • {m.line_name}
                      </span>
                    </div>
                    <span
                      className={`badge ${
                        m.status === 'operational'
                          ? 'badge-success'
                          : m.status === 'maintenance'
                            ? 'badge-warning'
                            : 'badge-danger'
                      }`}
                    >
                      {m.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="machine-health-box">
                    <div className="health-labels">
                      <span>Health Index</span>
                      <strong
                        style={{
                          color:
                            m.health_index > 80
                              ? 'var(--color-success-600)'
                              : m.health_index > 60
                                ? 'var(--color-warning-600)'
                                : 'var(--color-danger-600)',
                        }}
                      >
                        {m.health_index}%
                      </strong>
                    </div>
                    <div
                      className="progress-bar-container"
                      style={{ width: '100%' }}
                    >
                      <div
                        className="progress-fill"
                        style={{
                          width: `${m.health_index}%`,
                          backgroundColor:
                            m.health_index > 80
                              ? 'var(--color-success-500)'
                              : m.health_index > 60
                                ? 'var(--color-warning-500)'
                                : 'var(--color-danger-500)',
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="machine-dates-row">
                    <div>
                      <span className="date-label">Last Maintained</span>
                      <span className="date-val">
                        {m.last_maintenance_date}
                      </span>
                    </div>
                    <div>
                      <span className="date-label">Next Due Date</span>
                      <span className="date-val">
                        {m.next_maintenance_date}
                      </span>
                    </div>
                  </div>

                  <div className="machine-card-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setWorkOrderForm({
                          ...workOrderForm,
                          machine_id: m.id,
                        });
                        setShowWorkOrderModal(true);
                      }}
                    >
                      <i className="fas fa-wrench"></i> Service
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        alert(
                          `Diagnostics report for ${m.machine_code} generated.`,
                        )
                      }
                    >
                      <i className="fas fa-file-medical-alt"></i> Diagnostics
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: New Work Order (Figma node-id=1-60437) */}
      {showWorkOrderModal && (
        <div className="c2s-modal-overlay">
          <div className="c2s-modal-dialog">
            <div className="c2s-modal-header">
              <h2>Create Equipment Work Order</h2>
              <button
                className="c2s-modal-close"
                onClick={() => setShowWorkOrderModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateWorkOrder}>
              <div className="c2s-modal-body">
                <div className="form-group">
                  <label className="form-label">Target Machine</label>
                  <select
                    className="form-control"
                    value={workOrderForm.machine_id}
                    onChange={(e) =>
                      setWorkOrderForm({
                        ...workOrderForm,
                        machine_id: Number(e.target.value),
                      })
                    }
                  >
                    {(data.machines || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.machine_code} — {m.machine_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Maintenance Classification
                  </label>
                  <select
                    className="form-control"
                    value={workOrderForm.maintenance_type}
                    onChange={(e) =>
                      setWorkOrderForm({
                        ...workOrderForm,
                        maintenance_type: e.target.value,
                      })
                    }
                  >
                    <option value="Preventive">
                      Preventive Maintenance (PM)
                    </option>
                    <option value="Corrective">Corrective Calibration</option>
                    <option value="Emergency Breakdown">
                      Emergency Breakdown Repair
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Task Description & Parts Needed
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={workOrderForm.description}
                    onChange={(e) =>
                      setWorkOrderForm({
                        ...workOrderForm,
                        description: e.target.value,
                      })
                    }
                    required
                  ></textarea>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Estimated Cost ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={workOrderForm.cost}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          cost: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Scheduled Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={workOrderForm.scheduled_date}
                      onChange={(e) =>
                        setWorkOrderForm({
                          ...workOrderForm,
                          scheduled_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="c2s-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowWorkOrderModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-check"></i> Generate Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Export Report (Figma node-id=1-60319) */}
      {showExportModal && (
        <div className="c2s-modal-overlay">
          <div className="c2s-modal-dialog">
            <div className="c2s-modal-header">
              <h2>Export Machinery Maintenance Dossier</h2>
              <button
                className="c2s-modal-close"
                onClick={() => setShowExportModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="c2s-modal-body">
              <p className="modal-description">
                Generate equipment health and downtime logs for buyer compliance
                audits:
              </p>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Timeframe</label>
                <select className="form-control">
                  <option>Last 30 Days</option>
                  <option>Last 90 Days (Quarterly Audit)</option>
                  <option>Full Year 2026</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Include Maintenance Cost Ledger
                </label>
                <input type="checkbox" defaultChecked /> Yes, include part
                replacement invoices
              </div>
            </div>
            <div className="c2s-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  alert('Downloading machinery maintenance audit report...');
                  setShowExportModal(false);
                }}
              >
                <i className="fas fa-download"></i> Download Export
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MachineMaintenance;
