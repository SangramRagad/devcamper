const nodemailer = require("nodemailer");
const asyncHandler = require("../middleware/asyncHandler");

const sendEmail = asyncHandler(async options => {
  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "001169aceca3b8",
      pass: "6657fd388f05db",
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transport.sendMail(message);
  console.log("Mail sent: %s", info.messageId);
});

module.exports = sendEmail;
