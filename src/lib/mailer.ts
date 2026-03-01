import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface ContactEmailParams {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContactEmail({ name, email, subject, message }: ContactEmailParams) {
  const to = process.env.CONTACT_TO_EMAIL || "dao@medialane.org"
  const from = process.env.CONTACT_FROM_EMAIL || "dao@medialane.org"

  await transporter.sendMail({
    from: `"Medialane Contact" <${from}>`,
    to,
    replyTo: `"${name}" <${email}>`,
    subject: `[Contact] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <hr />
      <p>${message.replace(/\n/g, "<br />")}</p>
    `,
  })
}
