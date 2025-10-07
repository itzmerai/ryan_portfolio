// Simple email service using EmailJS or similar service
// This is a client-side implementation that can be used with EmailJS

const EMAILJS_SERVICE_ID = 'service_ci78ny6';
const EMAILJS_PUBLIC_KEY = 'JFAC2sNfd9W0csXAV';
const EMAILJS_TEMPLATE_ID = 'template_contact';

// Load EmailJS SDK
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
script.onload = () => {
  // Initialize EmailJS
  window.emailjs.init(EMAILJS_PUBLIC_KEY);
};

document.head.appendChild(script);

// Function to send email
export async function sendEmail(emailData) {
  try {
    // Wait for EmailJS to load
    if (!window.emailjs) {
      await new Promise(resolve => {
        const checkEmailJS = () => {
          if (window.emailjs) {
            resolve();
          } else {
            setTimeout(checkEmailJS, 100);
          }
        };
        checkEmailJS();
      });
    }

    const templateParams = {
      from_name: emailData.from_name,
      from_email: emailData.from_email,
      subject: emailData.subject,
      message: emailData.message,
      to_email: emailData.to_email
    };

    const result = await window.emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    return { success: true, result };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error: error.message };
  }
}

// Alternative: Simple mailto fallback
export function sendMailtoFallback(emailData) {
  const subject = encodeURIComponent(`Portfolio Contact: ${emailData.subject}`);
  const body = encodeURIComponent(`
Name: ${emailData.from_name}
Email: ${emailData.from_email}
Subject: ${emailData.subject}

Message:
${emailData.message}
  `);
  
  const mailtoUrl = `mailto:${emailData.to_email}?subject=${subject}&body=${body}`;
  window.open(mailtoUrl);
}
