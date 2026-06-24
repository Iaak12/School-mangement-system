const PDFDocument = require('pdfkit');
const moment = require('moment');

// Helper: Draw table
const drawTable = (doc, headers, rows, startX, startY, colWidths) => {
  const rowHeight = 22;
  let y = startY;

  // Header row
  doc.fillColor('#4f46e5').rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill();
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + 4, y + 6, { width: colWidths[i] - 8 });
    x += colWidths[i];
  });

  y += rowHeight;
  doc.fillColor('#000000').font('Helvetica').fontSize(9);

  rows.forEach((row, ri) => {
    if (ri % 2 === 0) {
      doc.fillColor('#f3f4f6').rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill();
    }
    doc.fillColor('#1f2937');
    x = startX;
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ''), x + 4, y + 6, { width: colWidths[i] - 8 });
      x += colWidths[i];
    });
    y += rowHeight;
  });

  return y;
};

// Fee Receipt PDF
const generateFeeReceiptPDF = (payment, student, schoolSettings) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];
    doc.on('data', (d) => buffers.push(d));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const { schoolName, address, phone, email } = schoolSettings || {};

    // Header
    doc.fillColor('#4f46e5').rect(0, 0, doc.page.width, 80).fill();
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text(schoolName || 'School ERP', 40, 20);
    doc.fontSize(9).font('Helvetica').text(
      `${address?.street || ''} | ${phone || ''} | ${email || ''}`, 40, 48
    );
    doc.fillColor('#e0e7ff').fontSize(14).font('Helvetica-Bold').text('FEE RECEIPT', 420, 30, { width: 140, align: 'right' });

    // Receipt info
    doc.fillColor('#1f2937').fontSize(10).font('Helvetica-Bold');
    doc.text(`Receipt No: ${payment.receiptNumber}`, 40, 100);
    doc.text(`Date: ${moment(payment.paidDate).format('DD MMM YYYY')}`, 40, 118);
    doc.text(`Payment Method: ${payment.paymentMethod?.toUpperCase()}`, 40, 136);
    if (payment.transactionId) doc.text(`Transaction ID: ${payment.transactionId}`, 40, 154);

    // Student info
    doc.roundedRect(40, 175, doc.page.width - 80, 70, 6).fillAndStroke('#f9fafb', '#e5e7eb');
    doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(10);
    doc.text('Student Information', 55, 185);
    doc.font('Helvetica').fontSize(9);
    doc.text(`Name: ${student?.firstName} ${student?.lastName}`, 55, 202);
    doc.text(`Admission No: ${student?.admissionNumber}`, 55, 218);
    doc.text(`Academic Year: ${payment.academicYear}`, 300, 202);
    doc.text(`Month: ${payment.month || '-'}`, 300, 218);

    // Fee items table
    doc.fillColor('#4f46e5').font('Helvetica-Bold').fontSize(11).text('Fee Details', 40, 265);
    const itemRows = payment.items.map((item) => [item.label, item.type, `₹${item.amount.toLocaleString('en-IN')}`]);
    let tableEndY = drawTable(
      doc,
      ['Description', 'Type', 'Amount'],
      itemRows,
      40,
      285,
      [250, 150, 100]
    );

    // Totals
    tableEndY += 10;
    doc.font('Helvetica').fontSize(10);
    doc.text(`Subtotal: ₹${payment.subtotal?.toLocaleString('en-IN')}`, 350, tableEndY);
    if (payment.discount > 0) {
      tableEndY += 18;
      doc.text(`Discount: -₹${payment.discount?.toLocaleString('en-IN')}`, 350, tableEndY);
    }
    if (payment.fine > 0) {
      tableEndY += 18;
      doc.text(`Fine: +₹${payment.fine?.toLocaleString('en-IN')}`, 350, tableEndY);
    }
    tableEndY += 18;
    doc.fillColor('#4f46e5').font('Helvetica-Bold').fontSize(12);
    doc.text(`Total Paid: ₹${payment.totalAmount?.toLocaleString('en-IN')}`, 350, tableEndY);

    if (payment.balance > 0) {
      tableEndY += 18;
      doc.fillColor('#dc2626').text(`Balance Due: ₹${payment.balance?.toLocaleString('en-IN')}`, 350, tableEndY);
    }

    // Signature
    doc.fillColor('#6b7280').font('Helvetica').fontSize(9);
    doc.text('Authorized Signature', 40, doc.page.height - 100);
    doc.moveTo(40, doc.page.height - 80).lineTo(200, doc.page.height - 80).stroke();
    doc.text('This is a computer-generated receipt.', 40, doc.page.height - 60, { width: 400, align: 'center' });

    doc.end();
  });
};

