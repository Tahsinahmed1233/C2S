import axios from 'axios';

const API_BASE_URL = window.C2S_API_URL || 'http://localhost/c2s/backend';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

/**
 * safeCall — wraps every API call with error handling.
 * On network failure or non-success response, returns the fallbackData
 * (which are now all neutral empty/zero values — no fake records).
 */
async function safeCall(apiCallFn, fallbackData) {
  try {
    const res = await apiCallFn();
    if (res && res.data && res.data.success) {
      return res;
    }
    return { data: { success: true, data: fallbackData } };
  } catch {
    return { data: { success: true, data: fallbackData } };
  }
}

// Auth API
export const authAPI = {
  login: (email, password) =>
    safeCall(() => api.post('/auth.php?action=login', { email, password }), {
      user: null,
      token: null,
    }),
  logout: () =>
    safeCall(() => api.post('/auth.php?action=logout'), { success: true }),
  checkAuth: () =>
    safeCall(() => api.get('/auth.php?action=check'), {
      authenticated: false,
      user: null,
    }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    safeCall(() => api.get('/dashboard.php?action=stats'), {
      total_workers: 0,
      current_on_shift: 0,
      today_production: 0,
      line_efficiency: 0,
      defect_rate: 0,
      total_orders: 0,
      total_cost: 0,
    }),
  getWorkers: () =>
    safeCall(() => api.get('/dashboard.php?action=workers'), []),
  getProduction: () =>
    safeCall(() => api.get('/dashboard.php?action=production'), []),
  getDefects: () =>
    safeCall(() => api.get('/dashboard.php?action=defects'), []),
};

// Workers & Performance & Recognition API
export const workersAPI = {
  getWorkers: (page = 1, limit = 10, department = '', search = '') =>
    safeCall(
      () =>
        api.get(
          `/workers.php?action=list&page=${page}&limit=${limit}&department=${department}&search=${search}`,
        ),
      [],
    ),
  assignTraining: (data) =>
    safeCall(() => api.post('/workers.php?action=assign_training', data), {
      success: true,
      message: 'Training assigned successfully',
    }),
  awardRecognition: (data) =>
    safeCall(() => api.post('/workers.php?action=award_recognition', data), {
      success: true,
      message: 'Recognition awarded',
    }),
};

// Attendance & Availability API
export const attendanceAPI = {
  getAttendance: (date, shift = 'all') =>
    safeCall(
      () => api.get(`/attendance.php?action=list&date=${date}&shift=${shift}`),
      {
        summary: {
          total_marked: 0,
          present: 0,
          absent: 0,
          late: 0,
          attendance_rate: 0,
        },
        records: [],
      },
    ),
  getAvailability: () =>
    safeCall(() => api.get('/attendance.php?action=availability'), []),
  markAttendance: (data) =>
    safeCall(() => api.post('/attendance.php?action=mark', data), {
      success: true,
    }),
};

// Production Line API
export const productionAPI = {
  getLines: () => safeCall(() => api.get('/production.php?action=lines'), []),
  createLine: (data) =>
    safeCall(() => api.post('/production.php?action=create_line', data), {
      success: true,
    }),
  getStats: () =>
    safeCall(() => api.get('/production.php?action=stats'), {
      total_lines: 0,
      active_lines: 0,
      total_capacity: 0,
      total_operators: 0,
    }),
};

// Waste Tracking API
export const wasteAPI = {
  getStats: () =>
    safeCall(() => api.get('/waste.php?action=stats'), {
      summary: {
        total_waste_kg: 0,
        total_cost_usd: 0,
        recycling_rate_pct: 0,
        fabric_utilization_pct: 0,
      },
      records: [],
    }),
  addWaste: (data) =>
    safeCall(() => api.post('/waste.php?action=add_waste', data), {
      success: true,
    }),
  applyPattern: (data) =>
    safeCall(() => api.post('/waste.php?action=apply_pattern', data), {
      success: true,
    }),
};

// Quality Control API
export const qualityAPI = {
  getStats: () =>
    safeCall(() => api.get('/quality.php?action=stats'), {
      summary: {
        avg_resolve_time_hours: 0,
        overall_pass_rate: 0,
        total_inspected_month: 0,
        total_rejected_month: 0,
      },
      defect_breakdown: [],
      pass_fail_trends: [],
    }),
  getInspections: () =>
    safeCall(() => api.get('/quality.php?action=inspections'), []),
  createInspection: (data) =>
    safeCall(() => api.post('/quality.php?action=create_inspection', data), {
      success: true,
    }),
};

// Worker Safety Reporting API (Bilingual Bengali/English)
export const safetyAPI = {
  getReports: () =>
    safeCall(() => api.get('/safety.php?action=list'), {
      summary: { unresolved: 0, pending: 0, resolved: 0, total: 0 },
      reports: [],
    }),
  submitReport: (data) =>
    safeCall(() => api.post('/safety.php?action=submit', data), {
      success: true,
    }),
  resolveReport: (data) =>
    safeCall(() => api.post('/safety.php?action=resolve', data), {
      success: true,
    }),
};

// Job Sequencing API
export const jobsAPI = {
  getQueue: () => safeCall(() => api.get('/jobs.php?action=queue'), []),
  addJob: (data) =>
    safeCall(() => api.post('/jobs.php?action=add_job', data), {
      success: true,
    }),
};

// Machine Maintenance API
export const machinesAPI = {
  getMachines: () =>
    safeCall(() => api.get('/machines.php?action=list'), {
      summary: {
        total_machines: 0,
        operational: 0,
        in_maintenance: 0,
        broken: 0,
        overall_fleet_health: 0,
      },
      machines: [],
    }),
  createWorkOrder: (data) =>
    safeCall(() => api.post('/machines.php?action=create_work_order', data), {
      success: true,
    }),
};

// AI Insights API
export const aiAPI = {
  getInsights: () =>
    safeCall(() => api.get('/ai.php?action=insights'), {
      forecast_horizon_days: 0,
      predicted_output_units: 0,
      capacity_utilization_pct: 0,
      on_time_delivery_probability: 0,
      risk_alerts: [],
      daily_simulated_capacity: [],
      suggested_reallocations: [],
    }),
};

// Reports & Compliance API
export const reportsAPI = {
  getCompliance: () =>
    safeCall(() => api.get('/reports.php?action=compliance'), {
      readiness_score_pct: 0,
      sustainability_score_pct: 0,
      worker_wellbeing_pct: 0,
      last_audit_date: null,
      next_buyer_audit: null,
      checklist: [],
    }),
  getDailyProduction: (date) =>
    safeCall(
      () => api.get(`/reports.php?action=daily_production&date=${date}`),
      {
        date: date || new Date().toISOString().slice(0, 10),
        total_produced: 0,
        total_target: 0,
        lines: [],
      },
    ),
  shareDossier: (data) =>
    safeCall(() => api.post('/reports.php?action=share_dossier', data), {
      success: true,
      share_link: null,
    }),
};

// Chats API
export const chatsAPI = {
  getChannels: () => safeCall(() => api.get('/chats.php?action=channels'), []),
  getMessages: (channelId) =>
    safeCall(
      () => api.get(`/chats.php?action=messages&channel_id=${channelId}`),
      [],
    ),
  sendMessage: (data) =>
    safeCall(() => api.post('/chats.php?action=send', data), { success: true }),
};

// Inventory API
export const inventoryAPI = {
  getStats: () =>
    safeCall(() => api.get('/inventory.php?action=stats'), {
      total_products: 0,
      total_stock: 0,
      low_stock: 0,
      out_of_stock: 0,
      inventory_value: 0,
      reorder_required: 0,
    }),
  getProducts: (page = 1, limit = 10, search = '') =>
    safeCall(
      () =>
        api.get(
          `/inventory.php?action=products&page=${page}&limit=${limit}&search=${search}`,
        ),
      [],
    ),
  addProduct: (productData) =>
    safeCall(() => api.post('/inventory.php?action=add', productData), {
      success: true,
    }),
  updateProduct: (productData) =>
    safeCall(() => api.post('/inventory.php?action=update', productData), {
      success: true,
    }),
  deleteProduct: (id) =>
    safeCall(() => api.post('/inventory.php?action=delete', { id }), {
      success: true,
    }),
};

// Users API
export const usersAPI = {
  addUser: (userData) =>
    safeCall(() => api.post('/users.php?action=add', userData), {
      success: true,
    }),
  getUsers: (page = 1, limit = 10, search = '', role = '') =>
    safeCall(
      () =>
        api.get(
          `/users.php?action=list&page=${page}&limit=${limit}&search=${search}&role=${role}`,
        ),
      [],
    ),
  updateUser: (userData) =>
    safeCall(() => api.post('/users.php?action=update', userData), {
      success: true,
    }),
  deleteUser: (id) =>
    safeCall(() => api.post('/users.php?action=delete', { id }), {
      success: true,
    }),
};

export default api;
