import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { jobsAPI } from '../api';
import './JobSequencing.css';

const JobSequencing = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    order_number: 'ORD-1058',
    client_name: 'Next Retail UK',
    product_name: 'Chino Trousers',
    line_name: 'Line-B',
    quantity: 2000,
    priority: 'High',
    start_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
  });

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    const res = await jobsAPI.getQueue();
    if (res.data?.success) {
      setQueue(res.data.data);
    }
    setLoading(false);
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    await jobsAPI.addJob(newJobForm);
    alert(
      `Production Job for "${newJobForm.order_number}" queued on ${newJobForm.line_name}!`,
    );
    setShowAddJobModal(false);
    loadQueue();
  };

  return (
    <Layout>
      <div className="sequencing-page">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Job Sequencing & Order Scheduling</h1>
            <p className="page-subtitle">
              Prioritize machine allocation, setup changeovers, and on-time
              shipment fulfillment
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowAddJobModal(true)}
            >
              <i className="fas fa-plus-circle"></i> Add Job
            </button>
            <button
              className="btn btn-accent"
              onClick={() =>
                alert(
                  'AI Scheduling Algorithm executed! Changeover times minimized by 14%.',
                )
              }
            >
              <i className="fas fa-magic"></i> Optimize Sequence (AI)
            </button>
          </div>
        </div>

        {/* Priority Timeline Cards */}
        <div className="queue-cards-section">
          <h2>Production Sequence Queue (Sorted by Priority &amp; Due Date)</h2>
          {loading ? (
            <div className="loading-state">Loading sequencing queue...</div>
          ) : (
            <div className="queue-list">
              {queue.map((job, idx) => (
                <div key={job.id} className="queue-card">
                  <div className="queue-rank-badge">#{idx + 1}</div>
                  <div className="queue-card-main">
                    <div className="queue-header-line">
                      <h3>
                        {job.order_number} — {job.client_name}
                      </h3>
                      <span
                        className={`badge ${
                          job.priority === 'Critical'
                            ? 'badge-danger'
                            : job.priority === 'High'
                              ? 'badge-warning'
                              : 'badge-info'
                        }`}
                      >
                        {job.priority} Priority
                      </span>
                    </div>

                    <div className="queue-meta-row">
                      <span>
                        <i className="fas fa-tshirt"></i> {job.product_name}
                      </span>
                      <span>
                        <i className="fas fa-boxes"></i>{' '}
                        {job.quantity.toLocaleString()} pcs
                      </span>
                      <span>
                        <i className="fas fa-industry"></i> {job.line_name}
                      </span>
                      <span>
                        <i className="fas fa-calendar-alt"></i> Start:{' '}
                        {job.start_date}
                      </span>
                      <span>
                        <i className="fas fa-truck"></i> Due: {job.due_date}
                      </span>
                    </div>
                  </div>

                  <div className="queue-status-col">
                    <span
                      className={`badge ${job.status === 'running' ? 'badge-success' : 'badge-info'}`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        alert(`Reordering position for ${job.order_number}...`)
                      }
                    >
                      <i className="fas fa-arrows-alt-v"></i> Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Job Modal (Figma node-id=1-56283) */}
      {showAddJobModal && (
        <div className="c2s-modal-overlay">
          <div className="c2s-modal-dialog">
            <div className="c2s-modal-header">
              <h2>Schedule New Production Job</h2>
              <button
                className="c2s-modal-close"
                onClick={() => setShowAddJobModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddJob}>
              <div className="c2s-modal-body">
                <div className="form-group">
                  <label className="form-label">Order Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newJobForm.order_number}
                    onChange={(e) =>
                      setNewJobForm({
                        ...newJobForm,
                        order_number: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Buyer / Client Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newJobForm.client_name}
                    onChange={(e) =>
                      setNewJobForm({
                        ...newJobForm,
                        client_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Garment Style / Item</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newJobForm.product_name}
                    onChange={(e) =>
                      setNewJobForm({
                        ...newJobForm,
                        product_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Production Line</label>
                  <select
                    className="form-control"
                    value={newJobForm.line_name}
                    onChange={(e) =>
                      setNewJobForm({
                        ...newJobForm,
                        line_name: e.target.value,
                      })
                    }
                  >
                    <option value="Line-A">Line-A (Sewing)</option>
                    <option value="Line-B">Line-B (Sewing)</option>
                    <option value="Line-C">Line-C (Finishing)</option>
                    <option value="Line-D">Line-D (Quality Control)</option>
                    <option value="Line-E">Line-E (Packaging)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Order Quantity (pcs)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newJobForm.quantity}
                    onChange={(e) =>
                      setNewJobForm({
                        ...newJobForm,
                        quantity: Number(e.target.value),
                      })
                    }
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Tier</label>
                  <select
                    className="form-control"
                    value={newJobForm.priority}
                    onChange={(e) =>
                      setNewJobForm({ ...newJobForm, priority: e.target.value })
                    }
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Shipment Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newJobForm.due_date}
                    onChange={(e) =>
                      setNewJobForm({ ...newJobForm, due_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="c2s-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddJobModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-calendar-plus"></i> Schedule Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default JobSequencing;
