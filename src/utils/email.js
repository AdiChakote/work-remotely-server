import nodemailer from "nodemailer";

export const sendInviteEmail = async (to, workspaceName, inviteLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Workspace App" <${process.env.EMAIL_USER}>`,
    to,
    subject: `You're invited to join ${workspaceName}`,
    text: `Click here to join: ${inviteLink}`,
  });
};
