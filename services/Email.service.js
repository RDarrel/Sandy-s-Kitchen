const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
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

const send = async () => {
  try {
    // File paths
    const htmlPath = path.join(process.cwd(), "mails", "booking.html");

    const bannerPath = path.join(process.cwd(), "mails", "banner.png");

    // Read HTML template
    const html = await fs.promises.readFile(htmlPath, "utf-8");

    const template = handlebars.compile(html);

    const htmlToSend = template({
      customerName: "Julia",
      bookingReference: "BK-000123",
      eventType: "Birthday Celebration",
      eventDate: "November 15, 2026",
      bookingType: "Catering",
      totalAmount: "₱25,000.00",
      downPayment: "₱7,500.00",
      paymentDeadline: "November 2, 2026",
      bookingUrl: "https://example.com",
      appName: process.env.APP_NAME,
    });

    // Read banner image
    const bannerBuffer = await fs.promises.readFile(bannerPath);

    // Check if the file is a valid PNG
    const isValidPNG = bannerBuffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

    console.log("Banner path:", bannerPath);
    console.log("Banner size:", bannerBuffer.length);
    console.log("Valid PNG:", isValidPNG);
    console.log("Banner CID found:", htmlToSend.includes("cid:bookingBanner"));

    if (!isValidPNG) {
      throw new Error("Banner file is not a valid PNG image.");
    }

    if (!htmlToSend.includes("cid:bookingBanner")) {
      throw new Error("Banner CID not found in HTML template.");
    }

    // Email message
    const msg = {
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
      to: "abellojulya@gmail.com",
      subject: "Booking Approved - Banner Test",

      html: htmlToSend,

      text: "Your booking has been approved by Sandy's Kitchenette.",

      attachments: [
        {
          filename: "banner.png",
          content: bannerBuffer,
          contentType: "image/png",
          contentDisposition: "inline",
          cid: "bookingBanner",
        },
      ],
    };

    console.log("Sending email...");

    const result = await transporter.sendMail(msg);

    console.log("Email Message ID:", result.messageId);
    console.log("Accepted:", result.accepted);
    console.log("Rejected:", result.rejected);

    return result;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = {
  send,
};
