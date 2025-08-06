export const sendWelcomeEmail = (name, role, from, email, password) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2d3748;">Welcome, ${name}!</h1>
        <p style="font-size: 16px; color: #4a5568;">
          ${
            role === 'user' 
              ? `Thank you for registering with us! We're excited to have you on board.` 
              : role === 'nurse' 
              ? `An admin (${from}) has registered you. Here are your login details:`
              : `A superadmin (${from}) has registered you. Here are your login details:`
          }
        </p>
        ${
          role !== 'user' 
            ? `<div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin-top: 16px;">
                 <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
                 <p style="margin: 4px 0;"><strong>Password:</strong> ${password}</p>
               </div>`
            : ''
        }
        <p style="font-size: 14px; color: #718096; margin-top: 20px;">
          Best regards,<br/>
          healthSpace Wellness Team
        </p>
      </div>
    `;
  };

  export const resetPasswordEmail = (email, token) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
          Password Reset Request
        </h1>
        
        <p style="font-size: 16px; color: #4a5568;">
          Hello,
        </p>
        
        <p style="font-size: 16px; color: #4a5568;">
          We received a request to reset your password. Click the button below to reset it:
        </p>
  
        <a href="http://localhost:5173/forgot-password/${token}" 
           style="display: inline-block; background-color: #4299e1; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                  margin: 20px 0;">
          Reset Password
        </a>
  
        <p style="font-size: 14px; color: #718096;">
          If you didn't request this password reset, you can safely ignore this email. 
          This link will expire in 1 hour for security reasons.
        </p>
  
        <p style="font-size: 14px; color: #718096;">
          <strong>Note:</strong> Never share this link with anyone. Our team will never 
          ask you for your password or reset token.
        </p>
  
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #a0aec0;">
            Can't click the button? Copy and paste this link in your browser:<br>
            http://localhost:5183/forgot-password/${token}
          </p>
        </div>
      </div>
    `;
  };

  export const passwordResetSuccessEmail = (email, resetTimestamp) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #48bb78; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 30px; height: 30px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 style="color: #2d3748; margin: 0;">Password Changed Successfully</h1>
        </div>
  
        <p style="font-size: 16px; color: #4a5568;">
          Hello,<br>
          Your password for account <strong>${email}</strong> was changed on 
          ${new Date(resetTimestamp).toLocaleString()}.
        </p>
  
        <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Security Checklist:</h3>
          <ul style="font-size: 14px; color: #4a5568; padding-left: 20px;">
            <li>Password changed successfully</li>
            <li>All active sessions remain logged in</li>
            <li>No other account details were modified</li>
          </ul>
        </div>
  
        <p style="font-size: 16px; color: #4a5568;">
          <strong>If you did this:</strong><br>
          No further action is needed. You're all set!
        </p>
  
        <p style="font-size: 16px; color: #4a5568;">
          <strong>If you didn't do this:</strong><br>
          Immediately contact our support team at 
          <a href="mailto:support@example.com" style="color: #4299e1; text-decoration: none;">
            support@example.com
          </a> or call +1-800-123-4567
        </p>
  
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #a0aec0;">
            This email was sent to ${email} because your account password was recently changed.<br>
            © ${new Date().getFullYear()} Your Company Name. All rights reserved.
          </p>
        </div>
      </div>
    `;
  };


  export const eventAcceptedEmail = (eventCode, eventName, eventLocation, eventDate) => {
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="background-color: #48bb78; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 30px; height: 30px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 style="color: #2d3748;">Event Accepted: ${eventName}</h1>
          <p style="color: #4a5568;">Event Code: ${eventCode}</p>
        </div>
  
        <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Event Details</h3>
          <p><strong>📍 Location:</strong> ${eventLocation}</p>
          <p><strong>📅 Date & Time:</strong> ${formattedDate}</p>
          <p><strong>✅ Status:</strong> Approved</p>
        </div>
  
        <p style="font-size: 16px; color: #4a5568;">
          Your event has been approved and is now active. Participants can register using the event code.
        </p>
  
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #718096;">
            Need to make changes? Contact our support team at
            <a href="mailto:eventsupport@example.com" style="color: #4299e1; text-decoration: none;">
              eventsupport@example.com
            </a>
          </p>
        </div>
      </div>
    `;
  };

  export const eventRejectedEmail = (eventCode, eventName, eventLocation, eventDate, reason) => {
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="background-color: #f56565; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
            <svg style="width: 30px; height: 30px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 style="color: #2d3748;">Event Rejected: ${eventName}</h1>
          <p style="color: #4a5568;">Event Code: ${eventCode}</p>
        </div>
  
        <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-top: 0;">Event Details</h3>
          <p><strong>📍 Location:</strong> ${eventLocation}</p>
          <p><strong>📅 Date & Time:</strong> ${formattedDate}</p>
          <p><strong>❌ Status:</strong> Rejected</p>
          <p><strong>📝 Reason:</strong> ${reason}</p>
        </div>
  
        <p style="font-size: 16px; color: #4a5568;">
          Please review the rejection reason and resubmit your event with the necessary changes.
        </p>
  
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 14px; color: #718096;">
            Need assistance? Contact our support team at
            <a href="mailto:eventsupport@example.com" style="color: #4299e1; text-decoration: none;">
              eventsupport@example.com
            </a>
          </p>
        </div>
      </div>
    `;
  };
  

  // ... existing templates ...

// NEW: Event creation confirmation for user
export const eventCreatedConfirmation = (eventCode, eventName, eventDate, venue) => {
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2d3748;">Event Created Successfully!</h1>
      <p style="font-size: 16px; color: #4a5568;">
        Thank you for creating your event with us. Your event is now pending approval.
      </p>
      
      <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Event Details</h3>
        <p><strong>Event Name:</strong> ${eventName}</p>
        <p><strong>Event Code:</strong> ${eventCode}</p>
        <p><strong>Date & Time:</strong> ${formattedDate}</p>
        <p><strong>Venue:</strong> ${venue}</p>
        <p><strong>Status:</strong> Pending Approval</p>
      </div>
      
      <p style="font-size: 16px; color: #4a5568;">
        Our team will review your event and notify you once it's approved. 
        You'll be able to manage your event from your dashboard.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 14px; color: #718096;">
          Need assistance? Contact our support team at
          <a href="mailto:eventsupport@example.com" style="color: #4299e1; text-decoration: none;">
            eventsupport@example.com
          </a>
        </p>
      </div>
    </div>
  `;
};

