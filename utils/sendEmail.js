import sgMail from "@sendgrid/mail";
import dotenv from 'dotenv';
dotenv.config();

// Set SendGrid API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


export async function sendEmail(options) {
  // Validate required environment variables
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SendGrid API key is missing');
  }

  // Validate required parameters
  if (!options.to || !options.subject) {
    throw new Error('Missing required email parameters');
  }

  // Check for content
  if (!options.text && !options.html) {
    throw new Error('Email must have either text or HTML content');
  }

  // Prepare email message
  const msg = {
    to: options.to,
    from: options.from || process.env.SENDGRID_DEFAULT_FROM,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const response = await sgMail.send(msg);
    console.log('Email sent successfully');
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('Error response body:', error.response.body);
    }
    throw error;
  }
}

