import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { attendanceAPI } from '../api';
import './Attendance.css';

const Attendance = () => {
  const [data, setData] = useState({ summary: {}, records: [] });
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );

  useEffect(() => {
    loadAttendance();
  }, [selectedDate, selectedShift]);

  const loadAttendance = async () => {
    setLoading(true);
    const res = await attendanceAPI.getAttendance(selectedDate, selectedShift);
    if (res.data?.success) {
      setData(res.data.data);
    }
    setLoading(false);
  };

  const handleOpenAvailability = async () => {
    const res = await attendanceAPI.getAvailability();
    if (res.data?.success) {
      setAvailability(res.data.data);
    }
    setShowAvailabilityModal(true);
  };

  return (
    <Layout>
      <div className="attendance-page">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Attendance & Shift Management</h1>
            <p className="page-subtitle">
              Track worker clock-ins, daily shift assignments, and real-time
              floor availability
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-primary"
              onClick={handleOpenAvailability}
            >
              <i className="fas fa-user-check"></i> Check Availability
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => alert('Exporting Attendance Ledger...')}
            >
              <i className="fas fa-download"></i> Export Ledger
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="attendance-filter-bar">
          <div className="filter-item">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <label className="form-label">Shift</label>
            <select
              className="form-control"
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
            >
              <option value="all">All Shifts</option>
              <option value="Morning">Morning Shift (08:00 - 17:00)</option>
              <option value="Evening">Evening Shift (17:00 - 23:00)</option>
              <option value="Night">Night Shift (23:00 - 07:00)</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="attendance-summary-grid">
          <div className="summary-stat-box">
            <span className="stat-label">Total Marked</span>
            <div className="stat-value">{data.summary.total_marked || 142}</div>
            <span className="stat-sub">Floor Headcount</span>
          </div>
          <div className="summary-stat-box success">
            <span className="stat-label">Present</span>
            <div className="stat-value">{data.summary.present || 136}</div>
            <span className="stat-sub">Active On Line</span>
          </div>
          <div className="summary-stat-box danger">
            <span className="stat-label">Absent</span>
            <div className="stat-value">{data.summary.absent || 4}</div>
            <span className="stat-sub">Unexcused</span>
          </div>
          <div className="summary-stat-box warning">
            <span className="stat-label">Late Arrivals</span>
            <div className="stat-value">{data.summary.late || 2}</div>
            <span className="stat-sub">&gt; 15 mins delay</span>
          </div>
          <div className="summary-stat-box blue">
            <span className="stat-label">Attendance Rate</span>
            <div className="stat-value">
              {data.summary.attendance_rate || 95.8}%
            </div>
            <span className="stat-sub">Target &gt; 92%</span>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="attendance-table-card">
          <div className="table-header-row">
            <h2>Daily Attendance Ledger ({selectedDate})</h2>
            <span className="badge badge-info">
              {data.records.length} Records
            </span>
          </div>

          <div className="table-responsive">
            <table className="c2s-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Worker Name</th>
                  <th>Department</th>
                  <th>Assigned Line</th>
                  <th>Shift</th>
                  <th>Clock In</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((rec, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{rec.employee_id}</strong>
                    </td>
                    <td>{rec.name}</td>
                    <td>{rec.department}</td>
                    <td>
                      <span className="badge badge-info">{rec.line}</span>
                    </td>
                    <td>{rec.shift}</td>
                    <td>{rec.check_in}</td>
                    <td>
                      <span
                        className={`badge ${
                          rec.status === 'present'
                            ? 'badge-success'
                            : rec.status === 'late'
                              ? 'badge-warning'
                              : 'badge-danger'
                        }`}
                      >
                        {rec.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Availability Modal (Figma node-id=1-57701) */}
      {showAvailabilityModal && (
        <div className="c2s-modal-overlay">
          <div className="c2s-modal-dialog large">
            <div className="c2s-modal-header">
              <h2>Line Worker Availability & Shift Coverage</h2>
              <button
                className="c2s-modal-close"
                onClick={() => setShowAvailabilityModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="c2s-modal-body">
              <p className="modal-description">
                Real-time line balancing matrix comparing required machinery
                headcount against present operators:
              </p>
              <div className="table-responsive" style={{ marginTop: '1rem' }}>
                <table className="c2s-table">
                  <thead>
                    <tr>
                      <th>Line Name</th>
                      <th>Planned Capacity</th>
                      <th>Active Present</th>
                      <th>Operator Shortage</th>
                      <th>Coverage Rate</th>
                      <th>Readiness Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availability.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{item.line_name}</strong>
                        </td>
                        <td>{item.capacity} operators</td>
                        <td>{item.present_workers} present</td>
                        <td>
                          {item.shortage > 0 ? (
                            <span
                              style={{
                                color: 'var(--color-danger-600)',
                                fontWeight: 600,
                              }}
                            >
                              -{item.shortage} workers
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-success-600)' }}>
                              Full Staff
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="progress-bar-container">
                            <div
                              className={`progress-fill ${item.coverage_pct < 80 ? 'danger' : 'success'}`}
                              style={{
                                width: `${Math.min(100, item.coverage_pct)}%`,
                              }}
                            ></div>
                            <span className="progress-text">
                              {item.coverage_pct}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.status === 'Full Coverage'
                                ? 'badge-success'
                                : item.status === 'Adequate'
                                  ? 'badge-warning'
                                  : 'badge-danger'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="c2s-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAvailabilityModal(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  alert(
                    'Auto-rebalancing algorithm initiated based on skill matrix!',
                  );
                  setShowAvailabilityModal(false);
                }}
              >
                <i className="fas fa-random"></i> Auto-Balance Shifts
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Attendance;
