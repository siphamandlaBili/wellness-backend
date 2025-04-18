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
          The Healthcare Team
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