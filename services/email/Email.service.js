const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs/promises");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const EMAIL_TEMPLATES = {
  booking_approved: "bookingApproved.html",
  booking_changes_requested: "bookingChangesRequested.html",
  booking_confirmed: "bookingConfirmed.html",
  payment_verified: "paymentVerified.html",
  payment_voided: "paymentVoided.html",
};

const getSubject = (type, reference) => {
  const SUBJECTS = {
    booking_approved: `Booking Approved – ${reference}`,
    booking_changes_requested: `Action Required: Booking Changes – ${reference}`,
    booking_confirmed: `Booking Confirmed – ${reference}`,
    payment_verified: `Payment Verified – ${reference}`,
    payment_voided: `Payment Not Verified – ${reference}`,
  };
  return SUBJECTS[type];
};
// Render HTML template
const renderTemplate = async (filePath, data) => {
  const html = await fs.readFile(filePath, "utf-8");
  const template = handlebars.compile(html);

  return template(data);
};

// Generate complete HTML email
const renderEmail = async ({ type, data, subject }) => {
  const templateName = EMAIL_TEMPLATES[type];

  if (!templateName) {
    throw new Error(`Unsupported email type: ${type}`);
  }

  const contentPath = path.join(__dirname, "templates", templateName);

  const basePath = path.join(__dirname, "layouts", "base.html");

  // Render notification-specific content
  const content = await renderTemplate(contentPath, data);

  // Render shared layout with notification content
  return renderTemplate(basePath, {
    ...data,
    subject,
    content,
  });
};

// Send email
const send = async ({
  to = "abellojulya@gmail.com",
  type = "booking_approved",
  data = {},
} = {}) => {
  try {
    const subject = getSubject(type, data?.bookingReference);
    const html = await renderEmail({
      type,
      subject,
      data,
    });

    const layoutsPath = path.join(__dirname, "layouts");

    const attachments = [
      ...["facebook", "instagram", "tiktok"].map((platform) => ({
        filename: `${platform}.png`,
        path: path.join(layoutsPath, `${platform}.png`),
        contentType: "image/png",
        contentDisposition: "inline",
        cid: `${platform}Icon`,
      })),
    ];

    console.log("[EMAIL] Before sendMail");

    const result = await transporter.sendMail({
      from: `"${process.env.APP_NAME || "Sandy's Kitchenette"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: data.preheader || subject,
      attachments,
    });

    console.log("[EMAIL] After sendMail:", result.messageId);

    console.log("Email sent:", result.messageId);

    return result;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = {
  send,
};
