import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Works without a custom domain — Resend's own sandbox sender, fine for
// low-volume transactional mail like this. Swap for a verified domain
// address later if desired.
const FROM = process.env.RESEND_FROM_EMAIL || "Books View <onboarding@resend.dev>";

/** Sends the "Quên mật khẩu" reset link. Falls back to logging the link to
 * the server console when RESEND_API_KEY isn't configured yet, so the
 * reset flow (token generation, expiry, single-use) stays fully testable
 * before a real email provider is wired up. */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    console.log(`[email:dev] Password reset link for ${to}: ${resetUrl}`);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Đặt lại mật khẩu Books View",
    html: `
      <p>Bạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản Books View này.</p>
      <p><a href="${resetUrl}">Bấm vào đây để đặt lại mật khẩu</a> (link có hiệu lực trong 30 phút).</p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này — mật khẩu hiện tại vẫn an toàn.</p>
    `,
  });
}
