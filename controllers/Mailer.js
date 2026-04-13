const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  port: process.env.EMAIL_PORT,
  host: process.env.EMAIL_HOST,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: "vscz hlye hqqn faop",
  },
});

let readHTMLFile = (path, cb) => {
  fs.readFile(path, { encoding: "utf-8" }, (err, html) => {
    if (err) {
      throw err;
    } else {
      cb(null, html);
    }
  });
};

exports.sendLink = (req, res) => {
  readHTMLFile("./mails/link.html", (err, html) => {
    let template = handlebars.compile(html);

    let replacements = {
      link: req.body.link,
      message: req.body.message,
      appName: process.env.APP_NAME,
    };
    let htmlToSend = template(replacements);

    let msg = {
      from: `${process.env.APP_NAME}  <${process.env.EMAIL_USER}>`,
      to: req.body.to,
      subject: req.body.subject,
      html: htmlToSend,
      // attachments: [
      //   {
      //     filename: "default.png",
      //     path: "./assets/default.png",
      //     cid: "aplogo",
      //   },
      // ],
    };
    transporter
      .sendMail(msg)
      .then(() => {
        return res.json({ message: "Email sent successfully." });
      })
      .catch(() => {
        return res.status(500).json({ message: "Failed to send email." });
      });
  });
};

exports.sendCode = (req, res) => {
  readHTMLFile("./mails/code.html", (err, html) => {
    let template = handlebars.compile(html);
    let replacements = {
      code: req.body.code,
      message: req.body.message,
      username: req.body.username,
      appName: process.env.APP_NAME,
    };
    let htmlToSend = template(replacements);
    let msg = {
      from: `${process.env.APP_NAME} Team <${process.env.EMAIL_USER}>`,
      to: req.body.to,
      subject: req.body.subject,
      html: htmlToSend,
      // attachments: [
      //   {
      //     filename: "default.png",
      //     path: "./assets/default.png",
      //     cid: "aplogo",
      //   },
      // ],
    };
    transporter
      .sendMail(msg)
      .then(() => {
        return res.json({ message: "Email sent successfully." });
      })
      .catch((err) => () => {
        return res.json({ message: err });
      });
  });
};
