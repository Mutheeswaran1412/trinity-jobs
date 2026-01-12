import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL || 'muthees@trinitetech.com',
    pass: process.env.SMTP_PASSWORD || 'bqqf cqxp incl fzrc'
  }
});

// Send job application confirmation email to candidate
export const sendJobApplicationEmail = async (candidateEmail, candidateName, jobTitle, companyName) => {
  if (!transporter) {
    console.log('Email transporter not available, skipping email');
    return { success: false, error: 'Email service unavailable' };
  }

  const mailOptions = {
    from: process.env.SMTP_EMAIL || 'noreply@trinityjobs.com',
    to: candidateEmail,
    subject: `Application Submitted Successfully - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Submitted Successfully! 🎉</h2>
        
        <p>Dear ${candidateName},</p>
        
        <p>Thank you for applying to <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Application Details:</h3>
          <p><strong>Position:</strong> ${jobTitle}</p>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>We have received your application and will review it shortly. You will be notified of any updates regarding your application status.</p>
        
        <p>Best regards,<br>Trinity Jobs Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280;">This is an automated email. Please do not reply to this message.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Application confirmation email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send application rejection email
export const sendApplicationRejectionEmail = async (candidateEmail, candidateName, jobTitle, companyName) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL || 'noreply@trinityjobs.com',
    to: candidateEmail,
    subject: `Application Update - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Application Update</h2>
        
        <p>Dear ${candidateName},</p>
        
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        
        <p>After careful consideration, we have decided to move forward with other candidates at this time.</p>
        
        <p>We encourage you to continue exploring other opportunities on our platform.</p>
        
        <p>Best regards,<br>Trinity Jobs Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Application rejection email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error: error.message };
  }
};

// Send application status update email
export const sendApplicationStatusEmail = async (candidateEmail, candidateName, jobTitle, companyName, status) => {
  const statusMessages = {
    reviewed: 'Your application is currently under review.',
    shortlisted: 'Congratulations! You have been shortlisted for the next round.',
    hired: 'Congratulations! You have been selected for this position.'
  };

  const mailOptions = {
    from: process.env.SMTP_EMAIL || 'noreply@trinityjobs.com',
    to: candidateEmail,
    subject: `Application Update - ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Status Update</h2>
        
        <p>Dear ${candidateName},</p>
        
        <p>We have an update regarding your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
          <p>${statusMessages[status] || 'Your application status has been updated.'}</p>
        </div>
        
        <p>We will keep you informed of any further updates.</p>
        
        <p>Best regards,<br>Trinity Jobs Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Application status email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending status email:', error);
    return { success: false, error: error.message };
  }
};