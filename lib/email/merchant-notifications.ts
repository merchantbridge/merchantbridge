import { Resend } from "resend";
import { BrevoClient } from '@getbrevo/brevo';

// Email provider configuration
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend'; // 'resend', 'brevo', or 'both'
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Initialize services
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

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
  let html = "";

  switch (type) {
    case "profile_approved":
      subject = "Welcome to Merchant Bridge! 🎉";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF6A00;">Welcome to Merchant Bridge!</h1>
          <p>Hi ${merchantName},</p>
          <p>Congratulations! Your merchant profile has been approved and you now have access to your dashboard.</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Browse matched opportunities in your feed</li>
            <li>Complete your profile for better matching</li>
            <li>Start applying to opportunities</li>
          </ul>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/merchant/dashboard" 
               style="background-color: #FF6A00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Go to your dashboard
            </a>
          </p>
          <p>If you have any questions, reply to this email.</p>
          <p>Best,<br>The Merchant Bridge Team</p>
        </div>
      `;
      break;

    case "profile_resubmit":
      subject = "Action needed: Update your Merchant Bridge profile";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #E85D00;">Profile Update Needed</h1>
          <p>Hi ${merchantName},</p>
          <p>We reviewed your application and need some additional information before we can approve your profile.</p>
          ${data?.feedback ? `<p><strong>Feedback:</strong> ${data.feedback}</p>` : ""}
          <p>Please update your profile and resubmit for review.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/merchant/onboarding/manual" 
               style="background-color: #FF6A00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Update your profile
            </a>
          </p>
          <p>If you have any questions, reply to this email.</p>
          <p>Best,<br>The Merchant Bridge Team</p>
        </div>
      `;
      break;

    case "weekly_digest":
      subject = "Your weekly opportunity digest from Merchant Bridge";
      const opportunities = data?.opportunities || [];
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF6A00;">Weekly Opportunity Digest</h1>
          <p>Hi ${merchantName},</p>
          <p>Here are the new opportunities matched to your profile this week:</p>
          ${opportunities.length > 0 ? `
            <ul>
              ${opportunities.map((opp) => `
                <li>
                  <strong>${opp.title}</strong> - ${opp.category}
                </li>
              `).join("")}
            </ul>
          ` : "<p>No new opportunities this week, but we're actively sourcing more!</p>"}
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/merchant/opportunities" 
               style="background-color: #FF6A00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View all opportunities
            </a>
          </p>
          <p>Best,<br>The Merchant Bridge Team</p>
        </div>
      `;
      break;

    case "deal_closed":
      subject = "Congratulations on your deal! 🎉";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF6A00;">Congratulations!</h1>
          <p>Hi ${merchantName},</p>
          <p>Great news! You've closed a deal through Merchant Bridge.</p>
          ${data?.opportunityTitle ? `<p><strong>Opportunity:</strong> ${data.opportunityTitle}</p>` : ""}
          <p>We'd love to hear about your experience. Consider sharing a testimonial to help other merchants discover the value of Merchant Bridge.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/merchant/applications" 
               style="background-color: #FF6A00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Share your testimonial
            </a>
          </p>
          <p>Thank you for being part of our community!</p>
          <p>Best,<br>The Merchant Bridge Team</p>
        </div>
      `;
      break;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.BREVO_FROM_EMAIL || "noreply@demerchantbridge.com";
  const fromName = "Merchant Bridge";

  // Try sending based on provider configuration
  if (EMAIL_PROVIDER === 'brevo' && BREVO_API_KEY) {
    return await sendViaBrevo(email, fromEmail, fromName, subject, html);
  } else if (EMAIL_PROVIDER === 'resend' && RESEND_API_KEY) {
    return await sendViaResend(email, fromEmail, fromName, subject, html);
  } else if (EMAIL_PROVIDER === 'both') {
    // Try Resend first, fallback to Brevo
    const resendResult = RESEND_API_KEY ? await sendViaResend(email, fromEmail, fromName, subject, html) : { success: false };
    if (resendResult.success) return resendResult;
    
    // Fallback to Brevo
    if (BREVO_API_KEY) {
      return await sendViaBrevo(email, fromEmail, fromName, subject, html);
    }
    return { success: false, error: "No email provider available" };
  } else {
    // Default: try Resend if available, otherwise Brevo
    if (RESEND_API_KEY) {
      return await sendViaResend(email, fromEmail, fromName, subject, html);
    } else if (BREVO_API_KEY) {
      return await sendViaBrevo(email, fromEmail, fromName, subject, html);
    }
    return { success: false, error: "No email provider configured" };
  }
}

async function sendViaResend(email: string, fromEmail: string, fromName: string, subject: string, html: string) {
  try {
    await resend!.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject,
      html,
    });
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
