const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Create transporter for email notifications
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verify connection
      await this.transporter.verify();
      this.isInitialized = true;
      logger.info('Notification service initialized');
    } catch (error) {
      logger.error('Failed to initialize notification service:', error);
      // Don't throw error - notifications are not critical for core functionality
      this.isInitialized = false;
    }
  }

  async sendEmail(to, subject, text, html = null) {
    if (!this.isInitialized) {
      logger.warn('Notification service not initialized, skipping email');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${subject}`);
      return result;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendComplianceAlert(batchId, violations, userEmail) {
    const subject = `Compliance Alert - Batch ${batchId}`;
    const text = `Compliance violations detected for batch ${batchId}:\n\n${violations.join('\n')}`;
    const html = `
      <h2>Compliance Alert</h2>
      <p><strong>Batch ID:</strong> ${batchId}</p>
      <p><strong>Violations detected:</strong></p>
      <ul>
        ${violations.map(violation => `<li>${violation}</li>`).join('')}
      </ul>
      <p>Please review and take appropriate action.</p>
    `;

    return await this.sendEmail(userEmail, subject, text, html);
  }

  async sendQualityTestResult(batchId, testResults, userEmail) {
    const subject = `Quality Test Results - Batch ${batchId}`;
    const text = `Quality test results for batch ${batchId}:\n\n${JSON.stringify(testResults, null, 2)}`;
    const html = `
      <h2>Quality Test Results</h2>
      <p><strong>Batch ID:</strong> ${batchId}</p>
      <p><strong>Test Results:</strong></p>
      <pre>${JSON.stringify(testResults, null, 2)}</pre>
    `;

    return await this.sendEmail(userEmail, subject, text, html);
  }

  async sendBatchStatusUpdate(batchId, newStatus, userEmail) {
    const subject = `Batch Status Update - ${batchId}`;
    const text = `Batch ${batchId} status has been updated to: ${newStatus}`;
    const html = `
      <h2>Batch Status Update</h2>
      <p><strong>Batch ID:</strong> ${batchId}</p>
      <p><strong>New Status:</strong> ${newStatus}</p>
    `;

    return await this.sendEmail(userEmail, subject, text, html);
  }

  async sendQRCodeGenerated(batchId, qrCodeUrl, userEmail) {
    const subject = `QR Code Generated - Batch ${batchId}`;
    const text = `QR code has been generated for batch ${batchId}. URL: ${qrCodeUrl}`;
    const html = `
      <h2>QR Code Generated</h2>
      <p><strong>Batch ID:</strong> ${batchId}</p>
      <p><strong>QR Code URL:</strong> <a href="${qrCodeUrl}">${qrCodeUrl}</a></p>
    `;

    return await this.sendEmail(userEmail, subject, text, html);
  }

  async sendWelcomeEmail(userEmail, username, role) {
    const subject = `Welcome to Ayurvedic Herb Traceability System`;
    const text = `Welcome ${username}! Your account has been created with role: ${role}`;
    const html = `
      <h2>Welcome to Ayurvedic Herb Traceability System</h2>
      <p>Hello ${username},</p>
      <p>Your account has been successfully created with the role: <strong>${role}</strong></p>
      <p>You can now access the system and start tracking herb batches.</p>
    `;

    return await this.sendEmail(userEmail, subject, text, html);
  }

  async sendPasswordResetEmail(userEmail, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = `Password Reset Request`;
    const text = `Click the following link to reset your password: ${resetUrl}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click the following link to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
    `;

    return await this.sendEmail(userEmail, subject, text, html);
  }

  // Real-time notification via Socket.IO
  sendRealtimeNotification(io, room, event, data) {
    try {
      io.to(room).emit(event, data);
      logger.info(`Real-time notification sent to room ${room}: ${event}`);
    } catch (error) {
      logger.error('Failed to send real-time notification:', error);
    }
  }

  // Send notification to specific user
  sendUserNotification(io, userId, event, data) {
    try {
      io.to(`user_${userId}`).emit(event, data);
      logger.info(`Real-time notification sent to user ${userId}: ${event}`);
    } catch (error) {
      logger.error('Failed to send user notification:', error);
    }
  }

  // Send notification to all users with specific role
  sendRoleNotification(io, role, event, data) {
    try {
      io.to(`role_${role}`).emit(event, data);
      logger.info(`Real-time notification sent to role ${role}: ${event}`);
    } catch (error) {
      logger.error('Failed to send role notification:', error);
    }
  }

  // Send compliance alert to regulators
  async sendComplianceAlertToRegulators(batchId, violations, io) {
    try {
      // Send real-time notification
      this.sendRoleNotification(io, 'regulator', 'compliance_alert', {
        batchId,
        violations,
        timestamp: new Date().toISOString()
      });

      // Send email to all regulators (in a real system, you'd get this from the database)
      const regulatorEmails = process.env.REGULATOR_EMAILS?.split(',') || [];
      for (const email of regulatorEmails) {
        await this.sendComplianceAlert(batchId, violations, email);
      }

      logger.info(`Compliance alert sent for batch ${batchId}`);
    } catch (error) {
      logger.error('Failed to send compliance alert to regulators:', error);
    }
  }

  // Send batch update notification
  sendBatchUpdateNotification(io, batchId, updateType, data) {
    try {
      this.sendRealtimeNotification(io, `batch_${batchId}`, 'batch_update', {
        batchId,
        updateType,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to send batch update notification:', error);
    }
  }

  // Send system maintenance notification
  sendMaintenanceNotification(io, message, scheduledTime) {
    try {
      this.sendRealtimeNotification(io, 'system', 'maintenance_notification', {
        message,
        scheduledTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to send maintenance notification:', error);
    }
  }
}

module.exports = new NotificationService();
