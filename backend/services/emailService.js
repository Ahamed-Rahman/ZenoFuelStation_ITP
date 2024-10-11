const nodemailer = require('nodemailer');

const sendEmail = async (recipient, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.BILL_EMAIL,
      pass: process.env.BILL_EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.BILL_EMAIL,
    to: recipient,
    subject: subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;




