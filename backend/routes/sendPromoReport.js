const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/sendReportEmail', async (req, res) => {
  const { email, pdfBase64 } = req.body;

  if (!email || !pdfBase64) {
    return res.status(400).json({ success: false, message: 'Email and PDF data are required' });
  }

  // Create a transporter using SMTP
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Send email with PDF attachment
    let info = await transporter.sendMail({
      from: `"Your Company" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Promo Code Report",
      text: "Please find attached the Promo Code Report.",
      attachments: [
        {
          filename: 'promo_report.pdf',
          content: pdfBase64,
          encoding: 'base64'
        }
      ]
    });

    console.log("Message sent: %s", info.messageId);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send email", 
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;