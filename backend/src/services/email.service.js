const transporter = require('../config/nodemailer');
const logger = require('../utils/logger');

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    logger.error(`Email failed to ${to}: ${error.message}`);
    throw error;
  }
};

const sendFeeReceipt = async (to, studentName, receiptData, pdfBuffer) => {
  return sendEmail({
    to,
    subject: `Fee Receipt - ${receiptData.receiptNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>Fee Receipt</h2>
        <p>Dear Parent,</p>
        <p>Fee receipt for <strong>${studentName}</strong> is attached.</p>
        <p>Receipt No: <strong>${receiptData.receiptNumber}</strong></p>
        <p>Amount Paid: <strong>₹${receiptData.totalAmount}</strong></p>
        <p>Date: <strong>${new Date(receiptData.paidDate).toLocaleDateString('en-IN')}</strong></p>
        <br><p>Thank you for your prompt payment.</p>
      </div>
    `,
    attachments: pdfBuffer
      ? [{ filename: `receipt_${receiptData.receiptNumber}.pdf`, content: pdfBuffer }]
      : [],
  });
};

const sendAttendanceAlert = async (to, studentName, date, status) => {
  return sendEmail({
    to,
    subject: `Attendance Alert - ${studentName}`,
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>Attendance Notification</h2>
        <p>Dear Parent,</p>
        <p><strong>${studentName}</strong> was marked <strong>${status}</strong> on ${new Date(date).toLocaleDateString('en-IN')}.</p>
        <p>Please contact the school if you have any questions.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendFeeReceipt, sendAttendanceAlert };
