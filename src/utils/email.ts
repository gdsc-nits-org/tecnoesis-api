import nodemailer from "nodemailer";

import * as Interfaces from "@interfaces";

/**
 * @description Configuration for fallback email accounts
 */
const emailConfigs = [
  {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASSWORD,
  },
  {
    user: process.env.MAIL_ID_2,
    pass: process.env.MAIL_PASSWORD_2,
  },
  {
    user: process.env.MAIL_ID_3,
    pass: process.env.MAIL_PASSWORD_3,
  },
];

/**
 * @description Sends an email with the
 * specified data. Automatically falls back to
 * alternative email accounts if one fails.
 */
const sendMail: Interfaces.Mail.MailOptions = async (email, html, subject) => {
  let lastError: Error | null = null;

  // Try each email configuration in order
  for (let i = 0; i < emailConfigs.length; i++) {
    const config = emailConfigs[i];

    // Skip if credentials are not configured
    if (!config.user || !config.pass) {
      console.warn(`Email config ${i + 1} is not configured, skipping...`);
      continue;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });

      await transporter.sendMail({
        to: email,
        from: `"${process.env.NAME}" <${config.user}>`,
        subject,
        html,
      });

      // If successful, log and return
      if (i > 0) {
        console.log(`Email sent successfully using fallback account ${i + 1}`);
      }
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Failed to send email using account ${i + 1}: ${lastError.message}`
      );

      // If this is not the last config, continue to next fallback
      if (i < emailConfigs.length - 1) {
        console.log(`Attempting fallback email account ${i + 2}...`);
      }
    }
  }

  // If all attempts failed, throw the last error
  throw new Error(
    `Failed to send email after trying all ${emailConfigs.length} accounts. Last error: ${lastError?.message}`
  );
};

export { sendMail };
