import { sendEmail } from "@/lib/email/provider";

export async function sendMerchantBridgeEmail({
  to,
  subject,
  html,
  replyTo = "support@demerchantbridge.com",
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  return sendEmail({
    to,
    subject,
    html,
    replyTo,
  });
}
