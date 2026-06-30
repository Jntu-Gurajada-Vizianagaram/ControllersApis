const crypto = require('crypto');
const { createTransporter, escapeHtml } = require('./mailer');

const requiredFields = ['rollno', 'email', 'name', 'phno', 'collegename', 'category', 'msg', 'date'];

exports.send_grievance = async (req, res) => {
  try {
    const missing = requiredFields.filter(field => !String(req.body[field] || '').trim());
    if (missing.length) {
      return res.status(400).json({ message: 'Required fields are missing', fields: missing });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }

    const safe = Object.fromEntries(Object.entries(req.body).map(([key, value]) => [key, escapeHtml(String(value).slice(0, 5000))]));
    const referenceId = `JNTUGV-${new Date().getFullYear()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const transporter = createTransporter();
    const attachment = req.file ? [{
      filename: req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'),
      content: req.file.buffer,
      contentType: req.file.mimetype,
    }] : [];

    await transporter.sendMail({
      from: `JNTU-GV Grievance <${process.env.SMTP_USER}>`,
      to: process.env.GRIEVANCE_RECIPIENT,
      replyTo: req.body.email,
      subject: `Student grievance ${referenceId}`,
      html: `<h2>Student grievance ${referenceId}</h2>
        <p><b>Name:</b> ${safe.name}</p><p><b>Roll number:</b> ${safe.rollno}</p>
        <p><b>Email:</b> ${safe.email}</p><p><b>Phone:</b> ${safe.phno}</p>
        <p><b>Aadhaar:</b> ${safe.adhaarno || 'Not provided'}</p>
        <p><b>College:</b> ${safe.collegename}</p><p><b>Category:</b> ${safe.category}</p>
        <p><b>Incident date:</b> ${safe.date}</p><p><b>Message:</b> ${safe.msg}</p>`,
      attachments: attachment,
    });

    await transporter.sendMail({
      from: `JNTU-GV Grievance <${process.env.SMTP_USER}>`,
      to: req.body.email,
      subject: `Grievance received - ${referenceId}`,
      html: `<p>Hello ${safe.name},</p><p>Your grievance has been received.</p><p>Reference: <b>${referenceId}</b></p>`,
    });

    res.status(201).json({ success: true, referenceId });
  } catch (error) {
    console.error('Unable to submit grievance:', error.message);
    res.status(500).json({ message: 'Unable to submit grievance' });
  }
};

exports.receive = (req, res) => res.json({ message: 'Grievance API is available' });
