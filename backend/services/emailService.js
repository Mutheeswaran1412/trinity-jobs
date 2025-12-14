import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendJobApplicationEmail = async (candidateEmail, candidateName, jobTitle, company) => {
  const mailOptions = {
    from: `"ZyncJobs" <${process.env.SMTP_EMAIL}>`,
    to: candidateEmail,
    subject: `Job Application Submitted Successfully - ${jobTitle}`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #6366f1; padding: 30px 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">ZyncJobs</h1>
  </div>
  
  <div style="background-color: white; padding: 40px 30px;">
    <h2 style="color: #333; margin: 0 0 20px 0;">✅ Application Submitted Successfully!</h2>
    
    <p style="color: #333; margin: 0 0 15px 0;">Dear ${candidateName},</p>
    
    <p style="color: #333; margin: 0 0 15px 0;">Your job application has been successfully submitted!</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Job Title:</strong> ${jobTitle}</p>
      <p style="margin: 0;"><strong>Company:</strong> ${company}</p>
    </div>
    
    <p style="color: #333; margin: 20px 0 15px 0;">What happens next?</p>
    <ul style="color: #333;">
      <li>The employer will review your application</li>
      <li>You'll be notified if they're interested</li>
      <li>Keep your profile updated for better chances</li>
    </ul>
    
    <p style="color: #666; margin: 30px 0 0 0;">Good luck with your application!</p>
  </div>
  
  <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
    <p style="color: #666; margin: 0; font-size: 12px;">ZyncJobs Team</p>
  </div>
</div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Application confirmation email sent to:', candidateEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendApplicationRejectionEmail = async (candidateEmail, candidateName, jobTitle, company) => {
  const mailOptions = {
    from: `"ZyncJobs" <${process.env.SMTP_EMAIL}>`,
    to: candidateEmail,
    subject: `Application Update - ${jobTitle}`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #6366f1; padding: 30px 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">ZyncJobs</h1>
  </div>
  
  <div style="background-color: white; padding: 40px 30px;">
    <h2 style="color: #333; margin: 0 0 20px 0;">Application Update</h2>
    
    <p style="color: #333; margin: 0 0 15px 0;">Dear ${candidateName},</p>
    
    <p style="color: #333; margin: 0 0 15px 0;">Thank you for your interest in the position at ${company}.</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Job Title:</strong> ${jobTitle}</p>
      <p style="margin: 0;"><strong>Company:</strong> ${company}</p>
    </div>
    
    <p style="color: #333; margin: 20px 0 15px 0;">After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current requirements.</p>
    
    <p style="color: #333; margin: 0 0 15px 0;">We encourage you to continue exploring opportunities on ZyncJobs and wish you the best in your job search.</p>
    
    <p style="color: #666; margin: 30px 0 0 0;">Best regards,<br>ZyncJobs Team</p>
  </div>
  
  <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
    <p style="color: #666; margin: 0; font-size: 12px;">ZyncJobs Team</p>
  </div>
</div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent to:', candidateEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendApplicationStatusEmail = async (candidateEmail, candidateName, jobTitle, company, status) => {
  const statusMessages = {
    reviewed: {
      subject: 'Application Under Review',
      title: '👀 Application Under Review',
      message: 'Your application is currently being reviewed by our team. We will update you on the next steps soon.'
    },
    shortlisted: {
      subject: 'Congratulations! You\'ve been Shortlisted',
      title: '🎉 Congratulations! You\'ve been Shortlisted',
      message: 'Great news! Your application has been shortlisted. The employer will contact you soon for the next steps.'
    },
    hired: {
      subject: 'Congratulations! Job Offer',
      title: '🎊 Congratulations! You Got the Job',
      message: 'Excellent news! You have been selected for this position. The employer will contact you with offer details.'
    }
  };

  const statusInfo = statusMessages[status];
  if (!statusInfo) return { success: false, error: 'Invalid status' };

  const mailOptions = {
    from: `"ZyncJobs" <${process.env.SMTP_EMAIL}>`,
    to: candidateEmail,
    subject: `${statusInfo.subject} - ${jobTitle}`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #6366f1; padding: 30px 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">ZyncJobs</h1>
  </div>
  
  <div style="background-color: white; padding: 40px 30px;">
    <h2 style="color: #333; margin: 0 0 20px 0;">${statusInfo.title}</h2>
    
    <p style="color: #333; margin: 0 0 15px 0;">Dear ${candidateName},</p>
    
    <p style="color: #333; margin: 0 0 15px 0;">${statusInfo.message}</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Job Title:</strong> ${jobTitle}</p>
      <p style="margin: 0;"><strong>Company:</strong> ${company}</p>
      <p style="margin: 10px 0 0 0;"><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
    </div>
    
    <p style="color: #666; margin: 30px 0 0 0;">Best regards,<br>ZyncJobs Team</p>
  </div>
  
  <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
    <p style="color: #666; margin: 0; font-size: 12px;">ZyncJobs Team</p>
  </div>
</div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ ${status} email sent to:`, candidateEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};