// UPDATED: Improved admin notification
export const sendEventCreateAlert = (eventCode, eventName, eventLocation, eventDate, createdBy) => {
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 30px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <div style="border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="color: #1e293b; margin: 0; font-size: 24px;">New Event Requires Approval</h1>
        <p style="color: #64748b; margin: 5px 0 0; font-size: 14px;">
          Event Code: ${eventCode} | Created By: ${createdBy}
        </p>
      </div>

      <div style="margin-bottom: 25px;">
        <h2 style="color: #2563eb; margin: 0 0 15px; font-size: 20px;">${eventName}</h2>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #475569; width: 30%;">Location:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${eventLocation}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #475569;">Date & Time:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #475569;">Event Code:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${eventCode}</td>
            </tr>
          </table>
        </div>
      </div>

      <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
        <h3 style="color: #2563eb; margin: 0 0 12px; font-size: 16px;">Action Required:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #1e293b;">
          <li>Review event details</li>
          <li>Approve or reject the event</li>
          <li>Notify the event creator</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 25px;">
        <a href="#" style="background-color: #2563eb; color: white; padding: 12px 25px; 
          text-decoration: none; border-radius: 5px; display: inline-block; 
          font-weight: 500; font-size: 14px;">Review Event</a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
          This is an automated notification. Please do not reply to this email.<br>
          Need assistance? Contact our support team at 
          <a href="mailto:support@yourevent.com" style="color: #2563eb; text-decoration: none;">support@yourevent.com</a>
        </p>
      </div>
    </div>
  `;
};

// NEW: Nurse assignment notification
export const nurseAssignedEmail = (eventCode, eventName, eventDate, venue, nurseName) => {
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2d3748;">New Event Assignment</h1>
      <p style="font-size: 16px; color: #4a5568;">
        Hello ${nurseName}, you've been assigned to an upcoming event.
      </p>
      
      <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Event Details</h3>
        <p><strong>Event Name:</strong> ${eventName}</p>
        <p><strong>Event Code:</strong> ${eventCode}</p>
        <p><strong>Date & Time:</strong> ${formattedDate}</p>
        <p><strong>Venue:</strong> ${venue}</p>
      </div>
      
      <p style="font-size: 16px; color: #4a5568;">
        Please review the event details and prepare any necessary materials. 
        The event will appear in your dashboard.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 14px; color: #718096;">
          Need assistance? Contact our support team at
          <a href="mailto:eventsupport@example.com" style="color: #4299e1; text-decoration: none;">
            eventsupport@example.com
          </a>
        </p>
      </div>
    </div>
  `;
};

// New email templates for referrals
export const patientReferralEmail = (patientName, practitionerName, practitionerEmail, comments, referralDate) => {
  const formattedDate = new Date(referralDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2d3748;">Your Health Referral</h1>
      <p style="font-size: 16px; color: #4a5568;">
        Dear ${patientName},
      </p>
      
      <p style="font-size: 16px; color: #4a5568;">
        Your healthcare provider has referred you to ${practitionerName} for further evaluation.
      </p>
      
      <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Referral Details</h3>
        <p><strong>Practitioner:</strong> ${practitionerName}</p>
        <p><strong>Contact:</strong> ${practitionerEmail}</p>
        <p><strong>Referral Date:</strong> ${formattedDate}</p>
        <p><strong>Reason for Referral:</strong> ${comments}</p>
      </div>
      
      <p style="font-size: 16px; color: #4a5568;">
        Please contact ${practitionerName}'s office to schedule an appointment at your earliest convenience.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 14px; color: #718096;">
          If you have any questions about this referral, please contact your primary healthcare provider.
        </p>
      </div>
    </div>
  `;
};

export const practitionerReferralEmail = (practitionerName, patientName, patientIdNumber, comments, referralDate) => {
  const formattedDate = new Date(referralDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2d3748;">New Patient Referral</h1>
      <p style="font-size: 16px; color: #4a5568;">
        Dear Dr. ${practitionerName},
      </p>
      
      <p style="font-size: 16px; color: #4a5568;">
        You have received a new patient referral from our healthcare system.
      </p>
      
      <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">Patient Details</h3>
        <p><strong>Patient Name:</strong> ${patientName}</p>
        <p><strong>ID Number:</strong> ${patientIdNumber}</p>
        <p><strong>Referral Date:</strong> ${formattedDate}</p>
        <p><strong>Reason for Referral:</strong> ${comments}</p>
      </div>
      
      <p style="font-size: 16px; color: #4a5568;">
        This patient has been notified of the referral and may contact your office to schedule an appointment.
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 14px; color: #718096;">
          Please log in to our healthcare portal for more detailed patient information.
        </p>
      </div>
    </div>
  `;
};