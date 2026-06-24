import api from '../lib/axios';

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: (data) => api.post('/auth/logout', data),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  changePassword: (data) => api.put('/auth/change-password', data),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// ─── Dashboard ───────────────────────────────────────────
export const dashboardAPI = {
  admin: (params) => api.get('/dashboard/admin', { params }),
  teacher: () => api.get('/dashboard/teacher'),
  student: () => api.get('/dashboard/student'),
  parent: () => api.get('/dashboard/parent'),
};

// ─── Students ────────────────────────────────────────────
export const studentsAPI = {
  list: (params) => api.get('/students', { params }),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  promote: (id, data) => api.put(`/students/${id}/promote`, data),
  transfer: (id, data) => api.put(`/students/${id}/transfer`, data),
  exportExcel: (params) => api.get('/students/export/excel', { params, responseType: 'blob' }),
  certificate: (id, type, data) => api.get(`/students/${id}/certificate/${type}`, { data, responseType: 'blob' }),
};

// ─── Teachers ────────────────────────────────────────────
export const teachersAPI = {
  list: (params) => api.get('/teachers', { params }),
  get: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
  assignSubjects: (id, data) => api.put(`/teachers/${id}/assign-subjects`, data),
};

// ─── Parents ─────────────────────────────────────────────
export const parentsAPI = {
  list: (params) => api.get('/parents', { params }),
  get: (id) => api.get(`/parents/${id}`),
  create: (data) => api.post('/parents', data),
  update: (id, data) => api.put(`/parents/${id}`, data),
};

// ─── Classes & Sections ──────────────────────────────────
export const classesAPI = {
  list: (params) => api.get('/classes', { params }),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  sections: (classId) => api.get(`/classes/${classId}/sections`),
  createSection: (classId, data) => api.post(`/classes/${classId}/sections`, data),
};

// ─── Subjects ────────────────────────────────────────────
export const subjectsAPI = {
  list: (params) => api.get('/subjects', { params }),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// ─── Attendance ──────────────────────────────────────────
export const attendanceAPI = {
  get: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  monthly: (params) => api.get('/attendance/monthly', { params }),
  student: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  exportExcel: (params) => api.get('/attendance/report/export', { params, responseType: 'blob' }),
};

// ─── Fees ────────────────────────────────────────────────
export const feesAPI = {
  getStructure: () => api.get('/fees/structure'),
  createStructure: (data) => api.post('/fees/structure', data),
  updateStructure: (id, data) => api.put(`/fees/structure/${id}`, data),
  getPayments: (params) => api.get('/fees/payments', { params }),
  collectFee: (data) => api.post('/fees/payments', data, { responseType: 'blob' }),
  downloadReceipt: (id) => api.get(`/fees/payments/${id}/receipt`, { responseType: 'blob' }),
  getDefaulters: (params) => api.get('/fees/defaulters', { params }),
  exportExcel: (params) => api.get('/fees/payments/export', { params, responseType: 'blob' }),
  getStats: (params) => api.get('/fees/stats', { params }),
};

// ─── Exams ───────────────────────────────────────────────
export const examsAPI = {
  list: (params) => api.get('/exams', { params }),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  enterMarks: (examId, data) => api.post(`/exams/${examId}/results`, data),
  getResults: (examId, params) => api.get(`/exams/${examId}/results`, { params }),
  downloadReportCard: (examId, studentId) => api.get(`/exams/${examId}/results/${studentId}/report-card`, { responseType: 'blob' }),
  publishResults: (examId) => api.put(`/exams/${examId}/results/publish`),
};

// ─── Homework ────────────────────────────────────────────
export const homeworkAPI = {
  list: (params) => api.get('/homework', { params }),
  create: (data) => api.post('/homework', data),
  update: (id, data) => api.put(`/homework/${id}`, data),
  delete: (id) => api.delete(`/homework/${id}`),
  submit: (id, data) => api.post(`/homework/${id}/submit`, data),
  getSubmissions: (id) => api.get(`/homework/${id}/submissions`),
  gradeSubmission: (id, data) => api.put(`/homework/submissions/${id}/grade`, data),
};

// ─── Timetable ───────────────────────────────────────────
export const timetableAPI = {
  get: (params) => api.get('/timetable', { params }),
  save: (data) => api.post('/timetable', data),
};

// ─── Notices ─────────────────────────────────────────────
export const noticesAPI = {
  list: (params) => api.get('/notices', { params }),
  create: (data) => api.post('/notices', data),
  update: (id, data) => api.put(`/notices/${id}`, data),
  delete: (id) => api.delete(`/notices/${id}`),
  publish: (id) => api.put(`/notices/${id}/publish`),
  notifications: (params) => api.get('/notices/notifications', { params }),
  markAllRead: () => api.put('/notices/notifications/read-all'),
};

// ─── Messages ────────────────────────────────────────────
export const messagesAPI = {
  conversations: () => api.get('/messages/conversations'),
  getMessages: (userId, params) => api.get(`/messages/${userId}`, { params }),
  send: (data) => api.post('/messages', data),
  users: () => api.get('/messages/users'),
};

// ─── Library ─────────────────────────────────────────────
export const libraryAPI = {
  books: (params) => api.get('/library/books', { params }),
  createBook: (data) => api.post('/library/books', data),
  updateBook: (id, data) => api.put(`/library/books/${id}`, data),
  issued: (params) => api.get('/library/issued', { params }),
  issueBook: (data) => api.post('/library/issue', data),
  returnBook: (id) => api.post(`/library/return/${id}`),
};

// ─── Transport ───────────────────────────────────────────
export const transportAPI = {
  routes: () => api.get('/transport/routes'),
  createRoute: (data) => api.post('/transport/routes', data),
  updateRoute: (id, data) => api.put(`/transport/routes/${id}`, data),
  vehicles: () => api.get('/transport/vehicles'),
  createVehicle: (data) => api.post('/transport/vehicles', data),
  drivers: () => api.get('/transport/drivers'),
  createDriver: (data) => api.post('/transport/drivers', data),
};

// ─── HR ──────────────────────────────────────────────────
export const hrAPI = {
  staff: (params) => api.get('/hr/staff', { params }),
  createStaff: (data) => api.post('/hr/staff', data),
  updateStaff: (id, data) => api.put(`/hr/staff/${id}`, data),
  payroll: (params) => api.get('/hr/payroll', { params }),
  generatePayroll: (data) => api.post('/hr/payroll', data),
  markPaid: (id, data) => api.put(`/hr/payroll/${id}/pay`, data),
};

// ─── Documents ───────────────────────────────────────────
export const documentsAPI = {
  list: (params) => api.get('/documents', { params }),
  upload: (data) => api.post('/documents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verify: (id) => api.put(`/documents/${id}/verify`),
  delete: (id) => api.delete(`/documents/${id}`),
};

// ─── Settings ────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  uploadLogo: (data) => api.post('/settings/logo', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
