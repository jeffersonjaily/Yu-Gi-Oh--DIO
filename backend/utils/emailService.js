// backend/utils/emailService.js
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'SEU_EMAIL@gmail.com',
    pass: 'SENHA_DO_APLICATIVO' // Use App Password do Gmail
  }
});

export async function sendPinEmail(to, pin) {
  const mailOptions = {
    from: '"Yu-Gi-Oh! DIO" <SEU_EMAIL@gmail.com>',
    to,
    subject: 'Seu PIN de Verificação',
    text: `Seu PIN de verificação é: ${pin}`
  };

  await transporter.sendMail(mailOptions);
}