// Report Card PDF
const generateReportCardPDF = (result, student, exam, schoolSettings) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];
    doc.on('data', (d) => buffers.push(d));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const { schoolName } = schoolSettings || {};

    // Header
    doc.fillColor('#1e3a5f').rect(0, 0, doc.page.width, 80).fill();
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text(schoolName || 'School ERP', 40, 20);
    doc.fontSize(13).text('PROGRESS REPORT / MARK SHEET', 40, 50);

    // Exam info
    doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(11).text(`Exam: ${exam?.name}`, 40, 100);
    doc.font('Helvetica').fontSize(10);
    doc.text(`Student: ${student?.firstName} ${student?.lastName}`, 40, 120);
    doc.text(`Admission No: ${student?.admissionNumber}`, 40, 138);
    doc.text(`Academic Year: ${result?.academicYear}`, 300, 120);
    doc.text(`Attendance: ${result?.attendance || 0}%`, 300, 138);

    // Marks table
    const markRows = result?.marks?.map((m) => [
      m.subject?.name || '-',
      m.theoryMarks ?? '-',
      m.practicalMarks ?? '-',
      m.totalMarks,
      m.maxMarks,
      `${((m.totalMarks / m.maxMarks) * 100).toFixed(0)}%`,
      m.grade,
      m.isPassed ? 'Pass' : 'Fail',
    ]) || [];

    drawTable(
      doc,
      ['Subject', 'Theory', 'Practical', 'Total', 'Max', '%', 'Grade', 'Status'],
      markRows,
      40,
      175,
      [120, 60, 60, 50, 50, 50, 50, 50]
    );

    // Summary
    const summaryY = 175 + 22 + markRows.length * 22 + 20;
    doc.fillColor('#1e3a5f').roundedRect(40, summaryY, doc.page.width - 80, 65, 6).fillAndStroke('#eff6ff', '#bfdbfe');
    doc.fillColor('#1e3a5f').font('Helvetica-Bold').fontSize(11);
    doc.text(`Total: ${result?.totalObtained}/${result?.totalMaxMarks}`, 55, summaryY + 12);
    doc.text(`Percentage: ${result?.percentage}%`, 55, summaryY + 30);
    doc.text(`Grade: ${result?.overallGrade}`, 200, summaryY + 12);
    doc.text(`GPA: ${result?.gpa}`, 200, summaryY + 30);
    doc.text(`Rank: ${result?.rank || '-'}`, 350, summaryY + 12);
    doc.fillColor(result?.isPassed ? '#16a34a' : '#dc2626').fontSize(14);
    doc.text(result?.isPassed ? 'PASSED' : 'FAILED', 350, summaryY + 28);

    doc.end();
  });
};

// Certificate PDF (Bonafide / Transfer / Character / Fee)
const generateCertificatePDF = (type, student, data, schoolSettings) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const buffers = [];
    doc.on('data', (d) => buffers.push(d));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const { schoolName, address, phone } = schoolSettings || {};
    const titles = {
      bonafide: 'BONAFIDE CERTIFICATE',
      transfer: 'TRANSFER CERTIFICATE',
      character: 'CHARACTER CERTIFICATE',
      fee: 'FEE CERTIFICATE',
    };

    // Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#4f46e5');

    // Header
    doc.fillColor('#4f46e5').font('Helvetica-Bold').fontSize(22).text(schoolName || 'School ERP', { align: 'center' });
    doc.fillColor('#1f2937').font('Helvetica').fontSize(10).text(address?.street || '', { align: 'center' });
    doc.moveDown(0.5);

    // Title
    doc.fillColor('#1e3a5f').font('Helvetica-Bold').fontSize(16).text(titles[type] || 'CERTIFICATE', { align: 'center', underline: true });
    doc.moveDown(1.5);

    // Body
    const fullName = `${student?.firstName} ${student?.lastName}`;
    const dob = student?.dateOfBirth ? moment(student.dateOfBirth).format('DD MMM YYYY') : '-';
    const admissionNo = student?.admissionNumber;

    let body = '';
    if (type === 'bonafide') {
      body = `This is to certify that ${fullName} (Admission No: ${admissionNo}), Date of Birth: ${dob}, is a bonafide student of this school. He/She is currently studying in Class ${data?.className || '-'}, Section ${data?.sectionName || '-'} for the academic year ${data?.academicYear || '-'}.`;
    } else if (type === 'transfer') {
      body = `This is to certify that ${fullName} (Admission No: ${admissionNo}) was a student of this school. He/She has completed his/her studies up to Class ${data?.lastClass || '-'}. He/She is hereby issued this Transfer Certificate on ${moment().format('DD MMM YYYY')}.`;
    } else if (type === 'character') {
      body = `This is to certify that ${fullName} (Admission No: ${admissionNo}) was a student of this school. During his/her tenure, he/she has maintained excellent conduct and character. We wish him/her all the best for future endeavors.`;
    } else if (type === 'fee') {
      body = `This is to certify that ${fullName} (Admission No: ${admissionNo}) has paid his/her fee of ₹${data?.amount || '-'} for the academic year ${data?.academicYear || '-'} up to the month of ${data?.month || '-'}.`;
    }

    doc.fillColor('#1f2937').font('Helvetica').fontSize(12).text(body, { align: 'justify', lineGap: 6 });
    doc.moveDown(3);

    // Signature
    doc.text(`Date: ${moment().format('DD MMM YYYY')}`, 60, doc.page.height - 150);
    doc.text('Principal\'s Signature', doc.page.width - 200, doc.page.height - 150);
    doc.moveTo(doc.page.width - 200, doc.page.height - 130).lineTo(doc.page.width - 60, doc.page.height - 130).stroke();

    doc.fillColor('#9ca3af').fontSize(8).text('This certificate is issued at the request of the student.', { align: 'center' });

    doc.end();
  });
};

module.exports = { generateFeeReceiptPDF, generateReportCardPDF, generateCertificatePDF };
