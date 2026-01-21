import cron from 'node-cron';
import Application from '../models/Application.js';
import { sendFollowUpReminderEmail } from './emailService.js';

class ReminderScheduler {
  constructor() {
    this.startScheduler();
  }

  // Start the automated reminder scheduler
  startScheduler() {
    // Run every hour to check for pending reminders
    cron.schedule('0 * * * *', async () => {
      console.log('🔔 Checking for pending reminders...');
      await this.processPendingReminders();
    });

    // Run daily at 9 AM to schedule new reminders
    cron.schedule('0 9 * * *', async () => {
      console.log('📅 Scheduling new follow-up reminders...');
      await this.scheduleNewReminders();
    });

    console.log('✅ Reminder scheduler started');
  }

  // Process and send pending reminders
  async processPendingReminders() {
    try {
      const now = new Date();
      
      // Find applications with pending reminders
      const applications = await Application.find({
        'followUpReminders.scheduledDate': { $lte: now },
        'followUpReminders.sent': false
      }).populate('jobId');

      for (const application of applications) {
        for (const reminder of application.followUpReminders) {
          if (!reminder.sent && reminder.scheduledDate <= now) {
            await this.sendReminder(application, reminder);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error processing reminders:', error);
    }
  }

  // Send individual reminder
  async sendReminder(application, reminder) {
    try {
      const result = await sendFollowUpReminderEmail(
        application.candidateEmail,
        application.candidateName,
        application.jobId.jobTitle,
        application.jobId.company,
        reminder.type,
        reminder.reminderData
      );

      if (result.success) {
        // Mark reminder as sent
        reminder.sent = true;
        reminder.sentAt = new Date();
        await application.save();
        
        console.log(`✅ Sent ${reminder.type} reminder to ${application.candidateEmail}`);
      }
    } catch (error) {
      console.error(`❌ Failed to send reminder:`, error);
    }
  }

  // Schedule new automatic reminders based on application status
  async scheduleNewReminders() {
    try {
      const applications = await Application.find({
        status: { $in: ['applied', 'reviewed', 'shortlisted'] },
        nextFollowUpDate: { $lte: new Date() }
      }).populate('jobId');

      for (const application of applications) {
        await this.scheduleReminderForApplication(application);
      }
    } catch (error) {
      console.error('❌ Error scheduling new reminders:', error);
    }
  }

  // Schedule reminder for specific application
  async scheduleReminderForApplication(application) {
    const now = new Date();
    const daysSinceLastUpdate = Math.floor((now - application.updatedAt) / (1000 * 60 * 60 * 24));
    
    let reminderType = 'follow_up';
    let scheduledDate = new Date();
    
    // Determine reminder type and schedule based on application status and age
    switch (application.status) {
      case 'applied':
        if (daysSinceLastUpdate >= 7) {
          reminderType = 'application_status';
          scheduledDate.setDate(scheduledDate.getDate() + 3); // 3 days from now
        }
        break;
        
      case 'reviewed':
        if (daysSinceLastUpdate >= 5) {
          reminderType = 'follow_up';
          scheduledDate.setDate(scheduledDate.getDate() + 2); // 2 days from now
        }
        break;
        
      case 'shortlisted':
        reminderType = 'interview_reminder';
        scheduledDate.setDate(scheduledDate.getDate() + 1); // 1 day from now
        break;
    }

    // Add reminder to application
    application.followUpReminders.push({
      type: reminderType,
      scheduledDate,
      sent: false,
      message: `Automated ${reminderType} reminder`,
      recipientEmail: application.candidateEmail
    });

    // Set next follow-up date
    application.nextFollowUpDate = new Date();
    application.nextFollowUpDate.setDate(application.nextFollowUpDate.getDate() + 7);

    await application.save();
    console.log(`📅 Scheduled ${reminderType} reminder for ${application.candidateEmail}`);
  }

  // Manual reminder scheduling (for employers)
  async scheduleManualReminder(applicationId, reminderData) {
    try {
      const application = await Application.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      application.followUpReminders.push({
        type: reminderData.type,
        scheduledDate: new Date(reminderData.scheduledDate),
        sent: false,
        message: reminderData.message,
        recipientEmail: application.candidateEmail,
        reminderData: reminderData.additionalData || {}
      });

      await application.save();
      console.log(`📅 Manual reminder scheduled for ${application.candidateEmail}`);
      return { success: true, message: 'Reminder scheduled successfully' };
    } catch (error) {
      console.error('❌ Error scheduling manual reminder:', error);
      return { success: false, error: error.message };
    }
  }

  // Get pending reminders for an application
  async getPendingReminders(applicationId) {
    try {
      const application = await Application.findById(applicationId);
      if (!application) {
        return { success: false, error: 'Application not found' };
      }

      const pendingReminders = application.followUpReminders.filter(
        reminder => !reminder.sent && reminder.scheduledDate > new Date()
      );

      return { success: true, reminders: pendingReminders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Cancel a scheduled reminder
  async cancelReminder(applicationId, reminderId) {
    try {
      const application = await Application.findById(applicationId);
      if (!application) {
        return { success: false, error: 'Application not found' };
      }

      const reminder = application.followUpReminders.id(reminderId);
      if (reminder && !reminder.sent) {
        reminder.remove();
        await application.save();
        return { success: true, message: 'Reminder cancelled' };
      }

      return { success: false, error: 'Reminder not found or already sent' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new ReminderScheduler();