import { Resend } from "resend";
import { BrevoClient } from '@getbrevo/brevo';

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const LOGO_URL = "https://www.demerchantbridge.com/images/logo-horizontal.png";
const HERO_IMAGE = "https://www.demerchantbridge.com/images/heroes/gifting.webp";

function emailWrapper(content: string): string {
  return `
    <div style="background-color: #ffffff; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
      <div style="background-color: #FF6A00; padding: 24px 32px; text-align: center;">
        <img src="${LOGO_URL}" alt="Merchant Bridge" style="height: 40px; max-width: 200px;" />
      </div>
      <div style="padding: 32px;">
        <img src="${HERO_IMAGE}" alt="Merchant Bridge" style="width: 100%; height: auto; border-radius: 12px; margin-bottom: 24px;" />
        ${content}
      </div>
      <div style="background-color: #FFF5EB; padding: 24px 32px; text-align: center; border-top: 2px solid #FF6A00;">
        <p style="color: #666666; font-size: 12px; margin: 0;">
          Merchant Bridge — Opportunities for independent e-commerce brands<br/>
          <a href="https://www.demerchantbridge.com" style="color: #FF6A00;">demerchantbridge.com</a>
        </p>
      </div>
    </div>
  `;
}

function ctaButton(text: string, href: string): string {
  return `<a href="${href}" style="background-color: #FF6A00; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 14px;">${text}</a>`;
}

