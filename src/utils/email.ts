import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

import * as Interfaces from "@interfaces";

class EmailService {
  private primaryTransporter: nodemailer.Transporter;
  private fallbackTransporter: nodemailer.Transporter;
  private fallback2Transporter: nodemailer.Transporter;

  constructor() {
    // Primary Gmail SMTP
    this.primaryTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ID, // Primary Gmail address
        pass: process.env.MAIL_PASSWORD, // App Password for the primary account
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Fallback Gmail SMTP
    this.fallbackTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ID_2, // Fallback Gmail address
        pass: process.env.MAIL_PASSWORD_2, // App Password for the fallback account
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    // Second Fallback Gmail SMTP
    this.fallback2Transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_ID_3, // Second Fallback Gmail address
        pass: process.env.MAIL_PASSWORD_3, // App Password for the second fallback account
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });
  }

  /**
   * Sends an email with fallback to another Gmail account if the first one fails.
   * @param {nodemailer.SendMailOptions} options - Email options
   */
  async sendEmail(options: nodemailer.SendMailOptions): Promise<void> {
    try {
      await this.primaryTransporter.sendMail(options);
      console.log("Email sent to", options.to);
    } catch (primaryError) {
      console.error(
        "Failed to send email with Primary Gmail SMTP:",
        primaryError
      );
      try {
        await this.fallbackTransporter.sendMail(options);
        console.log(
          "Email sent successfully with Fallback Gmail SMTP. To:",
          options.to
        );
      } catch (fallbackError) {
        console.error(
          "Failed to send email with Fallback Gmail SMTP:",
          fallbackError
        );
        try {
          await this.fallback2Transporter.sendMail(options);
          console.log(
            "Email sent successfully with Second Fallback Gmail SMTP. To:",
            options.to
          );
        } catch (fallback2Error) {
          console.error(
            "Failed to send email with Second Fallback Gmail SMTP:",
            fallback2Error
          );
          throw new Error("All primary and fallback email sending failed.");
        }
      }
    }
  }
}

const emailService = new EmailService();

/**
 * @description Sends an email with the
 * specified data. Automatically falls back to
 * alternative email accounts if one fails.
 */
const sendMail: Interfaces.Mail.MailOptions = async (email, html, subject) => {
  const options: nodemailer.SendMailOptions = {
    to: email,
    from: `"${process.env.NAME}" <${process.env.MAIL_ID}>`,
    subject,
    html,
  };

  await emailService.sendEmail(options);
};

export { sendMail };
