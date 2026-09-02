import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

const FROM_EMAIL = "Northstar <notifications@northstar.ai>";

export async function sendReviewRequestEmail(
  to: string[],
  docType: string,
  projectName: string,
  requesterName: string,
  docUrl: string,
) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email Skipped] Review request for ${projectName} sent to ${to.join(', ')}`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Review Requested: ${projectName} ${docType}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Review Requested</h2>
          <p><strong>${requesterName}</strong> has requested a review for the <strong>${docType}</strong> of <strong>${projectName}</strong>.</p>
          <a href="${docUrl}" style="display: inline-block; background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Document</a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send review request email", error);
  }
}

export async function sendReviewDecisionEmail(
  to: string[],
  docType: string,
  projectName: string,
  reviewerName: string,
  decision: "approved" | "rejected",
  docUrl: string,
) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email Skipped] Review decision (${decision}) for ${projectName} sent to ${to.join(', ')}`);
    return;
  }

  const color = decision === "approved" ? "#10b981" : "#ef4444";
  const actionText = decision === "approved" ? "Approved" : "Rejected";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${actionText}: ${projectName} ${docType}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Document ${actionText}</h2>
          <p><strong>${reviewerName}</strong> has <strong style="color: ${color}">${decision}</strong> the <strong>${docType}</strong> for <strong>${projectName}</strong>.</p>
          <a href="${docUrl}" style="display: inline-block; background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Document</a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send review decision email", error);
  }
}