export async function sendMerchantNotificationEmail(
  email: string,
  merchantName: string,
  type: "profile_approved" | "profile_resubmit" | "weekly_digest" | "deal_closed",
  data?: {
    feedback?: string;
    opportunities?: Array<{ title: string; category: string }>;
    opportunityTitle?: string;
  }
) {
  let subject = "";
  let content = "";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.demerchantbridge.com";

  switch (type) {
    case "profile_approved":
      subject = "Welcome to Merchant Bridge!";
      content = `
        <h1 style="color: #FF6A00; font-size: 24px; margin: 0 0 16px;">Welcome to Merchant Bridge!</h1>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Hi ${merchantName},</p>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Congratulations! Your merchant profile has been approved and you now have access to your dashboard.</p>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Here's what you can do next:</p>
        <ul style="color: #333333; font-size: 14px; line-height: 1.8;">
          <li>Browse matched opportunities in your feed</li>
          <li>Complete your profile for better matching</li>
          <li>Start applying to opportunities</li>
        </ul>
        <div style="margin: 24px 0;">${ctaButton("Go to your dashboard", `${appUrl}/merchant/dashboard`)}</div>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">If you have any questions, reply to this email.</p>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Best,<br/>The Merchant Bridge Team</p>
      `;
      break;

    case "profile_resubmit":
      subject = "Action needed: Update your Merchant Bridge profile";
      content = `
        <h1 style="color: #FF6A00; font-size: 24px; margin: 0 0 16px;">Profile Update Needed</h1>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Hi ${merchantName},</p>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">We reviewed your application and need some additional information before we can approve your profile.</p>
        ${data?.feedback ? `<div style="background-color: #FFF5EB; border-left: 4px solid #FF6A00; padding: 16px; margin: 16px 0;"><p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0;"><strong>Feedback:</strong> ${data.feedback}</p></div>` : ""}
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Please update your profile and resubmit for review.</p>
        <div style="margin: 24px 0;">${ctaButton("Update your profile", `${appUrl}/merchant/profile`)}</div>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">If you have any questions, reply to this email.</p>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Best,<br/>The Merchant Bridge Team</p>
      `;
      break;

    case "weekly_digest":
      subject = "Your weekly opportunity digest from Merchant Bridge";
      const opportunities = data?.opportunities || [];
      content = `
        <h1 style="color: #FF6A00; font-size: 24px; margin: 0 0 16px;">Weekly Opportunity Digest</h1>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Hi ${merchantName},</p>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Here are the new opportunities matched to your profile this week:</p>
        ${opportunities.length > 0 ? `
          <div style="margin: 16px 0;">
            ${opportunities.map((opp) => `
              <div style="background-color: #FFF5EB; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                <p style="color: #FF6A00; font-size: 14px; font-weight: bold; margin: 0 0 4px;">${opp.title}</p>
                <p style="color: #666666; font-size: 12px; margin: 0;">${opp.category}</p>
              </div>
            `).join("")}
          </div>
        ` : `<p style="color: #333333; font-size: 14px; line-height: 1.6;">No new opportunities this week, but we're actively sourcing more!</p>`}
        <div style="margin: 24px 0;">${ctaButton("View all opportunities", `${appUrl}/merchant/opportunities`)}</div>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Best,<br/>The Merchant Bridge Team</p>
      `;
      break;

    case "deal_closed":
      subject = "Congratulations on your deal!";
      content = `
        <h1 style="color: #FF6A00; font-size: 24px; margin: 0 0 16px;">Congratulations!</h1>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Hi ${merchantName},</p>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Great news! You've closed a deal through Merchant Bridge.</p>
        ${data?.opportunityTitle ? `<div style="background-color: #FFF5EB; border-radius: 8px; padding: 16px; margin: 16px 0;"><p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0;"><strong>Opportunity:</strong> ${data.opportunityTitle}</p></div>` : ""}
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">We'd love to hear about your experience. Consider sharing a testimonial to help other merchants discover the value of Merchant Bridge.</p>
        <div style="margin: 24px 0;">${ctaButton("Share your testimonial", `${appUrl}/merchant/applications`)}</div>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Thank you for being part of our community!</p>
        <p style="color: #333333; font-size: 14px; line-height: 1.6;">Best,<br/>The Merchant Bridge Team</p>
      `;
      break;
  }

  const html = emailWrapper(content);
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.BREVO_FROM_EMAIL || "noreply@demerchantbridge.com";
  const fromName = "Merchant Bridge";

  if (EMAIL_PROVIDER === 'brevo' && BREVO_API_KEY) {
    return await sendViaBrevo(email, fromEmail, fromName, subject, html);
  } else if (EMAIL_PROVIDER === 'resend' && RESEND_API_KEY) {
    return await sendViaResend(email, fromEmail, fromName, subject, html);
  } else if (EMAIL_PROVIDER === 'both') {
    const resendResult = RESEND_API_KEY ? await sendViaResend(email, fromEmail, fromName, subject, html) : { success: false };
    if (resendResult.success) return resendResult;
    if (BREVO_API_KEY) return await sendViaBrevo(email, fromEmail, fromName, subject, html);
    return { success: false, error: "No email provider available" };
  } else {
    if (RESEND_API_KEY) return await sendViaResend(email, fromEmail, fromName, subject, html);
    else if (BREVO_API_KEY) return await sendViaBrevo(email, fromEmail, fromName, subject, html);
    return { success: false, error: "No email provider configured" };
  }
}

async function sendViaResend(email: string, fromEmail: string, fromName: string, subject: string, html: string) {
  try {
    await resend!.emails.send({ from: `${fromName} <${fromEmail}>`, to: email, subject, html });
    return { success: true, provider: 'resend' };
  } catch (error) {
    console.error("Resend email failed:", error);
    return { success: false, error, provider: 'resend' };
  }
}

async function sendViaBrevo(email: string, fromEmail: string, fromName: string, subject: string, html: string) {
  try {
    const brevo = new BrevoClient({ apiKey: BREVO_API_KEY! });
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { email: fromEmail, name: fromName },
      to: [{ email }],
      subject,
      htmlContent: html,
    });
    return { success: true, provider: 'brevo' };
  } catch (error) {
    console.error("Brevo email failed:", error);
    return { success: false, error, provider: 'brevo' };
  }
}
