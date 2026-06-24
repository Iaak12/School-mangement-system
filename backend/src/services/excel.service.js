const XLSX = require('xlsx');

const generateExcel = (data, sheetName = 'Sheet1', fileName = 'report') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Auto column widths
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String(row[key] || '').length)) + 2,
  }));
  ws['!cols'] = colWidths;

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

const generateStudentExcel = (students) => {
  const data = students.map((s) => ({
    'Admission No': s.admissionNumber,
    'First Name': s.firstName,
    'Last Name': s.lastName,
    'Class': s.class?.name || '-',
    'Section': s.section?.name || '-',
    'Gender': s.gender,
    'Date of Birth': s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString('en-IN') : '-',
    'Blood Group': s.bloodGroup || '-',
    'Category': s.category || '-',
    'Status': s.status,
    'Admission Date': s.admissionDate ? new Date(s.admissionDate).toLocaleDateString('en-IN') : '-',
  }));
  return generateExcel(data, 'Students', 'students_report');
};

const generateFeeExcel = (payments) => {
  const data = payments.map((p) => ({
    'Receipt No': p.receiptNumber,
    'Student Name': `${p.student?.firstName || ''} ${p.student?.lastName || ''}`,
    'Admission No': p.student?.admissionNumber || '-',
    'Academic Year': p.academicYear,
    'Month': p.month || '-',
    'Total Amount': p.totalAmount,
    'Paid Amount': p.paidAmount,
    'Balance': p.balance,
    'Payment Method': p.paymentMethod,
    'Status': p.status,
    'Paid Date': p.paidDate ? new Date(p.paidDate).toLocaleDateString('en-IN') : '-',
  }));
  return generateExcel(data, 'Fee Payments', 'fee_report');
};

const generateAttendanceExcel = (records) => {
  const data = records.map((r) => ({
    'Student Name': r.student,
    'Total Days': r.totalDays,
    'Present': r.present,
    'Absent': r.absent,
    'Leave': r.leave,
    'Late': r.late,
    'Half Day': r.halfDay,
    'Attendance %': r.percentage,
  }));
  return generateExcel(data, 'Attendance', 'attendance_report');
};

module.exports = { generateExcel, generateStudentExcel, generateFeeExcel, generateAttendanceExcel };
