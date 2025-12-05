const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendAppointmentConfirmation = async (appointment, barber) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: appointment.customerEmail,
    subject: '✅ Appointment Confirmed - Classic Cuts Barbershop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">Appointment Confirmed!</h2>
        <p>Dear ${appointment.customerName},</p>
        <p>Your appointment has been confirmed with the following details:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Barber:</strong> ${barber.name}</p>
          <p><strong>Service:</strong> ${appointment.service}</p>
          <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
        </div>
        <p>We look forward to seeing you!</p>
        <p style="color: #666; font-size: 12px;">Classic Cuts Barbershop</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendAppointmentCancellation = async (appointment, barber) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: appointment.customerEmail,
    subject: '❌ Appointment Cancelled - Classic Cuts Barbershop',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Appointment Cancelled</h2>
        <p>Dear ${appointment.customerName},</p>
        <p>Your appointment has been cancelled:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Barber:</strong> ${barber.name}</p>
          <p><strong>Service:</strong> ${appointment.service}</p>
          <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.time}</p>
        </div>
        <p>If you'd like to reschedule, please visit our website.</p>
        <p style="color: #666; font-size: 12px;">Classic Cuts Barbershop</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentCancellation
};