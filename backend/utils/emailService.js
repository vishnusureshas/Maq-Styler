import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

export const sendOrderConfirmation = async (to, order) => {
  const subject = `Order ${order.orderNumber} confirmed`;
  const html = `
    <h1>Thank you for your order!</h1>
    <p>Your order <strong>${order.orderNumber}</strong> has been placed.</p>
    <p>Total: $${order.totalPrice.toFixed(2)}</p>
  `;
  return sendEmail({ to, subject, html });
};

export const sendOrderStatusEmail = async (to, order, status) => {
  const subject = `Order ${order.orderNumber} is now ${status}`;
  const html = `
    <h1>Order status update</h1>
    <p>Your order <strong>${order.orderNumber}</strong> is now <strong>${status}</strong>.</p>
    <p>Total: $${order.totalPrice.toFixed(2)}</p>
  `;
  return sendEmail({ to, subject, html });
};